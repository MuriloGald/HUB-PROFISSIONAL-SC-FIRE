-- Create public.clientes table
create table public.clientes (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  razao_social text,
  cnpj_cpf text,
  tipo text not null check (tipo in ('condominio', 'restaurante', 'deposito', 'comercial', 'outro')),
  responsavel_nome text,
  email text,
  telefone text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create public.laudos table
create table public.laudos (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references public.clientes(id) on delete cascade,
  tipo_documento text not null check (tipo_documento in ('SAVE23', 'IN24', 'Brigada', 'Habite-se', 'Outro')),
  status text not null check (status in ('rascunho', 'concluido', 'cancelado')),
  dados jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.clientes enable row level security;
alter table public.laudos enable row level security;

-- Policies for public.clientes (authenticated users can read/write)
create policy "Leitura pública de clientes" on public.clientes for select using (true);
create policy "Inserção por usuários autenticados" on public.clientes for insert to authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.clientes for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.clientes for delete to authenticated using (true);

-- Policies for public.laudos (authenticated users can read/write)
create policy "Leitura pública de laudos" on public.laudos for select using (true);
create policy "Inserção de laudos por usuários autenticados" on public.laudos for insert to authenticated with check (true);
create policy "Atualização de laudos por usuários autenticados" on public.laudos for update to authenticated using (true) with check (true);
create policy "Exclusão de laudos por usuários autenticados" on public.laudos for delete to authenticated using (true);
