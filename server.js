const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();
const port = 3000;

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
app.get('/', (req, res) => {
    // Corrigido: apenas redireciona para /login
    res.redirect('/login');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { user: { name: 'Usuário Teste' } });
});

app.get('/login', (req, res) => {
    res.render('login', { layout: false }); // Tela full-screen, sem layout padrão
});

app.get('/cadastro', (req, res) => {
    res.render('cadastro', { layout: false }); // Também tela independente
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

app.get('/home', (req, res) => {
  res.render('home', { layout: false });
});

// Após cadastro, redireciona para a home
app.post('/cadastro', (req, res) => {
  res.redirect('/home');
});

app.get('/sintomas', (req, res) => res.send('Tela de Sintomas - em desenvolvimento'));
app.get('/teste', (req, res) => res.send('Tela de Teste de Conhecimento - em desenvolvimento'));

// Login -> redireciona para Home
app.post('/login', (req, res) => {
  res.redirect('/home');
});

// Visitante -> redireciona também
app.get('/visitante', (req, res) => {
  res.redirect('/home');
});

app.get('/emergencia', (req, res) => {
  res.render('emergencia', { layout: false });
});
