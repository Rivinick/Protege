const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('home', { layout: false });
});

router.get('/login', (req, res) => {
    res.render('login', { layout: false });
});

router.post('/login', (req, res) => {
    res.redirect('/home');
});

router.get('/cadastro', (req, res) => {
    res.render('cadastro', { layout: false });
});

router.post('/cadastro', (req, res) => {
    res.redirect('/home');
});

router.get('/home', (req, res) => {
    res.render('home', { layout: false });
});

router.get('/teste', (req, res) => res.send('Tela de Teste de Conhecimento - em desenvolvimento'));

router.get('/visitante', (req, res) => {
    res.redirect('/home');
});

router.get('/emergencia', (req, res) => {
    res.render('emergencia', { layout: false });
});

router.get('/sintomas', (req, res) => {
    res.render('sintomas', { layout: false });
});

router.get('/sintomas/queixas', (req, res) => {
    res.render('queixas', { layout: false });
});

router.get('/sintomas/procedimentos', (req, res) => {
    res.render('procedimentos', { layout: false });
});

router.get('/sintomas/diagnosticos', (req, res) => {
    res.render('diagnosticos', { layout: false });
});

router.get('/sintomas/detalhes/:codigo', (req, res) => {
    res.render('detalhe_ciap', { layout: false, codigo: req.params.codigo });
});

module.exports = router;

