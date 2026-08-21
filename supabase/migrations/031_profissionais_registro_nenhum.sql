-- Permite cadastrar um profissional sem registro em conselho de classe (nem
-- CREA nem CFT) -- alguem identificado so pelo CPF. A migration 026 so aceitava
-- 'crea'/'cft' no check de registro_tipo.
alter table public.profissionais drop constraint if exists profissionais_registro_tipo_check;
alter table public.profissionais add constraint profissionais_registro_tipo_check
  check (registro_tipo in ('crea', 'cft', 'nenhum'));
