
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

const dbPromise = open({
    filename: path.join(__dirname, 'users.db'),
    driver: sqlite3.Database
});

async function initializeDatabase() {
    const db = await dbPromise;

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            password TEXT NOT NULL
        )
    `);

    console.log('Users table created successfully');

    return db;
}

module.exports = initializeDatabase();
