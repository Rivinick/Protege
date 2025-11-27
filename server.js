require('dotenv').config();

const createApp = require('./src/app');
const { APP_PORT } = require('./src/config/env');

const app = createApp();

app.listen(APP_PORT, () => {
    console.log(`Servidor rodando em http://localhost:${APP_PORT}`);
});