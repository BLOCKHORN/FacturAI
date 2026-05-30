import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const companies = [
  {
    cif: 'A12345678',
    legal_name: 'TECNOLOGÍAS AVANZADAS S.A.',
    address: 'Calle de la Innovación, 1',
    city: 'Castellón de la Plana',
    zip_code: '12003',
    province: 'Castellón',
    data_source: 'SEED'
  },
  {
    cif: 'B98765432',
    legal_name: 'CONSTRUCCIONES MEDITERRÁNEO S.L.',
    address: 'Avenida del Mar, 45',
    city: 'Onda',
    zip_code: '12200',
    province: 'Castellón',
    data_source: 'SEED'
  },
  {
    cif: 'P1234567A',
    legal_name: 'AYUNTAMIENTO DE CASTELLÓN',
    address: 'Plaza Mayor, 1',
    city: 'Castellón de la Plana',
    zip_code: '12001',
    province: 'Castellón',
    accounting_office: 'L01120406',
    managing_body: 'L01120406',
    processing_unit: 'L01120406',
    data_source: 'SEED'
  }
];

async function seed() {
  console.log('Seeding companies...');
  for (const company of companies) {
    const { error } = await supabase
      .from('global_verified_companies')
      .upsert(company as any, { onConflict: 'cif' });
    
    if (error) {
      console.error(`Error seeding ${company.cif}:`, error.message);
    } else {
      console.log(`Successfully seeded ${company.cif}`);
    }
  }
  console.log('Seed complete.');
}

seed();
