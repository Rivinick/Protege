const express = require('express');
const router = express.Router();
const { checkAuth } = require('./authController');
const {
    getGruposCiap,
    getItensCiap,
    getItensProcedimento,
    getDetalhesCiap,
    getSintomasPuros,
    verificarSintomas
} = require('./ciapController');

// Note: routes are intentionally public to allow guest access from web UI

router.get('/grupos', getGruposCiap);
router.get('/itens/:grupoId', getItensCiap);
router.get('/procedimentos/:grupoId', getItensProcedimento);
router.get('/detalhes/:codigo', getDetalhesCiap);
router.get('/sintomas', getSintomasPuros);
router.post('/verificar', verificarSintomas);

module.exports = router;