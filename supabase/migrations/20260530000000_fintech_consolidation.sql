-- 🏛️ CONSOLIDACIÓN ESTRUCTURAL FINTECH
-- Propósito: Unificar nomenclatura y crear tablas críticas para B2B2B y Banking.

-- 1. Tablas de Despachos (Partners)
CREATE TABLE IF NOT EXISTS tax_firms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  cif text UNIQUE NOT NULL,
  contact_email text,
  license_count int DEFAULT 0,
  max_licenses int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Migración de Referencia en Profiles
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='gestoria_id') THEN
        ALTER TABLE profiles RENAME COLUMN gestoria_id TO tax_firm_id;
    ELSE
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tax_firm_id uuid REFERENCES tax_firms(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Sistema de Invitaciones Seguras
CREATE TABLE IF NOT EXISTS firm_invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  firm_id uuid REFERENCES tax_firms(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now()
);

-- 4. Infraestructura Banking (Plaid)
CREATE TABLE IF NOT EXISTS bank_connections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  institution_id text NOT NULL,
  institution_name text,
  requisition_id text UNIQUE NOT NULL, -- item_id en Plaid
  access_token text NOT NULL, -- Encriptado AES-256
  status text DEFAULT 'linked',
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id uuid REFERENCES bank_connections(id) ON DELETE CASCADE,
  transaction_id text UNIQUE NOT NULL,
  booking_date date NOT NULL,
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'EUR',
  remittance_info text,
  matched_invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. Seguridad RLS (Row Level Security)
ALTER TABLE tax_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas: Solo dueños o gestores vinculados pueden ver datos.
CREATE POLICY "Users view own bank" ON bank_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own transactions" ON bank_transactions FOR SELECT 
USING (EXISTS (SELECT 1 FROM bank_connections WHERE id = bank_transactions.connection_id AND user_id = auth.uid()));

NOTIFY pgrst, 'reload schema';
