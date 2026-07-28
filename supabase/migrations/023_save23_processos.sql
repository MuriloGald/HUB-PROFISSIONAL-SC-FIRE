-- Board de acompanhamento do status de atendimento de cada condominio no SAVE 23
-- (contato inicial -> vistoria -> laudo -> protocolo -> aprovacao). Diferente do
-- funil do CRM (crm_leads.stage, fixo), aqui as colunas sao editaveis pelo usuario
-- (save23_estagios) porque o fluxo de atendimento varia por caso e o usuario pode
-- renomear/criar/excluir etapas sem depender de migration nova.

create table public.save23_estagios (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  ordem integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

insert into public.save23_estagios (nome, ordem) values
  ('Contato Inicial', 1),
  ('Vistoria Agendada', 2),
  ('Vistoria Realizada', 3),
  ('Laudo em Elaboração', 4),
  ('Laudo Emitido', 5),
  ('Protocolado no CBMSC', 6),
  ('Aprovado / Dispensa Concedida', 7);

create table public.save23_processos (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  estagio_id uuid not null references public.save23_estagios(id) on delete restrict,
  responsavel text,
  observacoes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.save23_estagios enable row level security;
alter table public.save23_processos enable row level security;

create policy "Leitura pública de save23_estagios" on public.save23_estagios for select using (true);
create policy "Inserção por usuários autenticados" on public.save23_estagios for insert to authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.save23_estagios for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.save23_estagios for delete to authenticated using (true);

create policy "Leitura pública de save23_processos" on public.save23_processos for select using (true);
create policy "Inserção por usuários autenticados" on public.save23_processos for insert to authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.save23_processos for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.save23_processos for delete to authenticated using (true);
