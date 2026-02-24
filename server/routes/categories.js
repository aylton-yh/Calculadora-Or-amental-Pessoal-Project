const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const categories = await req.db.all(
            'SELECT * FROM categories WHERE user_id IS NULL OR user_id = ?',
            [req.user.id]
        );
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    const { name, type } = req.body;
    try {
        await req.db.run(
            'INSERT INTO categories (user_id, name, type) VALUES (?, ?, ?)',
            [req.user.id, name, type]
        );
        res.status(201).json({ message: 'Category added' });
    } catch (err) {
        res.status(400).json({ error: 'Invalid data' });
    }
});

module.exports = router;
