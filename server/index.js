const express = require('express');
const cors = require('cors');
const setupDb = require('./database');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

async function startServer() {
    const db = await setupDb();

    // Pass db instance to routes (simple approach for this project)
    app.use((req, res, next) => {
        req.db = db;
        next();
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/categories', categoryRoutes);

    app.get('/', (req, res) => {
        res.send('Real Balance API is running');
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer().catch(err => {
    console.error('Failed to start server:', err);
});
