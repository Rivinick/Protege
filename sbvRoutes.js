const express = require('express');
const router = express.Router();
const { getAcidentes, getAcidenteDetalhes } = require('./sbvController');

router.get('/suporte-basico-vida', (req, res) => {
    res.render('sbv_index');
});

router.get('/api/sbv/acidentes', getAcidentes);
router.get('/api/sbv/acidentes/:cod', getAcidenteDetalhes);

module.exports = router;
