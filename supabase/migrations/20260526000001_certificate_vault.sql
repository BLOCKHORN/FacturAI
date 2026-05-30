-- Tabla para almacenar claves cifradas (Vault)
create table certificate_vault (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  encrypted_password text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS en vault
alter table certificate_vault enable row level security;

create policy "Los usuarios pueden gestionar sus propias claves cifradas"
  on certificate_vault for all
  using ( auth.uid() = user_id );

-- Bucket privado para certificados
insert into storage.buckets (id, name, public) 
values ('certificates', 'certificates', false)
on conflict (id) do nothing;

create policy "Acceso privado a certificados"
  on storage.objects for all
  using ( bucket_id = 'certificates' and auth.uid()::text = (storage.foldername(name))[1] );
