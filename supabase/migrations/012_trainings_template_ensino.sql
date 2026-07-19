-- Cursos de brigada de incendio compartilham a mesma ementa/objetivos/metodologia/
-- bibliografia entre turmas diferentes do mesmo curso (ex: "Basico", "Intermediario")
-- — antes o Plano de Ensino sempre comecava em branco nesses campos, mesmo quando o
-- curso ja estava cadastrado em Treinamentos. Agora esse "template" fica no proprio
-- curso e pre-preenche o wizard quando um curso cadastrado e selecionado.
alter table public.trainings
  add column if not exists ementa text,
  add column if not exists objetivo_geral text,
  add column if not exists objetivos_especificos text[] not null default '{}',
  add column if not exists metodologia text,
  add column if not exists recursos_didaticos text,
  add column if not exists criterios_avaliacao text,
  add column if not exists bibliografia_basica text[] not null default '{}',
  add column if not exists bibliografia_complementar text[] not null default '{}';
