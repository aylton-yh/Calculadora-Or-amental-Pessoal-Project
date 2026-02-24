const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function checkSchema() {
    const db = await open({
        filename: path.join(__dirname, 'server', 'database.sqlite'),
        driver: sqlite3.Database
    });

    console.log("--- USERS TABLE SCHEMA ---");
    const tableInfo = await db.all("PRAGMA table_info(users)");
    tableInfo.forEach(col => {
        console.log(`${col.name} (${col.type})`);
    });
    console.log("--------------------------");
    await db.close();
}

checkSchema().catch(console.error);
