-- Create Laudos Clientes table
CREATE TABLE IF NOT EXISTS public.laudos_clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cnpj VARCHAR,
    cpf VARCHAR,
    razao_social VARCHAR NOT NULL,
    nome_responsavel VARCHAR NOT NULL,
    telefone VARCHAR,
    email VARCHAR,
    endereco TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Laudos Eventos table
CREATE TABLE IF NOT EXISTS public.laudos_eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES public.laudos_clientes(id) ON DELETE CASCADE NOT NULL,
    nome_evento VARCHAR NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    local_evento TEXT NOT NULL,
    cidade VARCHAR NOT NULL,
    estado VARCHAR(2) NOT NULL,
    
    -- IN 24 Dados
    area_total DECIMAL,
    lotacao_estimada INTEGER,
    risco VARCHAR(50), -- Baixo, Médio, Alto
    porte VARCHAR(50), -- Pequeno, Médio, Grande
    
    -- Status
    status VARCHAR(50) DEFAULT 'rascunho', -- rascunho, emitido
    pdf_url TEXT,
    
    -- JSON para guardar os campos dinâmicos preenchidos no form
    dados_formulario JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.laudos_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laudos_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.laudos_clientes FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.laudos_clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.laudos_clientes FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.laudos_clientes FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.laudos_eventos FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.laudos_eventos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.laudos_eventos FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.laudos_eventos FOR DELETE USING (true);
