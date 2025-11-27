const sessionConfig = (() => {
    const { NODE_ENV, SESSION_SECRET } = require('./env');

    return {
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: NODE_ENV === 'production'
        }
    };
})();

module.exports = sessionConfig;

