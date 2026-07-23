-- Ambiente Virtual de Aprendizagem (AVA) do aluno — acessado pelo mesmo QR
-- Code do check-in de presenca (classes.qr_code_token). Alem de marcar
-- presenca, o aluno responde a Avaliacao (quiz com as perguntas cadastradas
-- no roteiro de cada subtema do curso, subthemes.conteudo->verificacao) e a
-- Pesquisa de Satisfacao — um envio por aluno por turma.
create table public.avaliacao_respostas (
  id uuid default gen_random_uuid() primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  respostas jsonb not null default '[]'::jsonb,
  acertos integer not null default 0,
  total integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (class_id, student_id)
);

create table public.pesquisas_satisfacao (
  id uuid default gen_random_uuid() primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  notas jsonb not null default '[]'::jsonb,
  comentario text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (class_id, student_id)
);

alter table public.avaliacao_respostas enable row level security;
alter table public.pesquisas_satisfacao enable row level security;

-- Mesmo padrao de RLS aberta de students/attendances (migration 013) — quem
-- envia e o aluno no proprio celular, sem login no Hub.
create policy "Leitura pública de avaliacao_respostas" on public.avaliacao_respostas for select using (true);
create policy "Inserção pública de avaliacao_respostas" on public.avaliacao_respostas for insert to anon, authenticated with check (true);
create policy "Exclusão por usuários autenticados" on public.avaliacao_respostas for delete to authenticated using (true);

create policy "Leitura pública de pesquisas_satisfacao" on public.pesquisas_satisfacao for select using (true);
create policy "Inserção pública de pesquisas_satisfacao" on public.pesquisas_satisfacao for insert to anon, authenticated with check (true);
create policy "Exclusão por usuários autenticados" on public.pesquisas_satisfacao for delete to authenticated using (true);
