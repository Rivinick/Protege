const express = require('express');
const router = express.Router();
// const { checkAuth } = require('../controllers/authController');
const { getTelefonesUteis } = require('../controllers/emergenciaController');

// Routes are public to support guest access from the web UI
router.get('/telefones', getTelefonesUteis);

module.exports = router;