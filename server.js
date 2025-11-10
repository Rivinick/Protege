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
    res.render('emergencia', { layout: false });
});

app.get('/sintomas', (req, res) => {
    res.render('sintomas', { layout: false });
});

// Sintomas sub-pages
app.get('/sintomas/queixas', (req, res) => {
    // Render dedicated queixas view (symptom checklist + verify)
    res.render('queixas', { layout: false });
});

app.get('/sintomas/procedimentos', (req, res) => {
    res.render('procedimentos', { layout: false });
});

app.get('/sintomas/diagnosticos', (req, res) => {
    res.render('diagnosticos', { layout: false });
});

// Detalhes de um item CIAP (página de detalhe)
app.get('/sintomas/detalhes/:codigo', (req, res) => {
    const codigo = req.params.codigo;
    res.render('detalhe_ciap', { layout: false, codigo });
});

// --- ADIÇÃO 2: Rotas do Novo Formulário de Exemplo ---

// 1. LISTAR (Read)
app.get("/questoes", function (req, res) {
    const sql = "SELECT * FROM questao_questionario, resposta_questionario WHERE IdQuestao=IdQuestao_FK ORDER BY IdQuestao desc";
    db.all(sql, [], function (err, rows) {
        if (err) return console.error(err.message);
        res.render("crud_index.ejs", { dados: rows, layout: false });
    });
});

// 2. INSERIR MESTRE (Create Questão)
app.get("/inserirM", function (req, res) {
    res.render("inserirM.ejs", { dados: {}, layout: false });
});
app.post("/inserirM", function (req, res) {
    const sql1 = "INSERT INTO questao_questionario (Descricao,Resposta_correta,IdPessoa_FK,IdProcedimento_FK) VALUES (?,?,?,?)";
    const dadosMestre = [req.body.Descricao, req.body.Resposta_correta, req.body.IdPessoa_FK, req.body.IdProcedimento_FK];
    db.run(sql1, dadosMestre, function (err) {
        if (err) return console.error(err.message);
        // Pega o ID da última questão criada para inserir a resposta inicial
        db.get("SELECT IdQuestao FROM questao_questionario ORDER BY IdQuestao DESC limit 1", [], function (err, row) {
            if (err) return console.error(err.message);
            const sql3 = "INSERT INTO resposta_questionario (Letra,DescricaoResposta,IdQuestao_FK) VALUES (?,?,?)";
            const dadosDetalhe = [req.body.Letra, req.body.DescricaoResposta, row.IdQuestao];
            db.run(sql3, dadosDetalhe, function (err) {
                if (err) return console.error(err.message);
                res.redirect("/questoes");
            });
        });
    });
});

// 3. INSERIR DETALHE (Create Resposta)
app.get("/inserirD/:id_m/:id_d", (req, res) => {
    const sql = "SELECT * FROM questao_questionario, resposta_questionario WHERE (IdQuestao=IdQuestao_FK) and (IdQuestao =?) and (IdResposta =?)";
    db.get(sql, [req.params.id_m, req.params.id_d], function (err, row) {
        if (err) return console.error(err.message);
        res.render("inserirD.ejs", { dado: row, Letra: "", DescricaoResposta: "", layout: false });
    });
});
app.post("/inserirD/:id_m/:id_d", (req, res) => {
    const sql3 = "INSERT INTO resposta_questionario (Letra,DescricaoResposta,IdQuestao_FK) VALUES (?,?,?)";
    db.run(sql3, [req.body.Letra, req.body.DescricaoResposta, req.params.id_m], function (err) {
        if (err) return console.error(err.message);
        res.redirect("/questoes");
    });
});

// 4. EDITAR (Update)
app.get("/editar/:id_m/:id_d", function (req, res) {
    const sql = "SELECT * FROM questao_questionario, resposta_questionario WHERE (IdQuestao=IdQuestao_FK) and (IdQuestao =?) and (IdResposta =?)";
    db.get(sql, [req.params.id_m, req.params.id_d], function (err, row) {
        if (err) return console.error(err.message);
        res.render("editar.ejs", { dados: row, layout: false });
    });
});
app.post("/editar/:id_m/:id_d", function (req, res) {
    const sql1 = "UPDATE questao_questionario SET Descricao=?,Resposta_correta=?,IdPessoa_FK=?,IdProcedimento_FK=? WHERE (IdQuestao = ?)";
    const dadosMestre = [req.body.Descricao, req.body.Resposta_correta, req.body.IdPessoa_FK, req.body.IdProcedimento_FK, req.params.id_m];
    const sql2 = "UPDATE resposta_questionario SET Letra=?,DescricaoResposta=? WHERE (IdResposta = ?)";
    const dadosDetalhe = [req.body.Letra, req.body.DescricaoResposta, req.params.id_d];
    db.run(sql1, dadosMestre, function (err) {
        if (err) return console.error(err.message);
        db.run(sql2, dadosDetalhe, function (err) {
            if (err) return console.error(err.message);
            res.redirect("/questoes");
        });
    });
});

// 5. DELETAR (Delete)
// Deletar apenas uma resposta
app.get("/delete/:id_m/:id_d", function (req, res) {
    const sql = "SELECT * FROM questao_questionario, resposta_questionario WHERE (IdQuestao=IdQuestao_FK) and (IdQuestao =?) and (IdResposta =?)";
    db.get(sql, [req.params.id_m, req.params.id_d], function (err, row) {
        if (err) return console.error(err.message);
        res.render("delete.ejs", { dados: row, layout: false });
    });
});
app.post("/delete/:id_d", function (req, res) {
    db.run("DELETE FROM resposta_questionario WHERE IdResposta = ?", req.params.id_d, function (err) {
        if (err) return console.error(err.message);
        res.redirect("/questoes");
    });
});
// Deletar Questão inteira (Mestre + Detalhes)
app.get("/deletaTodos/:id_m", function (req, res) {
    db.run("DELETE FROM resposta_questionario WHERE IdQuestao_FK = ?", req.params.id_m, (err) => {
         if (err) console.error(err.message);
         db.run("DELETE FROM questao_questionario WHERE IdQuestao = ?", req.params.id_m, function (err) {
            if (err) return console.error(err.message);
            res.redirect("/questoes");
        });
    });
});

// --- INICIAR SERVIDOR ---
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});