
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

async function resolveOfficialCif(name: string) {
  try {
    // Infonif es bueno pero a veces bloquea. Intentamos sacar el CIF de la búsqueda de Google/Bing simulada o Infonif directo.
    const searchUrl = `https://infonif.economia3.com/buscar-empresa?buscar=${encodeURIComponent(name)}`;
    const res = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 });
    const $ = cheerio.load(res.data);
    const detailUrl = $('.card-title a').first().attr('href');
    if (!detailUrl) return null;
    
    const detailRes = await axios.get(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 });
    const $d = cheerio.load(detailRes.data);
    
    return {
      cif: $d('td:contains("NIF")').next().text().trim(),
      address: $d('td:contains("Domicilio")').next().text().trim(),
      city: $d('td:contains("Localidad")').next().text().trim(),
      zipCode: $d('td:contains("Código Postal")').next().text().trim(),
      province: $d('td:contains("Provincia")').next().text().trim()
    };
  } catch (e) { return null; }
}

async function extractFromBormeXml(url: string, province: string) {
  console.log(`📡 Minando Oficial BORME: ${url}`);
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data, { xmlMode: true });
    const names: string[] = [];

    $('p.articulo').each((i, el) => {
      const text = $(el).text();
      const match = text.match(/\d+ - (.*)/);
      if (match) names.push(match[1].trim());
    });

    for (const name of names.slice(0, 15)) { // Procesamos los primeros 15 por boletín para ir rápido
      console.log(`  🔍 Resolviendo: ${name}...`);
      const data = await resolveOfficialCif(name);
      if (data && data.cif && data.cif.length === 9) {
        const { error } = await supabase.from('global_verified_companies').upsert({
          cif: data.cif,
          legal_name: name.toUpperCase(),
          address: data.address,
          city: data.city,
          zip_code: data.zipCode,
          province: province.includes('ALICANTE') ? 'ALICANTE' : 'CASTELLON',
          data_source: 'BORME_OFFICIAL_RESOLVER'
        });
        if (!error) console.log(`  ✅ INYECTADO: ${name} (${data.cif})`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  } catch (e: any) { console.error(`❌ Error XML: ${e.message}`); }
}

async function start() {
  console.log('🏗️  OPERACIÓN HIDRATACIÓN MASIVA (BORME + RESOLVER)');
  // ID 03 es Alicante, ID 12 es Castellon en el BORME
  const bulletins = [
    'https://www.boe.es/diario_borme/xml.php?id=BORME-A-2026-99-12', // Castellon ayer
    'https://www.boe.es/diario_borme/xml.php?id=BORME-A-2026-99-03', // Alicante ayer
    'https://www.boe.es/diario_borme/xml.php?id=BORME-A-2026-98-12', // Castellon 26/05
    'https://www.boe.es/diario_borme/xml.php?id=BORME-A-2026-98-03'  // Alicante 26/05
  ];

  for (const url of bulletins) {
    const prov = url.endsWith('12') ? 'CASTELLON' : 'ALICANTE';
    await extractFromBormeXml(url, prov);
  }
  
  console.log('\n✨ Sincronización con el Registro Mercantil completada.');
}

start();
