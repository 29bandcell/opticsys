export type TenantPlan = 'starter' | 'pro' | 'pro_nf' | 'enterprise';
export type TenantStatus = 'trial' | 'ativo' | 'inadimplente' | 'cancelado';

export interface Loja {
  id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  uf: string;
  plano: TenantPlan;
  status: TenantStatus;
  trial_ate: string;
  logo_url?: string;
  config_impressao?: {
    largura_mm: 58 | 80;
    imprimir_grade_grau: boolean;
    imprimir_termo_garantia: boolean;
    mensagem_rodape: string;
  };
}

export type RoleUsuario = 'ADMIN' | 'GERENTE' | 'OPTOMETRISTA' | 'VENDEDOR' | 'TECNICO_MONTAGEM';

export interface Funcionario {
  id: string;
  loja_id: string;
  nome: string;
  email: string;
  telefone?: string;
  senha?: string;
  cargo: RoleUsuario;
  comissao_produto_pct: number;
  comissao_servico_pct: number;
  permissoes: {
    dashboard: boolean;
    clientes: boolean;
    receitas: boolean;
    os: boolean;
    pdv: boolean;
    estoque: boolean;
    laboratorios: boolean;
    financeiro: boolean;
    configuracoes: boolean;
  };
  ativo: boolean;
}

export interface Cliente {
  id: string;
  loja_id: string;
  nome: string;
  cpf: string;
  rg?: string;
  data_nascimento?: string;
  telefone: string;
  whatsapp?: string;
  email?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  origem?: string;
  observacoes?: string;
  created_at: string;
}

export interface GrauOlho {
  esferico: number;      // -20.00 a +20.00
  cilindrico: number;    // -10.00 a +0.00
  eixo: number;          // 0 a 180 graus
  adicao?: number;       // +0.75 a +4.00
  dnp?: number;          // DNP em mm (ex: 31.5)
  altura?: number;       // Altura de montagem em mm (ex: 18.0)
  prisma?: number;
  base_prisma?: 'SUPERIOR' | 'INFERIOR' | 'NASAL' | 'TEMPORAL';
}

export interface MedicoPrescritor {
  id: string;
  loja_id: string;
  nome: string;
  registro: string; // CRM 12345-SP ou CROO 9876
  tipo: 'OFTALMOLOGISTA' | 'OPTOMETRISTA';
  especialidade?: string;
  consultorio?: string;
  telefone: string;
  email?: string;
  notificar_whatsapp?: boolean;
}

export interface AgendamentoConsulta {
  id: string;
  loja_id: string;
  cliente_id?: string;
  paciente_nome: string;
  telefone: string;
  cpf?: string;
  data_nascimento?: string;
  data: string;
  horario: string;
  profissional_id?: string;
  profissional: string; // Nome do médico ou optometrista
  tipo: string;
  status: 'AGENDADO' | 'CONFIRMADO' | 'EM_ATENDIMENTO' | 'CONCLUIDO' | 'CANCELADO';
  observacoes?: string;
  notificado_medico?: boolean;
  data_notificacao_medico?: string;
  receita_gerada_id?: string;
  created_at: string;
}

export interface ReceitaOptica {
  id: string;
  loja_id: string;
  cliente_id: string;
  cliente_nome?: string;
  medico_prescritor: string; // Dr. Fulano
  registro_profissional: string; // CRM 12345-SP ou CROO
  tipo_prescritor: 'OFTALMOLOGISTA' | 'OPTOMETRISTA';
  data_emissao: string;
  data_validade: string;
  
  // Grau Longe
  od_longe: GrauOlho;
  oe_longe: GrauOlho;
  
  // Grau Perto (Calculado ou explícito)
  od_perto?: GrauOlho;
  oe_perto?: GrauOlho;
  
  tipo_lente_sugerida?: 'MONOFOCAL' | 'BIFOCAL' | 'MULTIFOCAL' | 'DEGEN_OCUPACIONAL';
  observacoes?: string;
  anexo_receita_url?: string;
  created_at: string;
}

export type StatusOSOptica = 
  | 'ORCAMENTO'
  | 'AGUARDANDO_PAGAMENTO'
  | 'AGUARDANDO_LABORATORIO'
  | 'EM_SURFACAGEM'
  | 'EM_MONTAGEM'
  | 'CONTROLE_QUALIDADE'
  | 'PRONTO_RETIRADA'
  | 'ENTREGUE'
  | 'CANCELADA';

