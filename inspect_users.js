const sqlite3 = require('./server/node_modules/sqlite3').verbose();
const { open } = require('./server/node_modules/sqlite');
const path = require('path');

async function inspectUsers() {
    const db = await open({
        filename: path.join(__dirname, 'server', 'database.sqlite'),
        driver: sqlite3.Database
    });

    console.log("--- USERS ---");
    const users = await db.all("SELECT id, username, email, password FROM users");
    console.log(JSON.stringify(users, null, 2));
    await db.close();
}

inspectUsers().catch(console.error);
