const path = require('path');

const APP_PORT = process.env.APP_PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SESSION_SECRET = process.env.SESSION_SECRET || 'protege-plus-secret';
const AGENDA_DB_PATH = process.env.AGENDA_DB_PATH || path.join(__dirname, '../../BD_questionario.db');

module.exports = {
    APP_PORT,
    NODE_ENV,
    SESSION_SECRET,
    AGENDA_DB_PATH
};

