
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.bbtmfbirhppkpqjsuhbz',
  password: 'ksjsuh28282!',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function purge() {
  try {
    await client.connect();
    console.log('📡 Conectado a la base de datos para limpieza...');
    await client.query('TRUNCATE TABLE global_verified_companies;');
    console.log('🧹 Tabla global_verified_companies vaciada con éxito.');
  } catch (err: any) {
    console.error('❌ Error en la purga:', err.message);
  } finally {
    await client.end();
  }
}

purge();
