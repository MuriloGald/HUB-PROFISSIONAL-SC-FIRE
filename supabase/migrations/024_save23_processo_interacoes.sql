-- Histórico de interações do card de processo do SAVE 23 (mesmo padrão do
-- crm_interactions, ver migration 014) — anotações que acompanham o condomínio
-- ao longo do atendimento (contato, e-mail, reunião, nota, WhatsApp...).

create table public.save23_processo_interacoes (
  id uuid default gen_random_uuid() primary key,
  processo_id uuid not null references public.save23_processos(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('ligacao', 'email', 'reuniao', 'nota', 'proposta', 'whatsapp')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.save23_processo_interacoes enable row level security;

create policy "Leitura pública de save23_processo_interacoes" on public.save23_processo_interacoes for select using (true);
create policy "Inserção por usuários autenticados" on public.save23_processo_interacoes for insert to authenticated with check (true);
create policy "Exclusão por usuários autenticados" on public.save23_processo_interacoes for delete to authenticated using (true);
