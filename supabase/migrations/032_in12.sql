-- IN 12 (Anexo / Relatório de Comissionamento do Sistema de Detecção e Alarme de Incêndio)
-- conforme NBR 17240 e IN 12 / CBMSC — mesmo padrão de dados/laudos das demais INs.

alter table public.laudos drop constraint if exists laudos_tipo_documento_check;
alter table public.laudos add constraint laudos_tipo_documento_check
  check (tipo_documento in (
    'SAVE23', 'IN24', 'Brigada', 'Habite-se', 'PlanoEnsino',
    'IN02', 'IN04', 'IN07', 'IN09', 'IN10', 'IN12', 'IN15',
    'IN27', 'IN28', 'LaudoTecnico', 'Outro'
  ));
