require('dotenv').config();
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const path = require('path');
const sqlite = require("sqlite3").verbose();

// ==================================================================
// IMPORTAÇÃO DE ROTAS
// ==================================================================
const authRoutes = require('./authRoutes');
const ciapRoutes = require('./ciapRoutes');
const emergenciaRoutes = require('./emergenciaRoutes');

const app = express();
const port = process.env.APP_PORT || 3000;

// ==================================================================
// CONFIGURAÇÃO DO BANCO DE DADOS SQLITE
// ==================================================================
const db = new sqlite.Database("./BD_questionario.db", (err) => {
    if (err) {
        console.error('ERRO: Não foi possível conectar ao banco SQLite.', err.message);
    } else {
        console.log('Conectado com sucesso ao banco de dados SQLite.');
    }
});

// ==================================================================
// CONFIGURAÇÕES DO EXPRESS
// ==================================================================
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

// Rotas de API
app.use('/api/auth', authRoutes);
app.use('/api/ciap', ciapRoutes);
app.use('/api/emergencia', emergenciaRoutes);

// ==================================================================
// ROTAS ORIGINAIS (LOGIN, HOME, SINTOMAS)
// ==================================================================
app.get('/', (req, res) => res.render('home', { layout: false }));
app.get('/login', (req, res) => res.render('login', { layout: false }));
app.post('/login', (req, res) => res.redirect('/home'));
app.get('/cadastro', (req, res) => res.render('cadastro', { layout: false }));
app.post('/cadastro', (req, res) => res.redirect('/home'));
app.get('/home', (req, res) => res.render('home', { layout: false }));
app.get('/visitante', (req, res) => res.redirect('/home'));
app.get('/emergencia', (req, res) => res.render('emergencia', { layout: false }));

// --- AQUI ESTAVA O ERRO, AGORA CORRIGIDO (Note o "));" no final) ---
app.get('/sintomas', (req, res) => res.render('sintomas', { layout: false }));
app.get('/sintomas/queixas', (req, res) => res.render('queixas', { layout: false }));
app.get('/sintomas/procedimentos', (req, res) => res.render('procedimentos', { layout: false }));
app.get('/sintomas/diagnosticos', (req, res) => res.render('diagnosticos', { layout: false }));

app.get('/sintomas/detalhes/:codigo', (req, res) => {
    res.render('detalhe_ciap', { layout: false, codigo: req.params.codigo });
});

// ==================================================================
// MÓDULO 1: AGENDA DE CONTATOS (PESSOA / TELEFONE)
// ==================================================================

// Listar Pessoas
app.get("/pessoas", (req, res) => {
    const sql = "SELECT * FROM Pessoa, Telefone WHERE Pessoa.IdPessoa = Telefone.IdPessoa_FK ORDER BY Pessoa.IdPessoa DESC, Pessoa.Nome ASC";
    db.all(sql, [], (err, rows) => {
        if (err) return console.error(err.message);
        res.render("crud_index.ejs", { dados: rows, layout: false });
    });
});

// Inserir Pessoa (Mestre)
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
            const sql3 = "INSERT INTO Telefone (Numero, UnidadedaSaude, IdPessoa_FK) VALUES (?,?,?)";
            db.run(sql3, [req.body.Numero, req.body.UnidadedaSaude, row.IdPessoa], (err) => {
                if (err) return console.error(err.message);
                res.redirect("/pessoas");
            });
        });
    });
});

// Inserir Telefone (Detalhe)
app.get("/inserirTelefone/:id_m/:id_d", (req, res) => {
    const sql = "SELECT * FROM Pessoa, Telefone WHERE (Pessoa.IdPessoa = Telefone.IdPessoa_FK) and (IdPessoa =?) and (IdTelefone =?)";
    db.get(sql, [req.params.id_m, req.params.id_d], (err, row) => {
        if (err) return console.error(err.message);
        res.render("inserirD.ejs", { dado: row, Numero: "", UnidadedaSaude: "", layout: false });
    });
});
app.post("/inserirTelefone/:id_m/:id_d", (req, res) => {
    const sql3 = "INSERT INTO Telefone (Numero, UnidadedaSaude, IdPessoa_FK) VALUES (?,?,?)";
    db.run(sql3, [req.body.Numero, req.body.UnidadedaSaude, req.params.id_m], (err) => {
        if (err) return console.error(err.message);
        res.redirect("/pessoas");
    });
});

