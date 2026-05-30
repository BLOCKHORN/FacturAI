
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

async function extractFromGovXml(url: string, province: string) {
  console.log(`📡 Analizando Registro Oficial: ${url}`);
  try {
    const res = await axios.get(url);
    const $ = cheerio.load(res.data, { xmlMode: true });
    
    const articulos = $('p.articulo').toArray();
    let count = 0;

    for (const art of articulos) {
      const parrafo = $(art).next('p.parrafo').text();
      
      // Filtramos actos que tengan datos fiscales útiles: Constitución o Cambio de Domicilio
      if (parrafo.includes('Constitución') || parrafo.includes('Cambio de domicilio')) {
        const artText = $(art).text();
        const nameMatch = artText.match(/\d+ - (.*)/);
        if (!nameMatch) continue;
        
        const companyName = nameMatch[1].trim();
        
        // Extracción de Domicilio y Ciudad
        const domMatch = parrafo.match(/Domicilio: (.*?) \((.*?)\)/i) || parrafo.match(/domicilio social\. (.*?) \((.*?)\)/i);
        
        if (domMatch) {
          const address = domMatch[1].trim();
          const city = domMatch[2].trim();
          
          // El BORME no siempre pone el CIF en el sumario de constitución (se asigna después)
          // Pero para actos de empresas existentes (Cambios), sí suele estar.
          // Intentamos cazar cualquier patrón de CIF: [ABCDEFGHJNPQRSUVW]\d{8}
          const cifMatch = parrafo.match(/[ABCDEFGHJNPQRSUVW]\d{8}/);
          const cif = cifMatch ? cifMatch[0] : `PENDIENTE_${companyName.replace(/\s+/g, '_')}`;

          // Solo inyectamos si tenemos un CIF real o si queremos guardar el registro para lookup posterior
          if (cif && !cif.startsWith('PENDIENTE')) {
            const { error } = await supabase
              .from('global_verified_companies')
              .upsert({
                cif,
                legal_name: companyName,
                address,
                city,
                province,
                data_source: 'BOE_BORME_OFFICIAL_EXTRACTOR'
              }, { onConflict: 'cif' });
            
            if (!error) {
              console.log(`✅ [${province}] Inyectado: ${companyName}`);
              count++;
            }
          }
        }
      }
    }
    return count;
  } catch (e: any) {
    console.error(`❌ Error en XML: ${e.message}`);
    return 0;
  }
}

async function startDeepMining(days: number) {
  console.log(`🏗️  Iniciando Minería de Datos del Gobierno (BORME)...`);
  let total = 0;
  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
    
    try {
      const res = await axios.get(`https://www.boe.es/datosabiertos/api/borme/sumario/${dateStr}`, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.data?.data?.sumario?.diario) continue;
      
      const diarios = Array.isArray(res.data.data.sumario.diario) ? res.data.data.sumario.diario : [res.data.data.sumario.diario];
      
      for (const diario of diarios) {
        const secciones = Array.isArray(diario.seccion) ? diario.seccion : [diario.seccion];
        for (const seccion of secciones) {
          const items = Array.isArray(seccion.item) ? seccion.item : [seccion.item];
          for (const item of items) {
            if (item.titulo.includes('CASTELLON') || item.titulo.includes('ALICANTE')) {
              if (item.url_xml) {
                const added = await extractFromGovXml(item.url_xml, item.titulo);
                total += added;
              }
            }
          }
        }
      }
    } catch (e) {}
    // Pequeño respiro para la API
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`\n✨ Hidratación completada. Se han inyectado ${total} empresas verificadas del BOE.`);
}

// Ejecutamos para los últimos 60 días para asegurar volumen
startDeepMining(60);
