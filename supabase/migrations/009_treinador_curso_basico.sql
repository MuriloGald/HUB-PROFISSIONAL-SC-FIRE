-- Modulo de Ensino / Area do Treinador — piloto do Curso Basico (8h, IN 28/2024 CBMSC).
--
-- src/lib/supabase/types.ts ja declarava Training/Subtheme/TrainingSubtheme (usados
-- por src/app/actions/plano-ensino.ts desde que o modulo Plano de Ensino foi criado),
-- mas nenhuma migration deste repo jamais criou essas tabelas — o seletor de curso do
-- wizard estava mirando em relations inexistentes. Esta migration cria as 3 tabelas
-- (schema minimo que o codigo ja espera, mesmo padrao de RLS aberta de clientes/laudos)
-- e povoa o catalogo (nome + carga horaria) das 9 aulas do curso Basico, vindo da vault
-- "Hub do Treinador". Conteudo didatico completo (Etapas, quiz) fica fora deste lote.

create table public.trainings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  base_price numeric not null default 0,
  total_hours numeric not null default 0,
  combo_type text check (combo_type in ('basica', 'intermediaria', 'avancada', 'lei-lucas', 'customizado')),
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.subthemes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null check (category in ('Primeiros Socorros', 'Combate a Incêndio', 'SIPAT', 'Noções de Extinção', 'Sistemas Preventivos')),
  level text not null check (level in ('Bronze', 'Prata', 'Ouro', 'Básico', 'Intermediário', 'Avançado', 'Reciclagem')),
  hours numeric not null default 0,
  price numeric not null default 0,
  canva_embed text,
  pdf_url text,
  description text,
  syllabus text,
  in28_code text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.training_subthemes (
  id uuid default gen_random_uuid() primary key,
  training_id uuid not null references public.trainings(id) on delete cascade,
  subtheme_id uuid not null references public.subthemes(id) on delete cascade,
  sort_order integer not null default 0,
  is_mandatory boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trainings enable row level security;
alter table public.subthemes enable row level security;
alter table public.training_subthemes enable row level security;

create policy "Leitura pública de trainings" on public.trainings for select using (true);
create policy "Inserção por usuários autenticados" on public.trainings for insert to authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.trainings for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.trainings for delete to authenticated using (true);

create policy "Leitura pública de subthemes" on public.subthemes for select using (true);
create policy "Inserção por usuários autenticados" on public.subthemes for insert to authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.subthemes for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.subthemes for delete to authenticated using (true);

create policy "Leitura pública de training_subthemes" on public.training_subthemes for select using (true);
create policy "Inserção por usuários autenticados" on public.training_subthemes for insert to authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.training_subthemes for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.training_subthemes for delete to authenticated using (true);

with novo_curso as (
  insert into public.trainings (name, description, base_price, total_hours, combo_type, active)
  values (
    'Curso Básico — Brigada de Incêndio (IN 28/2024)',
    'Formação teórica de 8h para brigadista orgânico, 100% teórica, conforme Tabela 4 da IN 28/2024 CBMSC — sem módulo de Atividades da Brigada.',
    0, 8, 'basica', true
  )
  returning id
),
dados_subtemas (ord, name, category, level, hours, description) as (
  values
    (1, 'B1 — Teoria do Fogo', 'Noções de Extinção', 'Básico', 1::numeric,
      'Tetraedro do fogo, tipos de combustão, propagação de calor e fases do incêndio até o flashover. IN 28/2024 | NBR 14276 Anexo B.'),
    (2, 'B2 — Classes de Incêndio (A, B, C, D, K e L)', 'Noções de Extinção', 'Básico', 1::numeric,
      'Classes de incêndio A, B, C, D, K e L e o agente extintor indicado para cada uma. IN 28/2024 | NBR 14276 Anexo B.'),
    (3, 'B3 — Agentes e Métodos de Extinção', 'Noções de Extinção', 'Básico', 1::numeric,
      'Os 4 princípios de extinção e os agentes extintores aplicáveis a cada classe de incêndio. IN 28/2024 | NBR 14276 Anexo B.'),
    (4, 'B4 — Avaliação de Cena e Vítima + Acionamento 193', 'Primeiros Socorros', 'Básico', 1::numeric,
      'Avaliação de cena, biossegurança e acionamento do Corpo de Bombeiros (193) antes do atendimento à vítima. IN 28/2024 | NBR 14276 Anexo B.'),
    (5, 'B5 — RCP, DEA e OVACE', 'Primeiros Socorros', 'Básico', 1::numeric,
      'Reconhecimento da parada cardiorrespiratória, RCP, uso do DEA e desengasgo (OVACE). IN 28/2024 | NBR 14276 Anexo B | AHA Guidelines 2020.'),
    (6, 'B6 — Hemorragias, Queimaduras e Emergências Clínicas', 'Primeiros Socorros', 'Básico', 1::numeric,
      'Controle de hemorragias, atendimento a queimaduras e emergências clínicas comuns. IN 28/2024 | NBR 14276 Anexo B.'),
    (7, 'B7 — Extintores, Hidrantes e Sinalização', 'Sistemas Preventivos', 'Básico', 0.75::numeric,
      'Tipos de extintores, sistema de hidrantes e sinalização de segurança contra incêndio. NBR 12693 | NBR 13714 | NBR 13434.'),
    (8, 'B8 — Alarme, Detecção e Iluminação de Emergência', 'Sistemas Preventivos', 'Básico', 0.75::numeric,
      'Sistema de detecção e alarme de incêndio (SDAI) e iluminação de emergência. NBR 9441 | NBR 10898 | NBR 14276 Anexo B.'),
    (9, 'B9 — Saídas de Emergência', 'Sistemas Preventivos', 'Básico', 0.5::numeric,
      'Rotas de fuga e saídas de emergência conforme dimensionamento da NBR 9077. NBR 9077 | NBR 14276 Anexo B.')
),
novos_subtemas as (
  insert into public.subthemes (name, category, level, hours, price, description, active)
  select name, category, level, hours, 0, description, true
  from dados_subtemas
  returning id, name
)
insert into public.training_subthemes (training_id, subtheme_id, sort_order, is_mandatory)
select nc.id, ns.id, ds.ord, true
from novo_curso nc
cross join novos_subtemas ns
join dados_subtemas ds on ds.name = ns.name;
