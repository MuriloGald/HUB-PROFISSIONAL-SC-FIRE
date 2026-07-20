-- Depois que o negocio "Ganho" e faturado, o card deve sair do quadro ativo sem
-- ser excluido (mantem o historico) — arquivamento e uma flag, nao uma exclusao.
alter table public.crm_leads add column if not exists archived boolean not null default false;
