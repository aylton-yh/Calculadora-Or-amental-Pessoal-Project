const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, username, contact, gender, maritalStatus, idNumber, address, photo, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Usuário, Email e Senha são obrigatórios.' });
    }

    try {
        // Check if user already exists (manual check since constraints might be missing in some SQLite versions)
        const existingUser = await req.db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Usuário ou Email já cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await req.db.run(
            'INSERT INTO users (name, email, username, contact, gender, marital_status, id_number, address, photo, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, username, contact, gender, maritalStatus, idNumber, address, photo, hashedPassword]
        );
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error detail:', err);
        res.status(500).json({ error: 'Erro interno no servidor ao realizar registo.' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await req.db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Remove password from user object
        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (err) {
        console.error('Login error detail:', err);
        res.status(500).json({ error: 'Erro interno no servidor ao realizar login.' });
    }
});

module.exports = router;
