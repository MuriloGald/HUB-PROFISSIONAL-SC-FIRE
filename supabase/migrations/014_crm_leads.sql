-- Funil de vendas B2B (kanban). Portado do repo antigo (HUB SC FIRE, crm/page.tsx),
-- mas nesse repo a tela rodava praticamente sempre em modo mock — crm_leads/
-- crm_interactions nunca tiveram migration em nenhum dos dois repos. Aqui ja nasce
-- com FK pra clientes (unificado) em vez de repetir company_name como texto solto
-- e sem fallback silencioso pra mock (se a query falhar, o erro aparece de verdade).
-- Tabela crm_contracts (tela /crm/contratos do legado) fica de fora por enquanto —
-- era 100% mock la tambem e dependeria de um modulo Comercial que ainda nao existe
-- neste repo; sem fonte real de contratos, seria so outra casca vazia.

create table public.crm_leads (
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references public.clientes(id) on delete set null,
  company_name text not null,
  contact_name text,
  contact_phone text,
  contact_email text,
  stage text not null default 'novo' check (stage in ('novo', 'contatado', 'proposta_enviada', 'negociacao', 'ganho', 'perdido')),
  expected_value numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.crm_interactions (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('ligacao', 'email', 'reuniao', 'nota', 'proposta')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.crm_leads enable row level security;
alter table public.crm_interactions enable row level security;

create policy "Leitura pública de crm_leads" on public.crm_leads for select using (true);
create policy "Inserção por usuários autenticados" on public.crm_leads for insert to authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.crm_leads for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.crm_leads for delete to authenticated using (true);

create policy "Leitura pública de crm_interactions" on public.crm_interactions for select using (true);
create policy "Inserção por usuários autenticados" on public.crm_interactions for insert to authenticated with check (true);
create policy "Exclusão por usuários autenticados" on public.crm_interactions for delete to authenticated using (true);
