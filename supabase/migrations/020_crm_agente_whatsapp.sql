-- Agente de IA (SDR) + instâncias de WhatsApp do CRM, portados do app de referência
-- CRM-IA (Claude_Code_Version) pro Hub. Uso interno da SC Fire, não multi-tenant como
-- o CRM-IA original — por isso sem user_id, uma configuração só pra organização toda.

create table public.sdr_configs (
  id uuid default gen_random_uuid() primary key,
  agent_name text not null default 'Sofia',
  company_context text not null default '',
  products text not null default '',
  qualification_criteria text not null default '',
  communication_style text not null default '',
  handoff_rules text not null default '',
  enabled boolean not null default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.whatsapp_instances (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  status text not null default 'disconnected' check (status in ('disconnected', 'connected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sdr_configs enable row level security;
alter table public.whatsapp_instances enable row level security;

create policy "Leitura por qualquer autenticado" on public.sdr_configs
  for select to authenticated using (true);
create policy "Escrita só por diretor" on public.sdr_configs
  for insert to authenticated with check (public.has_role(auth.uid(), 'diretor'));
create policy "Atualização só por diretor" on public.sdr_configs
  for update to authenticated using (public.has_role(auth.uid(), 'diretor'));

create policy "Leitura por qualquer autenticado" on public.whatsapp_instances
  for select to authenticated using (true);
create policy "Escrita só por diretor" on public.whatsapp_instances
  for insert to authenticated with check (public.has_role(auth.uid(), 'diretor'));
create policy "Atualização só por diretor" on public.whatsapp_instances
  for update to authenticated using (public.has_role(auth.uid(), 'diretor'));

-- Linha única de configuração, já criada (a tela de Agente IA só edita, nunca insere outra).
insert into public.sdr_configs (agent_name, company_context, products, qualification_criteria, communication_style, handoff_rules)
values (
  'Sofia',
  'A SC Fire (EZS Consultoria e Treinamentos) presta serviços de segurança contra incêndio: laudos técnicos (SAVE, PPCI, Habite-se), vistorias e treinamentos de brigada de incêndio.',
  'Laudo técnico SAVE; Projeto e laudo PPCI; Vistoria e adequação para Habite-se; Treinamento de brigada de incêndio.',
  'Descobrir tipo e porte do imóvel, se já existe laudo/AVCB vigente, urgência (prazo de vistoria ou fiscalização) e cidade antes de recomendar um serviço.',
  'Tom próximo e profissional, mensagens curtas, sem prometer prazos ou resultados garantidos.',
  'Encaminhar para um atendente humano em pedidos de orçamento fechado, reclamações ou negociação de valores fora da tabela.'
);

-- Aperta o RLS de crm_leads/crm_interactions (014) — hoje `using (true)` liberava
-- insert/update/delete pra qualquer autenticado. Agora exige diretor ou administrador
-- (professor não deve mexer no CRM nem contornando a UI/middleware direto pela API).
drop policy if exists "Inserção por usuários autenticados" on public.crm_leads;
drop policy if exists "Atualização por usuários autenticados" on public.crm_leads;
drop policy if exists "Exclusão por usuários autenticados" on public.crm_leads;

create policy "Inserção por diretor/administrador" on public.crm_leads
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'diretor') or public.has_role(auth.uid(), 'administrador'));
create policy "Atualização por diretor/administrador" on public.crm_leads
  for update to authenticated
  using (public.has_role(auth.uid(), 'diretor') or public.has_role(auth.uid(), 'administrador'));
create policy "Exclusão por diretor/administrador" on public.crm_leads
  for delete to authenticated
  using (public.has_role(auth.uid(), 'diretor') or public.has_role(auth.uid(), 'administrador'));

drop policy if exists "Inserção por usuários autenticados" on public.crm_interactions;
drop policy if exists "Exclusão por usuários autenticados" on public.crm_interactions;

create policy "Inserção por diretor/administrador" on public.crm_interactions
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'diretor') or public.has_role(auth.uid(), 'administrador'));
create policy "Exclusão por diretor/administrador" on public.crm_interactions
  for delete to authenticated
  using (public.has_role(auth.uid(), 'diretor') or public.has_role(auth.uid(), 'administrador'));
