-- ============================================================================
-- SCHEMA DDL: OPTICSYS ERP SAAS MULTI-TENANT PARA ÓTICAS
-- Compatível com PostgreSQL 14+ / Supabase
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. LOJAS (TENANTS SAAS) - 7 DIAS DE TESTE GRATUITO
CREATE TABLE public.lojas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fantasia VARCHAR(150) NOT NULL,
    razao_social VARCHAR(150),
    cnpj VARCHAR(20) UNIQUE,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    endereco TEXT,
    cidade VARCHAR(60),
    uf VARCHAR(2),
    plano VARCHAR(30) DEFAULT 'pro' CHECK (plano IN ('starter', 'pro', 'enterprise')),
    status VARCHAR(20) DEFAULT 'trial' CHECK (status IN ('trial', 'ativo', 'inadimplente', 'cancelado')),
    trial_ate TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'), -- 7 DIAS DE TRIAL
    config_impressao JSONB DEFAULT '{
        "largura_mm": 80,
        "imprimir_grade_grau": true,
        "imprimir_termo_garantia": true,
        "mensagem_rodape": "Obrigado pela preferência! Lentes com 1 ano de garantia técnica."
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USUÁRIOS / FUNCIONÁRIOS / CONSULTOR ÓPTICO
CREATE TABLE public.funcionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    cargo VARCHAR(50) NOT NULL DEFAULT 'VENDEDOR' 
        CHECK (cargo IN ('ADMIN', 'GERENTE', 'OPTOMETRISTA', 'VENDEDOR', 'TECNICO_MONTAGEM')),
    comissao_produto_pct NUMERIC(5,2) DEFAULT 3.00,
    comissao_servico_pct NUMERIC(5,2) DEFAULT 5.00,
    permissoes JSONB NOT NULL DEFAULT '{
        "dashboard": true,
        "clientes": true,
        "receitas": true,
        "os": true,
        "pdv": true,
        "estoque": true,
        "laboratorios": true,
        "financeiro": true,
        "configuracoes": false
    }'::jsonb,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_funcionario_loja_email UNIQUE (loja_id, email)
);

CREATE INDEX idx_funcionarios_loja ON public.funcionarios(loja_id);

-- RLS HELPER
CREATE OR REPLACE FUNCTION public.current_loja_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT loja_id 
    FROM public.funcionarios 
    WHERE auth_user_id = auth.uid() 
      AND ativo = TRUE 
    LIMIT 1;
$$;

-- 3. CLIENTES / PACIENTES
CREATE TABLE public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(20),
    data_nascimento DATE,
    telefone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    email VARCHAR(100),
    cep VARCHAR(10),
    endereco VARCHAR(150),
    numero VARCHAR(20),
    bairro VARCHAR(60),
    cidade VARCHAR(60),
    uf VARCHAR(2),
    origem VARCHAR(50) DEFAULT 'BALCAO',
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_clientes_loja ON public.clientes(loja_id);

-- 4. RECEITAS OFTALMOLÓGICAS (PRESCRIÇÕES ÓPTICAS)
CREATE TABLE public.receitas_opticas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    medico_prescritor VARCHAR(120) NOT NULL,
    registro_profissional VARCHAR(40) NOT NULL,
    tipo_prescritor VARCHAR(30) DEFAULT 'OFTALMOLOGISTA' CHECK (tipo_prescritor IN ('OFTALMOLOGISTA', 'OPTOMETRISTA')),
    data_emissao DATE NOT NULL,
    data_validade DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    
    od_longe_esferico NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    od_longe_cilindrico NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    od_longe_eixo INTEGER NOT NULL DEFAULT 0,
    od_longe_dnp NUMERIC(4,1),
    od_longe_altura NUMERIC(4,1),
    
    oe_longe_esferico NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    oe_longe_cilindrico NUMERIC(4,2) NOT NULL DEFAULT 0.00,
    oe_longe_eixo INTEGER NOT NULL DEFAULT 0,
    oe_longe_dnp NUMERIC(4,1),
    oe_longe_altura NUMERIC(4,1),

    adicao NUMERIC(4,2) DEFAULT 0.00,
    tipo_lente_sugerida VARCHAR(50),
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. LABORATÓRIOS ÓPTICOS PARCEIROS
CREATE TABLE public.laboratorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    contato VARCHAR(80),
    telefone VARCHAR(20),
    email VARCHAR(100),
    prazo_medio_dias INTEGER DEFAULT 3,
    tabela_precos_resumo TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRODUTOS & CATÁLOGO ÓPTICO
