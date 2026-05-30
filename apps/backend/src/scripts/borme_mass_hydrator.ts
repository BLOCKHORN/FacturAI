
import axios from 'axios';
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

async function hydrateFromXml(url: string, province: string) {
  console.log(`📡 Fetching XML: ${url}`);
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data, { xmlMode: true });
    
    const articulos = $('p.articulo').toArray();
    
    for (const art of articulos) {
      const artText = $(art).text();
      // Formato: "NUMERO - NOMBRE EMPRESA"
      const nameMatch = artText.match(/\d+ - (.*)/);
      if (!nameMatch) continue;
      
      const companyName = nameMatch[1].trim();
      const parrafo = $(art).next('p.parrafo').text();
      
      // Intentamos extraer domicilio
      let address = '';
      let city = '';
      let zipCode = '';
      let cif = '';

      // Regex para Domicilio: C/ ..., AVDA ... seguido de (CIUDAD)
      const domMatch = parrafo.match(/Domicilio: (.*?) \((.*?)\)/i) || parrafo.match(/domicilio social\. (.*?) \((.*?)\)/i);
      
      if (domMatch) {
        address = domMatch[1].trim();
        city = domMatch[2].trim();
      }

      // Regex para CIF en el texto
      const cifMatch = parrafo.match(/[ABCDEFGHJNPQRSUVW]\d{8}/);
      if (cifMatch) cif = cifMatch[0];

      // Si tenemos nombre y al menos ciudad o direccion, inyectamos
      if (companyName && (address || city)) {
        // Nota: El CIF es la clave primaria. Si no lo tenemos, 
        // usaremos un hash del nombre como ID temporal o simplemente saltamos si queremos 100% legal.
        // Pero para "llenar", si encontramos el CIF en el texto, es perfecto.
        
        if (cif) {
          const { error } = await supabase
            .from('global_verified_companies')
            .upsert({
              cif,
              legal_name: companyName,
              address: address || city,
              city: city,
              province: province,
              data_source: 'BORME_OFFICIAL_CRAWLER'
            }, { onConflict: 'cif' });
            
          if (!error) console.log(`✅ Inyectada: ${companyName} (${cif})`);
        }
      }
    }
  } catch (e: any) {
    console.error(`❌ Error parsing XML: ${e.message}`);
  }
}

async function runHydrator(days: number) {
  const today = new Date();
  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
    
    try {
      const res = await axios.get(`https://www.boe.es/datosabiertos/api/borme/sumario/${dateStr}`, {
        headers: { 'Accept': 'application/json' }
      });
      
      const items = res.data.data.sumario.diario[0].seccion[0].item;
      for (const item of items) {
        if (item.titulo.includes('CASTELLON') || item.titulo.includes('ALICANTE')) {
          await hydrateFromXml(item.url_xml, item.titulo);
        }
      }
    } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
  }
}

runHydrator(10);
