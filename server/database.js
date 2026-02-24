const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function setupDb() {
    const db = await open({
        filename: path.join(__dirname, 'database.sqlite'),
        driver: sqlite3.Database
    });

    // Users Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE,
            contact TEXT,
            gender TEXT,
            marital_status TEXT,
            id_number TEXT,
            address TEXT,
            photo TEXT,
            password TEXT NOT NULL
        )
    `);

    // Migration for existing databases accurately
    const tableInfo = await db.all("PRAGMA table_info(users)");
    const columns = tableInfo.map(c => c.name);

    const safeAddColumn = async (columnName, type) => {
        if (!columns.includes(columnName)) {
            try {
                await db.exec(`ALTER TABLE users ADD COLUMN ${columnName} ${type}`);
            } catch (err) {
                console.error(`Error adding column ${columnName}:`, err.message);
            }
        }
    };

    await safeAddColumn('username', 'TEXT'); // SQLite doesn't support UNIQUE in ADD COLUMN
    await safeAddColumn('contact', 'TEXT');
    await safeAddColumn('gender', 'TEXT');
    await safeAddColumn('marital_status', 'TEXT');
    await safeAddColumn('id_number', 'TEXT');
    await safeAddColumn('address', 'TEXT');
    await safeAddColumn('photo', 'TEXT');

    // Categories Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);

    // Transactions Table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            category_id INTEGER,
            amount REAL NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
    `);

    // Insert default categories if none exist
    const categoriesCount = await db.get('SELECT COUNT(*) as count FROM categories WHERE user_id IS NULL');
    if (categoriesCount.count === 0) {
        const defaultCategories = [
            ['Salary', 'income'], ['Investment', 'income'], ['Other', 'income'],
            ['Food', 'expense'], ['Transport', 'expense'], ['Rent', 'expense'],
            ['Leisure', 'expense'], ['Health', 'expense']
        ];
        for (const [name, type] of defaultCategories) {
            await db.run('INSERT INTO categories (name, type) VALUES (?, ?)', [name, type]);
        }
    }

    return db;
}

module.exports = setupDb;
