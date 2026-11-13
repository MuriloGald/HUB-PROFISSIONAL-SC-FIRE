-- Edição manual do Relatório da Turma.
-- Guarda só os campos que o instrutor alterou (ver RelatorioTurmaEdicao em
-- src/lib/turmas/relatorio-types.ts); o que não estiver aqui continua vindo
-- calculado das presenças/avaliações/pesquisas. NULL = relatório sem edição.
alter table public.classes add column if not exists relatorio_edicao jsonb;
