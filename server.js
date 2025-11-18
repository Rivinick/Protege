require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const path = require('path');
const sqlite = require("sqlite3").verbose();

// Importação das rotas originais do seu projeto
const authRoutes = require('./src/routes/authRoutes');
const ciapRoutes = require('./src/routes/ciapRoutes');
const emergenciaRoutes = require('./src/routes/emergenciaRoutes');

const app = express();
const port = process.env.APP_PORT || 3000; // Usa a porta 3000 se APP_PORT não estiver definida

// --- CONFIGURAÇÃO DO BANCO DE DADOS SQLITE ---
const db = new sqlite.Database("./BD_questionario.db", (err) => {
    if (err) {
        console.error('ERRO: Não foi possível conectar ao banco SQLite.', err.message);
    } else {
        console.log('Conectado com sucesso ao banco de dados SQLite (Agenda).');
    }
});

// --- CONFIGURAÇÕES ORIGINAIS DO SEU PROJETO ---
app.use(session({
    secret: 'protege-plus-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {secure: process.env.NODE_ENV === 'production'}
}));

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/ciap', ciapRoutes);
app.use('/api/emergencia', emergenciaRoutes);

// ==================================================================
// ROTAS ORIGINAIS (LOGIN, HOME, SINTOMAS, ETC.)
// ==================================================================

