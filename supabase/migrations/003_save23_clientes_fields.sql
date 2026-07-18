-- Adiciona campos de edificacao usados pelo modulo SAVE 23 (Vistoria + Laudo Tecnico, IN 23).
-- Ficam em "clientes" (nao em laudos.dados) porque sao atributos do imovel, reutilizaveis
-- por outros modulos de edificacao no futuro (Brigada, Habite-se).
alter table public.clientes add column if not exists re text;
alter table public.clientes add column if not exists preexistente boolean;
alter table public.clientes add column if not exists area_construida numeric;
alter table public.clientes add column if not exists pavimentos integer;
alter table public.clientes add column if not exists altura numeric;
alter table public.clientes add column if not exists validade_atestado date;
