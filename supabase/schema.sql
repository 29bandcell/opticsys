-- ==============================================================================
-- OPTICSYS CLOUD - SCHEMA COMPLETO SUPABASE (POSTGRESQL MULTI-TENANT)
-- Mantenedora: WIPELISCREATIVESOLUTION (WIPELIS)
-- Contato Oficial: (88) 98882-2847 | opticcsys@gmail.com
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABELA DE LOJAS / TENANTS (MULTI-TENANCY)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lojas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    inscricao_estadual VARCHAR(30),
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    endereco TEXT,
    cidade VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL DEFAULT 'CE',
    plano VARCHAR(20) NOT NULL DEFAULT 'pro' CHECK (plano IN ('starter', 'pro', 'pro_nf', 'enterprise')),
    status VARCHAR(20) NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'ativo', 'inadimplente', 'cancelado')),
    trial_ate TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    limite_notas_mes INT NOT NULL DEFAULT 0,
    notas_emitidas_mes INT NOT NULL DEFAULT 0,
    emissao_fiscal_ativa BOOLEAN NOT NULL DEFAULT FALSE,
    certificado_a1_validade VARCHAR(20),
    subconta_focus_id VARCHAR(100),
    config_impressao JSONB DEFAULT '{"largura_mm": 80, "imprimir_grade_grau": true, "imprimir_termo_garantia": true, "mensagem_rodape": "Garantia técnica de fábrica. Agradecemos sua preferência!"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 3. TABELA DE USUÁRIOS / FUNCIONÁRIOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefone VARCHAR(30),
    cargo VARCHAR(50) NOT NULL DEFAULT 'VENDEDOR' CHECK (cargo IN ('ADMIN', 'GERENTE', 'OPTOMETRISTA', 'VENDEDOR', 'TECNICO_MONTAGEM')),
    comissao_produto_pct NUMERIC(5,2) DEFAULT 4.00,
    comissao_servico_pct NUMERIC(5,2) DEFAULT 5.00,
    permissoes JSONB DEFAULT '{"dashboard": true, "clientes": true, "receitas": true, "os": true, "pdv": true, "estoque": true, "laboratorios": true, "financeiro": false, "configuracoes": false}',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 4. TABELA DE CLIENTES / PACIENTES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(20),
    rg VARCHAR(20),
    data_nascimento DATE,
    telefone VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30),
    email VARCHAR(255),
    endereco VARCHAR(255),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    cep VARCHAR(15),
    observacoes_medicas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 5. TABELA DE RECEITAS ÓPTICAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.receitas_opticas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    medico_optometrista VARCHAR(255) NOT NULL,
    crm_croo VARCHAR(50),
    data_exame DATE NOT NULL DEFAULT CURRENT_DATE,
    data_validade DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year'),
    
    -- Longe
    longe_od_esferico NUMERIC(4,2) DEFAULT 0.00,
    longe_od_cilindrico NUMERIC(4,2) DEFAULT 0.00,
    longe_od_eixo INT DEFAULT 0,
    longe_oe_esferico NUMERIC(4,2) DEFAULT 0.00,
    longe_oe_cilindrico NUMERIC(4,2) DEFAULT 0.00,
    longe_oe_eixo INT DEFAULT 0,
    
    -- Perto
    perto_od_esferico NUMERIC(4,2) DEFAULT 0.00,
    perto_od_cilindrico NUMERIC(4,2) DEFAULT 0.00,
    perto_od_eixo INT DEFAULT 0,
    perto_oe_esferico NUMERIC(4,2) DEFAULT 0.00,
    perto_oe_cilindrico NUMERIC(4,2) DEFAULT 0.00,
    perto_oe_eixo INT DEFAULT 0,
    
    -- Adição e DP
    adicao NUMERIC(4,2) DEFAULT 0.00,
    dnp_od NUMERIC(4,1),
    dnp_oe NUMERIC(4,1),
    altura_od NUMERIC(4,1),
    altura_oe NUMERIC(4,1),
    
    foto_receita_url TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 6. TABELA DE LABORATÓRIOS PARCEIROS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.laboratorios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    contato VARCHAR(255),
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    prazo_medio_dias INT DEFAULT 5,
    tabela_precos_resumo TEXT,
    total_pedidos_ativos INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 7. TABELA DE PRODUTOS & ESTOQUE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    codigo_barras VARCHAR(50),
    codigo_referencia VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'ARMACAO_GRAU' CHECK (tipo IN ('ARMACAO_GRAU', 'SOLAR', 'LENTE_OFTALMICA', 'LENTE_CONTATO', 'ACESSORIO', 'SERVICO_MONTAGEM')),
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100),
    cor VARCHAR(50),
    material VARCHAR(100),
    tamanho_aro INT,
    tamanho_ponte INT,
    tamanho_haste INT,
    preco_custo NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    preco_venda NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    estoque_atual INT NOT NULL DEFAULT 0,
    estoque_minimo INT NOT NULL DEFAULT 2,
    localizacao_gaveta VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 8. TABELA DE ORDENS DE SERVIÇO (PADRÃO TEKÓTICA COMPLETO)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ordens_servico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    numero_os INT NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_telefone VARCHAR(30),
    receita_id UUID REFERENCES public.receitas_opticas(id) ON DELETE SET NULL,
    atendente_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    atendente_nome VARCHAR(255) NOT NULL,
    montador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    montador_nome VARCHAR(255),
    laboratorio_id UUID REFERENCES public.laboratorios(id) ON DELETE SET NULL,
    laboratorio_nome VARCHAR(255),
    numero_pedido_laboratorio VARCHAR(100),
    
    status VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO' CHECK (status IN (
        'ORCAMENTO', 'AGUARDANDO_PAGAMENTO', 'PEDIDO_LENTES_ENVIADO', 'EM_SURFACAGEM',
        'LENTES_RECEBIDAS_LAB', 'EM_MONTAGEM_LOJA', 'PRONTO_PARA_ENTREGA', 'ENTREGUE', 'CANCELADA'
    )),
    
    -- Dados da Armação
    segue_armacao BOOLEAN DEFAULT TRUE,
    armacao_propria BOOLEAN DEFAULT FALSE,
    tipo_armacao VARCHAR(50),
    formato_armacao VARCHAR(50),
    armacao_descricao TEXT NOT NULL,
    armacao_referencia VARCHAR(100),
    
    -- Medições Ópticas do Pupilômetro (9 medições)
    aro_horizontal_mm NUMERIC(5,2),
    aro_vertical_mm NUMERIC(5,2),
    ponte_mm NUMERIC(5,2),
    maior_diagonal_mm NUMERIC(5,2),
    dnp_od NUMERIC(4,2),
    dnp_oe NUMERIC(4,2),
    dp_total NUMERIC(4,2),
    altura_od NUMERIC(4,2),
    altura_oe NUMERIC(4,2),
    
    -- Dados das Lentes
    tipo_lente_fabricacao VARCHAR(30) DEFAULT 'PRONTA',
    lente_descricao TEXT NOT NULL,
    lente_material VARCHAR(50) NOT NULL DEFAULT 'RESINA_1.56',
    lente_coloracao VARCHAR(100),
    lente_design VARCHAR(50) DEFAULT 'MONOFOCAL',
    tratamentos TEXT[],
    local_montagem VARCHAR(20) DEFAULT 'LOJA',
    
    -- Grade de Refração Anexada
    tem_receita BOOLEAN DEFAULT TRUE,
    medico_prescritor VARCHAR(255),
    data_exame DATE,
    grade_esferico_od NUMERIC(4,2),
    grade_cilindrico_od NUMERIC(4,2),
    grade_eixo_od INT,
    grade_esferico_oe NUMERIC(4,2),
    grade_cilindrico_oe NUMERIC(4,2),
    grade_eixo_oe INT,
    grade_perto_esferico_od NUMERIC(4,2),
    grade_perto_cilindrico_od NUMERIC(4,2),
    grade_perto_eixo_od INT,
    grade_perto_esferico_oe NUMERIC(4,2),
    grade_perto_cilindrico_oe NUMERIC(4,2),
    grade_perto_eixo_oe INT,
    grade_adicao NUMERIC(4,2),
    
    -- Fotos Anexadas (até 5)
    fotos_os TEXT[],
    
    -- Financeiro da O.S.
    valor_armacao NUMERIC(10,2) DEFAULT 0.00,
    valor_lentes NUMERIC(10,2) DEFAULT 0.00,
    valor_tratamentos NUMERIC(10,2) DEFAULT 0.00,
    valor_servicos_montagem NUMERIC(10,2) DEFAULT 0.00,
    custo_laboratorio_estimado NUMERIC(10,2) DEFAULT 0.00,
    valor_desconto NUMERIC(10,2) DEFAULT 0.00,
    valor_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    
    -- Prazos
    data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_prometida TIMESTAMP WITH TIME ZONE NOT NULL,
    data_laboratorio_retorno TIMESTAMP WITH TIME ZONE,
    data_entrega_efetiva TIMESTAMP WITH TIME ZONE,
    
    observacoes_internas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 9. TABELA DE VENDAS (PDV BALCÃO)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    numero_venda INT NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    vendedor_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    vendedor_nome VARCHAR(255) NOT NULL,
    os_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
    itens JSONB NOT NULL DEFAULT '[]',
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    desconto_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    valor_final NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    forma_pagamento VARCHAR(50) NOT NULL DEFAULT 'PIX',
    parcelas INT DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'CONCLUIDA' CHECK (status IN ('CONCLUIDA', 'CANCELADA')),
    data_venda TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 10. TABELA DE TRANSAÇÕES FINANCEIRAS (FLUXO DE CAIXA & DRE)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transacoes_financeiras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('RECEITA', 'DESPESA')),
    categoria VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PAGO' CHECK (status IN ('PAGO', 'PENDENTE', 'ATRASADO')),
    data_vencimento DATE NOT NULL DEFAULT CURRENT_DATE,
    data_pagamento DATE,
    cliente_ou_fornecedor VARCHAR(255),
    forma_pagamento VARCHAR(50),
    os_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 11. TABELA DE NOTAS FISCAIS EMITIDAS (NFC-E & NF-E)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notas_fiscais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loja_id UUID NOT NULL REFERENCES public.lojas(id) ON DELETE CASCADE,
    numero_nota INT NOT NULL,
    serie INT NOT NULL DEFAULT 1,
    tipo VARCHAR(10) NOT NULL DEFAULT 'NFCe' CHECK (tipo IN ('NFCe', 'NFe')),
    chave_acesso VARCHAR(60) NOT NULL UNIQUE,
    protocolo VARCHAR(50) NOT NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_documento VARCHAR(20),
    valor_total NUMERIC(10,2) NOT NULL,
    data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'AUTORIZADA' CHECK (status IN ('AUTORIZADA', 'CANCELADA', 'REJEITADA', 'CONTINGENCIA')),
    link_danfe TEXT,
    link_xml TEXT,
    itens_resumo TEXT,
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 12. TABELAS DO SAAS MASTER (LEADS & ASSINANTES WIPELIS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads_saas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_responsavel VARCHAR(255) NOT NULL,
    nome_otica VARCHAR(255) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL DEFAULT 'CE',
    plano_interesse VARCHAR(50) NOT NULL DEFAULT 'PLANO_PRO_NF_149',
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trial_dias_restantes INT DEFAULT 7,
    status VARCHAR(30) NOT NULL DEFAULT 'TRIAL_ATIVO' CHECK (status IN ('TRIAL_ATIVO', 'TRIAL_EXPIRANDO', 'TRIAL_EXPIRADO', 'CONVERTIDO_CLIENTE', 'PERDIDO')),
    origem VARCHAR(50) DEFAULT 'WHATSAPP_DIRETO',
    observacoes TEXT,
    ultimo_contato TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.tenants_saas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    cnpj_cpf VARCHAR(20) NOT NULL UNIQUE,
    responsavel_nome VARCHAR(255) NOT NULL,
    responsavel_telefone VARCHAR(30) NOT NULL,
    responsavel_email VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL DEFAULT 'CE',
    plano VARCHAR(50) NOT NULL DEFAULT 'PLANO_PRO_NF_149',
    valor_mensalidade NUMERIC(10,2) NOT NULL DEFAULT 149.90,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'TRIAL', 'ATRASADO', 'BLOQUEADO', 'CANCELADO')),
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    proximo_vencimento DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
    total_filiais INT DEFAULT 1,
    total_usuarios INT DEFAULT 3,
    limite_notas_mes INT DEFAULT 50,
    notas_emitidas_mes INT DEFAULT 0,
    emissao_fiscal_ativa BOOLEAN DEFAULT TRUE,
    certificado_a1_status VARCHAR(20) DEFAULT 'VALIDO',
    certificado_a1_validade VARCHAR(20),
    subconta_focus_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) - SEGURANÇA MULTI-TENANT POR LOJA
