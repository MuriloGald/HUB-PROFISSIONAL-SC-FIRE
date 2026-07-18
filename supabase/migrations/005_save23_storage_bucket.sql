-- Bucket de imagens do modulo SAVE 23 (fotos de setor na Vistoria de Campo e de
-- subsecoes no Laudo Tecnico). No app legado essas imagens iam para o Google Drive;
-- aqui usamos Supabase Storage, com a URL publica guardada dentro de laudos.dados.
insert into storage.buckets (id, name, public)
values ('save23-imagens', 'save23-imagens', true)
on conflict (id) do nothing;

create policy "Leitura pública de imagens SAVE23"
  on storage.objects for select
  using (bucket_id = 'save23-imagens');

create policy "Upload por usuários autenticados"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'save23-imagens');

create policy "Exclusão por usuários autenticados"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'save23-imagens');
