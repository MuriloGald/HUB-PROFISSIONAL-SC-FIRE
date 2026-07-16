-- ══════════════════════════════════════════════════════════════════
-- SC FIRE — Migração 009: Tabela independente de Condomínios
-- Execute este script no Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- Condomínios que respondem o Diagnóstico de Concepções Prévias NÃO
-- são clientes comerciais (não têm relação contratual direta com a
-- SC FIRE — são unidades residenciais de um cliente parceiro que
-- administra várias dezenas de condomínios). Por isso, decoupla-se
-- esse cadastro da tabela "companies" (clientes reais).

-- ── 1. Criar tabela independente de condomínios ──
CREATE TABLE IF NOT EXISTS public.condominios (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  cnpj        TEXT,
  address     TEXT,
  email       TEXT,
  phone       TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.condominios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de condomínios" ON public.condominios;
CREATE POLICY "Leitura pública de condomínios"
  ON public.condominios
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Inserção pública de condomínios" ON public.condominios;
CREATE POLICY "Inserção pública de condomínios"
  ON public.condominios
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ── 2. Migrar dados existentes (companies tipo 'Outros' usados como condomínio) ──
INSERT INTO public.condominios (id, name, cnpj, address, email, phone, active, created_at, updated_at)
SELECT id, name, cnpj, address, email, phone, active, created_at, updated_at
FROM public.companies
WHERE type = 'Outros'
ON CONFLICT (id) DO NOTHING;

-- ── 3. Criar (se não existir) ou migrar diagnosticos_previos ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'diagnosticos_previos'
  ) THEN
    -- A tabela nunca existiu neste banco: cria já apontando para condominios
    CREATE TABLE public.diagnosticos_previos (
      id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      condominio_id    UUID NOT NULL REFERENCES public.condominios(id) ON DELETE CASCADE,
      participant_name TEXT NOT NULL,
      participant_cpf  TEXT NOT NULL,
      respostas        JSONB NOT NULL,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    ALTER TABLE public.diagnosticos_previos ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Leitura de diagnósticos para usuários autenticados"
      ON public.diagnosticos_previos
      FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Inserção pública de diagnósticos"
      ON public.diagnosticos_previos
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Se a tabela já existia (com a coluna antiga company_id), repointa para condominios
DO $$
DECLARE con_name text;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'diagnosticos_previos' AND column_name = 'company_id'
  ) THEN
    SELECT conname INTO con_name
    FROM pg_constraint
    WHERE conrelid = 'public.diagnosticos_previos'::regclass
      AND contype = 'f'
      AND conname LIKE '%company_id%';

    IF con_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.diagnosticos_previos DROP CONSTRAINT %I', con_name);
    END IF;

    ALTER TABLE public.diagnosticos_previos RENAME COLUMN company_id TO condominio_id;

    ALTER TABLE public.diagnosticos_previos
      ADD CONSTRAINT diagnosticos_previos_condominio_id_fkey
      FOREIGN KEY (condominio_id) REFERENCES public.condominios(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── 4. Desativar (não excluir) as linhas migradas em companies ──
UPDATE public.companies SET active = false WHERE type = 'Outros';

-- ── 5. Tentativa best-effort de remover de companies (se não houver outras referências) ──
DO $$
BEGIN
  DELETE FROM public.companies WHERE type = 'Outros';
EXCEPTION WHEN foreign_key_violation THEN
  RAISE NOTICE 'Algumas empresas tipo "Outros" não puderam ser removidas (referenciadas em outra tabela, ex: classes/turmas). Permanecem marcadas como inativas.';
END $$;

-- ── 6. Reverter a política temporária de INSERT em companies (não é mais necessária) ──
DROP POLICY IF EXISTS "Inserção de empresas (uso interno)" ON public.companies;
