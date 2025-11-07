const GrupoCiap = require('../models/GrupoCiap');
const DetalheCiap = require('../models/DetalheCiap');

const getGruposCiap = async (req, res) => {
    try {
    const grupos = await GrupoCiap.getGruposCiap();
    // normalized response: include both legacy key and a data wrapper
    res.json({ success: true, grupos, data: { grupos } });
    } catch (error) {
        console.error('Erro ao buscar grupos CIAP:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar grupos CIAP'
        });
    }
};

const getItensCiap = async (req, res) => {
    try {
        const { grupoId } = req.params;
    const itens = await GrupoCiap.getItensFromTbCiap(grupoId);
    res.json({ success: true, itens, data: { itens } });
    } catch (error) {
        console.error('Erro ao buscar itens CIAP:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar itens CIAP'
        });
    }
};

const getItensProcedimento = async (req, res) => {
    try {
        const { grupoId } = req.params;
    const itens = await GrupoCiap.getItensFromProcedimentoClinico(grupoId);
    res.json({ success: true, itens, data: { itens } });
    } catch (error) {
        console.error('Erro ao buscar procedimentos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar procedimentos'
        });
    }
};

const getDetalhesCiap = async (req, res) => {
    try {
        const { codigo } = req.params;
        const detalhes = await DetalheCiap.getDetalhesCiap(codigo);
        const subSintomas = await DetalheCiap.getSubSintomas(codigo);
        
        const payload = {
            ...detalhes,
            subSintomas
        };

        res.json({ 
            success: true, 
            detalhes: payload,
            data: { detalhes: payload }
        });
    } catch (error) {
        console.error('Erro ao buscar detalhes CIAP:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar detalhes CIAP'
        });
    }
};

const getSintomasPuros = async (req, res) => {
    try {
    const sintomas = await DetalheCiap.getSintomasPuros();
    res.json({ success: true, sintomas, data: { sintomas } });
    } catch (error) {
        console.error('Erro ao buscar sintomas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar sintomas'
        });
    }
};

const verificarSintomas = async (req, res) => {
    try {
    const { sintomas } = req.body;
    const enfermidades = await DetalheCiap.getEnfermidadesPorSintomas(sintomas);
    res.json({ success: true, enfermidades, data: { enfermidades } });
    } catch (error) {
        console.error('Erro ao verificar sintomas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar sintomas'
        });
    }
};

module.exports = {
    getGruposCiap,
    getItensCiap,
    getItensProcedimento,
    getDetalhesCiap,
    getSintomasPuros,
    verificarSintomas
};