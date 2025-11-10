const express = require('express');
const router = express.Router();
const axios = require('axios'); // Lembre-se de dar 'npm install axios'
require('dotenv').config(); // Lembre-se de dar 'npm install dotenv'

// --- FUNÇÃO PARA CALCULAR DISTÂNCIA (Haversine) ---
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// --- ROTA DE API COM DADOS REAIS E NÚMERO DE TELEFONE ---
router.get('/proximos', async (req, res) => {
    
    const { lat, lon } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude e longitude são obrigatórias.' });
    }
    if (!apiKey) {
        console.error('Chave de API do Google não encontrada. Verifique o .env');
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    // 1. PRIMEIRA CHAMADA: Encontrar hospitais próximos
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=15000&type=hospital&key=${apiKey}`;

    console.log('--- API: Buscando hospitais (Passo 1/2) ---');
    console.log('Localização do usuário:', { lat, lon });

    try {
        const response = await axios.get(searchUrl);
        let results = response.data.results; // Pega os resultados

        // --- MUDANÇA AQUI: FILTRAGEM RÍGIDA ---
        // Filtra a lista para incluir apenas locais que parecem ser relevantes
        // (Isso remove "falsos positivos" como lojas ou hotéis)
        const keywords = ['hospital', 'clínica', 'saúde', 'pronto', 'atendimento', 'upa', 'maternidade', 'emergência'];
        
        results = results.filter(hospital => {
            const nomeEmMinusculo = hospital.name.toLowerCase();
            // Verifica se o nome do local contém alguma das nossas palavras-chave
            return keywords.some(keyword => nomeEmMinusculo.includes(keyword));
        });
        // --- FIM DA MUDANÇA ---


        // 2. SEGUNDA CHAMADA: Buscar o telefone dos resultados filtrados
        console.log(`--- API: Buscando detalhes (telefone) para ${results.length} resultados filtrados (Passo 2/2) ---`);

        const hospitaisPromises = results.map(async (hospital) => {
            const hospLat = hospital.geometry.location.lat;
            const hospLon = hospital.geometry.location.lng;
            const distancia = getDistance(lat, lon, hospLat, hospLon);

            let telefone = hospital.vicinity || '---';

            try {
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${hospital.place_id}&fields=formatted_phone_number&key=${apiKey}`;
                const detailsResponse = await axios.get(detailsUrl);
                
                if (detailsResponse.data.result && detailsResponse.data.result.formatted_phone_number) {
                    telefone = detailsResponse.data.result.formatted_phone_number;
                }
            } catch (detailsError) {
                console.error(`Erro ao buscar detalhes para ${hospital.name}:`, detailsError.message);
            }

            return {
                nome: hospital.name,
                telefone: telefone,
                rawDistancia: distancia
            };
        });

        let hospitais = await Promise.all(hospitaisPromises);

        // Ordena o array pela menor 'rawDistancia'
        hospitais.sort((a, b) => a.rawDistancia - b.rawDistancia);

        // Formata depois de ordenar
        const hospitaisFormatados = hospitais.map(h => {
            return {
                nome: h.nome,
                telefone: h.telefone,
                distancia: `${h.rawDistancia.toFixed(1)} km`
            };
        });

        console.log(`Encontrados e ordenados ${hospitaisFormatados.length} hospitais com detalhes.`);
        res.json(hospitaisFormatados); 

    } catch (error) {
        console.error('Erro ao chamar a API do Google (NearbySearch):', error.message);
        res.status(500).json({ error: 'Erro ao buscar hospitais' });
    }
});

module.exports = router;