// Editar
app.get("/editar/:id_m/:id_d", (req, res) => {
    const sql = "SELECT * FROM Pessoa, Telefone WHERE (Pessoa.IdPessoa = Telefone.IdPessoa_FK) and (IdPessoa =?) and (IdTelefone =?)";
    db.get(sql, [req.params.id_m, req.params.id_d], (err, row) => {
        if (err) return console.error(err.message);
        res.render("editar.ejs", { dados: row, layout: false });
    });
});
app.post("/editar/:id_m/:id_d", (req, res) => {
    const sql1 = "UPDATE Pessoa SET CPF=?, Nome=?, Cargo=?, Empresa=?, Email=?, Senha=? WHERE IdPessoa=?";
    const sql2 = "UPDATE Telefone SET Numero=?, UnidadedaSaude=? WHERE IdTelefone=?";
    
    db.run(sql1, [req.body.CPF, req.body.Nome, req.body.Cargo, req.body.Empresa, req.body.Email, req.body.Senha, req.params.id_m], (err) => {
        if (err) return console.error(err.message);
        db.run(sql2, [req.body.Numero, req.body.UnidadedaSaude, req.params.id_d], (err) => {
            if (err) return console.error(err.message);
            res.redirect("/pessoas");
        });
    });
});

// Deletar
app.get("/delete/:id_m/:id_d", (req, res) => {
    const sql = "SELECT * FROM Pessoa, Telefone WHERE (Pessoa.IdPessoa = Telefone.IdPessoa_FK) and (IdPessoa =?) and (IdTelefone =?)";
    db.get(sql, [req.params.id_m, req.params.id_d], (err, row) => {
        if (err) return console.error(err.message);
        res.render("delete.ejs", { dados: row, layout: false });
    });
});
app.post("/delete/:id_d", (req, res) => {
    db.run("DELETE FROM Telefone WHERE IdTelefone = ?", req.params.id_d, (err) => {
        if (err) return console.error(err.message);
        res.redirect("/pessoas");
    });
});
app.get("/deletaTodos/:id_m", (req, res) => {
    db.run("DELETE FROM Pessoa WHERE IdPessoa = ?", req.params.id_m, (err) => {
        if (err) return console.error(err.message);
        res.redirect("/pessoas");
    });
});


// ==================================================================
// MÓDULO 2: CRUD DE QUESTIONÁRIO (QUESTÃO / ALTERNATIVA)
// ==================================================================

// Listar Questões
app.get("/quiz", function (req, res) {
    const sql = "SELECT * FROM Questao, Alternativa WHERE Questao.IdQuestao = Alternativa.IdQuestao_FK ORDER BY Questao.IdQuestao DESC";
    db.all(sql, [], function (err, rows) {
        if (err) return console.error(err.message);
        res.render("quiz_index.ejs", { dados: rows, layout: false });
    });
});

// Inserir Questão
app.get("/novaQuestao", function (req, res) {
    res.render("quiz_inserirM.ejs", { dados: {}, layout: false });
});
app.post("/novaQuestao", function (req, res) {
    const sql1 = "INSERT INTO Questao (Titulo, Categoria, Dificuldade) VALUES (?,?,?)";
    const dadosMestre = [req.body.Titulo, req.body.Categoria, req.body.Dificuldade];
    
    db.run(sql1, dadosMestre, function (err) {
        if (err) return console.error(err.message);
        db.get("SELECT IdQuestao FROM Questao ORDER BY IdQuestao DESC limit 1", [], function (err, row) {
            if (err) return console.error(err.message);
            const sql2 = "INSERT INTO Alternativa (Texto, EhCorreta, IdQuestao_FK) VALUES (?,?,?)";
            db.run(sql2, [req.body.Texto, req.body.EhCorreta, row.IdQuestao], function (err) {
                if (err) return console.error(err.message);
                res.redirect("/quiz");
            });
        });
    });
});

