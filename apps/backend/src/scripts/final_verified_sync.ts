
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function run() {
  console.log('🚀 Sincronizando potencias industriales confirmadas...');
  
  const verifiedList = [
    { cif: 'B12497467', legal_name: 'ARGENTA CERÁMICA, S.L.U.', address: 'POLÍGONO INDUSTRIAL VALL D\'ALBA, VIAL 5, PARCELA 2', zip_code: '12194', city: 'VALL D\'ALBA', province: 'CASTELLON', data_source: 'MANUAL_VERIFIED' },
    { cif: 'B12845459', legal_name: 'CERÁMICA ARGENTA, S.L.', address: 'CTRA. VIVER-PUERTO DE BURRIANA, KM. 61,5', zip_code: '12540', city: 'VILLARREAL', province: 'CASTELLON', data_source: 'MANUAL_VERIFIED' },
    { cif: 'A12016085', legal_name: 'PORCELANOSA SA', address: 'CARRETERA NACIONAL 340, S/N, KM 56,2', zip_code: '12540', city: 'VILLARREAL', province: 'CASTELLON', data_source: 'MANUAL_VERIFIED' },
    { cif: 'A12011030', legal_name: 'PAMESA CERAMICA SL', address: 'CAMINO ALCORA, 8', zip_code: '12550', city: 'ALMAZORA', province: 'CASTELLON', data_source: 'MANUAL_VERIFIED' },
    { cif: 'A53293213', legal_name: 'BALEÀRIA EUROLÍNEAS MARÍTIMAS S.A.', address: 'ESTACIÓN MARÍTIMA, S/N', zip_code: '03700', city: 'DÉNIA', province: 'ALICANTE', data_source: 'MANUAL_VERIFIED' },
    { cif: 'A03063806', legal_name: 'ROLSER SA', address: 'CALLE TEULADA, 2 (POL. IND. LES GALGUES)', zip_code: '03750', city: 'PEDREGUER', province: 'ALICANTE', data_source: 'MANUAL_VERIFIED' },
    { cif: 'A03222346', legal_name: 'JUAN FORNÉS FORNÉS SA (MASYMAS)', address: 'CARRETERA VALENCIA-ALICANTE, KM. 191', zip_code: '03750', city: 'PEDREGUER', province: 'ALICANTE', data_source: 'MANUAL_VERIFIED' },
    { cif: 'A46103834', legal_name: 'MERCADONA, S.A.', address: 'CALLE ALFONSO ROIG ALFONSO, S/N', zip_code: '46135', city: 'ALBALAT DELS SORELLS', province: 'VALENCIA', data_source: 'MANUAL_VERIFIED' }
  ];

  for (const c of verifiedList) {
    const { error } = await supabase.from('global_verified_companies').upsert(c);
    if (!error) console.log(`✅ SINCRONIZADA: ${c.legal_name}`);
    else console.error(`❌ ERROR ${c.legal_name}: ${error.message}`);
  }
}

run();
