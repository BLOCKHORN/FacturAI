-- Migration: 20260528000006_fix_global_columns.sql
-- Purpose: Ensure DIR3 columns exist in global_verified_companies

alter table global_verified_companies add column if not exists accounting_office text;
alter table global_verified_companies add column if not exists managing_body text;
alter table global_verified_companies add column if not exists processing_unit text;

-- Seed data again to be sure
insert into global_verified_companies (cif, legal_name, address, city, zip_code, province, data_source, accounting_office, managing_body, processing_unit)
values 
('P1208400J', 'AYUNTAMIENTO DE ONDA', 'EL PLA, 1', 'ONDA', '12200', 'CASTELLON', 'OFFICIAL', 'L01120845', 'L01120845', 'L01120845'),
('P4619600H', 'AYUNTAMIENTO DE PICASSENT', 'PLAZA DEL AYUNTAMIENTO, 1', 'PICASSENT', '46220', 'VALENCIA', 'OFFICIAL', 'L01461947', 'L01461947', 'L01461947'),
('P0306300E', 'AYUNTAMIENTO DE DENIA', 'PLAZA DE LA CONSTITUCION, 10', 'DENIA', '03700', 'ALICANTE', 'OFFICIAL', 'L01030638', 'L01030638', 'L01030638')
on conflict (cif) do update set
    accounting_office = excluded.accounting_office,
    managing_body = excluded.managing_body,
    processing_unit = excluded.processing_unit;
