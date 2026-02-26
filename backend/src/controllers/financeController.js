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
        const [rows] = await pool.query('SELECT * FROM categoria WHERE id_usuario = ? OR id_usuario IS NULL', [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createCategory = async (req, res) => {
    const { nome, icone, cor, tipo } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO categoria (nome, icone, cor, tipo, id_usuario) VALUES (?, ?, ?, ?, ?)',
            [nome, icone, cor, tipo, req.user.id]
        );
        res.status(201).json({ id_categoria: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Transactions ---
export const getTransactions = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT t.*, c.nome as categoria_nome FROM transacoes t LEFT JOIN categoria c ON t.id_categoria = c.id_categoria WHERE t.id_usuario = ? ORDER BY t.data DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTransaction = async (req, res) => {
    const { descricao, valor, data, tipo, metodo_pagamento, id_categoria, id_conta } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO transacoes (descricao, valor, data, tipo, metodo_pagamento, id_usuario, id_categoria, id_conta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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
            'SELECT o.*, c.nome as categoria_nome FROM orcamentos o JOIN categoria c ON o.id_categoria = c.id_categoria WHERE o.id_usuario = ?',
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
        const [rows] = await pool.query(
            'SELECT * FROM actividades_sistema WHERE id_usuario = ? ORDER BY data DESC LIMIT 20',
            [req.user.id]
        );
        res.json(rows);
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
