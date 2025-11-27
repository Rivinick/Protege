const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const session = require('express-session');

const sessionConfig = require('./config/session');
const registerRoutes = require('./routes');
const registerProcessHandlers = require('./utils/processHandlers');

const createApp = () => {
    const app = express();

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));
    app.set('layout', 'layout');

    app.use(expressLayouts);
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(session(sessionConfig));

    registerProcessHandlers();
    registerRoutes(app);

    return app;
};

module.exports = createApp;

