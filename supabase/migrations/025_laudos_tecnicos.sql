-- Laudos Técnicos decorrentes da Inspeção de Regularidade (IN 04): testes
-- instrumentados de Alarme (nível de pressão sonora), Iluminação de Emergência
-- (luxímetro) e Estanqueidade da Rede de Gás — um único tipo_documento com um
-- discriminante "tipo" dentro de dados (alarme | iluminacao | gas), mesmo
-- padrão de dados/laudos das demais.
alter table public.laudos drop constraint laudos_tipo_documento_check;
alter table public.laudos add constraint laudos_tipo_documento_check
  check (tipo_documento in ('SAVE23', 'IN24', 'Brigada', 'Habite-se', 'PlanoEnsino', 'IN02', 'IN04', 'IN07', 'IN09', 'IN10', 'IN15', 'IN27', 'IN28', 'LaudoTecnico', 'Outro'));
