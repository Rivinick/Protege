const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const sqlite = require("sqlite3").verbose(); // Importando o SQLite

const app = express();
const port = 3000; // Porta padrão do projeto

// --- CONFIGURAÇÃO DO BANCO DE DADOS SQLITE ---
// Conecta ao arquivo que deve estar na RAIZ do projeto
const db = new sqlite.Database("./BD_questionario.db", (err) => {
    if (err) {
        console.error('ERRO: Não foi possível conectar ao banco SQLite. Verifique se o arquivo BD_questionario.db está na raiz do projeto.', err.message);
    } else {
        console.log('Conectado com sucesso ao banco de dados SQLite.');
    }
});

// --- CONFIGURAÇÕES DO EXPRESS ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout'); // Layout padrão para as páginas do Protege
app.use(expressLayouts);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// ==================================================================
// ROTAS ORIGINAIS DO PROTEGE (Baseado no seu projeto)
// ==================================================================

app.get('/', (req, res) => {
    res.redirect('/login');
});

// --- Autenticação ---
app.get('/login', (req, res) => {
    res.render('login', { layout: false });
});
app.post('/login', (req, res) => {
    res.redirect('/home');
});
app.get('/cadastro', (req, res) => {
    res.render('cadastro', { layout: false });
});
app.post('/cadastro', (req, res) => {
    res.redirect('/home');
});

// --- Páginas Principais ---
app.get('/home', (req, res) => {
    res.render('home', { layout: false });
});
app.get('/visitante', (req, res) => res.redirect('/home'));

app.get('/emergencia', (req, res) => {
    res.render('emergencia', { layout: false });
});

// --- Rotas de Sintomas (Vistas na sua imagem) ---
app.get('/sintomas', (req, res) => {
    res.render('sintomas', { layout: false });
});
app.get('/sintomas/queixas', (req, res) => {
    // Se este arquivo não existir, pode dar erro. Confirme se seus colegas criaram.
    res.render('queixas', { layout: false });
});
app.get('/sintomas/procedimentos', (req, res) => {
    res.render('procedimentos', { layout: false });
});
app.get('/sintomas/diagnosticos', (req, res) => {
    res.render('diagnosticos', { layout: false });
});
// Exemplo de rota com parâmetro que vi na sua imagem
app.get('/sintomas/detalhes/:codigo', (req, res) => {
    res.render('detalhe_ciap', { layout: false, codigo: req.params.codigo });
});


// ==================================================================
// NOVAS ROTAS: CRUD SQLITE (Mestre/Detalhe)
// Usamos { layout: false } para usar nosso próprio head.ejs com Bootstrap
// ==================================================================

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

// ==================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ==================================================================
app.listen(port, () => {
    console.log(`--- SERVIDOR PROTEGE ATIVO ---`);
    console.log(`Acesse: http://localhost:${port}`);
});