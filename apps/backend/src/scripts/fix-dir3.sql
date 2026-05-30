-- Añadir campos DIR3 a la tabla global
alter table global_verified_companies add column if not exists accounting_office text;
alter table global_verified_companies add column if not exists managing_body text;
alter table global_verified_companies add column if not exists processing_unit text;

-- Asegurar que la tabla privada también los tiene (ya deberían estar, pero verificamos)
alter table tenant_private_clients add column if not exists accounting_office_code text;
alter table tenant_private_clients add column if not exists managing_body_code text;
alter table tenant_private_clients add column if not exists processing_unit_code text;

-- Insertar/Corregir Ayuntamiento de Onda con CIF correcto (P1208400J) y códigos DIR3
insert into global_verified_companies (cif, legal_name, address, city, zip_code, province, data_source, accounting_office, managing_body, processing_unit)
values 
('P1208400J', 'AYUNTAMIENTO DE ONDA', 'EL PLA, 1', 'ONDA', '12200', 'CASTELLON', 'OFFICIAL_GVA', 'L01120845', 'L01120845', 'L01120845')
on conflict (cif) do update set 
    legal_name = excluded.legal_name,
    address = excluded.address,
    accounting_office = excluded.accounting_office,
    managing_body = excluded.managing_body,
    processing_unit = excluded.processing_unit;

-- Insertar Ayuntamiento de Picassent como ejemplo adicional
insert into global_verified_companies (cif, legal_name, address, city, zip_code, province, data_source, accounting_office, managing_body, processing_unit)
values 
('P4619600H', 'AYUNTAMIENTO DE PICASSENT', 'PLAZA DEL AYUNTAMIENTO, 1', 'PICASSENT', '46220', 'VALENCIA', 'OFFICIAL_GVA', 'L01461947', 'L01461947', 'L01461947')
on conflict (cif) do update set 
    accounting_office = excluded.accounting_office,
    managing_body = excluded.managing_body,
    processing_unit = excluded.processing_unit;
