-- Cadastro unico de profissionais (engenheiros/tecnicos) que assinam como
-- Responsavel Tecnico nos documentos do hub. Ate aqui, cada um dos ~10 modulos
-- de documento tinha seu proprio jeito de capturar o RT (dropdown fixo de 2
-- pessoas, texto livre, ou nada) -- nenhum guardava se o registro e no CREA
-- (engenheiros) ou no CFT (tecnicos), o que impedia imprimir o numero de
-- registro embaixo do nome na assinatura de forma consistente.
--
-- Tabela separada de "clientes" de proposito: profissional nao e quem contrata
-- o servico, e quem assina o laudo/atestado.
create table public.profissionais (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  cpf text,
  telefone text,
  email text,
  registro_tipo text check (registro_tipo in ('crea', 'cft')),
  registro_numero text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profissionais enable row level security;

-- Mesmo padrao de RLS de clientes (migration 001) — quem usa o cadastro e o
-- time interno autenticado no Hub.
create policy "Leitura pública de profissionais" on public.profissionais for select using (true);
create policy "Inserção por usuários autenticados" on public.profissionais for insert to authenticated with check (true);
create policy "Atualização por usuários autenticados" on public.profissionais for update to authenticated using (true) with check (true);
create policy "Exclusão por usuários autenticados" on public.profissionais for delete to authenticated using (true);

-- Semeia os 2 RTs fixos que ate aqui viviam hardcoded em src/lib/laudos/constants.ts,
-- pra nenhum modulo perder quem ja usava ao trocar pro cadastro novo.
insert into public.profissionais (nome, cpf, telefone, email, registro_tipo, registro_numero) values
  ('DIONE BORGES', '00426088050', '48 3093-6140', 'contato@scfire.com.br', 'crea', '177797-2'),
  ('PAULO ROBERTO RAMOS', '07025632049', '48 3093-6140', 'contato@scfire.com.br', 'cft', '70256632049');
