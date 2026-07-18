-- Adiciona o tipo 'PlanoEnsino' para o modulo Programa de Materia / Plano de Ensino.
-- Documento pedagogico vinculado a um curso (public.trainings) ja cadastrado em
-- Treinamentos -- nao ha cliente/imovel envolvido, entao laudos.cliente_id fica
-- null para este tipo (a coluna ja e nullable).
alter table public.laudos drop constraint laudos_tipo_documento_check;
alter table public.laudos add constraint laudos_tipo_documento_check
  check (tipo_documento in ('SAVE23', 'IN24', 'Brigada', 'Habite-se', 'PlanoEnsino', 'Outro'));
