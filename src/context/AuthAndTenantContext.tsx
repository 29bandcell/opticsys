import React, { createContext, useContext, useState, useEffect } from 'react';
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
  StatusOSOptica,
  TenantPlan,
  LeadSaaS, 
  TenantSaaS, 
  StatusLead
} from '../types';
import {
  INITIAL_LOJAS,
  INITIAL_FUNCIONARIOS,
  INITIAL_CLIENTES,
  INITIAL_RECEITAS,
  INITIAL_ORDENS_SERVICO,
  INITIAL_PRODUTOS,
  INITIAL_LABORATORIOS,
  INITIAL_VENDAS,
  INITIAL_TRANSACOES,
  INITIAL_LEADS_SAAS,
  INITIAL_TENANTS_SAAS
} from '../lib/mockData';

const OPTICSYS_SYSTEM_VERSION = '2.0.0-operational';

// Auto-limpeza de dados de demonstração na primeira inicialização da versão operacional
if (typeof window !== 'undefined') {
  const currentVer = localStorage.getItem('opticsys_system_version');
  if (currentVer !== OPTICSYS_SYSTEM_VERSION) {
    localStorage.removeItem('opticsys_clientes');
    localStorage.removeItem('opticsys_receitas');
    localStorage.removeItem('opticsys_os');
    localStorage.removeItem('opticsys_produtos');
    localStorage.removeItem('opticsys_laboratorios');
    localStorage.removeItem('opticsys_vendas');
    localStorage.removeItem('opticsys_transacoes');
    localStorage.removeItem('opticsys_leads_saas');
    localStorage.removeItem('opticsys_tenants_saas');
    localStorage.removeItem('opticsys_lojas');
    localStorage.removeItem('opticsys_funcionarios');
    localStorage.setItem('opticsys_system_version', OPTICSYS_SYSTEM_VERSION);
  }
}

interface AuthAndTenantContextType {
  // Tenant & Auth
  lojas: Loja[];
  lojaAtiva: Loja;
  setLojaAtiva: (loja: Loja) => void;
  funcionarios: Funcionario[];
  usuarioAtual: Funcionario;
  setUsuarioAtual: (func: Funcionario) => void;
  
  // Data Collections
  clientes: Cliente[];
  receitas: ReceitaOptica[];
  ordensServico: OrdemServicoOptica[];
  produtos: Produto[];
  laboratorios: Laboratorio[];
  vendas: VendaPDV[];
  transacoes: TransacaoFinanceira[];

  // SaaS Master / Wipelis Leads & Tenants
  leadsSaaS: LeadSaaS[];
  tenantsSaaS: TenantSaaS[];
  adicionarLeadSaaS: (lead: Omit<LeadSaaS, 'id' | 'data_cadastro' | 'trial_dias_restantes'>) => void;
  atualizarStatusLead: (leadId: string, status: StatusLead, obs?: string) => void;
  atualizarTenantStatus: (tenantId: string, status: 'ATIVO' | 'TRIAL' | 'ATRASADO' | 'BLOQUEADO' | 'CANCELADO') => void;
  prorrogarTrialTenant: (tenantId: string, diasExtras?: number) => void;
  adicionarCotaNotasTenant: (tenantId: string, quantidadeExtra?: number) => void;
  resetarCotaNotasTenant: (tenantId: string) => void;
  toggleEmissaoFiscalTenant: (tenantId: string) => void;
  
  cadastrarNovaOtica: (dados: {
    nome_fantasia: string;
    razao_social?: string;
    cnpj?: string;
    telefone: string;
    email: string;
    cidade?: string;
    uf?: string;
    plano: TenantPlan;
    nome_responsavel: string;
  }) => string;
  adicionarFilial: (dados: {
    nome_fantasia: string;
    razao_social?: string;
    cnpj?: string;
    telefone: string;
    email: string;
    cidade?: string;
    uf?: string;
    endereco?: string;
  }) => Loja;
  removerLoja: (lojaId: string) => void;
  
