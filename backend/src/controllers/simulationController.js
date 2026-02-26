import pool from '../config/db.js';

// --- Goals ---
export const getGoals = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM metas WHERE id_usuario = ?', [req.user.id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createGoal = async (req, res) => {
    const { nome, valor_alvo, prazo, icone } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO metas (nome, valor_alvo, prazo, icone, id_usuario) VALUES (?, ?, ?, ?, ?)',
            [nome, valor_alvo, prazo, icone, req.user.id]
        );
        res.status(201).json({ id_meta: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Simulations ---
export const createRatioSimulation = async (req, res) => {
    const { rendimento_mensal, necessidades, desejos, poupanca } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO simulacoes_ratios (rendimento_mensal, necessidades, desejos, poupanca, id_usuario) VALUES (?, ?, ?, ?, ?)',
            [rendimento_mensal, necessidades, desejos, poupanca, req.user.id]
        );
        res.status(201).json({ id_simulacao: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
