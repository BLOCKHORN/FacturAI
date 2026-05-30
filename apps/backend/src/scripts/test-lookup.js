const fetch = require('node-fetch');

const test = async () => {
    try {
        const res = await fetch('http://localhost:3001/api/company/lookup?cif=F40546053', {
            headers: {
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` // Usamos el service key como auth temporal
            }
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
};

test();