  adicionarCliente: (cliente: Omit<Cliente, 'id' | 'loja_id' | 'created_at'>) => Cliente;
  atualizarCliente: (id: string, dados: Partial<Cliente>) => void;
  adicionarReceita: (receita: Omit<ReceitaOptica, 'id' | 'loja_id' | 'created_at'>) => ReceitaOptica;
  criarOrdemServico: (os: Omit<OrdemServicoOptica, 'id' | 'loja_id' | 'numero_os' | 'created_at'>) => OrdemServicoOptica;
  atualizarStatusOS: (osId: string, novoStatus: StatusOSOptica, montadorNome?: string) => void;
  adicionarProduto: (prod: Omit<Produto, 'id' | 'loja_id'>) => Produto;
  adicionarLaboratorio: (lab: Omit<Laboratorio, 'id' | 'loja_id' | 'total_pedidos_ativos'>) => Laboratorio;
  adicionarFuncionario: (func: Omit<Funcionario, 'id' | 'loja_id'>) => Funcionario;
  atualizarFuncionario: (id: string, dados: Partial<Funcionario>) => void;
  toggleFuncionarioAtivo: (id: string) => void;
  realizarVendaPDV: (vendaData: Omit<VendaPDV, 'id' | 'loja_id' | 'numero_venda' | 'data_venda'>) => VendaPDV;
  adicionarTransacao: (tra: Omit<TransacaoFinanceira, 'id' | 'loja_id'>) => void;
  limparTodosOsDadosLocais: () => void;
  
  // UI Helpers
  isDark: boolean;
  toggleDarkMode: () => void;
}

const AuthAndTenantContext = createContext<AuthAndTenantContextType | undefined>(undefined);

