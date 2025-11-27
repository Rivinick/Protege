const { db } = require('../config/database');

class User {
    constructor(data) {
        this.nome = data.nome;
        this.cpf = data.cpf;
        this.cargo = data.cargo;
        this.telefone = data.telefone;
        this.empresa = data.empresa;
        this.email = data.email;
        this.senha = data.senha;
    }

    static createUser(userData) {
        return new Promise((resolve, reject) => {
            if (!userData.email || !userData.senha || !userData.nome) {
                reject(new Error('Email, senha e nome são obrigatórios'));
                return;
            }

            const query = `INSERT INTO pessoa (Nome, CPF, Cargo, Telefone, Empresa, Email, Senha) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)`;
            
            db.run(query, 
                [userData.nome, userData.cpf, userData.cargo, userData.telefone, 
                 userData.empresa, userData.email, userData.senha],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, ...userData });
                    }
                }
            );
        });
    }

    static verifyLogin(email, senha) {
        return new Promise((resolve, reject) => {
            if (!email || !senha) {
                reject(new Error('Email e senha são obrigatórios'));
                return;
            }

            const query = 'SELECT * FROM pessoa WHERE Email = ? AND Senha = ?';
            db.get(query, [email, senha], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? true : false);
                }
            });
        });
    }

    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM pessoa WHERE Email = ?';
            db.get(query, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new User(row) : null);
                }
            });
        });
    }
}

module.exports = User;