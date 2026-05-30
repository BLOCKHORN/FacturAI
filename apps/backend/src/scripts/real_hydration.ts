
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function resolveCif(name: string) {
  try {
    const searchUrl = `https://infonif.economia3.com/buscar-empresa?buscar=${encodeURIComponent(name)}`;
    const res = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
    const $ = cheerio.load(res.data);
    const detailUrl = $('.card-title a').first().attr('href');
    if (!detailUrl) return null;
    
    const detailRes = await axios.get(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
    const $d = cheerio.load(detailRes.data);
    
    // Selectores específicos basados en la estructura de Infonif
    const cif = $d('td:contains("NIF")').next().text().trim();
    const address = $d('td:contains("Domicilio")').next().text().trim();
    const city = $d('td:contains("Localidad")').next().text().trim();
    const zipCode = $d('td:contains("Código Postal")').next().text().trim();
    const province = $d('td:contains("Provincia")').next().text().trim();

    return { cif, address, city, zipCode, province };
  } catch (e: any) { 
    console.error(`  ⚠️ Error resolviendo ${name}: ${e.message}`);
    return null; 
  }
}

async function run() {
  console.log('🚀 Iniciando Hidratación REAL (Targeted)...');
  
  const targetCompanies = [
    'BP ENERGIA ESPAÑA SAU',
    'KERABEN GRUPO SA',
    'CERACASA SA',
    'GRESPANIA SA',
    'BALEÀRIA EUROLÍNEAS MARÍTIMAS S.A.',
    'ROLSER SA',
    'JUAN FORNES FORNES SA',
    'MARINA SALUD SA',
    'VAPF SA'
  ];

  for (const name of targetCompanies) {
    console.log(`🔍 Buscando: ${name}...`);
    const data = await resolveCif(name);
    
    if (data && data.cif && data.zipCode) {
      const { error } = await supabase.from('global_verified_companies').upsert({
        cif: data.cif,
        legal_name: name,
        address: data.address,
        city: data.city,
        zip_code: data.zipCode,
        province: data.province,
        data_source: 'REAL_GOV_HYDRATOR'
      }, { onConflict: 'cif' });

      if (error) console.error(`  ❌ Error DB: ${error.message}`);
      else console.log(`  ✅ OK: ${name} (${data.cif})`);
    } else {
      console.log(`  ⚠️  Datos incompletos para ${name} (Falta CIF o CP)`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('\n✨ Proceso completado.');
}

run();
