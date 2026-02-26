import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection on startup
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Base de Dados ligada com sucesso!');
        connection.release();
    } catch (err) {
        console.error('❌ Erro de ligação à Base de Dados:', err.message);
    }
})();

export default pool;
