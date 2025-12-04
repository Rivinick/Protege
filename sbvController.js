const SbvAcidente = require('./SbvAcidente');

const getAcidentes = async (req, res) => {
    try {
        const acidentes = await SbvAcidente.getAcidentes();
        res.json({ success: true, acidentes, data: { acidentes } });
    } catch (error) {
        console.error('Erro ao buscar acidentes SBV:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar acidentes SBV'
        });
    }
};

const getAcidenteDetalhes = async (req, res) => {
    try {
        const { cod } = req.params;
        const acidente = await SbvAcidente.getAcidenteByCod(cod);
        
        if (!acidente) {
            return res.status(404).json({
                success: false,
                message: 'Acidente não encontrado'
            });
        }

        res.json({ success: true, acidente, data: { acidente } });
    } catch (error) {
        console.error('Erro ao buscar detalhes do acidente:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar detalhes do acidente'
        });
    }
};

module.exports = {
    getAcidentes,
    getAcidenteDetalhes
};
