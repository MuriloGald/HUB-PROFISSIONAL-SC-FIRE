-- ══════════════════════════════════════════════════════════════════
-- SC FIRE — Migração 007: Diagnósticos Prévios & Brigada Residencial
-- Execute este script no Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════

-- ── 1. Tabela de Diagnósticos Prévios ──
CREATE TABLE IF NOT EXISTS public.diagnosticos_previos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id      UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_cpf  TEXT NOT NULL,
  respostas        JSONB NOT NULL, -- Respostas estruturadas do questionário
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.diagnosticos_previos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
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

-- ── 2. Inserir Subtemas Específicos para Brigada Residencial ──
-- Teoria Básica do Incêndio
INSERT INTO public.subthemes (name, category, level, hours, price, description) VALUES
  ('Teoria Básica do Incêndio', 'Combate a Incêndio', 'Bronze', 1.0, 150.00, 'Conceitos básicos sobre combustão, tetraedro do fogo, propagação de calor e classes de incêndio.'),
  ('Teoria Básica do Incêndio', 'Combate a Incêndio', 'Prata',  1.5, 210.00, 'Teoria básica do fogo com foco em propagação, compartimentação e primeiros passos em incêndio residencial.'),
  ('Teoria Básica do Incêndio', 'Combate a Incêndio', 'Ouro',   2.0, 300.00, 'Teoria do fogo aprofundada, comportamento extremo do fogo (flashover, backdraft) e ventilação tática basica.')
ON CONFLICT DO NOTHING;

-- ── 3. Seed: Condomínios de Teste (Tipo 'Outros') ──
INSERT INTO public.companies (name, type, cnpj, email, phone, address, active) VALUES
  ('Condomínio Residencial Bella Vista', 'Outros', '12.345.678/0001-01', 'contato@bellavista.com', '(48) 99911-2233', 'Rua das Palmeiras, 150 - Centro', true),
  ('Condomínio Edifício Solar das Flores', 'Outros', '98.765.432/0001-02', 'sindico@solarflores.com', '(48) 99888-7766', 'Av. das Flores, 1020 - Trindade', true),
  ('Condomínio Residencial Portal do Sol', 'Outros', '55.666.777/0001-03', 'portal@sol.com', '(48) 99122-3344', 'Rua do Sol, 45 - Coqueiros', true),
  ('Residencial Jardins Park Club', 'Outros', '44.333.222/0001-04', 'jardins@parkclub.com', '(48) 98765-4321', 'Rua dos Jardins, 300 - Itacorubi', true)
ON CONFLICT (cnpj) DO NOTHING;
