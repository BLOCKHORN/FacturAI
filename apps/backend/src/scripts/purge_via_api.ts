
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import ws from 'ws';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws }
});

async function purge() {
  console.log('📡 Iniciando limpieza via API...');
  // Borramos todo mediante un range grande o similar si no hay rpc de truncate
  const { error } = await supabase
    .from('global_verified_companies')
    .delete()
    .neq('cif', '000000000'); // Delete all where CIF is not some dummy value

  if (error) console.error('❌ Error:', error.message);
  else console.log('🧹 Tabla vaciada con éxito.');
}

purge();
