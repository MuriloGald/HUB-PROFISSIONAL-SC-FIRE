-- Controle de acesso por papel (diretor / administrador / professor).
-- Ate aqui o Hub nao tinha nenhum conceito de papel — so logado/nao-logado, com RLS
-- aberta pra qualquer autenticado (ver policies de crm_leads em 014). Esta migration
-- cria a base (profiles + app_role + has_role) usada pelo middleware, pelo menu e
-- pelas Server Actions daqui pra frente.

create type public.app_role as enum ('diretor', 'administrador', 'professor');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role not null default 'professor',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER pra nao recursar a propria RLS de profiles quando usada nas policies.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = _user_id and role = _role
  );
$$;

create policy "Usuário lê o próprio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "Diretor lê todos os perfis" on public.profiles
  for select using (public.has_role(auth.uid(), 'diretor'));

create policy "Diretor atualiza qualquer perfil" on public.profiles
  for update using (public.has_role(auth.uid(), 'diretor'));

-- Toda conta nova (criada pela tela de usuários ou direto no painel do Supabase)
-- ganha uma linha em profiles automaticamente, papel 'professor' por padrão —
-- o papel mais restrito, promovido manualmente por um diretor depois.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: quem já tinha conta antes desta migration vira 'diretor' automaticamente,
-- pra ninguém ficar bloqueado na virada. Contas novas a partir daqui nascem 'professor'
-- (via trigger acima) e são promovidas pela tela de usuários.
insert into public.profiles (id, email, full_name, role)
select id, email, raw_user_meta_data ->> 'full_name', 'diretor'
from auth.users
on conflict (id) do nothing;
