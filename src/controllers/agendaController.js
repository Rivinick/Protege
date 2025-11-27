const agendaService = require('../services/agendaService');

const listPessoas = async (req, res, next) => {
    try {
        const dados = await agendaService.listPessoas();
        res.render('crud_index.ejs', { dados, layout: false });
    } catch (error) {
        next(error);
    }
};

const showInserirPessoa = (req, res) => {
    res.render('inserirM.ejs', { dados: {}, layout: false });
};

const inserirPessoa = async (req, res, next) => {
    try {
        await agendaService.createPessoaWithTelefone(req.body);
        res.redirect('/pessoas');
    } catch (error) {
        next(error);
    }
};

const showInserirTelefone = async (req, res, next) => {
    try {
        const dado = await agendaService.getPessoaTelefone(req.params.id_m, req.params.id_d);
        res.render('inserirD.ejs', {
            dado,
            Numero: '',
            UnidadedaSaude: '',
            layout: false
        });
    } catch (error) {
        next(error);
    }
};

const inserirTelefone = async (req, res, next) => {
    try {
        await agendaService.createTelefone(req.params.id_m, req.body);
        res.redirect('/pessoas');
    } catch (error) {
        next(error);
    }
};

const showEditarPessoa = async (req, res, next) => {
    try {
        const dados = await agendaService.getPessoaTelefone(req.params.id_m, req.params.id_d);
        res.render('editar.ejs', { dados, layout: false });
    } catch (error) {
        next(error);
    }
};

const editarPessoa = async (req, res, next) => {
    try {
        await agendaService.updatePessoa(req.params.id_m, req.body);
        await agendaService.updateTelefone(req.params.id_d, req.body);
        res.redirect('/pessoas');
    } catch (error) {
        next(error);
    }
};

const showDelete = async (req, res, next) => {
    try {
        const dados = await agendaService.getPessoaTelefone(req.params.id_m, req.params.id_d);
        res.render('delete.ejs', { dados, layout: false });
    } catch (error) {
        next(error);
    }
};

const deletarTelefone = async (req, res, next) => {
    try {
        await agendaService.deleteTelefone(req.params.id_d);
        res.redirect('/pessoas');
    } catch (error) {
        next(error);
    }
};

const deletarPessoa = async (req, res, next) => {
    try {
        await agendaService.deletePessoa(req.params.id_m);
        res.redirect('/pessoas');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listPessoas,
    showInserirPessoa,
    inserirPessoa,
    showInserirTelefone,
    inserirTelefone,
    showEditarPessoa,
    editarPessoa,
    showDelete,
    deletarTelefone,
    deletarPessoa
};

