const express = require('express');
const router = express.Router();
const { login, register, logout, checkAuth } = require('./authController');

router.post('/login', login);
// Helpful GET for development/browser sanity: redirect to UI login or explain method
router.get('/login', (req, res) => {
	res.json({ success: false, message: 'Use POST /api/auth/login with JSON {email, senha} or visit /login for the web form.' });
});
router.post('/register', register);
router.post('/logout', logout);

module.exports = router;