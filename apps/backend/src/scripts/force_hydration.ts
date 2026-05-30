
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
    const res = await axios.get(`https://infonif.economia3.com/buscar-empresa?buscar=${encodeURIComponent(name)}`, { timeout: 10000 });
    const $ = cheerio.load(res.data);
    const detailUrl = $('.card-title a').first().attr('href');
    if (!detailUrl) return null;
    
    const detailRes = await axios.get(detailUrl, { timeout: 10000 });
    const $d = cheerio.load(detailRes.data);
    return {
      cif: $d('td:contains("NIF")').next().text().trim(),
      address: $d('td:contains("Domicilio")').next().text().trim(),
      city: $d('td:contains("Localidad")').next().text().trim(),
      zip: $d('td:contains("Código Postal")').next().text().trim(),
      province: $d('td:contains("Provincia")').next().text().trim()
    };
  } catch (e) { return null; }
}

async function run() {
  console.log('🚀 Extrayendo empresas clave de Castellón y Marina Alta...');
  const companies = [
    'BP ENERGIA ESPAÑA SAU',
    'KERABEN GRUPO SA',
    'CERACASA SA',
    'GRESPANIA SA',
    'AZULEJOS ALCOR SA',
    'HOTEL LOS ANGELES DENIA SL',
    'PONS QUIMICAS SL',
    'CHG PROMOCIONES INMOBILIARIAS SL',
    'MARINA SALUD SA',
    'VAPF SA'
  ];

  for (const name of companies) {
    const data = await resolveCif(name);
    if (data && data.cif) {
      const { error } = await supabase.from('global_verified_companies').upsert({
        cif: data.cif,
        legal_name: name,
        address: data.address,
        city: data.city,
        zip_code: data.zip,
        province: data.province,
        data_source: 'ULTIMATE_GOV_RESOLVER'
      }, { onConflict: 'cif' });

      if (error) console.error(`❌ Error con ${name}:`, error.message);
      else console.log(`✅ Inyectada con éxito: ${name} (${data.cif})`);
    }
  }
  console.log('✨ Proceso finalizado.');
}

run();
