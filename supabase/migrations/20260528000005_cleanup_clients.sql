-- Migration: 20260528000005_cleanup_clients.sql
-- Purpose: Migration from 'clients' to 'tenant_private_clients' and update 'invoices' FK

-- 1. Transfer data from old 'clients' to 'tenant_private_clients' if it exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'clients') then
    insert into tenant_private_clients (
      tenant_id, cif, legal_name, address, city, zip_code, province, phone_number, created_at
    )
    select 
      user_id, cif_nif, company_name, fiscal_address, 'CASTELLON', '12001', 'CASTELLON', phone_number, created_at
    from clients
    on conflict (tenant_id, cif) do nothing;
  end if;
end $$;

-- 2. Update 'invoices' table to reference 'tenant_private_clients'
alter table invoices drop constraint if exists invoices_client_id_fkey;
alter table invoices add constraint invoices_client_id_fkey 
  foreign key (client_id) references tenant_private_clients(id) on delete set null;

-- 3. Update 'profiles' to match architecture if needed
-- (Already handled in previous migrations but ensuring consistency)

-- 4. Clean up old table
-- drop table if exists clients cascade;
