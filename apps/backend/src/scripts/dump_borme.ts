
import axios from 'axios';
import fs from 'fs';

async function dumpJson() {
  const date = '20260527';
  try {
    const response = await axios.get(`https://www.boe.es/datosabiertos/api/borme/sumario/${date}`, {
      headers: { 'Accept': 'application/json' }
    });
    fs.writeFileSync('borme_dump.json', JSON.stringify(response.data, null, 2));
    console.log('✅ Dumped to borme_dump.json');
  } catch (e: any) {
    console.error(e.message);
  }
}
dumpJson();
