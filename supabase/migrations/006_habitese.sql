-- Adiciona o tipo 'imovel' para proprietarios/responsaveis pelo imovel (modulo Habite-se)
alter table public.clientes drop constraint if exists clientes_tipo_check;
alter table public.clientes add constraint clientes_tipo_check
  check (tipo in ('condominio', 'restaurante', 'deposito', 'comercial', 'evento', 'imovel', 'outro'));

-- Bucket de imagens do modulo Habite-se (fotos dos sistemas de seguranca contra
-- incendio instalados no imovel, anexadas ao Termo de Entrega do Imovel).
insert into storage.buckets (id, name, public)
values ('habitese-imagens', 'habitese-imagens', true)
on conflict (id) do nothing;

drop policy if exists "Leitura pública de imagens Habite-se" on storage.objects;
create policy "Leitura pública de imagens Habite-se"
  on storage.objects for select
  using (bucket_id = 'habitese-imagens');

drop policy if exists "Upload por usuários autenticados (Habite-se)" on storage.objects;
create policy "Upload por usuários autenticados (Habite-se)"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'habitese-imagens');

drop policy if exists "Exclusão por usuários autenticados (Habite-se)" on storage.objects;
create policy "Exclusão por usuários autenticados (Habite-se)"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'habitese-imagens');
