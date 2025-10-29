const express = require('express');
const router = express.Router();

// Redireciona raiz para login
router.get('/', (req, res) => res.redirect('/login'));

// Login
router.get('/login', (req, res) => res.render('login'));
router.post('/login', (req, res) => {
  // Lógica de autenticação futura
  res.redirect('/dashboard');
});

// Cadastro
router.get('/cadastro', (req, res) => res.render('cadastro'));
router.post('/cadastro', (req, res) => {
  // Lógica de cadastro futura
  res.redirect('/login');
});

// Dashboard (exemplo)
router.get('/dashboard', (req, res) => res.render('dashboard'));

module.exports = router;
