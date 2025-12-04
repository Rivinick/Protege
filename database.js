const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_SOURCE = path.join(__dirname, './db/BD_Protege_v12.db');

const initializeDatabase = () => {
    // Ensure the db directory exists
    const dbDir = path.dirname(DB_SOURCE);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database connection
    const db = new sqlite3.Database(DB_SOURCE, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

    return db;
};

module.exports = {
    db: initializeDatabase(),
    DB_SOURCE
};