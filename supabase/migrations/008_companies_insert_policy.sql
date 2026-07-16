-- ══════════════════════════════════════════════════════════════════
-- SC FIRE — Migração 008: Política de Inserção em Companies
-- Execute este script no Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- A tabela "companies" já possui RLS habilitado (criada na migração 001),
-- mas não tinha política de INSERT — por isso o cadastro de novos
-- condomínios (e qualquer outra empresa) pelo Hub falhava com:
-- "new row violates row-level security policy for table 'companies'"

-- O Hub ainda não tem login obrigatório implementado (auth.uid() chega
-- NULL nas Server Actions), então a política libera "anon" também —
-- uso interno, sem exposição pública do cadastro.

DROP POLICY IF EXISTS "Inserção de empresas para usuários autenticados" ON public.companies;

CREATE POLICY "Inserção de empresas (uso interno)"
  ON public.companies
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
