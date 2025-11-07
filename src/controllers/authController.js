const User = require('../models/User');

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const isValid = await User.verifyLogin(email, senha);
        
        if (isValid) {
            req.session.user = { email };
            // return normalized payload with user info in data
            res.json({ success: true, user: { email }, data: { user: { email } } });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Email ou senha inválidos' 
            });
        }
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
};

const register = async (req, res) => {
    try {
        const userData = {
            nome: req.body.nome,
            cpf: req.body.cpf,
            cargo: req.body.cargo,
            telefone: req.body.telefone,
            empresa: req.body.empresa,
            email: req.body.email,
            senha: req.body.senha
        };

    const user = await User.createUser(userData);
    // wrap created user in a data object for consistency
    res.json({ success: true, user, data: { user } });
    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(400).json({ 
            success: false, 
            message: error.message || 'Erro ao criar usuário' 
        });
    }
};

const logout = (req, res) => {
    req.session.destroy();
    res.json({ success: true });
};

const checkAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Não autorizado' 
        });
    }
};

module.exports = {
    login,
    register,
    logout,
    checkAuth
};