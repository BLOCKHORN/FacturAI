const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATA_URL = 'https://dadesobertes.gva.es/dataset/ac050833-9d08-40f5-bb7e-027db6347682/resource/e20d8485-cfd7-48e0-8ebc-a5a5bb69b230/download/cooperativas-valencianas_202501.csv';

const CP_MAP = {
    'PICASSENT': '46220',
    'ONDA': '12200',
    'CASTELLON DE LA PLANA': '12001',
    'ALMASSORA': '12550',
    'DENIA': '03700',
    'PEDREGUER': '03750',
    'VILA-REAL': '12540',
    'OROPESA DEL MAR': '12594'
};

const fixEncoding = (str) => {
    if (!str) return '';
    try {
        return Buffer.from(str, 'latin1').toString('utf8')
            .replace(/Ã“/g, 'Ó').replace(/Ãˆ/g, 'È').replace(/Ã€/g, 'À')
            .replace(/Âº/g, 'º').replace(/Ã /g, 'à').replace(/Ã©/g, 'é').trim();
    } catch (e) { return str.trim(); }
};

const seed = async () => {
    console.log('ETL Mágico: Limpieza + Carga REST...');
    https.get(DATA_URL, (res) => {
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', async () => {
            const lines = Buffer.concat(chunks).toString('utf8').split('\n');
            const headers = lines[0].split(';');
            const results = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(';');
                if (values.length < 2) continue;
                const data = {};
                headers.forEach((h, idx) => data[h.trim()] = values[idx]?.trim() || '');

                if (data['CD_NIF'] && data['DS_RAZON_SOCIAL']) {
                    const city = fixEncoding(data['DS_MUNICIPIO']).toUpperCase();
                    results.push({
                        cif: data['CD_NIF'].toUpperCase(),
                        legal_name: fixEncoding(data['DS_RAZON_SOCIAL']).toUpperCase(),
                        address: fixEncoding(data['DS_DOMICILIO']).toUpperCase() || 'S/N',
                        city: city.split('/')[0].trim(),
                        zip_code: CP_MAP[city] || (data['CD_PROVINCIA'] || '46').padStart(2, '0') + '000',
                        province: fixEncoding(data['DS_PROVINCIA']).toUpperCase().split('/')[0].trim(),
                        data_source: 'COOPERATIVAS_GVA_2025'
                    });
                }
            }

            console.log(`Inyectando ${results.length} empresas...`);
            for (let i = 0; i < results.length; i += 100) {
                const chunk = results.slice(i, i + 100);
                const req = https.request({
                    hostname: SUPABASE_URL.replace('https://', ''),
                    path: '/rest/v1/global_verified_companies',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Prefer': 'resolution=merge-duplicates'
                    }
                });
                req.write(JSON.stringify(chunk));
                req.end();
            }
            console.log('--- ETL FINALIZADO ---');
        });
    });
};
seed();
