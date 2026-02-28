import pool from '../config/db.js';

// --- Accounts ---
export const getAccounts = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM contas_bancarias WHERE id_usuario = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createAccount = async (req, res) => {
    const { nome_conta, tipo_conta, banco, saldo_inicial, cor_tema } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO contas_bancarias (nome_conta, tipo_conta, banco, saldo_inicial, saldo_atual, cor_tema, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome_conta, tipo_conta, banco, saldo_inicial, saldo_inicial, cor_tema, req.user.id]
        );
        res.status(201).json({ id_conta: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Categories ---
export const getCategories = async (req, res) => {
    try {
        const [receitas] = await pool.query('SELECT *, \'receita\' as tipo FROM categoria_receita WHERE id_usuario = ? OR id_usuario IS NULL', [req.user.id]);
        const [despesas] = await pool.query('SELECT *, \'despesa\' as tipo FROM categoria_despesa WHERE id_usuario = ? OR id_usuario IS NULL', [req.user.id]);

        // Return a combined list to maintain frontend compatibility if needed, 
        // but now specifically marked by table origins if necessary.
        res.json([...receitas, ...despesas]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req, res) => {
    const { nome, icone, cor, tipo } = req.body;
    const table = tipo === 'receita' ? 'categoria_receita' : 'categoria_despesa';
    const idField = tipo === 'receita' ? 'id_categoria_receita' : 'id_categoria_despesa';

    try {
        const [result] = await pool.query(
            `INSERT INTO ${table} (nome, icone, cor, id_usuario) VALUES (?, ?, ?, ?)`,
            [nome, icone, cor, req.user.id]
        );
        res.status(201).json({ [idField]: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Transactions ---
export const getTransactions = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT t.*, 
                    cr.nome as categoria_receita_nome, 
                    cd.nome as categoria_despesa_nome 
             FROM transacoes t 
             LEFT JOIN categoria_receita cr ON t.id_categoria_receita = cr.id_categoria_receita 
             LEFT JOIN categoria_despesa cd ON t.id_categoria_despesa = cd.id_categoria_despesa 
             WHERE t.id_usuario = ? ORDER BY t.data DESC`,
            [req.user.id]
        );

        // Normalize for frontend: add a virtual 'categoria_nome'
        const normalizedRows = rows.map(t => ({
            ...t,
            categoria_nome: t.tipo === 'receita' ? t.categoria_receita_nome : t.categoria_despesa_nome,
            id_categoria: t.tipo === 'receita' ? t.id_categoria_receita : t.id_categoria_despesa
        }));

        res.json(normalizedRows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTransaction = async (req, res) => {
    const { descricao, valor, data, tipo, metodo_pagamento, id_categoria, id_conta } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const catField = tipo === 'receita' ? 'id_categoria_receita' : 'id_categoria_despesa';

        const [result] = await connection.query(
            `INSERT INTO transacoes (descricao, valor, data, tipo, metodo_pagamento, id_usuario, ${catField}, id_conta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [descricao, valor, data, tipo, metodo_pagamento, req.user.id, id_categoria, id_conta]
        );

        const balanceChange = tipo === 'receita' ? parseFloat(valor) : -parseFloat(valor);
        await connection.query(
            'UPDATE contas_bancarias SET saldo_atual = saldo_atual + ? WHERE id_conta = ? AND id_usuario = ?',
            [balanceChange, id_conta, req.user.id]
        );

        await connection.query(
            'INSERT INTO actividades_sistema (descricao, tipo, tela, valor, referencia_id, id_usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [`${tipo === 'receita' ? 'Receita' : 'Despesa'} adicionada: ${descricao}`, tipo, tipo === 'receita' ? 'Receitas' : 'Despesas', valor, result.insertId, req.user.id]
        );

        await connection.commit();
        res.status(201).json({ id_transacao: result.insertId, ...req.body });
    } catch (error) {
        console.error('Error creating transaction:', error);
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// --- Budgets ---
export const getBudgets = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT o.*, c.nome as categoria_nome FROM orcamentos o JOIN categoria_despesa c ON o.id_categoria_despesa = c.id_categoria_despesa WHERE o.id_usuario = ?',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Activities ---
export const getActivities = async (req, res) => {
    try {
        // only return activities belonging to the authenticated user
        const [rows] = await pool.query(
            'SELECT * FROM actividades_sistema WHERE id_usuario = ? ORDER BY data DESC LIMIT 20',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// generic endpoint to let the client register an arbitrary activity
export const logActivity = async (req, res) => {
    const { descricao, tipo = 'sistema', tela = 'Sistema', valor = null, referencia_id = null } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO actividades_sistema (descricao, tipo, tela, valor, referencia_id, id_usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [descricao, tipo, tela, valor, referencia_id, req.user.id]
        );
        res.status(201).json({ id_actividade: result.insertId, descricao, tipo, tela, valor, referencia_id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// allow user to clear their own activity log
export const clearActivities = async (req, res) => {
    try {
        await pool.query('DELETE FROM actividades_sistema WHERE id_usuario = ?', [req.user.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Dashboard Stats ---
export const getDashboardStats = async (req, res) => {
    try {
        const [accounts] = await pool.query('SELECT SUM(saldo_atual) as total_balance FROM contas_bancarias WHERE id_usuario = ?', [req.user.id]);
        const [monthly] = await pool.query(
            `SELECT 
        SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as income,
        SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as expense
      FROM transacoes 
      WHERE id_usuario = ? AND MONTH(data) = MONTH(CURRENT_DATE) AND YEAR(data) = YEAR(CURRENT_DATE)`,
            [req.user.id]
        );

        res.json({
            total_balance: accounts[0].total_balance || 0,
            monthly_income: monthly[0].income || 0,
            monthly_expense: monthly[0].expense || 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
