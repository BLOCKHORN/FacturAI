
import axios from 'axios';
import * as cheerio from 'cheerio';

async function testBormeApi() {
  const date = '20260527'; // Ayer
  console.log(`📡 Intentando conectar con la API oficial del BOE (BORME) para la fecha ${date}...`);
  
  try {
    const response = await axios.get(`https://www.boe.es/datosabiertos/api/borme/sumario/${date}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (response.status === 200) {
      console.log('✅ Conexión exitosa con la API del BOE.');
      const data = response.data;
      console.log('Estructura raíz:', Object.keys(data));
      
      // La API del BOE suele envolverlo en una propiedad con el nombre del boletín
      const rootKey = Object.keys(data)[0];
      const sumario = data[rootKey];
      console.log(`Contenido de ${rootKey}:`, Object.keys(sumario));

      if (sumario.diario) {
        const secciones = Array.isArray(sumario.diario) ? sumario.diario[0].seccion : sumario.diario.seccion;
        // ... resto de la lógica
      } else {
        console.log('No se encontró la propiedad diario. Estructura recibida:', JSON.stringify(data).substring(0, 500));
      }
    }
  } catch (error: any) {
    console.error('❌ Error de conexión:', error.response?.status || error.message);
    if (error.response?.status === 400) {
      console.log('💡 La API del BOE a veces falla si el boletín de ese día aún no está procesado en JSON. Intentando formato XML...');
    }
  }
}

testBormeApi();
