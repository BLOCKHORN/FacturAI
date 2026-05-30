
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  realtime: { transport: ws }
});

async function run() {
  console.log('🛠️ Actualizando función RPC para el motivo de rechazo...');
  const sql = `
    -- Primero borramos la función anterior para asegurar la firma correcta
    DROP FUNCTION IF EXISTS public.update_invoice_status_by_token(uuid, text);
    DROP FUNCTION IF EXISTS public.update_invoice_status_by_token(uuid, text, text);

    -- Re-creamos la función con los 3 parámetros explícitos
    CREATE OR REPLACE FUNCTION public.update_invoice_status_by_token(
      token_id uuid, 
      new_status text, 
      reason text DEFAULT NULL
    )
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
        IF new_status IN ('accepted', 'rejected') THEN
            UPDATE invoices 
            SET status = new_status, 
                rejection_reason = reason,
                status_updated_at = now()
            WHERE secure_token = token_id;
        ELSE
            RAISE EXCEPTION 'Estado no permitido';
        END IF;
    END;
    $$;

    -- Y recargamos el schema cache para que PostgREST se entere
    NOTIFY pgrst, 'reload schema';
  `;

  console.log('Copia este SQL y ejecútalo en el SQL Editor de Supabase:');
  console.log('---------------------------------------------------------');
  console.log(sql);
  console.log('---------------------------------------------------------');
}

run();
