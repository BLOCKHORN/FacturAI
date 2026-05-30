
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import ws from 'ws';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function scrapeOfficialBoe(province: string, pages: number) {
  console.log(`🚀 Iniciando Extracción Masiva del Gobierno para: ${province}`);
  
  for (let p = 0; p <= pages; p++) {
    const url = `https://www.boe.es/buscar/borme.php?campo%5B0%5D=TXT&dato%5B0%5D=${province}&page_hits=50&sort_field%5B0%5D=fpu&sort_order%5B0%5D=desc`;
    console.log(`📡 Fetching: ${url}`);
    
    try {
      const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const $ = cheerio.load(res.data);
      const list = $('.listado > li').toArray();
      
      for (const item of list) {
        const title = $(item).find('h4').text().trim();
        // El titulo suele ser: "ALICANTE - NOMBRE EMPRESA SL"
        const name = title.split(' - ')[1]?.trim();
        
        const txtLink = $(item).find('a[href*="txt.php"]').attr('href');
        if (name && txtLink) {
          const detailUrl = `https://www.boe.es${txtLink}`;
          const detailRes = await axios.get(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const $d = cheerio.load(detailRes.data);
          const text = $d('#textoxml').text() || $d('.texto').text();
          
          // Extraemos CIF
          const cifMatch = text.match(/[ABCDEFGHJNPQRSUVW]\d{8}/);
          // Extraemos Domicilio
          const domMatch = text.match(/Domicilio: (.*?) \((.*?)\)/i) || text.match(/domicilio social\. (.*?) \((.*?)\)/i);
          
          if (cifMatch && name) {
            const cif = cifMatch[0];
            const address = domMatch ? domMatch[1] : '';
            const city = domMatch ? domMatch[2] : province;

            const { error } = await supabase
              .from('global_verified_companies')
              .upsert({
                cif,
                legal_name: name,
                address,
                city,
                province: province.includes('ALICANTE') ? 'ALICANTE' : 'CASTELLON',
                data_source: 'BOE_OFFICIAL_SEARCH_SCRAPER'
              }, { onConflict: 'cif' });

            if (!error) console.log(`✅ [BORME] Inyectado: ${name} (${cif})`);
          }
        }
      }
      // Delay para no ser baneados
      await new Promise(r => setTimeout(r, 1000));
    } catch (e: any) {
      console.error(`❌ Error en pagina ${p}:`, e.message);
    }
  }
}

async function run() {
  await scrapeOfficialBoe('CASTELLON', 2);
  await scrapeOfficialBoe('ALICANTE', 2);
}

run();
