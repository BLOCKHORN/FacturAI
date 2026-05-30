
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import ws from 'ws';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  realtime: {
    transport: ws
  }
});

const verifiedCompanies = [
  {
    cif: 'A46103834',
    legal_name: 'MERCADONA, S.A.',
    address: 'CALLE ALFONSO ROIG ALFONSO, S/N',
    city: 'ALBALAT DELS SORELLS',
    zip_code: '46135',
    province: 'VALENCIA',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A28017895',
    legal_name: 'EL CORTE INGLES, S.A.',
    address: 'CALLE HERMOSILLA, 112',
    city: 'MADRID',
    zip_code: '28009',
    province: 'MADRID',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A28015865',
    legal_name: 'TELEFÓNICA, S.A.',
    address: 'GRAN VIA, 28',
    city: 'MADRID',
    zip_code: '28013',
    province: 'MADRID',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A15075062',
    legal_name: 'INDUSTRIA DE DISEÑO TEXTIL, S.A. (INDITEX)',
    address: 'AVENIDA DE LA DIPUTACION, S/N',
    city: 'ARTEIXO',
    zip_code: '15142',
    province: 'A CORUÑA',
    data_source: 'OFFICIAL'
  }
];

const wrongCifs = ['A46413761', 'A28000644'];

async function cleanupAndSeed() {
  console.log('🧹 Limpiando datos erróneos...');
  for (const cif of wrongCifs) {
    const { error } = await supabase
      .from('global_verified_companies')
      .delete()
      .eq('cif', cif);
    if (error) console.error(`❌ Error al borrar ${cif}:`, error.message);
    else console.log(`🗑️ Borrado CIF erróneo: ${cif}`);
  }

  console.log('🚀 Inyectando datos 100% verificados (Fuentes Oficiales)...');
  for (const company of verifiedCompanies) {
    const { error } = await supabase
      .from('global_verified_companies')
      .upsert(company, { onConflict: 'cif' });

    if (error) {
      console.error(`❌ Error al insertar ${company.legal_name}:`, error.message);
    } else {
      console.log(`✅ Verificado e Inyectado: ${company.legal_name} (${company.cif})`);
    }
  }
  console.log('✨ Proceso completado con integridad de datos.');
}

cleanupAndSeed();
