require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./src/routes/authRoutes');
const ciapRoutes = require('./src/routes/ciapRoutes');
const emergenciaRoutes = require('./src/routes/emergenciaRoutes');

const app = express();
const port = 3000;

// Session configuration
app.use(session({
    secret: 'protege-plus-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: process.env.NODE_ENV === 'production'}
}));

// Improved error reporting for uncaught exceptions/rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/ciap', ciapRoutes);
app.use('/api/emergencia', emergenciaRoutes);


// --- ROTAS PRINCIPAIS ---

// Make the home screen the first screen when accessing the site
app.get('/', (req, res) => {
    res.render('home', {layout: false});
});

app.get('/login', (req, res) => {
    res.render('login', {layout: false});
});

// Login -> redireciona para Home
app.post('/login', (req, res) => {
    console.log('Tentativa de Login:', req.body);
    res.redirect('/home');
});

app.get('/cadastro', (req, res) => {
    res.render('cadastro', {layout: false});
});

// Após cadastro, redireciona para a home
app.post('/cadastro', (req, res) => {
    console.log('Novos dados de Cadastro:', req.body);
    res.redirect('/home');
});

app.get('/home', (req, res) => {
    res.render('home', {layout: false});
});

app.get('/teste', (req, res) => res.send('Tela de Teste de Conhecimento - em desenvolvimento'));

app.get('/visitante', (req, res) => {
    res.redirect('/home');
});

app.get('/emergencia', (req, res) => {
    res.render('emergencia', {layout: false});
});

app.get('/sintomas', (req, res) => {
    res.render('sintomas', {layout: false});
});

// Sintomas sub-pages
app.get('/sintomas/queixas', (req, res) => {
    // Render dedicated queixas view (symptom checklist + verify)
    res.render('queixas', {layout: false});
});

app.get('/sintomas/procedimentos', (req, res) => {
    res.render('procedimentos', {layout: false});
});

app.get('/sintomas/diagnosticos', (req, res) => {
    res.render('diagnosticos', {layout: false});
});

// Detalhes de um item CIAP (página de detalhe)
app.get('/sintomas/detalhes/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    res.render('detalhe_ciap', {layout: false, codigo});
});

// --- ADIÇÃO 2: Rotas do Novo Formulário de Exemplo ---

// Rota para EXIBIR o formulário de exemplo
// (Corrigido por você, está perfeito!)
app.get('/formulario', (req, res) => {
    // Agora o formularioExemplo.ejs usará o seu layout.ejs padrão!
    res.render('formularioExemplo', {layout: false});
});

// --- ATUALIZAÇÃO DO "PASSO 3" APLICADA AQUI ---
// Rota para PROCESSAR o envio do formulário (POST)
app.post('/salvar-formulario', (req, res) => {

    // Atualizei os console.log para mostrar o conceito Mestre/Detalhe
    // com os campos do novo formulário de "Pedido de Suprimentos".

    console.log('--- DADOS DO FORMULÁRIO (MESTRE/DETALHE) ---');

    // --- MESTRE (O Pedido em si) ---
    console.log('MESTRE: ID do Pedido:', req.body.idPedido);
    console.log('MESTRE: Data do Pedido:', req.body.dataPedido);
    console.log('MESTRE: Solicitante:', req.body.solicitante);
    console.log('------------------------------------------------');

    // --- DETALHE (Itens do Pedido) ---
    console.log('DETALHE: Item 1 - Nome:', req.body.item1Nome);
    console.log('DETALHE: Item 1 - Qtd:', req.body.item1Quantidade);
    console.log('DETALHE: Item 1 - Obs:', req.body.item1Observacoes);

    // Verifica se o Item 2 (opcional) foi preenchido
    if (req.body.item2Nome && req.body.item2Nome !== '') {
        console.log('------------------------------------------------');
        console.log('DETALHE: Item 2 - Nome:', req.body.item2Nome);
        console.log('DETALHE: Item 2 - Qtd:', req.body.item2Quantidade);
        console.log('DETALHE: Item 2 - Obs:', req.body.item2Observacoes);
    }
    console.log('================================================');

    // Envia uma resposta simples de volta para o navegador
    res.send('Formulário recebido com sucesso! Verifique o console do VSCode para ver os dados Mestre/Detalhe.');
});


// --- INICIAR SERVIDOR ---
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});