app.get('/', (req, res) => {
    res.render('home', {layout: false});
});
app.get('/login', (req, res) => {
    res.render('login', {layout: false});
});
app.post('/login', (req, res) => {
    res.redirect('/home');
});
app.get('/cadastro', (req, res) => {
    res.render('cadastro', {layout: false});
});
app.post('/cadastro', (req, res) => {
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
app.get('/sintomas/queixas', (req, res) => {
    res.render('queixas', { layout: false });
});
app.get('/sintomas/procedimentos', (req, res) => {
    res.render('procedimentos', { layout: false });
});
app.get('/sintomas/diagnosticos', (req, res) => {
    res.render('diagnosticos', { layout: false });
});
app.get('/sintomas/detalhes/:codigo', (req, res) => {
    res.render('detalhe_ciap', { layout: false, codigo: req.params.codigo });
});

// ==================================================================
// NOVAS ROTAS: CRUD DE AGENDA (PESSOA / TELEFONE)
// ==================================================================

// 1. LISTAR (Read)
app.get("/pessoas", function (req, res) {
    const sql = "SELECT * FROM Pessoa, Telefone WHERE Pessoa.IdPessoa = Telefone.IdPessoa_FK ORDER BY Pessoa.Nome asc";
    db.all(sql, [], function (err, rows) {
        if (err) return console.error(err.message);
        res.render("crud_index.ejs", { dados: rows, layout: false });
    });
});

// 2. INSERIR MESTRE (Create Pessoa + 1º Telefone)
app.get("/inserirPessoa", function (req, res) {
    // Passa um objeto vazio para 'dados' para evitar erros no EJS
    res.render("inserirM.ejs", { dados: {}, layout: false });
});
app.post("/inserirPessoa", function (req, res) {
    const sql1 = "INSERT INTO Pessoa (CPF, Nome, Cargo, Empresa, Email, Senha) VALUES (?,?,?,?,?,?)";
    const dadosMestre = [req.body.CPF, req.body.Nome, req.body.Cargo, req.body.Empresa, req.body.Email, req.body.Senha];
    
    db.run(sql1, dadosMestre, function (err) {
        if (err) return console.error(err.message);
        
        // Pega o ID da pessoa recém-criada
        db.get("SELECT IdPessoa FROM Pessoa ORDER BY IdPessoa DESC limit 1", [], function (err, row) {
            if (err) return console.error(err.message);
            const FK = row.IdPessoa;
            
            const sql3 = "INSERT INTO Telefone (Numero, UnidadedaSaude, IdPessoa_FK) VALUES (?,?,?)";
            const dadosDetalhe = [req.body.Numero, req.body.UnidadedaSaude, FK];
            
            db.run(sql3, dadosDetalhe, function (err) {
                if (err) return console.error(err.message);
                res.redirect("/pessoas");
            });
        });
    });
});

// 3. INSERIR DETALHE (Create Telefone adicional)
app.get("/inserirTelefone/:id_m/:id_d", (req, res) => {
    const sql = "SELECT * FROM Pessoa, Telefone WHERE (Pessoa.IdPessoa = Telefone.IdPessoa_FK) and (IdPessoa =?) and (IdTelefone =?)";
    db.get(sql, [req.params.id_m, req.params.id_d], function (err, row) {
        if (err) return console.error(err.message);
        // Precisamos do arquivo inserirD.ejs atualizado (vou assumir que ele existe e atualizá-lo)
        res.render("inserirD.ejs", { dado: row, Numero: "", UnidadedaSaude: "", layout: false });
    });
});
app.post("/inserirTelefone/:id_m/:id_d", (req, res) => {
    const sql3 = "INSERT INTO Telefone (Numero, UnidadedaSaude, IdPessoa_FK) VALUES (?,?,?)";
    db.run(sql3, [req.body.Numero, req.body.UnidadedaSaude, req.params.id_m], function (err) {
        if (err) return console.error(err.message);
        res.redirect("/pessoas");
    });
});

// 4. EDITAR (Update Pessoa + Telefone)
app.get("/editar/:id_m/:id_d", function (req, res) {
    const sql = "SELECT * FROM Pessoa, Telefone WHERE (Pessoa.IdPessoa = Telefone.IdPessoa_FK) and (IdPessoa =?) and (IdTelefone =?)";
    db.get(sql, [req.params.id_m, req.params.id_d], function (err, row) {
        if (err) return console.error(err.message);
        res.render("editar.ejs", { dados: row, layout: false });
    });
});
app.post("/editar/:id_m/:id_d", function (req, res) {
    const sql1 = "UPDATE Pessoa SET CPF=?, Nome=?, Cargo=?, Empresa=?, Email=?, Senha=? WHERE (IdPessoa = ?)";
    const dadosMestre = [req.body.CPF, req.body.Nome, req.body.Cargo, req.body.Empresa, req.body.Email, req.body.Senha, req.params.id_m];
    
    const sql2 = "UPDATE Telefone SET Numero=?, UnidadedaSaude=? WHERE (IdTelefone = ?)";
    const dadosDetalhe = [req.body.Numero, req.body.UnidadedaSaude, req.params.id_d];
    
    db.run(sql1, dadosMestre, function (err) {
        if (err) return console.error(err.message);
        db.run(sql2, dadosDetalhe, function (err) {
            if (err) return console.error(err.message);
            res.redirect("/pessoas");
        });
    });
});

// 5. DELETAR (Delete)
// Tela de confirmação
app.get("/delete/:id_m/:id_d", function (req, res) {
    const sql = "SELECT * FROM Pessoa, Telefone WHERE (Pessoa.IdPessoa = Telefone.IdPessoa_FK) and (IdPessoa =?) and (IdTelefone =?)";
    db.get(sql, [req.params.id_m, req.params.id_d], function (err, row) {
        if (err) return console.error(err.message);
        // Precisamos do delete.ejs atualizado (vou assumir que ele existe e atualizá-lo)
        res.render("delete.ejs", { dados: row, layout: false });
    });
});
// Deletar apenas um Telefone (Detalhe)
app.post("/delete/:id_d", function (req, res) {
    db.run("DELETE FROM Telefone WHERE IdTelefone = ?", req.params.id_d, function (err) {
        if (err) return console.error(err.message);
        res.redirect("/pessoas");
    });
});
// Deletar Pessoa inteira (Mestre + todos os Detalhes)
app.get("/deletaTodos/:id_m", function (req, res) {
    // O "ON DELETE CASCADE" no SQL do banco de dados já deve cuidar disso,
    // mas por segurança, deletamos a pessoa e os telefones são deletados em cascata.
    db.run("DELETE FROM Pessoa WHERE IdPessoa = ?", req.params.id_m, function (err) {
        if (err) return console.error(err.message);
        res.redirect("/pessoas");
    });
});

// ==================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ==================================================================
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});