-- IN 04 (Vistoria de Regularidade de Manutencao do SMSCI) -- checklist
-- composto que cobre 8 categorias (extintores, hidrantes, gas, saidas/
-- compartimentacao, iluminacao/sinalizacao, alarme, eletrica, brigada), cada
-- uma remetendo a uma IN especifica, mesmo padrao de dados/laudos das demais.
-- Usa o bucket 'documentos-cbmsc-imagens' ja criado na migration 017 para as
-- fotos anexadas a cada item vistoriado.
alter table public.laudos drop constraint laudos_tipo_documento_check;
alter table public.laudos add constraint laudos_tipo_documento_check
  check (tipo_documento in ('SAVE23', 'IN24', 'Brigada', 'Habite-se', 'PlanoEnsino', 'IN02', 'IN04', 'IN07', 'IN09', 'IN10', 'IN15', 'IN27', 'IN28', 'Outro'));
