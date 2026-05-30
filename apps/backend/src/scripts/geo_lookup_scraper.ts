
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';
import ws from 'ws';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

// Lista de CIFs conocidos en Castellón y Marina Alta para validar el scraper
const targetCifs = [
  'A12004241', // PORCELANOSA SA (Castellón)
  'A12011030', // PAMESA CERAMICA SL (Castellón)
  'A03011343', // BALEÀRIA EUROPARGENTINA (Dénia - Marina Alta)
  'A03063806', // ROLSER SA (Pedreguer - Marina Alta)
  'A12002369', // AZULIBER SA (Castellón)
];

async function scrapeAndInject() {
  console.log('🏗️ Iniciando Barrido Geográfico: Castellón & Marina Alta');
  
  for (const cif of targetCifs) {
    console.log(`\n🔍 Scrapeando CIF: ${cif}...`);
    try {
      const res = await fetch(`https://librebor.me/borme/empresa/${cif}/`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (!res.ok) continue;
      
      const html = await res.text();
      const $ = cheerio.load(html);
      const name = $('.box-title').text().trim();
      let address = '';
      let zip_code = '';
      let city = '';
      let province = '';

      $('dt').each((i, el) => {
        if ($(el).text().toLowerCase().includes('domicilio')) {
          address = $(el).next('dd').text().trim();
          const zipMatch = address.match(/(\d{5})/);
          if (zipMatch) zip_code = zipMatch[1];
          
          if (address.toUpperCase().includes('CASTELLON')) province = 'CASTELLON';
          if (address.toUpperCase().includes('ALICANTE')) province = 'ALICANTE';
          
          // Limpieza básica de ciudad (suele estar después del CP)
          const parts = address.split(zip_code);
          if (parts[1]) city = parts[1].replace(/[\(\),\.]/g, '').trim();
        }
      });

      if (name) {
        const { error } = await supabase
          .from('global_verified_companies')
          .upsert({
            cif,
            legal_name: name,
            address,
            zip_code,
            city: city || province,
            province,
            data_source: 'SCRAPED_OFFICIAL'
          }, { onConflict: 'cif' });

        if (error) console.error(`❌ Error inyectando ${name}:`, error.message);
        else console.log(`✅ Inyectado con éxito: ${name} (${province})`);
      }
    } catch (err: any) {
      console.error(`⚠️ Fallo en ${cif}:`, err.message);
    }
    // Delay para no ser bloqueados
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log('\n✨ Barrido completado.');
}

scrapeAndInject();
