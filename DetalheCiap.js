const { db } = require('./database');

class DetalheCiap {
    constructor(data) {
        this.codigo = data.codigo_ciap2;
        this.nomeLeigo = data.enfermidade_leigo;
        this.sintomasInclusos = data.sintomas_inclusos;
        this.sintomasExclusao = data.sintomas_exclusao;
        this.possiveisCid10 = data.possiveis_cid10;
        this.outrosSintomas = data.outros_sintomas;
    }

    static getDetalhesCiap(codigoCiap) {
        return new Promise((resolve, reject) => {
            const query = `SELECT codigo_ciap2, enfermidade_leigo, sintomas_inclusos,
                                sintomas_exclusao, possiveis_cid10, outros_sintomas
                         FROM tb_ciap
                         WHERE codigo_ciap2 = ?`;
            
            db.get(query, [codigoCiap], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? new DetalheCiap(row) : null);
                }
            });
        });
    }

    static getSubSintomas(codigoCiap) {
        return new Promise((resolve, reject) => {
            const query = `SELECT sub_enfermidade
                         FROM tb_sintomas
                         WHERE CIAP2_Codigo_fk = ?
                         ORDER BY sub_enfermidade ASC`;
            
            db.all(query, [codigoCiap], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => ({
                        nome: row.sub_enfermidade
                    })));
                }
            });
        });
    }

    static getEnfermidadesPorSintomas(codigosSintomas) {
        return new Promise((resolve, reject) => {
            if (!codigosSintomas.length) {
                resolve([]);
                return;
            }

            let placeholders = codigosSintomas.map(() => '(sintomas_inclusos LIKE ? OR outros_sintomas LIKE ?)').join(' OR ');
            let params = [];
            codigosSintomas.forEach(codigo => {
                params.push(`% ${codigo}%`);
                params.push(`% ${codigo}%`);
            });

            const query = `SELECT codigo_ciap2, enfermidade_leigo, id_grupo_fk,
                                 sintomas_inclusos, outros_sintomas
                          FROM tb_ciap
                          WHERE ${placeholders}`;
            
            db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => ({
                        codigo: row.codigo_ciap2,
                        nome: row.enfermidade_leigo,
                        idGrupo: row.id_grupo_fk,
                        textoSintomasInclusos: row.sintomas_inclusos,
                        textoOutrosSintomas: row.outros_sintomas
                    })));
                }
            });
        });
    }

    static getSintomasPuros() {
        return new Promise((resolve, reject) => {
            const query = `SELECT CIAP2_Codigo_fk, sub_enfermidade
                         FROM tb_sintomas
                         WHERE CIAP2_Codigo_fk IS NOT NULL 
                         AND CIAP2_Codigo_fk NOT LIKE '*%'
                         AND sub_enfermidade IS NOT NULL 
                         AND sub_enfermidade != ''
                         GROUP BY CIAP2_Codigo_fk, sub_enfermidade
                         ORDER BY sub_enfermidade ASC`;
            
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => ({
                        codigo: row.CIAP2_Codigo_fk,
                        nome: row.sub_enfermidade,
                        idGrupo: 1 // Mantendo consistência com o código original
                    })));
                }
            });
        });
    }
}

module.exports = DetalheCiap;