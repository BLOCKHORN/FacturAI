-- Actualización final del esquema para FacturAI según GEMINI.md

-- 1. Actualizar tabla de perfiles
alter table profiles add column if not exists role text check (role in ('company', 'gestoria')) not null default 'company';
alter table profiles add column if not exists gestoria_id uuid references profiles(id) on delete set null;
alter table profiles add column if not exists settings_vat_accounts jsonb default '{"21": "47700021", "10": "47700010", "4": "47700004", "0": "47700000"}'::jsonb;
alter table profiles add column if not exists settings_sales_account text default '7000000';

-- Asegurar unicidad de CIF/NIF en perfiles si no existe
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_cif_nif_key') then
    alter table profiles add constraint profiles_cif_nif_key unique (cif_nif);
  end if;
end $$;

-- 2. Actualizar tabla de clientes
alter table clients add column if not exists contact_email text;
alter table clients alter column phone_number drop not null;

-- 3. Actualizar tabla de facturas
alter table invoices add column if not exists pdf_path text;
alter table invoices add column if not exists source_image_path text;
-- Eliminar columnas redundantes si se prefiere usar invoice_taxes, pero las mantendremos por compatibilidad de "emisión rápida"
-- alter table invoices drop column if exists base_amount;
-- alter table invoices drop column if exists tax_percentage;

-- 4. Crear tabla de impuestos por factura (Soporte multi-IVA)
create table if not exists invoice_taxes (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references invoices(id) on delete cascade not null,
  tax_percentage numeric(4, 2) not null,
  taxable_base numeric(12, 2) not null,
  tax_amount numeric(12, 2) not null
);

-- Habilitar RLS en invoice_taxes
alter table invoice_taxes enable row level security;

create policy "Users can manage taxes of their own invoices"
  on invoice_taxes for all
  using (
    exists (
      select 1 from invoices
      where invoices.id = invoice_taxes.invoice_id
      and invoices.user_id = auth.uid()
    )
  );

-- 5. Actualizar políticas de perfiles para que las gestorías puedan ver perfiles vinculados
create policy "Gestorias can view their linked company profiles"
  on profiles for select
  using (
    auth.uid() = gestoria_id
  );

-- 6. Actualizar políticas de facturas para que las gestorías puedan ver facturas de sus empresas vinculadas
create policy "Gestorias can view invoices of their linked companies"
  on invoices for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = invoices.user_id
      and profiles.gestoria_id = auth.uid()
    )
  );
