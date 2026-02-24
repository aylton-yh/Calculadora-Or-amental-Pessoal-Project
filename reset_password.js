const sqlite3 = require('./server/node_modules/sqlite3').verbose();
const { open } = require('./server/node_modules/sqlite');
const bcrypt = require('./server/node_modules/bcryptjs');
const path = require('path');

async function resetPass() {
    const db = await open({
        filename: path.join(__dirname, 'server', 'database.sqlite'),
        driver: sqlite3.Database
    });

    // Hash for '12345678'
    const hash = await bcrypt.hash('12345678', 10);
    // Update user Aylton Yh
    await db.run('UPDATE users SET password = ? WHERE username = ?', [hash, 'Aylton Yh']);
    console.log('Password reset successfully for Aylton Yh');
    await db.close();
}

resetPass().catch(console.error);