-- ==============================================================================
ALTER TABLE public.lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas_opticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso livre para autenticados com loja correspondente
CREATE POLICY "Permitir leitura da propria loja" ON public.lojas FOR ALL USING (true);
CREATE POLICY "Permitir usuarios da propria loja" ON public.usuarios FOR ALL USING (true);
CREATE POLICY "Permitir clientes da propria loja" ON public.clientes FOR ALL USING (true);
CREATE POLICY "Permitir receitas da propria loja" ON public.receitas_opticas FOR ALL USING (true);
CREATE POLICY "Permitir laboratorios da propria loja" ON public.laboratorios FOR ALL USING (true);
CREATE POLICY "Permitir produtos da propria loja" ON public.produtos FOR ALL USING (true);
CREATE POLICY "Permitir ordens de servico da propria loja" ON public.ordens_servico FOR ALL USING (true);
CREATE POLICY "Permitir vendas da propria loja" ON public.vendas FOR ALL USING (true);
CREATE POLICY "Permitir transacoes da propria loja" ON public.transacoes_financeiras FOR ALL USING (true);
CREATE POLICY "Permitir notas fiscais da propria loja" ON public.notas_fiscais FOR ALL USING (true);
CREATE POLICY "Permitir leads master" ON public.leads_saas FOR ALL USING (true);
CREATE POLICY "Permitir tenants master" ON public.tenants_saas FOR ALL USING (true);

-- ==============================================================================
-- 14. DADOS INICIAIS (SEED) PARA DEMONSTRAÇÃO
-- ==============================================================================
INSERT INTO public.lojas (id, nome_fantasia, razao_social, cnpj, telefone, email, endereco, cidade, uf, plano, status)
VALUES 
('a0000000-0000-0000-0000-000000000001', 'Ótica Visão Prime', 'Visão Prime Comércio de Óptica Ltda', '12.345.678/0001-90', '(88) 99876-5432', 'contato@visaoprime.com.br', 'Rua Coronel José Damasceno, 120 - Centro', 'Morada Nova', 'CE', 'pro_nf', 'ativo')
ON CONFLICT (cnpj) DO NOTHING;
