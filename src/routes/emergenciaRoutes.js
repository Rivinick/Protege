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

// --- ROTA DE API COM DADOS REAIS ---
// Esta rota será acessada como: GET /api/emergencia/proximos
router.get('/proximos', async (req, res) => {
    
    // 1. RECEBE a localização que o front-end (emergencia.ejs) enviou
    const { lat, lon } = req.query;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY; // Pega do arquivo .env

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude e longitude são obrigatórias.' });
    }

    if (!apiKey) {
        console.error('Chave de API do Google não encontrada. Verifique o .env');
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }

    // 2. Monta a URL da API do Google
    const radius = 5000; // 5km
    const type = 'hospital';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${type}&key=${apiKey}`;

    console.log('--- API: Buscando hospitais reais no Google ---');
    console.log('Localização do usuário:', { lat, lon });

    try {
        // 3. Chama a API do Google
        const response = await axios.get(url);
        const results = response.data.results;

        // 4. Formata os dados do Google
        const hospitais = results.map(hospital => {
            const hospLat = hospital.geometry.location.lat;
            const hospLon = hospital.geometry.location.lng;
            const distancia = getDistance(lat, lon, hospLat, hospLon);

            return {
                nome: hospital.name,
                telefone: hospital.formatted_phone_number || hospital.vicinity || '---', 
                distancia: `${distancia.toFixed(1)} km` // "1.2 km"
            };
        });

        // 5. Envia os dados REAIS para o front-end
        console.log(`Encontrados ${hospitais.length} hospitais.`);
        res.json(hospitais);

    } catch (error) {
        console.error('Erro ao chamar a API do Google:', error.message);
        res.status(500).json({ error: 'Erro ao buscar hospitais' });
    }
});

module.exports = router;