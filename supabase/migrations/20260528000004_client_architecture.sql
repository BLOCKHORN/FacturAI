-- Migration: 20260528000004_client_architecture.sql
-- Purpose: Implement the dual-tier client architecture (Private and Global)

-- 1. Global Verified Companies (Read-only for users)
create table if not exists global_verified_companies (
    cif text primary key,
    legal_name text not null,
    address text not null,
    city text not null,
    zip_code text not null,
    province text not null,
    country_code text default 'ESP' not null,
    data_source text not null, -- 'OFFICIAL', 'VIES', 'AI_GENERATED', 'MANUAL'
    accounting_office text,
    managing_body text,
    processing_unit text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tenant Private Clients (User's private agenda)
create table if not exists tenant_private_clients (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references auth.users on delete cascade not null,
  cif text not null,
  legal_name text not null,
  address text not null,
  city text not null,
  zip_code text not null,
  province text not null,
  country_code text default 'ESP' not null,
  accounting_office_code text,
  managing_body_code text,
  processing_unit_code text,
  phone_number text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(tenant_id, cif)
);

-- 3. Security (RLS)
alter table tenant_private_clients enable row level security;
create policy "Users can manage their private clients" on tenant_private_clients for all using (auth.uid() = tenant_id);

alter table global_verified_companies enable row level security;
create policy "Everyone can read global companies" on global_verified_companies for select using (true);

-- 4. Initial Global Data (Seeds)
insert into global_verified_companies (cif, legal_name, address, city, zip_code, province, data_source, accounting_office, managing_body, processing_unit)
values 
('P1208400J', 'AYUNTAMIENTO DE ONDA', 'EL PLA, 1', 'ONDA', '12200', 'CASTELLON', 'OFFICIAL', 'L01120845', 'L01120845', 'L01120845'),
('P4619600H', 'AYUNTAMIENTO DE PICASSENT', 'PLAZA DEL AYUNTAMIENTO, 1', 'PICASSENT', '46220', 'VALENCIA', 'OFFICIAL', 'L01461947', 'L01461947', 'L01461947'),
('P0306300E', 'AYUNTAMIENTO DE DENIA', 'PLAZA DE LA CONSTITUCION, 10', 'DENIA', '03700', 'ALICANTE', 'OFFICIAL', 'L01030638', 'L01030638', 'L01030638'),
('B12015087', 'PAMESA CERÁMICA S.L.', 'CAMINO ALCORA, 8', 'ALMASSORA', '12550', 'CASTELLON', 'OFFICIAL', null, null, null),
('F40546053', 'SICOVAL, COOP.V.', 'CALLE CERVANTES, Nº 58', 'PICASSENT', '46220', 'VALENCIA', 'OFFICIAL', null, null, null)
on conflict (cif) do nothing;
