const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const transactions = await req.db.all(
            'SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.user_id = ? ORDER BY t.date DESC',
            [req.user.id]
        );
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    const { amount, description, date, type, category_id } = req.body;
    try {
        await req.db.run(
            'INSERT INTO transactions (user_id, category_id, amount, description, date, type) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, category_id, amount, description, date, type]
        );
        res.status(201).json({ message: 'Transaction recorded' });
    } catch (err) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

router.get('/balance', auth, async (req, res) => {
    try {
        const result = await req.db.get(
            `SELECT 
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
             FROM transactions WHERE user_id = ?`,
            [req.user.id]
        );
        const balance = (result.total_income || 0) - (result.total_expense || 0);
        res.json({ balance, ...result });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
