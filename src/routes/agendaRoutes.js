const express = require('express');
const agendaController = require('../controllers/agendaController');

const router = express.Router();

router.get('/pessoas', agendaController.listPessoas);

router.get('/inserirPessoa', agendaController.showInserirPessoa);
router.post('/inserirPessoa', agendaController.inserirPessoa);

router.get('/inserirTelefone/:id_m/:id_d', agendaController.showInserirTelefone);
router.post('/inserirTelefone/:id_m/:id_d', agendaController.inserirTelefone);

router.get('/editar/:id_m/:id_d', agendaController.showEditarPessoa);
router.post('/editar/:id_m/:id_d', agendaController.editarPessoa);

router.get('/delete/:id_m/:id_d', agendaController.showDelete);
router.post('/delete/:id_d', agendaController.deletarTelefone);
router.get('/deletaTodos/:id_m', agendaController.deletarPessoa);

module.exports = router;

