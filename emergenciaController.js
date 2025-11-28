const TelefoneUtil = require('./TelefoneUtil');

const getTelefonesUteis = async (req, res) => {
    try {
    const telefones = await TelefoneUtil.getTelefonesUteis();
    res.json({ success: true, telefones, data: { telefones } });
    } catch (error) {
        console.error('Erro ao buscar telefones:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar telefones úteis'
        });
    }
};

module.exports = {
    getTelefonesUteis
};