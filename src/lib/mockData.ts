import { 
  Loja, 
  Funcionario, 
  Cliente, 
  ReceitaOptica, 
  OrdemServicoOptica, 
  Produto, 
  Laboratorio, 
  VendaPDV, 
  TransacaoFinanceira,
  LeadSaaS,
  TenantSaaS
} from '../types';

/**
 * OpticSys Cloud - Base de Dados Inicial Operacional
 * Todos os registros de demonstração foram limpos para entrada em produção.
 */

export const INITIAL_LOJAS: Loja[] = [
  {
    id: 'loja-matriz',
    nome_fantasia: 'Minha Ótica Principal',
    razao_social: 'Ótica Principal Ltda',
    cnpj: '00.000.000/0001-00',
    telefone: '(88) 98882-2847',
    email: 'contato@opticsys.com.br',
    endereco: 'Rua Principal, 100 - Centro',
    cidade: 'Morada Nova',
    uf: 'CE',
    plano: 'pro_nf',
    status: 'ativo',
    trial_ate: undefined,
    config_impressao: {
      largura_mm: 80,
      imprimir_grade_grau: true,
      imprimir_termo_garantia: true,
      mensagem_rodape: 'Obrigado por sua preferência!'
    }
  }
];

export const INITIAL_FUNCIONARIOS: Funcionario[] = [
  {
    id: 'func-admin-01',
    loja_id: 'loja-matriz',
    nome: 'Administrador Master',
    email: 'admin@opticsys.com.br',
    cargo: 'ADMIN',
    senha: 'admin123',
    comissao_produto_pct: 0.0,
    comissao_servico_pct: 0.0,
    permissoes: {
      dashboard: true,
      clientes: true,
      receitas: true,
      os: true,
      pdv: true,
      estoque: true,
      laboratorios: true,
      financeiro: true,
      configuracoes: true
    },
    ativo: true
  }
];

export const INITIAL_CLIENTES: Cliente[] = [];

export const INITIAL_RECEITAS: ReceitaOptica[] = [];

export const INITIAL_LABORATORIOS: Laboratorio[] = [];

export const INITIAL_PRODUTOS: Produto[] = [];

export const INITIAL_ORDENS_SERVICO: OrdemServicoOptica[] = [];

export const INITIAL_VENDAS: VendaPDV[] = [];

export const INITIAL_TRANSACOES: TransacaoFinanceira[] = [];

export const INITIAL_LEADS_SAAS: LeadSaaS[] = [];

export const INITIAL_TENANTS_SAAS: TenantSaaS[] = [];