export interface ItemProdutoServicoOS {
  id: string;
  produto_id?: string;
  nome: string;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}

export interface OrdemServicoOptica {
  id: string;
  loja_id: string;
  numero_os: number;
  codigo_referencia?: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_telefone: string;
  receita_id?: string;
  receita?: ReceitaOptica;
  atendente_id: string;
  atendente_nome: string;
  responsavel_tecnico?: string;
  montador_id?: string;
  montador_nome?: string;
  laboratorio_id?: string;
  laboratorio_nome?: string;
  numero_pedido_laboratorio?: string;
  status: StatusOSOptica;
  
  // Itens da O.S. (Produtos & Serviços)
  itens?: ItemProdutoServicoOS[];

  // Dados da Receita & Prescritor
  tem_receita?: boolean;
  data_exame?: string;
  medico_prescritor?: string;
  grade_esferico_od?: number;
  grade_cilindrico_od?: number;
  grade_eixo_od?: number;
  grade_esferico_oe?: number;
  grade_cilindrico_oe?: number;
  grade_eixo_oe?: number;
  grade_perto_esferico_od?: number;
  grade_perto_cilindrico_od?: number;
  grade_perto_eixo_od?: number;
  grade_perto_esferico_oe?: number;
  grade_perto_cilindrico_oe?: number;
  grade_perto_eixo_oe?: number;
  grade_adicao?: number;
  foto_receita_url?: string;

  // Medições da Armação & Pupilômetro
  altura_od?: number;
  altura_oe?: number;
  dnp_od?: number;
  dnp_oe?: number;
  dp_total?: number;
  aro_horizontal_mm?: number;
  aro_vertical_mm?: number;
  ponte_mm?: number;
  maior_diagonal_mm?: number;
  
  // Dados das Lentes & Laboratório
  tipo_lente_fabricacao?: 'PRONTA' | 'SURFACADA';
  lente_descricao: string;
  lente_material: 'RESINA_1.56' | 'POLICARBONATO_1.59' | 'TRIVEX_1.53' | 'ALTO_INDICE_1.67' | 'ALTO_INDICE_1.74' | 'CRISTAL';
  lente_coloracao?: string;
  lente_design: 'MONOFOCAL' | 'BIFOCAL' | 'MULTIFOCAL_PROGRESSIVA';
  tratamentos: string[];
  local_montagem?: 'LOJA' | 'LABORATORIO';

  // Dados da Armação & Formato
  segue_armacao?: boolean;
  armacao_propria: boolean;
  tipo_armacao?: string;
  formato_armacao?: string;
  armacao_descricao: string;
  armacao_referencia?: string;

  // Fotos / Imagens Anexadas (até 5 fotos)
  fotos_os?: string[];
  
  // Valores & Financeiro da O.S.
  valor_armacao: number;
  valor_lentes: number;
  valor_tratamentos: number;
  valor_servicos_montagem: number;
  custo_laboratorio_estimado: number;
  valor_desconto: number;
  valor_total: number;
  valor_sinal?: number;
  valor_saldo?: number;
  forma_pagamento_sinal?: string;
  
  // Prazos
  data_abertura: string;
  data_prometida: string;
  data_laboratorio_retorno?: string;
  data_entrega_efetiva?: string;
  
  // Controle de Qualidade & Retirada Técnica
  checklist_conferencia?: {
    dioptria_conferida: boolean;
    dnp_altura_conferida: boolean;
    eixo_base_alinhado: boolean;
    limpeza_ajuste_plaquetas: boolean;
    conferido_por?: string;
    data_conferencia?: string;
  };
  comprovante_retirada_assinado?: boolean;
  data_retirada_assinatura?: string;
  nome_recebedor?: string;
  documento_recebedor?: string;
  
  observacoes_internas?: string;
  created_at: string;
}

export type TipoProduto = 
  | 'ARMACAO_GRAU'
  | 'SOLAR'
  | 'LENTE_OFTALMICA'
  | 'LENTE_CONTATO'
  | 'ACESSORIO'
  | 'SERVICO_MONTAGEM';

export interface Produto {
  id: string;
  loja_id: string;
  codigo_barras: string;
  codigo_referencia: string;
  nome: string;
  tipo: TipoProduto;
  marca: string;
  modelo?: string;
  cor?: string;
  material?: string;
  tamanho_aro?: number;
  tamanho_ponte?: number;
  tamanho_haste?: number;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  fornecedor_id?: string;
  ativo: boolean;
}

