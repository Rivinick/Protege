const { db } = require('../config/database');

class GrupoCiap {
    constructor(data) {
        this.id = data.id_grupo;
        this.componente = data.componente;
    }

    static getGruposCiap() {
        return new Promise((resolve, reject) => {
            const query = `SELECT id_grupo, componente FROM grupo_ciap 
                         WHERE id_grupo IN (1, 2, 7)
                         ORDER BY id_grupo ASC`;
            
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => new GrupoCiap(row)));
                }
            });
        });
    }

    static getItensFromTbCiap(grupoId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT codigo_ciap2, enfermidade_leigo, id_grupo_fk
                         FROM tb_ciap
                         WHERE id_grupo_fk = ?
                         ORDER BY enfermidade_leigo ASC`;
            
            db.all(query, [grupoId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => ({
                        codigo: row.codigo_ciap2,
                        nome: row.enfermidade_leigo,
                        idGrupo: row.id_grupo_fk
                    })));
                }
            });
        });
    }

    static getItensFromProcedimentoClinico(grupoId) {
        return new Promise((resolve, reject) => {
            const query = `SELECT codigociap2_fk, enfermidade_leigo, id_grupo_fk
                         FROM procedimento_clinico
                         WHERE id_grupo_fk = ?
                         ORDER BY enfermidade_leigo ASC`;
            
            db.all(query, [grupoId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => ({
                        codigo: row.codigociap2_fk,
                        nome: row.enfermidade_leigo,
                        idGrupo: row.id_grupo_fk
                    })));
                }
            });
        });
    }
}

module.exports = GrupoCiap;