export const AuthAndTenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lojas
  const [lojas, setLojas] = useState<Loja[]>(() => {
    const saved = localStorage.getItem('opticsys_lojas');
    return saved ? JSON.parse(saved) : INITIAL_LOJAS;
  });

  const [lojaAtivaId, setLojaAtivaId] = useState<string>(() => {
    return localStorage.getItem('opticsys_active_loja_id') || INITIAL_LOJAS[0].id;
  });

  const lojaAtiva = lojas.find(l => l.id === lojaAtivaId) || lojas[0];

  // Funcionários
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(() => {
    const saved = localStorage.getItem('opticsys_funcionarios');
    return saved ? JSON.parse(saved) : INITIAL_FUNCIONARIOS;
  });

  const [usuarioAtual, setUsuarioAtual] = useState<Funcionario>(() => {
    return funcionarios.find(f => f.loja_id === lojaAtivaId) || funcionarios[0];
  });

  // Coleções de Dados Operacionais
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const saved = localStorage.getItem('opticsys_clientes');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTES;
  });

  const [receitas, setReceitas] = useState<ReceitaOptica[]>(() => {
    const saved = localStorage.getItem('opticsys_receitas');
    return saved ? JSON.parse(saved) : INITIAL_RECEITAS;
  });

  const [ordensServico, setOrdensServico] = useState<OrdemServicoOptica[]>(() => {
    const saved = localStorage.getItem('opticsys_os');
    return saved ? JSON.parse(saved) : INITIAL_ORDENS_SERVICO;
  });

  const [produtos, setProdutos] = useState<Produto[]>(() => {
    const saved = localStorage.getItem('opticsys_produtos');
    return saved ? JSON.parse(saved) : INITIAL_PRODUTOS;
  });

  const [laboratorios, setLaboratorios] = useState<Laboratorio[]>(() => {
    const saved = localStorage.getItem('opticsys_laboratorios');
    return saved ? JSON.parse(saved) : INITIAL_LABORATORIOS;
  });

  const [vendas, setVendas] = useState<VendaPDV[]>(() => {
    const saved = localStorage.getItem('opticsys_vendas');
    return saved ? JSON.parse(saved) : INITIAL_VENDAS;
  });

  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>(() => {
    const saved = localStorage.getItem('opticsys_transacoes');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACOES;
  });

  // Leads e Clientes SaaS da Wipelis
  const [leadsSaaS, setLeadsSaaS] = useState<LeadSaaS[]>(() => {
    const saved = localStorage.getItem('opticsys_leads_saas');
    return saved ? JSON.parse(saved) : INITIAL_LEADS_SAAS;
  });

  const [tenantsSaaS, setTenantsSaaS] = useState<TenantSaaS[]>(() => {
    const saved = localStorage.getItem('opticsys_tenants_saas');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS_SAAS;
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('opticsys_dark') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('opticsys_lojas', JSON.stringify(lojas));
  }, [lojas]);

  useEffect(() => {
    localStorage.setItem('opticsys_active_loja_id', lojaAtivaId);
    const userDaLoja = funcionarios.find(f => f.loja_id === lojaAtivaId && f.cargo === 'ADMIN') || funcionarios[0];
    setUsuarioAtual(userDaLoja);
  }, [lojaAtivaId, funcionarios]);

  useEffect(() => {
    localStorage.setItem('opticsys_funcionarios', JSON.stringify(funcionarios));
  }, [funcionarios]);

  useEffect(() => {
    localStorage.setItem('opticsys_clientes', JSON.stringify(clientes));
  }, [clientes]);

  useEffect(() => {
    localStorage.setItem('opticsys_receitas', JSON.stringify(receitas));
  }, [receitas]);

  useEffect(() => {
    localStorage.setItem('opticsys_os', JSON.stringify(ordensServico));
  }, [ordensServico]);

  useEffect(() => {
    localStorage.setItem('opticsys_produtos', JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem('opticsys_laboratorios', JSON.stringify(laboratorios));
  }, [laboratorios]);

  useEffect(() => {
    localStorage.setItem('opticsys_vendas', JSON.stringify(vendas));
  }, [vendas]);

  useEffect(() => {
    localStorage.setItem('opticsys_transacoes', JSON.stringify(transacoes));
  }, [transacoes]);

  useEffect(() => {
    localStorage.setItem('opticsys_leads_saas', JSON.stringify(leadsSaaS));
  }, [leadsSaaS]);

  useEffect(() => {
    localStorage.setItem('opticsys_tenants_saas', JSON.stringify(tenantsSaaS));
  }, [tenantsSaaS]);

  // Auto-limpeza de lojas placeholder quando existe uma loja real cadastrada pelo usuário
  useEffect(() => {
    if (lojas.length > 1) {
      const lojasReais = lojas.filter(l => l.id !== 'loja-matriz');
      if (lojasReais.length > 0 && lojas.some(l => l.id === 'loja-matriz')) {
        setLojas(lojasReais);
        localStorage.setItem('opticsys_lojas', JSON.stringify(lojasReais));
        if (lojaAtivaId === 'loja-matriz') {
          setLojaAtivaId(lojasReais[0].id);
          localStorage.setItem('opticsys_active_loja_id', lojasReais[0].id);
        }
      }
    }
  }, [lojas, lojaAtivaId]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('opticsys_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('opticsys_dark', 'false');
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  const setLojaAtiva = (loja: Loja) => {
    setLojaAtivaId(loja.id);
  };

  const limparTodosOsDadosLocais = () => {
    localStorage.removeItem('opticsys_clientes');
    localStorage.removeItem('opticsys_receitas');
    localStorage.removeItem('opticsys_os');
    localStorage.removeItem('opticsys_produtos');
    localStorage.removeItem('opticsys_laboratorios');
    localStorage.removeItem('opticsys_vendas');
    localStorage.removeItem('opticsys_transacoes');
    localStorage.removeItem('opticsys_leads_saas');
    localStorage.removeItem('opticsys_tenants_saas');
    setClientes([]);
    setReceitas([]);
    setOrdensServico([]);
    setProdutos([]);
    setLaboratorios([]);
    setVendas([]);
    setTransacoes([]);
    setLeadsSaaS([]);
    setTenantsSaaS([]);
  };

  // Adicionar Lead captado na Landing Page ou Onboarding
  const adicionarLeadSaaS = (leadData: Omit<LeadSaaS, 'id' | 'data_cadastro' | 'trial_dias_restantes'>) => {
    const novoLead: LeadSaaS = {
      ...leadData,
      id: `lead-${Date.now()}`,
      data_cadastro: new Date().toISOString(),
      trial_dias_restantes: 7
    };
    setLeadsSaaS(prev => [novoLead, ...prev]);
  };

  const atualizarStatusLead = (leadId: string, status: StatusLead, obs?: string) => {
    setLeadsSaaS(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status,
          observacoes: obs !== undefined ? obs : l.observacoes,
          ultimo_contato: new Date().toISOString()
        };
      }
      return l;
    }));
  };

  const atualizarTenantStatus = (tenantId: string, status: 'ATIVO' | 'TRIAL' | 'ATRASADO' | 'BLOQUEADO' | 'CANCELADO') => {
    setTenantsSaaS(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, status };
      }
      return t;
    }));
  };

  const prorrogarTrialTenant = (tenantId: string, diasExtras: number = 7) => {
    setTenantsSaaS(prev => prev.map(t => {
      if (t.id === tenantId) {
        const dataAtual = new Date(t.proximo_vencimento).getTime();
        const novaData = new Date(dataAtual + diasExtras * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return { ...t, proximo_vencimento: novaData, status: 'TRIAL' };
      }
      return t;
    }));
  };

  const adicionarCotaNotasTenant = (tenantId: string, quantidadeExtra: number = 50) => {
    setTenantsSaaS(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { 
          ...t, 
          limite_notas_mes: (t.limite_notas_mes || 0) + quantidadeExtra,
          emissao_fiscal_ativa: true 
        };
      }
      return t;
    }));
  };

  const resetarCotaNotasTenant = (tenantId: string) => {
    setTenantsSaaS(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { 
          ...t, 
          notas_emitidas_mes: 0,
          limite_notas_mes: t.plano === 'PLANO_PRO_NF_149' ? 50 : 0,
          emissao_fiscal_ativa: t.plano === 'PLANO_PRO_NF_149'
        };
      }
      return t;
    }));
  };

  const toggleEmissaoFiscalTenant = (tenantId: string) => {
    setTenantsSaaS(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { 
          ...t, 
          emissao_fiscal_ativa: !t.emissao_fiscal_ativa 
        };
      }
      return t;
    }));
  };

  // Cadastro Self-Service de nova Ótica - 7 DIAS DE TESTE GRATUITO
  const cadastrarNovaOtica = (dados: {
    nome_fantasia: string;
    razao_social?: string;
    cnpj?: string;
    telefone: string;
    email: string;
    cidade?: string;
    uf?: string;
    plano: TenantPlan;
    nome_responsavel: string;
  }): string => {
    const novaLojaId = `loja-${Date.now()}`;
    const novaLoja: Loja = {
      id: novaLojaId,
      nome_fantasia: dados.nome_fantasia,
      razao_social: dados.razao_social || dados.nome_fantasia,
      cnpj: dados.cnpj || 'Não informado (Trial)',
      telefone: dados.telefone,
      email: dados.email,
      endereco: 'Endereço a preencher',
      cidade: dados.cidade || 'Não informada',
      uf: dados.uf || 'BR',
      plano: dados.plano,
      status: 'trial',
      trial_ate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 DIAS DE TRIAL
      config_impressao: {
        largura_mm: 80,
        imprimir_grade_grau: true,
        imprimir_termo_garantia: true,
        mensagem_rodape: 'Garantia técnica de fábrica. Agradecemos sua preferência!'
      }
    };

    const novoAdmin: Funcionario = {
      id: `func-${Date.now()}`,
      loja_id: novaLojaId,
      nome: dados.nome_responsavel,
      email: dados.email,
      cargo: 'ADMIN',
      comissao_produto_pct: 4.0,
      comissao_servico_pct: 5.0,
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
    };

    // Salva automaticamente como Lead e Tenant no Wipelis Hub
    const novoLead: LeadSaaS = {
      id: `lead-${Date.now()}`,
      nome_responsavel: dados.nome_responsavel,
      nome_otica: dados.nome_fantasia,
      telefone: dados.telefone,
      email: dados.email,
      cidade: dados.cidade,
      estado: dados.uf,
      plano_interesse: dados.plano === 'pro_nf' ? 'PLANO_PRO_NF_149' : 'PLANO_PRO_99',
      data_cadastro: new Date().toISOString(),
      trial_dias_restantes: 7,
      status: 'TRIAL_ATIVO',
      origem: 'LANDING_PAGE',
      observacoes: 'Novo cadastro de teste de 7 dias via Onboarding OpticSys.'
    };

    const novoTenant: TenantSaaS = {
      id: `tenant-${Date.now()}`,
      nome_fantasia: dados.nome_fantasia,
      razao_social: dados.razao_social || dados.nome_fantasia,
      cnpj_cpf: dados.cnpj || 'Não informado (Trial)',
      responsavel_nome: dados.nome_responsavel,
      responsavel_telefone: dados.telefone,
      responsavel_email: dados.email,
      cidade: dados.cidade || 'Não informada',
      estado: dados.uf || 'BR',
      plano: dados.plano === 'pro_nf' ? 'PLANO_PRO_NF_149' : 'PLANO_PRO_99',
      valor_mensalidade: dados.plano === 'pro_nf' ? 149.90 : 99.90,
      status: 'TRIAL',
      data_inicio: new Date().toISOString().split('T')[0],
      proximo_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      total_filiais: 1,
      total_usuarios: 1,
      limite_notas_mes: dados.plano === 'pro_nf' ? 50 : 0,
      notas_emitidas_mes: 0,
      emissao_fiscal_ativa: dados.plano === 'pro_nf',
      certificado_a1_status: 'PENDENTE'
    };

    setLeadsSaaS(prev => [novoLead, ...prev]);
    setTenantsSaaS(prev => [novoTenant, ...prev]);
    // ISOLAMENTO MULTI-TENANT:
    // O novo cliente tem sua própria ótica isolada, não herdando o template 'loja-matriz' ou lojas de outras contas
    setLojas([novaLoja]);
    setFuncionarios([novoAdmin]);
    setLojaAtivaId(novaLojaId);
    setUsuarioAtual(novoAdmin);

    localStorage.setItem('opticsys_lojas', JSON.stringify([novaLoja]));
    localStorage.setItem('opticsys_funcionarios', JSON.stringify([novoAdmin]));
    localStorage.setItem('opticsys_active_loja_id', novaLojaId);

    return novaLojaId;
  };

  // Adicionar Filial / Unidade para a mesma conta multi-lojas
  const adicionarFilial = (dados: {
    nome_fantasia: string;
    razao_social?: string;
    cnpj?: string;
    telefone: string;
    email: string;
    cidade?: string;
    uf?: string;
    endereco?: string;
  }): Loja => {
    const novaLoja: Loja = {
      id: `loja-filial-${Date.now()}`,
      nome_fantasia: dados.nome_fantasia,
      razao_social: dados.razao_social || dados.nome_fantasia,
      cnpj: dados.cnpj || 'Não informado',
      telefone: dados.telefone,
      email: dados.email,
      endereco: dados.endereco || 'Endereço a preencher',
      cidade: dados.cidade || 'Não informada',
      uf: dados.uf || 'BR',
      plano: lojaAtiva.plano || 'pro',
      status: lojaAtiva.status || 'trial',
      trial_ate: lojaAtiva.trial_ate,
      config_impressao: { ...lojaAtiva.config_impressao }
    };

    setLojas(prev => [...prev, novaLoja]);
    return novaLoja;
  };

  // Remover Unidade / Filial
  const removerLoja = (lojaId: string) => {
    if (lojas.length <= 1) {
      alert('Não é possível remover a única loja ativa da conta.');
      return;
    }
    const atualizadas = lojas.filter(l => l.id !== lojaId);
    setLojas(atualizadas);
    localStorage.setItem('opticsys_lojas', JSON.stringify(atualizadas));
    if (lojaAtivaId === lojaId) {
      setLojaAtivaId(atualizadas[0].id);
      localStorage.setItem('opticsys_active_loja_id', atualizadas[0].id);
    }
  };

  const adicionarCliente = (clienteData: Omit<Cliente, 'id' | 'loja_id' | 'created_at'>): Cliente => {
    const novoCliente: Cliente = {
      ...clienteData,
      id: `cli-${Date.now()}`,
      loja_id: lojaAtiva.id,
      created_at: new Date().toISOString()
    };
    setClientes(prev => [novoCliente, ...prev]);
    return novoCliente;
  };

  const atualizarCliente = (id: string, dados: Partial<Cliente>) => {
    setClientes(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, ...dados };
      }
      return c;
    }));
  };

  const adicionarReceita = (receitaData: Omit<ReceitaOptica, 'id' | 'loja_id' | 'created_at'>): ReceitaOptica => {
    const novaReceita: ReceitaOptica = {
      ...receitaData,
      id: `rec-${Date.now()}`,
      loja_id: lojaAtiva.id,
      created_at: new Date().toISOString()
    };
    setReceitas(prev => [novaReceita, ...prev]);
    return novaReceita;
  };

  const criarOrdemServico = (osData: Omit<OrdemServicoOptica, 'id' | 'loja_id' | 'numero_os' | 'created_at'>): OrdemServicoOptica => {
    const proximoNumero = ordensServico.length > 0 
      ? Math.max(...ordensServico.map(o => o.numero_os)) + 1 
      : 1001;

    const novaOS: OrdemServicoOptica = {
      ...osData,
      id: `os-${Date.now()}`,
      loja_id: lojaAtiva.id,
      numero_os: proximoNumero,
      created_at: new Date().toISOString()
    };

    setOrdensServico(prev => [novaOS, ...prev]);
    return novaOS;
  };

  const atualizarStatusOS = (osId: string, novoStatus: StatusOSOptica, montadorNome?: string) => {
    setOrdensServico(prev => prev.map(os => {
      if (os.id === osId) {
        return {
          ...os,
          status: novoStatus,
          montador_nome: montadorNome || os.montador_nome,
          data_entrega_efetiva: novoStatus === 'ENTREGUE' ? new Date().toISOString() : os.data_entrega_efetiva
        };
      }
      return os;
    }));
  };

  const adicionarProduto = (prodData: Omit<Produto, 'id' | 'loja_id'>): Produto => {
    const novoProduto: Produto = {
      ...prodData,
      id: `prod-${Date.now()}`,
      loja_id: lojaAtiva.id
    };
    setProdutos(prev => [novoProduto, ...prev]);
    return novoProduto;
  };

  const adicionarLaboratorio = (labData: Omit<Laboratorio, 'id' | 'loja_id' | 'total_pedidos_ativos'>): Laboratorio => {
    const novoLab: Laboratorio = {
      ...labData,
      id: `lab-${Date.now()}`,
      loja_id: lojaAtiva.id,
      total_pedidos_ativos: 0
    };
    setLaboratorios(prev => [novoLab, ...prev]);
    return novoLab;
  };

  const realizarVendaPDV = (vendaData: Omit<VendaPDV, 'id' | 'loja_id' | 'numero_venda' | 'data_venda'>): VendaPDV => {
    const proximaVenda = vendas.length > 0 
      ? Math.max(...vendas.map(v => v.numero_venda)) + 1 
      : 500;

    const novaVenda: VendaPDV = {
      ...vendaData,
      id: `venda-${Date.now()}`,
      loja_id: lojaAtiva.id,
      numero_venda: proximaVenda,
      data_venda: new Date().toISOString()
    };

    setVendas(prev => [novaVenda, ...prev]);

    // Baixa automática de estoque dos produtos vendidos
    setProdutos(prev => prev.map(p => {
      const itemVendido = novaVenda.itens.find(i => i.produto_id === p.id);
      if (itemVendido) {
        return { 
          ...p, 
          estoque_atual: Math.max(0, p.estoque_atual - itemVendido.quantidade) 
        };
      }
      return p;
    }));

    // Lançamento automático no Fluxo de Caixa / Financeiro
    const novaTra: TransacaoFinanceira = {
      id: `tra-${Date.now()}`,
      loja_id: lojaAtiva.id,
      tipo: 'RECEITA',
      categoria: 'Vendas de Balcão (PDV)',
      descricao: `Venda PDV #${proximaVenda} - ${vendaData.cliente_nome}`,
      valor: vendaData.valor_final,
      status: 'PAGO',
      data_vencimento: new Date().toISOString().split('T')[0],
      data_pagamento: new Date().toISOString().split('T')[0],
      cliente_ou_fornecedor: vendaData.cliente_nome,
      forma_pagamento: vendaData.forma_pagamento
    };
    setTransacoes(prev => [novaTra, ...prev]);

    return novaVenda;
  };

  const adicionarFuncionario = (funcData: Omit<Funcionario, 'id' | 'loja_id'>): Funcionario => {
    const novoFunc: Funcionario = {
      ...funcData,
      id: `func-${Date.now()}`,
      loja_id: lojaAtiva.id
    };
    setFuncionarios(prev => [...prev, novoFunc]);
    return novoFunc;
  };

  const atualizarFuncionario = (id: string, dados: Partial<Funcionario>) => {
    setFuncionarios(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, ...dados };
      }
      return f;
    }));
  };

  const toggleFuncionarioAtivo = (id: string) => {
    setFuncionarios(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, ativo: !f.ativo };
      }
      return f;
    }));
  };

  const adicionarTransacao = (traData: Omit<TransacaoFinanceira, 'id' | 'loja_id'>) => {
    const novaTra: TransacaoFinanceira = {
      ...traData,
      id: `tra-${Date.now()}`,
      loja_id: lojaAtiva.id
    };
    setTransacoes(prev => [novaTra, ...prev]);
  };

  return (
    <AuthAndTenantContext.Provider value={{
      lojas,
      lojaAtiva,
      setLojaAtiva,
      funcionarios,
      usuarioAtual,
      setUsuarioAtual,
      clientes: clientes.filter(c => c.loja_id === lojaAtiva.id),
      receitas: receitas.filter(r => r.loja_id === lojaAtiva.id),
      ordensServico: ordensServico.filter(o => o.loja_id === lojaAtiva.id),
      produtos: produtos.filter(p => p.loja_id === lojaAtiva.id),
      laboratorios: laboratorios.filter(l => l.loja_id === lojaAtiva.id),
      vendas: vendas.filter(v => v.loja_id === lojaAtiva.id),
      transacoes: transacoes.filter(t => t.loja_id === lojaAtiva.id),
      leadsSaaS,
      tenantsSaaS,
      adicionarLeadSaaS,
      atualizarStatusLead,
      atualizarTenantStatus,
      prorrogarTrialTenant,
      adicionarCotaNotasTenant,
      resetarCotaNotasTenant,
      toggleEmissaoFiscalTenant,
      cadastrarNovaOtica,
      adicionarFilial,
      removerLoja,
      adicionarCliente,
      atualizarCliente,
      adicionarReceita,
      criarOrdemServico,
      atualizarStatusOS,
      adicionarProduto,
      adicionarLaboratorio,
      adicionarFuncionario,
      atualizarFuncionario,
      toggleFuncionarioAtivo,
      realizarVendaPDV,
      adicionarTransacao,
      limparTodosOsDadosLocais,
      isDark,
      toggleDarkMode
    }}>
      {children}
    </AuthAndTenantContext.Provider>
  );
};

export const useAuthAndTenant = () => {
  const context = useContext(AuthAndTenantContext);
  if (!context) {
    throw new Error('useAuthAndTenant must be used within an AuthAndTenantProvider');
  }
  return context;
};
