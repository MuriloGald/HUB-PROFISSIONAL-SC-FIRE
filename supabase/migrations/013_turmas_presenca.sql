-- Turma + presenca por QR pro cockpit do instrutor. Como o resto deste schema
-- (ver migration 009), essas tabelas nunca existiram — o cockpit legado dependia
-- de classes/companies/students/attendances que so existiam no repo antigo.
-- company_id do legado vira cliente_id aqui, apontando pro /clientes unificado
-- deste hub em vez de uma tabela "companies" separada.

create table public.classes (
  id uuid default gen_random_uuid() primary key,
  training_id uuid not null references public.trainings(id) on delete cascade,
  cliente_id uuid references public.clientes(id) on delete set null,
  instrutor_nome text,
  status text not null default 'agendada' check (status in ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  qr_code_token text not null default gen_random_uuid()::text unique,
  scheduled_at timestamp with time zone,
  started_at timestamp with time zone,
  finished_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- students.cpf sem formatacao (so digitos) pra lookup de check-in ser exato.
create table public.students (
  id uuid default gen_random_uuid() primary key,
  cpf text not null unique,
  full_name text not null,
  email text,
  phone text,
  cliente_id uuid references public.clientes(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.attendances (
  id uuid default gen_random_uuid() primary key,
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  source text not null default 'qr_code' check (source in ('qr_code', 'manual')),
  checked_in_at timestamp with time zone default timezone('utc'::text, now()) not null,
  latitude numeric,
  longitude numeric,
  unique (class_id, student_id)
);

alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.attendances enable row level security;

create policy "Leitura pública de classes" on public.classes for select using (true);
create policy "Inserção por usuários autenticados" on public.classes for insert to authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.classes for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.classes for delete to authenticated using (true);

-- students/attendances precisam de escrita publica (to anon) porque quem faz
-- check-in e o aluno escaneando o QR no proprio celular, sem login no Hub.
create policy "Leitura pública de students" on public.students for select using (true);
create policy "Inserção pública de students" on public.students for insert to anon, authenticated with check (true);
create policy "Atualização pública de students" on public.students for update to anon, authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.students for delete to authenticated using (true);

create policy "Leitura pública de attendances" on public.attendances for select using (true);
create policy "Inserção pública de attendances" on public.attendances for insert to anon, authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.attendances for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.attendances for delete to authenticated using (true);