export interface Laboratorio {
  id: string;
  loja_id: string;
  nome: string;
  contato: string;
  telefone: string;
  email: string;
  prazo_medio_dias: number;
  tabela_precos_resumo: string;
  total_pedidos_ativos: number;
}

export interface VendaPDV {
  id: string;
  loja_id: string;
  numero_venda: number;
  cliente_id?: string;
  cliente_nome: string;
  vendedor_id: string;
  vendedor_nome: string;
  os_id?: string;
  itens: {
    produto_id: string;
    nome: string;
    quantidade: number;
    preco_unitario: number;
    desconto: number;
    subtotal: number;
  }[];
  subtotal: number;
  desconto_total: number;
  valor_final: number;
  forma_pagamento: 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'CREDIARIO_PROPRIO' | 'FATURADO';
  parcelas?: number;
  status: 'CONCLUIDA' | 'CANCELADA';
  data_venda: string;
}

export interface TransacaoFinanceira {
  id: string;
  loja_id: string;
  tipo: 'RECEITA' | 'DESPESA';
  categoria: string;
  descricao: string;
  valor: number;
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO';
  data_vencimento: string;
  data_pagamento?: string;
  cliente_ou_fornecedor?: string;
  forma_pagamento?: string;
  os_id?: string;
}

export interface NotaFiscalEmitida {
  id: string;
  loja_id: string;
  numero_nota: number;
  serie: number;
  tipo: 'NFCe' | 'NFe';
  chave_acesso: string;
  protocolo: string;
  cliente_nome: string;
  cliente_documento: string;
  valor_total: number;
  data_emissao: string;
  status: 'AUTORIZADA' | 'CANCELADA' | 'REJEITADA' | 'CONTINGENCIA';
  link_danfe: string;
  link_xml: string;
  itens_resumo: string;
  qr_code_url?: string;
}

export interface ItemXMLNota {
  codigo_fornecedor: string;
  descricao: string;
  ncm: string;
  ean: string;
  quantidade: number;
  custo_unitario: number;
  valor_total: number;
  tipo: 'ARMACAO' | 'LENTE_BLOCO' | 'LENTE_CONTATO' | 'SOLAR' | 'ACESSORIO';
  margem_sugerida_pct: number;
  preco_venda_sugerido: number;
  selecionado: boolean;
}

export interface FaturaDuplicataXML {
  numero: string;
  vencimento: string;
  valor: number;
}

export interface NotaFiscalEntradaParsed {
  chave_acesso: string;
  numero_nota: string;
  serie: string;
  data_emissao: string;
  fornecedor_cnpj: string;
  fornecedor_nome: string;
  fornecedor_ie?: string;
  fornecedor_cidade?: string;
  fornecedor_uf?: string;
  valor_total: number;
  valor_produtos: number;
  valor_frete?: number;
  valor_ipi?: number;
  itens: ItemXMLNota[];
  duplicatas: FaturaDuplicataXML[];
}

export type StatusLead = 
  | 'NOVO_LEAD' 
  | 'PRIMEIRO_CONTATO' 
  | 'DEMO_AGENDADA' 
  | 'TRIAL_ATIVO' 
  | 'TRIAL_EXPIRANDO' 
  | 'TRIAL_EXPIRADO' 
  | 'CONVERTIDO_CLIENTE' 
  | 'PERDIDO';

export interface InteracaoCRMLead {
  id: string;
  data: string;
  autor: string;
  canal: 'WHATSAPP' | 'LIGACAO' | 'EMAIL' | 'REUNIAO_ONLINE';
  resumo: string;
}

export interface LeadSaaS {
  id: string;
  nome_responsavel: string;
  nome_otica: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  plano_interesse: 'PLANO_PRO_99' | 'PLANO_PRO_NF_149';
  data_cadastro: string;
  trial_dias_restantes: number;
  status: StatusLead;
  origem: 'LANDING_PAGE' | 'INDICACAO' | 'ANUNCIO_INSTAGRAM' | 'WHATSAPP_DIRETO' | 'EVENTO';
  vendedor_responsavel?: string;
  proxima_acao_data?: string;
  proxima_acao_descricao?: string;
  motivo_perda?: string;
  historico_interacoes?: InteracaoCRMLead[];
  observacoes?: string;
  ultimo_contato?: string;
}

