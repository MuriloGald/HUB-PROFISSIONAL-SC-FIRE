-- ══════════════════════════════════════════════════════════════════
-- SC FIRE — Migração 010: Políticas RLS para tabela subthemes
-- Execute este script no Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════
--
-- PROBLEMA: A tabela "subthemes" tem RLS habilitado mas não tinha
-- política de SELECT para anon — fazendo com que subtemas ativados
-- no painel do Supabase não aparecessem na página Comercial do Hub.
--
-- SOLUÇÃO: Liberar SELECT para anon e authenticated, e UPDATE/INSERT
-- para uso interno do Hub.

-- Limpeza de políticas antigas conflitantes (se existirem)
DROP POLICY IF EXISTS "Leitura pública de subtemas ativos" ON public.subthemes;
DROP POLICY IF EXISTS "Leitura de subtemas para autenticados" ON public.subthemes;
DROP POLICY IF EXISTS "Leitura de subtemas" ON public.subthemes;
DROP POLICY IF EXISTS "Inserção de subtemas para uso interno" ON public.subthemes;
DROP POLICY IF EXISTS "Atualização de subtemas para uso interno" ON public.subthemes;

-- Garante que RLS está habilitado
ALTER TABLE public.subthemes ENABLE ROW LEVEL SECURITY;

-- 1. Leitura liberada para todos (anon e autenticados)
--    O filtro active=true é feito na query da aplicação, não aqui.
CREATE POLICY "Leitura de subtemas"
  ON public.subthemes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. Inserção para uso interno do Hub (sem autenticação obrigatória)
CREATE POLICY "Inserção de subtemas para uso interno"
  ON public.subthemes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3. Atualização para uso interno do Hub (ativar/desativar, editar)
CREATE POLICY "Atualização de subtemas para uso interno"
  ON public.subthemes
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
