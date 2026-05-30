
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

const companies = [
  // IBEX 35 & Grandes Empresas
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
  },
  {
    cif: 'A39000013',
    legal_name: 'BANCO SANTANDER, S.A.',
    address: 'PASEO DE PEREDA, 9-12',
    city: 'SANTANDER',
    zip_code: '39004',
    province: 'CANTABRIA',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A48265169',
    legal_name: 'BANCO BILBAO VIZCAYA ARGENTARIA, S.A. (BBVA)',
    address: 'PLAZA DE SAN NICOLAS, 4',
    city: 'BILBAO',
    zip_code: '48005',
    province: 'BIZKAIA',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A48010615',
    legal_name: 'IBERDROLA, S.A.',
    address: 'PLAZA EUSKADI, 5',
    city: 'BILBAO',
    zip_code: '48009',
    province: 'BIZKAIA',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A28211027',
    legal_name: 'REPSOL, S.A.',
    address: 'CALLE MENDEZ ALVARO, 44',
    city: 'MADRID',
    zip_code: '28045',
    province: 'MADRID',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A08663619',
    legal_name: 'CAIXABANK, S.A.',
    address: 'CALLE PINTOR SOROLLA, 2-4',
    city: 'VALENCIA',
    zip_code: '46002',
    province: 'VALENCIA',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A81980658',
    legal_name: 'FERROVIAL, S.E.',
    address: 'CALLE PRINCIPE DE VERGARA, 135',
    city: 'MADRID',
    zip_code: '28002',
    province: 'MADRID',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A28004885',
    legal_name: 'ACS, ACTIVIDADES DE CONSTRUCCION Y SERVICIOS, S.A.',
    address: 'AVENIDA DE PIO XII, 102',
    city: 'MADRID',
    zip_code: '28036',
    province: 'MADRID',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A08015497',
    legal_name: 'NATURGY ENERGY GROUP, S.A.',
    address: 'AVENIDA DE SAN LUIS, 77',
    city: 'MADRID',
    zip_code: '28033',
    province: 'MADRID',
    data_source: 'OFFICIAL'
  },
  // Administraciones Públicas (DIR3)
  {
    cif: 'P2807900B',
    legal_name: 'AYUNTAMIENTO DE MADRID',
    address: 'PLAZA DE CIBELES, 1',
    city: 'MADRID',
    zip_code: '28014',
    province: 'MADRID',
    data_source: 'OFFICIAL',
    accounting_office: 'L01280796',
    managing_body: 'L01280796',
    processing_unit: 'L01280796'
  },
  {
    cif: 'P0801900B',
    legal_name: 'AYUNTAMIENTO DE BARCELONA',
    address: 'PLAZA DE SANT JAUME, 1',
    city: 'BARCELONA',
    zip_code: '08002',
    province: 'BARCELONA',
    data_source: 'OFFICIAL',
    accounting_office: 'L01080193',
    managing_body: 'L01080193',
    processing_unit: 'L01080193'
  },
  {
    cif: 'P4625000A',
    legal_name: 'AYUNTAMIENTO DE VALENCIA',
    address: 'PLAZA DEL AYUNTAMIENTO, 1',
    city: 'VALENCIA',
    zip_code: '46002',
    province: 'VALENCIA',
    data_source: 'OFFICIAL',
    accounting_office: 'L01462507',
    managing_body: 'L01462507',
    processing_unit: 'L01462507'
  },
  {
    cif: 'P4109100E',
    legal_name: 'AYUNTAMIENTO DE SEVILLA',
    address: 'PLAZA NUEVA, 1',
    city: 'SEVILLA',
    zip_code: '41001',
    province: 'SEVILLA',
    data_source: 'OFFICIAL',
    accounting_office: 'L01410911',
    managing_body: 'L01410911',
    processing_unit: 'L01410911'
  },
  {
    cif: 'P2906700F',
    legal_name: 'AYUNTAMIENTO DE MALAGA',
    address: 'AVENIDA DE CERVANTES, 4',
    city: 'MALAGA',
    zip_code: '29016',
    province: 'MALAGA',
    data_source: 'OFFICIAL',
    accounting_office: 'L01290672',
    managing_body: 'L01290672',
    processing_unit: 'L01290672'
  },
  {
    cif: 'P4802000J',
    legal_name: 'AYUNTAMIENTO DE BILBAO',
    address: 'PLAZA ERNESTO ERCORECA, 1',
    city: 'BILBAO',
    zip_code: '48007',
    province: 'BIZKAIA',
    data_source: 'OFFICIAL',
    accounting_office: 'L01480202',
    managing_body: 'L01480202',
    processing_unit: 'L01480202'
  },
  {
    cif: 'P5029700C',
    legal_name: 'AYUNTAMIENTO DE ZARAGOZA',
    address: 'PLAZA DEL PILAR, 18',
    city: 'ZARAGOZA',
    zip_code: '50003',
    province: 'ZARAGOZA',
    data_source: 'OFFICIAL',
    accounting_office: 'L01502975',
    managing_body: 'L01502975',
    processing_unit: 'L01502975'
  },
  {
    cif: 'P3302400I',
    legal_name: 'AYUNTAMIENTO DE GIJON',
    address: 'PLAZA MAYOR, 1',
    city: 'GIJON',
    zip_code: '33201',
    province: 'ASTURIAS',
    data_source: 'OFFICIAL',
    accounting_office: 'L01330247',
    managing_body: 'L01330247',
    processing_unit: 'L01330247'
  },
  {
    cif: 'P1204000B',
    legal_name: 'AYUNTAMIENTO DE CASTELLON DE LA PLANA',
    address: 'PLAZA MAYOR, 1',
    city: 'CASTELLON DE LA PLANA',
    zip_code: '12001',
    province: 'CASTELLON',
    data_source: 'OFFICIAL',
    accounting_office: 'L01120407',
    managing_body: 'L01120407',
    processing_unit: 'L01120407'
  },
  {
    cif: 'A28000644',
    legal_name: 'EL CORTE INGLES, S.A.',
    address: 'HERMOSILLA, 112',
    city: 'MADRID',
    zip_code: '28009',
    province: 'MADRID',
    data_source: 'OFFICIAL'
  },
  {
    cif: 'A46413761',
    legal_name: 'MERCADONA, S.A.',
    address: 'CALLE VALENCIA, 5',
    city: 'TAVERNES BLANQUES',
    zip_code: '46160',
    province: 'VALENCIA',
    data_source: 'OFFICIAL'
  }
];

async function seed() {
  console.log('🚀 Iniciando inyección de empresas verificadas...');
  
  for (const company of companies) {
    // Filter out DIR3 columns if they don't exist yet
    const { accounting_office, managing_body, processing_unit, ...safeCompany } = company as any;
    
    const { error } = await supabase
      .from('global_verified_companies')
      .upsert(safeCompany, { onConflict: 'cif' });

    if (error) {
      console.error(`❌ Error al insertar ${company.legal_name}:`, error.message);
    } else {
      console.log(`✅ Inyectado: ${company.legal_name} (${company.cif})`);
    }
  }

  console.log('✨ Proceso finalizado (DIR3 omitido por ahora).');
}

seed();