// Inserir Alternativa
app.get("/novaAlternativa/:id_m", (req, res) => {
    db.get("SELECT * FROM Questao WHERE IdQuestao = ?", [req.params.id_m], function(err, row) {
        if (err) return console.error(err.message);
        res.render("quiz_inserirD.ejs", { dado: row, Texto: "", EhCorreta: "", layout: false });
    });
});
app.post("/novaAlternativa/:id_m", (req, res) => {
    const sql = "INSERT INTO Alternativa (Texto, EhCorreta, IdQuestao_FK) VALUES (?,?,?)";
    db.run(sql, [req.body.Texto, req.body.EhCorreta, req.params.id_m], function (err) {
        if (err) return console.error(err.message);
        res.redirect("/quiz");
    });
});

// Deletar Quiz
app.get("/deletarAlternativa/:id_d", function (req, res) {
    db.run("DELETE FROM Alternativa WHERE IdAlternativa = ?", req.params.id_d, function (err) {
        if (err) return console.error(err.message);
        res.redirect("/quiz");
    });
});
app.get("/deletarQuestao/:id_m", function (req, res) {
    db.run("DELETE FROM Questao WHERE IdQuestao = ?", req.params.id_m, function (err) {
        if (err) return console.error(err.message);
        res.redirect("/quiz");
    });
});

// ==================================================================
// MÓDULO 3: ÁREA DO ALUNO (REALIZAR PROVA)
// ==================================================================

// 1. Mostrar a Prova (GET)
app.get("/responder-quiz", function (req, res) {
    const sql = "SELECT * FROM Questao, Alternativa WHERE Questao.IdQuestao = Alternativa.IdQuestao_FK ORDER BY Questao.IdQuestao DESC";
    db.all(sql, [], function (err, rows) {
        if (err) return console.error(err.message);
        res.render("take_quiz.ejs", { dados: rows, layout: false });
    });
});

// 2. Corrigir a Prova (POST) - COM GABARITO
app.post("/finalizar-quiz", function (req, res) {
    const respostasUsuario = req.body;
    let acertos = 0;
    let total = 0;
    const detalhes = []; 

    const sql = `
        SELECT Q.IdQuestao, Q.Titulo, A.IdAlternativa, A.Texto, A.EhCorreta 
        FROM Questao Q 
        JOIN Alternativa A ON Q.IdQuestao = A.IdQuestao_FK
    `;

    db.all(sql, [], function (err, rows) {
        if (err) return console.error(err.message);

        const questoesMap = {};
        rows.forEach(row => {
            if (!questoesMap[row.IdQuestao]) {
                questoesMap[row.IdQuestao] = {
                    Titulo: row.Titulo,
                    Alternativas: {}
                };
            }
            questoesMap[row.IdQuestao].Alternativas[row.IdAlternativa] = {
                Texto: row.Texto,
                EhCorreta: row.EhCorreta
            };
        });

        for (const [key, value] of Object.entries(respostasUsuario)) {
            if (key.startsWith('pergunta_')) {
                const idQuestao = key.split('_')[1];
                const idAlternativaEscolhida = value;
                const questaoInfo = questoesMap[idQuestao];

                if (questaoInfo) {
                    total++;
                    const altEscolhida = questaoInfo.Alternativas[idAlternativaEscolhida];
                    
                    let textoCorreto = "";
                    for (const [id, alt] of Object.entries(questaoInfo.Alternativas)) {
                        if (alt.EhCorreta === "Sim") {
                            textoCorreto = alt.Texto;
                        }
                    }

                    const acertou = (altEscolhida && altEscolhida.EhCorreta === 'Sim');
                    if (acertou) acertos++;

                    detalhes.push({
                        pergunta: questaoInfo.Titulo,
                        suaResposta: altEscolhida ? altEscolhida.Texto : "Nenhuma",
                        respostaCerta: textoCorreto,
                        acertou: acertou
                    });
                }
            }
        }

        res.render("result_quiz.ejs", { 
            acertos: acertos, 
            total: total, 
            detalhes: detalhes, 
            layout: false 
        });
    });
});

// ==================================================================
// INICIALIZAÇÃO
// ==================================================================
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});