CREATE TABLE public.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    codigo_barras VARCHAR(50),
    codigo_referencia VARCHAR(50),
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(40) NOT NULL,
    marca VARCHAR(60) NOT NULL,
    modelo VARCHAR(60),
    cor VARCHAR(40),
    material VARCHAR(40),
    tamanho_aro INTEGER,
    tamanho_ponte INTEGER,
    tamanho_haste INTEGER,
    preco_custo NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    preco_venda NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    estoque_atual NUMERIC(12,3) NOT NULL DEFAULT 0.000,
    estoque_minimo NUMERIC(12,3) NOT NULL DEFAULT 1.000,
    fornecedor_id UUID REFERENCES public.laboratorios(id) ON DELETE SET NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ORDENS DE SERVIÇO ÓPTICAS
CREATE TABLE public.ordens_servico_opticas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    numero_os BIGINT GENERATED BY DEFAULT AS IDENTITY,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
    receita_id UUID REFERENCES public.receitas_opticas(id) ON DELETE SET NULL,
    atendente_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE RESTRICT,
    montador_id UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
    laboratorio_id UUID REFERENCES public.laboratorios(id) ON DELETE SET NULL,
    numero_pedido_laboratorio VARCHAR(50),
    
    status VARCHAR(30) NOT NULL DEFAULT 'ORCAMENTO',
    armacao_descricao VARCHAR(150) NOT NULL,
    armacao_referencia VARCHAR(50),
    armacao_propria BOOLEAN NOT NULL DEFAULT FALSE,
    lente_descricao VARCHAR(150) NOT NULL,
    lente_material VARCHAR(50) NOT NULL,
    lente_design VARCHAR(50) NOT NULL,
    tratamentos JSONB DEFAULT '[]'::jsonb,
    
    aro_horizontal_mm NUMERIC(4,1),
    ponte_mm NUMERIC(4,1),
    dnp_od NUMERIC(4,1),
    dnp_oe NUMERIC(4,1),
    altura_od NUMERIC(4,1),
    altura_oe NUMERIC(4,1),

    valor_armacao NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    valor_lentes NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    valor_tratamentos NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    valor_servicos_montagem NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    valor_desconto NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    valor_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,

    data_abertura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_prometida TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. VENDAS PDV & TRANSAÇÕES
CREATE TABLE public.vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    numero_venda BIGINT GENERATED BY DEFAULT AS IDENTITY,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    vendedor_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE RESTRICT,
    os_id UUID REFERENCES public.ordens_servico_opticas(id) ON DELETE SET NULL,
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    desconto_total NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    valor_final NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    forma_pagamento VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONCLUIDA',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ATIVAÇÃO DE RLS
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas_opticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico_opticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_lojas ON public.lojas FOR ALL USING (id = public.current_loja_id());
CREATE POLICY rls_funcionarios ON public.funcionarios FOR ALL USING (loja_id = public.current_loja_id());
CREATE POLICY rls_clientes ON public.clientes FOR ALL USING (loja_id = public.current_loja_id());
CREATE POLICY rls_receitas ON public.receitas_opticas FOR ALL USING (loja_id = public.current_loja_id());
CREATE POLICY rls_produtos ON public.produtos FOR ALL USING (loja_id = public.current_loja_id());
CREATE POLICY rls_os_opticas ON public.ordens_servico_opticas FOR ALL USING (loja_id = public.current_loja_id());
CREATE POLICY rls_vendas ON public.vendas FOR ALL USING (loja_id = public.current_loja_id());
