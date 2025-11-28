const { db } = require('../config/database');

class TelefoneUtil {
    constructor(data) {
        this.id = data.IdTelefone;
        this.numero = data.Numero;
        this.unidade = data.Unidadesaude;
    }

    static getTelefonesUteis() {
        return new Promise((resolve, reject) => {
            const query = `SELECT IdTelefone, Numero, Unidadesaude
                         FROM telefonesuteis
                         ORDER BY Unidadesaude ASC`;
            
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new TelefoneUtil(row)));
                }
            });
        });
    }
}

module.exports = TelefoneUtil;