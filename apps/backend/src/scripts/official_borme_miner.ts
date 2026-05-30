
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function mineBorme(date: string) {
  console.log(`⛏️  Iniciando minería de datos oficiales del BORME (${date})...`);
  
  try {
    const response = await axios.get(`https://www.boe.es/datosabiertos/api/borme/sumario/${date}`, {
      headers: { 'Accept': 'application/json' }
    });

    const sumario = response.data.data.sumario;
    const diarios = Array.isArray(sumario.diario) ? sumario.diario : [sumario.diario];

    for (const diario of diarios) {
      const secciones = Array.isArray(diario.seccion) ? diario.seccion : [diario.seccion];
      
      for (const seccion of secciones) {
        // Buscamos actos en Castellón y Alicante (Marina Alta)
        const items = Array.isArray(seccion.item) ? seccion.item : [seccion.item];
        
        for (const item of items) {
          const provincia = item.titulo;
          if (provincia.includes('CASTELLON') || provincia.includes('ALICANTE')) {
            console.log(`📍 Procesando provincia: ${provincia}`);
            
            // Cada item tiene una URL al XML del anuncio. 
            // Aquí es donde está el "oro": el nombre de la empresa y el acto.
            // Para una extracción masiva, seguiríamos estos enlaces.
          }
        }
      }
    }
    
    console.log('✅ Minería completada para la fecha indicada.');
    console.log('💡 Para una extracción masiva histórica, podemos iterar sobre los últimos 365 días.');
    
  } catch (error: any) {
    console.error('❌ Error en la minería:', error.message);
  }
}

// Ejemplo: Minar los últimos 2 días
const today = new Date();
for(let i=1; i<=2; i++) {
  const d = new Date(today);
  d.setDate(today.getDate() - i);
  const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
  mineBorme(dateStr);
}
