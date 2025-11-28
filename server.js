require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const path = require('path');
const sqlite = require("sqlite3").verbose();

// ==========================
// IMPORTA AS ROTAS 
// ==========================
const authRoutes = require('./authRoutes');
const ciapRoutes = require('./ciapRoutes');
const emergenciaRoutes = require('./emergenciaRoutes');

const app = express();
const port = process.env.APP_PORT || 3000;

// ==========================
// BANCO DE DADOS SQLITE
// ==========================
const db = new sqlite.Database("./BD_questionario.db", (err) => {
    if (err) {
        console.error('ERRO: Não foi possível conectar ao banco SQLite.', err.message);
    } else {
        console.log('Conectado com sucesso ao banco de dados SQLite (Agenda).');
    }
});

// ==========================
// CONFIGURAÇÕES EXPRESS
// ==========================
app.use(session({
    secret: 'protege-plus-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err?.stack || err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================
// ROTAS DE API
// ==========================
app.use('/api/auth', authRoutes);
app.use('/api/ciap', ciapRoutes);
app.use('/api/emergencia', emergenciaRoutes);

// ==========================
// ROTAS PRINCIPAIS
// ==========================
app.get('/', (req, res) => res.render('home', { layout: false }));
app.get('/login', (req, res) => res.render('login', { layout: false }));
app.post('/login', (req, res) => res.redirect('/home'));
app.get('/cadastro', (req, res) => res.render('cadastro', { layout: false }));
app.post('/cadastro', (req, res) => res.redirect('/home'));
app.get('/home', (req, res) => res.render('home', { layout: false }));
app.get('/teste', (req, res) => res.send('Tela de Teste de Conhecimento - em desenvolvimento'));
app.get('/visitante', (req, res) => res.redirect('/home'));
app.get('/emergencia', (req, res) => res.render('emergencia', { layout: false }));

app.get('/sintomas', (req, res) => res.render('sintomas', { layout: false }));
app.get('/sintomas/queixas', (req, res) => res.render('queixas', { layout: false }));
app.get('/sintomas/procedimentos', (req, res) => res.render('procedimentos', { layout: false }));
app.get('/sintomas/diagnosticos', (req, res) => res.render('diagnosticos', { layout: false }));
app.get('/sintomas/detalhes/:codigo', (req, res) => {
    res.render('detalhe_ciap', { layout: false, codigo: req.params.codigo });
});

// ==========================
// CRUD DA AGENDA
// ==========================
app.get("/pessoas", (req, res) => {
    const sql = "SELECT * FROM Pessoa, Telefone WHERE Pessoa.IdPessoa = Telefone.IdPessoa_FK ORDER BY Pessoa.IdPessoa DESC, Pessoa.Nome ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);
        res.render("crud_index.ejs", { dados: rows, layout: false });
    });
});

app.get("/inserirPessoa", (req, res) => {
    res.render("inserirM.ejs", { dados: {}, layout: false });
});
app.post("/inserirPessoa", (req, res) => {
    const sql1 = "INSERT INTO Pessoa (CPF, Nome, Cargo, Empresa, Email, Senha) VALUES (?,?,?,?,?,?)";
    const dadosMestre = [req.body.CPF, req.body.Nome, req.body.Cargo, req.body.Empresa, req.body.Email, req.body.Senha];

    db.run(sql1, dadosMestre, function (err) {
        if (err) return console.error(err.message);

        db.get("SELECT IdPessoa FROM Pessoa ORDER BY IdPessoa DESC limit 1", [], (err, row) => {
            if (err) return console.error(err.message);

            const FK = row.IdPessoa;

            const sql3 = "INSERT INTO Telefone (Numero, UnidadedaSaude, IdPessoa_FK) VALUES (?,?,?)";
            const dadosDetalhe = [req.body.Numero, req.body.UnidadedaSaude, FK];

            db.run(sql3, dadosDetalhe, (err) => {
                if (err) return console.error(err.message);
                res.redirect("/pessoas");
            });
        });
    });
});

// Editar Mestre + Detalhe
app.get("/editar/:id_m/:id_d", (req, res) => {
    const sql = "SELECT * FROM Pessoa, Telefone WHERE Pessoa.IdPessoa = Telefone.IdPessoa_FK AND IdPessoa = ? AND IdTelefone = ?";
    db.get(sql, [req.params.id_m, req.params.id_d], (err, row) => {
        if (err) return console.error(err.message);
        res.render("editar.ejs", { dados: row, layout: false });
    });
});

app.post("/editar/:id_m/:id_d", (req, res) => {
    const sql1 = "UPDATE Pessoa SET CPF=?, Nome=?, Cargo=?, Empresa=?, Email=?, Senha=? WHERE IdPessoa=?";
    const sql2 = "UPDATE Telefone SET Numero=?, UnidadedaSaude=? WHERE IdTelefone=?";
    
    const dados1 = [req.body.CPF, req.body.Nome, req.body.Cargo, req.body.Empresa, req.body.Email, req.body.Senha, req.params.id_m];
    const dados2 = [req.body.Numero, req.body.UnidadedaSaude, req.params.id_d];

    db.run(sql1, dados1, (err) => {
        if (err) return console.error(err.message);

        db.run(sql2, dados2, (err) => {
            if (err) return console.error(err.message);
            res.redirect("/pessoas");
        });
    });
});

// Deletar Mestre + Detalhes
app.get("/deletaTodos/:id_m", (req, res) => {
    db.run("DELETE FROM Pessoa WHERE IdPessoa = ?", req.params.id_m, (err) => {
        if (err) return console.error(err.message);
        res.redirect("/pessoas");
    });
});

// ==========================
// INICIA SERVIDOR
// ==========================
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
