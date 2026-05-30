
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function scrapeBoeSearch(query: string) {
  console.log(`🔎 Buscando empresas oficial de: ${query}...`);
  try {
    const url = `https://www.boe.es/buscar/borme.php?campo%5B0%5D=TXT&dato%5B0%5D=${query}&operador%5B0%5D=and&campo%5B1%5D=TIT&dato%5B1%5D=&operador%5B1%5D=and&campo%5B2%5D=NIF&dato%5B2%5D=&operador%5B2%5D=and&page_hits=50&sort_field%5B0%5D=fpu&sort_order%5B0%5D=desc`;
    
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const $ = cheerio.load(res.data);
    const results = $('.listado > li').toArray();
    
    console.log(`Encontrados ${results.length} resultados preliminares.`);
    
    for (const el of results) {
      const title = $(el).find('h4').text().trim();
      // El titulo suele ser "PROVINCIA - NOMBRE EMPRESA" o similar
      
      const link = $(el).find('.enlacesMas > li > a').first().attr('href');
      if (link && link.includes('txt.php')) {
        const fullLink = `https://www.boe.es${link}`;
        // Aquí iríamos al texto del anuncio para sacar el CIF y Domicilio
        console.log(`📍 Acto encontrado: ${title}`);
      }
    }
  } catch (e: any) {
    console.error(`❌ Error: ${e.message}`);
  }
}

scrapeBoeSearch('VILLARREAL');
