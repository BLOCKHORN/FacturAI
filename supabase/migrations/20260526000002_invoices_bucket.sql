-- Bucket privado para facturas (XMLs firmados)
insert into storage.buckets (id, name, public) 
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

create policy "Acceso privado a facturas"
  on storage.objects for all
  using ( bucket_id = 'invoices' and auth.uid()::text = (storage.foldername(name))[1] );
