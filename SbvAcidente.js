const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_SOURCE = path.join(__dirname, './db/BD_Protege_v12.db');

class SbvAcidente {
    constructor(data) {
        // Mapeia as propriedades de forma flexível para suportar diferentes nomes de coluna
        this.cod = data.cod || data.COD || data.Cod || '';
        this.enfermidade = data.enfermidade || data.ENFERMIDADE || data.Enfermidade || '';
        this.categoria = data.categoria || data.CATEGORIA || data.Categoria || '';
        this.sintomas_proced = data.sintomas_proced || data.SINTOMAS_PROCED || data.Sintomas_proced || '';
    }

    static getAcidentes() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_SOURCE, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                const query = `SELECT COD, ENFERMIDADE, CATEGORIA, SINTOMAS_PROCED 
                             FROM sbv_acidentes 
                             ORDER BY ENFERMIDADE ASC`;

                db.all(query, [], (err, rows) => {
                    db.close();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows.map(row => new SbvAcidente(row)));
                    }
                });
            });
        });
    }

    static getAcidenteByCod(cod) {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(DB_SOURCE, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                const query = `SELECT COD, ENFERMIDADE, CATEGORIA, SINTOMAS_PROCED 
                             FROM sbv_acidentes 
                             WHERE COD = ?`;

                db.get(query, [cod], (err, row) => {
                    db.close();
                    if (err) {
                        reject(err);
                    } else if (row) {
                        resolve(new SbvAcidente(row));
                    } else {
                        resolve(null);
                    }
                });
            });
        });
    }
}

module.exports = SbvAcidente;
