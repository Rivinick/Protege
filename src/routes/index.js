const authRoutes = require('./authRoutes');
const ciapRoutes = require('./ciapRoutes');
const emergenciaRoutes = require('./emergenciaRoutes');
const viewRoutes = require('./viewRoutes');
const agendaRoutes = require('./agendaRoutes');

const registerRoutes = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api/ciap', ciapRoutes);
    app.use('/api/emergencia', emergenciaRoutes);

    app.use('/', viewRoutes);
    app.use('/', agendaRoutes);
};

module.exports = registerRoutes;

