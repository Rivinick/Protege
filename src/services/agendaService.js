const db = require('../config/agendaDatabase');

const run = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve(this);
        });
    });

const get = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.get(sql, params, function (err, row) {
            if (err) return reject(err);
            resolve(row);
        });
    });

const all = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.all(sql, params, function (err, rows) {
            if (err) return reject(err);
            resolve(rows);
        });
    });

const listPessoas = () => {
    const sql = `
        SELECT *
        FROM Pessoa
        INNER JOIN Telefone ON Pessoa.IdPessoa = Telefone.IdPessoa_FK
        ORDER BY Pessoa.IdPessoa DESC, Pessoa.Nome ASC
    `;

    return all(sql);
};

const createPessoaWithTelefone = async ({
    CPF,
    Nome,
    Cargo,
    Empresa,
    Email,
    Senha,
    Numero,
    UnidadedaSaude
}) => {
    const insertPessoaSql = `
        INSERT INTO Pessoa (CPF, Nome, Cargo, Empresa, Email, Senha)
        VALUES (?,?,?,?,?,?)
    `;

    const pessoaResult = await run(insertPessoaSql, [CPF, Nome, Cargo, Empresa, Email, Senha]);
    const pessoaId = pessoaResult.lastID;

    const insertTelefoneSql = `
        INSERT INTO Telefone (Numero, UnidadedaSaude, IdPessoa_FK)
        VALUES (?,?,?)
    `;
    await run(insertTelefoneSql, [Numero, UnidadedaSaude, pessoaId]);

    return pessoaId;
};

const getPessoaTelefone = (idPessoa, idTelefone) => {
    const sql = `
        SELECT *
        FROM Pessoa
        INNER JOIN Telefone ON Pessoa.IdPessoa = Telefone.IdPessoa_FK
        WHERE Pessoa.IdPessoa = ? AND Telefone.IdTelefone = ?
    `;

    return get(sql, [idPessoa, idTelefone]);
};

const createTelefone = (idPessoa, { Numero, UnidadedaSaude }) => {
    const sql = `
        INSERT INTO Telefone (Numero, UnidadedaSaude, IdPessoa_FK)
        VALUES (?,?,?)
    `;

    return run(sql, [Numero, UnidadedaSaude, idPessoa]);
};

const updatePessoa = (idPessoa, { CPF, Nome, Cargo, Empresa, Email, Senha }) => {
    const sql = `
        UPDATE Pessoa
        SET CPF = ?, Nome = ?, Cargo = ?, Empresa = ?, Email = ?, Senha = ?
        WHERE IdPessoa = ?
    `;

    return run(sql, [CPF, Nome, Cargo, Empresa, Email, Senha, idPessoa]);
};

const updateTelefone = (idTelefone, { Numero, UnidadedaSaude }) => {
    const sql = `
        UPDATE Telefone
        SET Numero = ?, UnidadedaSaude = ?
        WHERE IdTelefone = ?
    `;

    return run(sql, [Numero, UnidadedaSaude, idTelefone]);
};

const deleteTelefone = (idTelefone) => {
    const sql = `DELETE FROM Telefone WHERE IdTelefone = ?`;
    return run(sql, [idTelefone]);
};

const deletePessoa = (idPessoa) => {
    const sql = `DELETE FROM Pessoa WHERE IdPessoa = ?`;
    return run(sql, [idPessoa]);
};

module.exports = {
    listPessoas,
    createPessoaWithTelefone,
    getPessoaTelefone,
    createTelefone,
    updatePessoa,
    updateTelefone,
    deleteTelefone,
    deletePessoa
};