export interface TenantSaaS {
  id: string;
  nome_fantasia: string;
  razao_social: string;
  cnpj_cpf: string;
  responsavel_nome: string;
  responsavel_telefone: string;
  responsavel_email: string;
  cidade: string;
  estado: string;
  plano: 'PLANO_PRO_99' | 'PLANO_PRO_NF_149';
  valor_mensalidade: number;
  status: 'ATIVO' | 'TRIAL' | 'ATRASADO' | 'BLOQUEADO' | 'CANCELADO';
  data_inicio: string;
  proximo_vencimento: string;
  total_filiais: number;
  total_usuarios: number;
  limite_usuarios_plano?: number;
  limite_filiais_plano?: number;
  // Gestão Fiscal Master (50 Notas / CNPJ)
  limite_notas_mes: number;
  notas_emitidas_mes: number;
  emissao_fiscal_ativa: boolean;
  certificado_a1_status?: 'VALIDO' | 'EXPIRADO' | 'PENDENTE';
  certificado_a1_validade?: string;
  subconta_focus_id?: string;
  historico_cobrancas?: {
    id: string;
    mes_referencia: string;
    valor: number;
    status: 'PAGO' | 'PENDENTE' | 'VENCIDO';
    data_pagamento?: string;
    metodo?: 'PIX' | 'BOLETO' | 'CARTAO';
  }[];
}

// -------------------------------------------------------------
// OPERAÇÃO ÓTICA: CAIXA, REFAÇÕES, TROCAS E AUDITORIA
// -------------------------------------------------------------

export interface MovimentacaoCaixa {
  id: string;
  loja_id: string;
  tipo: 'SUPRIMENTO' | 'SANGRIA' | 'VENDA' | 'ESTORNO_DEVOLUCAO';
  valor: number;
  forma_pagamento: 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'CREDIARIO_PROPRIO';
  descricao: string;
  operador_nome: string;
  data_hora: string;
}

export interface TurnoCaixa {
  id: string;
  loja_id: string;
  operador_id: string;
  operador_nome: string;
  data_abertura: string;
  data_fechamento?: string;
  status: 'ABERTO' | 'FECHADO';
  valor_abertura: number;
  // Valores calculados pelo sistema
  total_dinheiro_sistema: number;
  total_pix_sistema: number;
  total_cartao_debito_sistema: number;
  total_cartao_credito_sistema: number;
  total_crediario_sistema: number;
  total_sangrias: number;
  total_suprimentos: number;
  // Valores contados na conferência cega de fechamento
  dinheiro_informado?: number;
  pix_informado?: number;
  cartao_debito_informado?: number;
  cartao_credito_informado?: number;
  diferenca_apurada?: number;
  observacoes_fechamento?: string;
  movimentacoes: MovimentacaoCaixa[];
}

export type MotivoRefacaoOS = 
  | 'ERRO_DIOPTRIA_RECEITA' 
  | 'ERRO_MONTAGEM_LABORATORIO' 
  | 'DEFEITO_BLOCO_LENTE' 
  | 'RISCO_NAO_CONFORMIDADE' 
  | 'EIXO_DESALINHADO' 
  | 'ALTURA_DNP_INCORRETA'
  | 'INSATISFACAO_PACIENTE';

export interface RefacaoOS {
  id: string;
  loja_id: string;
  os_id: string;
  numero_os: number;
  cliente_nome: string;
  laboratorio_id?: string;
  laboratorio_nome?: string;
  motivo: MotivoRefacaoOS;
  responsavel_custo: 'OTICA' | 'LABORATORIO' | 'CLIENTE';
  custo_refacao: number;
  data_solicitacao: string;
  data_prevista_reentrega: string;
  status: 'PENDENTE_ENVIO' | 'EM_PROCESSO' | 'CONCLUIDA' | 'CANCELADA';
  observacoes: string;
}

export interface TrocaDevolucaoItem {
  id: string;
  loja_id: string;
  cliente_id?: string;
  cliente_nome: string;
  venda_original_id?: string;
  produto_devolvido_id?: string;
  produto_devolvido_nome: string;
  quantidade: number;
  valor_credito: number;
  motivo: string;
  retornar_ao_estoque: boolean;
  data_solicitacao: string;
  status: 'VALE_EMITIDO' | 'UTILIZADO' | 'ESTORNADO';
  codigo_vale: string;
}

