-- IN 02 (Formulario de Recurso + Requerimento de ressarcimento de multa PF/PJ)
-- e IN 07 (Relatorio de Comissionamento do SHP) -- documentos "preenchiveis"
-- oficiais do CBMSC, com cabecalho institucional (drawCabecalhoOficialCBMSC),
-- sem identidade visual SC Fire. Mesmo padrao de dados/laudos das demais INs.
alter table public.laudos drop constraint laudos_tipo_documento_check;
alter table public.laudos add constraint laudos_tipo_documento_check
  check (tipo_documento in ('SAVE23', 'IN24', 'Brigada', 'Habite-se', 'PlanoEnsino', 'IN02', 'IN07', 'Outro'));
