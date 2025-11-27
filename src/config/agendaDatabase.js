const sqlite3 = require('sqlite3').verbose();
const { AGENDA_DB_PATH } = require('./env');

const db = new sqlite3.Database(AGENDA_DB_PATH, (err) => {
    if (err) {
        console.error('ERRO: Não foi possível conectar ao banco SQLite da agenda.', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite (Agenda).');
    }
});

module.exports = db;
