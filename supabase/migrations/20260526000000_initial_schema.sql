-- Extensiones requeridas
create extension if not exists "pgcrypto";

-- Tabla de Perfiles de Empresa (Usuarios del SaaS)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  company_name text not null,
  cif_nif text not null unique,
  fiscal_address text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'trial',
  certificate_path text, -- Ruta en el storage privado
  certificate_vault_key uuid -- ID de referencia para desencriptado de clave
);

-- Habilitar RLS en profiles
alter table profiles enable row level security;

create policy "Los usuarios pueden ver su propio perfil"
  on profiles for select
  using ( auth.uid() = id );

create policy "Los usuarios pueden actualizar su propio perfil"
  on profiles for update
  using ( auth.uid() = id );

-- Tabla de Clientes B2B
create table clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  company_name text not null,
  cif_nif text not null,
  fiscal_address text not null,
  accounting_office_code text,
  managing_body_code text,
  processing_unit_code text,
  phone_number text not null, -- Para alertas de WhatsApp
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en clients
alter table clients enable row level security;

create policy "Los usuarios pueden gestionar sus propios clientes"
  on clients for all
  using ( auth.uid() = user_id );

-- Tabla de Facturas Emitidas
create table invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  invoice_number text not null,
  issue_date date not null default current_date,
  due_date date not null,
  base_amount numeric(12, 2) not null,
  tax_percentage numeric(4, 2) default 21.00 not null,
  total_amount numeric(12, 2) not null,
  concept text not null,
  xml_path text, -- Ruta al XML legal firmado en Storage
  status text check (status in ('draft', 'sent', 'accepted', 'paid', 'rejected')) default 'sent' not null,
  status_updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, invoice_number)
);

-- Habilitar RLS en invoices
alter table invoices enable row level security;

create policy "Los usuarios pueden gestionar sus propias facturas"
  on invoices for all
  using ( auth.uid() = user_id );

-- Función para actualizar el timestamp de actualización de estado
create or replace function update_status_updated_at()
returns trigger as $$
begin
  if new.status <> old.status then
    new.status_updated_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_invoices_status_update
  before update on invoices
  for each row
  execute function update_status_updated_at();
