-- IN 09 (Anexo E - Comissionamento do Elevador de Emergencia), IN 10 (Anexo B/C
-- - Sistema de Controle de Fumaca), IN 15 (Anexo B/C - Chuveiros Automaticos),
-- IN 27 (Anexos A/B/C - Eventos Pirotecnicos) e IN 28 (Anexos C/E/F - Brigada
-- de Incendio) -- documentos "preenchiveis" oficiais do CBMSC, mesmo padrao
-- de dados/laudos das demais INs.
alter table public.laudos drop constraint laudos_tipo_documento_check;
alter table public.laudos add constraint laudos_tipo_documento_check
  check (tipo_documento in ('SAVE23', 'IN24', 'Brigada', 'Habite-se', 'PlanoEnsino', 'IN02', 'IN07', 'IN09', 'IN10', 'IN15', 'IN27', 'IN28', 'Outro'));

-- Bucket de imagens genérico para os "preenchíveis" que anexam imagem (croqui
-- de evento pirotécnico, planta/croqui do PIBI etc.) — reutilizável por
-- qualquer módulo novo que precise anexar imagem, ao contrário do bucket
-- 'habitese-imagens' que é específico do Termo de Entrega do Imóvel.
insert into storage.buckets (id, name, public)
values ('documentos-cbmsc-imagens', 'documentos-cbmsc-imagens', true)
on conflict (id) do nothing;

drop policy if exists "Leitura pública de imagens Documentos CBMSC" on storage.objects;
create policy "Leitura pública de imagens Documentos CBMSC"
  on storage.objects for select
  using (bucket_id = 'documentos-cbmsc-imagens');

drop policy if exists "Upload por usuários autenticados (Documentos CBMSC)" on storage.objects;
create policy "Upload por usuários autenticados (Documentos CBMSC)"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documentos-cbmsc-imagens');

drop policy if exists "Exclusão por usuários autenticados (Documentos CBMSC)" on storage.objects;
create policy "Exclusão por usuários autenticados (Documentos CBMSC)"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documentos-cbmsc-imagens');
