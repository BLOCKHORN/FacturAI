-- Migration: 20260528000008_aeat_verifactu_compliance.sql
-- Purpose: Add mandatory AEAT Verifactu fields to profiles

alter table profiles add column if not exists zip_code text;
alter table profiles add column if not exists city text;
alter table profiles add column if not exists province text;
alter table profiles add column if not exists phone text;
alter table profiles add column if not exists email text;
alter table profiles add column if not exists tax_regime text default '01'; -- 01: Régimen General
alter table profiles add column if not exists default_series text default '2026-';
alter table profiles add column if not exists logo_url text;

-- Update existing profiles with data from fiscal_address if possible (basic attempt)
update profiles 
set city = split_part(fiscal_address, ',', 2),
    zip_code = substring(fiscal_address from '\d{5}')
where fiscal_address is not null and city is null;
