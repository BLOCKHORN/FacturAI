const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectionString = `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.bbtmfbirhppkpqjsuhbz.supabase.co:5432/postgres`;

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to Supabase DB');

    const sql = `
      -- Fix global_verified_companies
      alter table global_verified_companies add column if not exists accounting_office text;
      alter table global_verified_companies add column if not exists managing_body text;
      alter table global_verified_companies add column if not exists processing_unit text;

      -- Seed data
      insert into global_verified_companies (cif, legal_name, address, city, zip_code, province, data_source, accounting_office, managing_body, processing_unit)
      values 
      ('P1208400J', 'AYUNTAMIENTO DE ONDA', 'EL PLA, 1', 'ONDA', '12200', 'CASTELLON', 'OFFICIAL', 'L01120845', 'L01120845', 'L01120845'),
      ('P4619600H', 'AYUNTAMIENTO DE PICASSENT', 'PLAZA DEL AYUNTAMIENTO, 1', 'PICASSENT', '46220', 'VALENCIA', 'OFFICIAL', 'L01461947', 'L01461947', 'L01461947'),
      ('P0306300E', 'AYUNTAMIENTO DE DENIA', 'PLAZA DE LA CONSTITUCION, 10', 'DENIA', '03700', 'ALICANTE', 'OFFICIAL', 'L01030638', 'L01030638', 'L01030638'),
      ('B12015087', 'PAMESA CERÁMICA S.L.', 'CAMINO ALCORA, 8', 'ALMASSORA', '12550', 'CASTELLON', 'OFFICIAL', null, null, null),
      ('F40546053', 'SICOVAL, COOP.V.', 'CALLE CERVANTES, Nº 58', 'PICASSENT', '46220', 'VALENCIA', 'OFFICIAL', null, null, null)
      on conflict (cif) do update set
          accounting_office = excluded.accounting_office,
          managing_body = excluded.managing_body,
          processing_unit = excluded.processing_unit;
      
      -- Ensure tenant_private_clients is also correct
      alter table tenant_private_clients add column if not exists accounting_office_code text;
      alter table tenant_private_clients add column if not exists managing_body_code text;
      alter table tenant_private_clients add column if not exists processing_unit_code text;
    `;

    await client.query(sql);
    console.log('Migration and seeding successful, Paco!');
  } catch (err) {
    console.error('Error running migration:', err);
  } finally {
    await client.end();
  }
}

run();
