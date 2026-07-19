-- Permite cadastrar aulas de abertura/apresentacao de curso (ex: "B0 — Apresentação
-- do curso") que nao se encaixam nos 3 modulos tematicos do Basico. Amplia a check
-- existente de forma aditiva (mesmo padrao da migration 009) — nao remove nenhum
-- valor ja aceito.
do $$
declare
  con record;
begin
  for con in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_attribute a on a.attrelid = t.oid and a.attnum = any(c.conkey)
    where t.relname = 'subthemes' and c.contype = 'c' and a.attname = 'category'
  loop
    execute format('alter table public.subthemes drop constraint %I', con.conname);
  end loop;
end $$;

alter table public.subthemes
  add constraint subthemes_category_check
  check (category in ('Primeiros Socorros', 'Combate a Incêndio', 'SIPAT', 'Noções de Extinção', 'Sistemas Preventivos', 'Abertura do Curso'));
