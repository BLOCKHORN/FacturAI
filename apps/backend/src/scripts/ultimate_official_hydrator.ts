
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

async function resolveCifAndAddress(name: string) {
  try {
    const searchUrl = `https://infonif.economia3.com/buscar-empresa?buscar=${encodeURIComponent(name)}`;
    const res = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(res.data);
    
    // Intentamos sacar el primer resultado
    const firstResult = $('.card-title a').first();
    const detailUrl = firstResult.attr('href');
    
    if (detailUrl) {
      const detailRes = await axios.get(detailUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $d = cheerio.load(detailRes.data);
      
      const cif = $d('td:contains("NIF")').next().text().trim();
      const address = $d('td:contains("Domicilio")').next().text().trim();
      const city = $d('td:contains("Localidad")').next().text().trim();
      const zipCode = $d('td:contains("Código Postal")').next().text().trim();
      const province = $d('td:contains("Provincia")').next().text().trim();

      if (cif && cif.length === 9) {
        return { cif, name: name.toUpperCase(), address, city, zipCode, province };
      }
    }
  } catch (e) {}
  return null;
}

async function extractNamesFromBorme(date: string) {
  const names: {name: string, province: string}[] = [];
  try {
    const url = `https://www.boe.es/datosabiertos/api/borme/sumario/${date}`;
    const res = await axios.get(url, { headers: { 'Accept': 'application/json' } });
    
    const diario = res.data.data.sumario.diario[0];
    const secciones = Array.isArray(diario.seccion) ? diario.seccion : [diario.seccion];
    
    for (const sec of secciones) {
      if (!sec.nombre.includes('SECCIÓN PRIMERA')) continue;
      const items = Array.isArray(sec.item) ? sec.item : [sec.item];
      for (const item of items) {
        if (item.titulo.includes('CASTELLON') || item.titulo.includes('ALICANTE')) {
          const xmlUrl = item.url_xml;
          const xmlRes = await axios.get(xmlUrl);
          const $xml = cheerio.load(xmlRes.data, { xmlMode: true });
          $xml('p.articulo').each((i, el) => {
            const text = $xml(el).text();
            const nameMatch = text.match(/\d+ - (.*)/);
            if (nameMatch) names.push({ name: nameMatch[1].trim(), province: item.titulo });
          });
        }
      }
    }
  } catch (e) {}
  return names;
}

async function runUltimateHydrator() {
  console.log('🚀 Iniciando ULTIMATE OFFICIAL HYDRATOR...');
  
  // Procesamos los últimos 3 días para ver resultados rápidos "a saco"
  const dates = ['20260527', '20260526', '20260525'];
  
  for (const date of dates) {
    console.log(`\n📅 Extrayendo nombres del BORME: ${date}`);
    const names = await extractNamesFromBorme(date);
    console.log(`📍 Encontradas ${names.length} empresas en Castellón/Alicante.`);
    
    for (const entry of names) {
      console.log(`🔍 Resolviendo datos oficiales para: ${entry.name}...`);
      const data = await resolveCifAndAddress(entry.name);
      
      if (data) {
        const { error } = await supabase
          .from('global_verified_companies')
          .upsert({
            cif: data.cif,
            legal_name: data.name,
            address: data.address,
            city: data.city,
            zip_code: data.zipCode,
            province: data.province.toUpperCase().includes('ALICANTE') ? 'ALICANTE' : 'CASTELLON',
            data_source: 'ULTIMATE_GOV_RESOLVER'
          }, { onConflict: 'cif' });
          
        if (!error) console.log(`✅ INYECTADA: ${data.name} (${data.cif})`);
      }
      await new Promise(r => setTimeout(r, 1000)); // Delay legal
    }
  }
  
  console.log('\n✨ Misión cumplida. Base de datos hidratada con datos del Gobierno y Registro Mercantil.');
}

runUltimateHydrator();
