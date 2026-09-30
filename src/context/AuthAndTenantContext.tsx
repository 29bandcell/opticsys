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
  StatusLead,
  TurnoCaixa,
  MovimentacaoCaixa,
  RefacaoOS,
  TrocaDevolucaoItem,
  InteracaoCRMLead,
  MedicoPrescritor,
  AgendamentoConsulta
} from '../types';
import { evolutionService } from '../services/evolutionApi';
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

// Marcação de versão sem apagar cadastros do usuário
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('opticsys_system_version')) {
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

  // Turnos e Operação de Caixa
  turnosCaixa: TurnoCaixa[];
  turnoCaixaAtivo: TurnoCaixa | null;
  abrirTurnoCaixa: (valorAbertura: number) => TurnoCaixa;
  fecharTurnoCaixa: (dados: {
    dinheiroInformado: number;
    pixInformado: number;
    cartaoDebitoInformado: number;
    cartaoCreditoInformado: number;
    observacoes?: string;
  }) => TurnoCaixa;
  realizarSangria: (valor: number, descricao: string) => void;
  realizarSuprimento: (valor: number, descricao: string) => void;

  // Refações e Retrabalhos de Laboratório
  refacoesOS: RefacaoOS[];
  adicionarRefacaoOS: (refacao: Omit<RefacaoOS, 'id' | 'loja_id' | 'data_solicitacao' | 'status'>) => RefacaoOS;
  atualizarStatusRefacao: (id: string, status: RefacaoOS['status']) => void;

  // Trocas e Vale-Crédito
  trocasDevolucoes: TrocaDevolucaoItem[];
  registrarTrocaDevolucao: (troca: Omit<TrocaDevolucaoItem, 'id' | 'loja_id' | 'data_solicitacao' | 'status' | 'codigo_vale'>) => TrocaDevolucaoItem;
  utilizarValeCredito: (codigoVale: string) => TrocaDevolucaoItem | null;

  // Importação e Exportação de Dados
  importarClientesEmLote: (clientesNovos: Omit<Cliente, 'id' | 'loja_id' | 'created_at'>[]) => number;
  importarProdutosEmLote: (produtosNovos: Omit<Produto, 'id' | 'loja_id'>[]) => number;
  exportarBackupCompleto: () => string;

  // SaaS Master / CRM Wipelis Leads & Tenants
  leadsSaaS: LeadSaaS[];
  tenantsSaaS: TenantSaaS[];
  adicionarLeadSaaS: (lead: Omit<LeadSaaS, 'id' | 'data_cadastro' | 'trial_dias_restantes'>) => void;
  atualizarStatusLead: (leadId: string, status: StatusLead, obs?: string) => void;
  adicionarInteracaoLead: (leadId: string, interacao: Omit<InteracaoCRMLead, 'id' | 'data'>) => void;
  atualizarLeadCRM: (leadId: string, dados: Partial<LeadSaaS>) => void;
  atualizarTenantStatus: (tenantId: string, status: 'ATIVO' | 'TRIAL' | 'ATRASADO' | 'BLOQUEADO' | 'CANCELADO') => void;
  atualizarTenantSaaS: (tenantId: string, dados: Partial<TenantSaaS>) => void;
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
    senha?: string;
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
  removerFuncionario: (id: string) => void;
  toggleFuncionarioAtivo: (id: string) => void;
  realizarVendaPDV: (vendaData: Omit<VendaPDV, 'id' | 'loja_id' | 'numero_venda' | 'data_venda'>) => VendaPDV;
  adicionarTransacao: (tra: Omit<TransacaoFinanceira, 'id' | 'loja_id'>) => void;
  limparTodosOsDadosLocais: () => void;

  // Médicos e Optometristas Prescritores
  medicos: MedicoPrescritor[];
  adicionarMedico: (medico: Omit<MedicoPrescritor, 'id' | 'loja_id'>) => MedicoPrescritor;
  atualizarMedico: (id: string, dados: Partial<MedicoPrescritor>) => void;
  removerMedico: (id: string) => void;

  // Agendamentos de Consultas & Gabinete do Optometrista
  agendamentos: AgendamentoConsulta[];
  adicionarAgendamento: (ag: Omit<AgendamentoConsulta, 'id' | 'loja_id' | 'created_at'>, autoNotificarWhatsApp?: boolean) => Promise<AgendamentoConsulta>;
  atualizarStatusAgendamento: (id: string, status: AgendamentoConsulta['status'], extras?: Partial<AgendamentoConsulta>) => void;
  removerAgendamento: (id: string) => void;
  notificarMedicoWhatsApp: (agendamentoId: string) => Promise<{ success: boolean; message: string }>;
  
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
    return sessionStorage.getItem('opticsys_active_loja_id') || localStorage.getItem('opticsys_active_loja_id') || INITIAL_LOJAS[0].id;
  });

  const lojaAtiva = lojas.find(l => l.id === lojaAtivaId) || lojas[0];

  // Funcionários
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(() => {
    const saved = localStorage.getItem('opticsys_funcionarios');
    return saved ? JSON.parse(saved) : INITIAL_FUNCIONARIOS;
  });

  const [usuarioAtual, setUsuarioAtual] = useState<Funcionario>(() => {
    const savedUserId = sessionStorage.getItem('opticsys_logged_user_id');
    if (savedUserId) {
      const found = funcionarios.find(f => f.id === savedUserId);
      if (found) return found;
    }
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

  // Operação de Caixa (Turnos, Sangrias, Suprimentos)
  const [turnosCaixa, setTurnosCaixa] = useState<TurnoCaixa[]>(() => {
    const saved = localStorage.getItem('opticsys_turnos_caixa');
    return saved ? JSON.parse(saved) : [];
  });

  // Refações e Retrabalhos de Laboratório
  const [refacoesOS, setRefacoesOS] = useState<RefacaoOS[]>(() => {
    const saved = localStorage.getItem('opticsys_refacoes_os');
    return saved ? JSON.parse(saved) : [];
  });

  // Trocas e Vale-Crédito
  const [trocasDevolucoes, setTrocasDevolucoes] = useState<TrocaDevolucaoItem[]>(() => {
    const saved = localStorage.getItem('opticsys_trocas_devolucoes');
    return saved ? JSON.parse(saved) : [];
  });

  // Médicos e Optometristas Prescritores
  const [medicos, setMedicos] = useState<MedicoPrescritor[]>(() => {
    const saved = localStorage.getItem('opticsys_medicos');
    return saved ? JSON.parse(saved) : [];
  });

  // Agendamentos de Consultas & Gabinete do Optometrista
  const [agendamentos, setAgendamentos] = useState<AgendamentoConsulta[]>(() => {
    const saved = localStorage.getItem('opticsys_agenda');
    return saved ? JSON.parse(saved) : [];
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('opticsys_dark') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('opticsys_lojas', JSON.stringify(lojas));
  }, [lojas]);

  useEffect(() => {
    localStorage.setItem('opticsys_active_loja_id', lojaAtivaId);
    sessionStorage.setItem('opticsys_active_loja_id', lojaAtivaId);
    if (usuarioAtual && usuarioAtual.loja_id !== lojaAtivaId) {
      const userDaLoja = funcionarios.find(f => f.loja_id === lojaAtivaId) || funcionarios[0];
      setUsuarioAtual(userDaLoja);
    }
  }, [lojaAtivaId]);

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

  useEffect(() => {
    localStorage.setItem('opticsys_turnos_caixa', JSON.stringify(turnosCaixa));
  }, [turnosCaixa]);

  useEffect(() => {
    localStorage.setItem('opticsys_refacoes_os', JSON.stringify(refacoesOS));
  }, [refacoesOS]);

  useEffect(() => {
    localStorage.setItem('opticsys_trocas_devolucoes', JSON.stringify(trocasDevolucoes));
  }, [trocasDevolucoes]);

  useEffect(() => {
    localStorage.setItem('opticsys_medicos', JSON.stringify(medicos));
  }, [medicos]);

  useEffect(() => {
    localStorage.setItem('opticsys_agenda', JSON.stringify(agendamentos));
  }, [agendamentos]);

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

  // Auto-limpeza do Administrador Master de demonstração quando a loja possui admin próprio cadastrado
  useEffect(() => {
    const temOutroAdmin = funcionarios.some(f => f.loja_id === lojaAtivaId && f.cargo === 'ADMIN' && f.id !== 'func-admin-01');
    const temMaster = funcionarios.some(f => f.id === 'func-admin-01');
    if (temOutroAdmin && temMaster) {
      const limpos = funcionarios.filter(f => f.id !== 'func-admin-01');
      setFuncionarios(limpos);
      localStorage.setItem('opticsys_funcionarios', JSON.stringify(limpos));
    }
  }, [funcionarios, lojaAtivaId]);

  useEffect(() => {
    if (usuarioAtual) {
      sessionStorage.setItem('opticsys_logged_user_id', usuarioAtual.id);
    }
  }, [usuarioAtual]);

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
    localStorage.removeItem('opticsys_turnos_caixa');
    localStorage.removeItem('opticsys_refacoes_os');
    localStorage.removeItem('opticsys_trocas_devolucoes');
    localStorage.removeItem('opticsys_medicos');
    localStorage.removeItem('opticsys_agenda');
    setClientes([]);
    setReceitas([]);
    setOrdensServico([]);
    setProdutos([]);
    setLaboratorios([]);
    setVendas([]);
    setTransacoes([]);
    setLeadsSaaS([]);
    setTenantsSaaS([]);
    setTurnosCaixa([]);
    setRefacoesOS([]);
    setTrocasDevolucoes([]);
    setMedicos([]);
    setAgendamentos([]);
  };

  // Turno de Caixa Ativo da Loja
  const turnoCaixaAtivo = turnosCaixa.find(t => t.loja_id === lojaAtiva.id && t.status === 'ABERTO') || null;

  const abrirTurnoCaixa = (valorAbertura: number): TurnoCaixa => {
    if (turnoCaixaAtivo) {
      return turnoCaixaAtivo;
    }
    const novoTurno: TurnoCaixa = {
      id: `turno-${Date.now()}`,
      loja_id: lojaAtiva.id,
      operador_id: usuarioAtual.id,
      operador_nome: usuarioAtual.nome,
      data_abertura: new Date().toISOString(),
      status: 'ABERTO',
      valor_abertura: valorAbertura,
      total_dinheiro_sistema: valorAbertura,
      total_pix_sistema: 0,
      total_cartao_debito_sistema: 0,
      total_cartao_credito_sistema: 0,
      total_crediario_sistema: 0,
      total_sangrias: 0,
      total_suprimentos: 0,
      movimentacoes: [
        {
          id: `mov-${Date.now()}`,
          loja_id: lojaAtiva.id,
          tipo: 'SUPRIMENTO',
          valor: valorAbertura,
          forma_pagamento: 'DINHEIRO',
          descricao: 'Fundo de troco / Abertura de caixa',
          operador_nome: usuarioAtual.nome,
          data_hora: new Date().toISOString()
        }
      ]
    };
    setTurnosCaixa(prev => [novoTurno, ...prev]);
    return novoTurno;
  };

  const fecharTurnoCaixa = (dados: {
    dinheiroInformado: number;
    pixInformado: number;
    cartaoDebitoInformado: number;
    cartaoCreditoInformado: number;
    observacoes?: string;
  }): TurnoCaixa => {
    if (!turnoCaixaAtivo) {
      throw new Error('Não há caixa aberto no momento.');
    }
    const totalSistema = turnoCaixaAtivo.total_dinheiro_sistema + 
      turnoCaixaAtivo.total_pix_sistema + 
      turnoCaixaAtivo.total_cartao_debito_sistema + 
      turnoCaixaAtivo.total_cartao_credito_sistema;
    
    const totalInformado = dados.dinheiroInformado + dados.pixInformado + dados.cartaoDebitoInformado + dados.cartaoCreditoInformado;
    const diferencaApurada = totalInformado - totalSistema;

    const turnoAtualizado: TurnoCaixa = {
      ...turnoCaixaAtivo,
      status: 'FECHADO',
      data_fechamento: new Date().toISOString(),
      dinheiro_informado: dados.dinheiroInformado,
      pix_informado: dados.pixInformado,
      cartao_debito_informado: dados.cartaoDebitoInformado,
      cartao_credito_informado: dados.cartaoCreditoInformado,
      diferenca_apurada: diferencaApurada,
      observacoes_fechamento: dados.observacoes
    };

    setTurnosCaixa(prev => prev.map(t => t.id === turnoCaixaAtivo.id ? turnoAtualizado : t));
    return turnoAtualizado;
  };

  const realizarSangria = (valor: number, descricao: string) => {
    if (!turnoCaixaAtivo) {
      alert('É necessário ter um caixa aberto para realizar sangria.');
      return;
    }
    const novaMov: MovimentacaoCaixa = {
      id: `mov-${Date.now()}`,
      loja_id: lojaAtiva.id,
      tipo: 'SANGRIA',
      valor,
      forma_pagamento: 'DINHEIRO',
      descricao: descricao || 'Retirada / Sangria de Caixa',
      operador_nome: usuarioAtual.nome,
      data_hora: new Date().toISOString()
    };

    setTurnosCaixa(prev => prev.map(t => {
      if (t.id === turnoCaixaAtivo.id) {
        return {
          ...t,
          total_dinheiro_sistema: Math.max(0, t.total_dinheiro_sistema - valor),
          total_sangrias: t.total_sangrias + valor,
          movimentacoes: [novaMov, ...t.movimentacoes]
        };
      }
      return t;
    }));

    // Registra despesa / transferência no financeiro
    adicionarTransacao({
      tipo: 'DESPESA',
      categoria: 'Sangria de Caixa',
      descricao: `Sangria Caixa (${usuarioAtual.nome}): ${descricao}`,
      valor: valor,
      status: 'PAGO',
      data_vencimento: new Date().toISOString().split('T')[0],
      data_pagamento: new Date().toISOString().split('T')[0],
      forma_pagamento: 'DINHEIRO'
    });
  };

  const realizarSuprimento = (valor: number, descricao: string) => {
    if (!turnoCaixaAtivo) {
      alert('É necessário ter um caixa aberto para realizar suprimento.');
      return;
    }
    const novaMov: MovimentacaoCaixa = {
      id: `mov-${Date.now()}`,
      loja_id: lojaAtiva.id,
      tipo: 'SUPRIMENTO',
      valor,
      forma_pagamento: 'DINHEIRO',
      descricao: descricao || 'Aporte / Suprimento de Caixa',
      operador_nome: usuarioAtual.nome,
      data_hora: new Date().toISOString()
    };

    setTurnosCaixa(prev => prev.map(t => {
      if (t.id === turnoCaixaAtivo.id) {
        return {
          ...t,
          total_dinheiro_sistema: t.total_dinheiro_sistema + valor,
          total_suprimentos: t.total_suprimentos + valor,
          movimentacoes: [novaMov, ...t.movimentacoes]
        };
      }
      return t;
    }));

    adicionarTransacao({
      tipo: 'RECEITA',
      categoria: 'Suprimento de Caixa',
      descricao: `Suprimento Caixa (${usuarioAtual.nome}): ${descricao}`,
      valor: valor,
      status: 'PAGO',
      data_vencimento: new Date().toISOString().split('T')[0],
      data_pagamento: new Date().toISOString().split('T')[0],
      forma_pagamento: 'DINHEIRO'
    });
  };

  // Refações de O.S.
  const adicionarRefacaoOS = (refacaoData: Omit<RefacaoOS, 'id' | 'loja_id' | 'data_solicitacao' | 'status'>): RefacaoOS => {
    const novaRefacao: RefacaoOS = {
      ...refacaoData,
      id: `ref-${Date.now()}`,
      loja_id: lojaAtiva.id,
      data_solicitacao: new Date().toISOString(),
      status: 'PENDENTE_ENVIO'
    };
    setRefacoesOS(prev => [novaRefacao, ...prev]);

    // Opcionalmente atualiza status da O.S. para AGUARDANDO_LABORATORIO
    if (refacaoData.os_id) {
      atualizarStatusOS(refacaoData.os_id, 'AGUARDANDO_LABORATORIO');
    }
    return novaRefacao;
  };

  const atualizarStatusRefacao = (id: string, status: RefacaoOS['status']) => {
    setRefacoesOS(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  // Trocas & Devoluções (Vale-Crédito)
  const registrarTrocaDevolucao = (trocaData: Omit<TrocaDevolucaoItem, 'id' | 'loja_id' | 'data_solicitacao' | 'status' | 'codigo_vale'>): TrocaDevolucaoItem => {
    const codigoVale = `VALE-${Math.floor(100000 + Math.random() * 900000)}`;
    const novaTroca: TrocaDevolucaoItem = {
      ...trocaData,
      id: `troca-${Date.now()}`,
      loja_id: lojaAtiva.id,
      data_solicitacao: new Date().toISOString(),
      status: 'VALE_EMITIDO',
      codigo_vale: codigoVale
    };
    setTrocasDevolucoes(prev => [novaTroca, ...prev]);

    // Retorna produto ao estoque se solicitado
    if (trocaData.retornar_ao_estoque && trocaData.produto_devolvido_id) {
      setProdutos(prev => prev.map(p => {
        if (p.id === trocaData.produto_devolvido_id) {
          return { ...p, estoque_atual: p.estoque_atual + trocaData.quantidade };
        }
        return p;
      }));
    }

    return novaTroca;
  };

  const utilizarValeCredito = (codigoVale: string): TrocaDevolucaoItem | null => {
    const limpo = codigoVale.trim().toUpperCase();
    const vale = trocasDevolucoes.find(t => t.loja_id === lojaAtiva.id && t.codigo_vale === limpo && t.status === 'VALE_EMITIDO');
    if (!vale) return null;

    setTrocasDevolucoes(prev => prev.map(t => t.id === vale.id ? { ...t, status: 'UTILIZADO' } : t));
    return vale;
  };

  // Importação e Exportação em Lote
  const importarClientesEmLote = (novos: Omit<Cliente, 'id' | 'loja_id' | 'created_at'>[]): number => {
    const formatados: Cliente[] = novos.map(c => ({
      ...c,
      id: `cli-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      loja_id: lojaAtiva.id,
      created_at: new Date().toISOString()
    }));
    setClientes(prev => [...formatados, ...prev]);
    return formatados.length;
  };

  const importarProdutosEmLote = (novos: Omit<Produto, 'id' | 'loja_id'>[]): number => {
    const formatados: Produto[] = novos.map(p => ({
      ...p,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      loja_id: lojaAtiva.id
    }));
    setProdutos(prev => [...formatados, ...prev]);
    return formatados.length;
  };

  const exportarBackupCompleto = (): string => {
    const payload = {
      exportado_em: new Date().toISOString(),
      versao_sistema: OPTICSYS_SYSTEM_VERSION,
      loja: lojaAtiva,
      funcionarios: funcionarios.filter(f => f.loja_id === lojaAtiva.id),
      clientes: clientes.filter(c => c.loja_id === lojaAtiva.id),
      receitas: receitas.filter(r => r.loja_id === lojaAtiva.id),
      ordens_servico: ordensServico.filter(o => o.loja_id === lojaAtiva.id),
      produtos: produtos.filter(p => p.loja_id === lojaAtiva.id),
      laboratorios: laboratorios.filter(l => l.loja_id === lojaAtiva.id),
      vendas: vendas.filter(v => v.loja_id === lojaAtiva.id),
      transacoes: transacoes.filter(t => t.loja_id === lojaAtiva.id),
      turnos_caixa: turnosCaixa.filter(tc => tc.loja_id === lojaAtiva.id),
      refacoes_os: refacoesOS.filter(r => r.loja_id === lojaAtiva.id),
      trocas_devolucoes: trocasDevolucoes.filter(td => td.loja_id === lojaAtiva.id)
    };
    return JSON.stringify(payload, null, 2);
  };

  // CRM SaaS Wipelis
  const adicionarLeadSaaS = (leadData: Omit<LeadSaaS, 'id' | 'data_cadastro' | 'trial_dias_restantes'>) => {
    const novoLead: LeadSaaS = {
      ...leadData,
      id: `lead-${Date.now()}`,
      data_cadastro: new Date().toISOString(),
      trial_dias_restantes: 7,
      historico_interacoes: []
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

  const adicionarInteracaoLead = (leadId: string, interacao: Omit<InteracaoCRMLead, 'id' | 'data'>) => {
    const novaInteracao: InteracaoCRMLead = {
      ...interacao,
      id: `int-${Date.now()}`,
      data: new Date().toISOString()
    };
    setLeadsSaaS(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          historico_interacoes: [novaInteracao, ...(l.historico_interacoes || [])],
          ultimo_contato: new Date().toISOString()
        };
      }
      return l;
    }));
  };

  const atualizarLeadCRM = (leadId: string, dados: Partial<LeadSaaS>) => {
    setLeadsSaaS(prev => prev.map(l => l.id === leadId ? { ...l, ...dados } : l));
  };

  const atualizarTenantStatus = (tenantId: string, status: 'ATIVO' | 'TRIAL' | 'ATRASADO' | 'BLOQUEADO' | 'CANCELADO') => {
    setTenantsSaaS(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, status };
      }
      return t;
    }));
  };

  const atualizarTenantSaaS = (tenantId: string, dados: Partial<TenantSaaS>) => {
    setTenantsSaaS(prev => prev.map(t => t.id === tenantId ? { ...t, ...dados } : t));
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
    senha?: string;
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
      telefone: dados.telefone,
      cargo: 'ADMIN',
      senha: dados.senha || 'admin123',
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
      observacoes: 'Novo cadastro de teste de 7 dias via Onboarding OpticSys.',
      historico_interacoes: []
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

    setLeadsSaaS(prev => [novoLead, ...prev.filter(l => l.email !== dados.email)]);
    setTenantsSaaS(prev => [novoTenant, ...prev.filter(t => t.responsavel_email !== dados.email)]);
    
    // Define a nova ótica como ativa imediatamente
    setLojas(prev => [novaLoja, ...prev.filter(l => l.id !== novaLojaId && l.email !== dados.email)]);
    setFuncionarios(prev => [novoAdmin, ...prev.filter(f => f.id !== novoAdmin.id && f.email !== dados.email)]);
    setLojaAtivaId(novaLojaId);
    setUsuarioAtual(novoAdmin);

    try {
      const savedLojasRaw = localStorage.getItem('opticsys_lojas');
      const savedLojas: Loja[] = savedLojasRaw ? JSON.parse(savedLojasRaw) : INITIAL_LOJAS;
      localStorage.setItem('opticsys_lojas', JSON.stringify([novaLoja, ...savedLojas.filter(l => l.id !== novaLojaId && l.email !== dados.email)]));

      const savedFuncsRaw = localStorage.getItem('opticsys_funcionarios');
      const savedFuncs: Funcionario[] = savedFuncsRaw ? JSON.parse(savedFuncsRaw) : INITIAL_FUNCIONARIOS;
      localStorage.setItem('opticsys_funcionarios', JSON.stringify([novoAdmin, ...savedFuncs.filter(f => f.id !== novoAdmin.id && f.email !== dados.email)]));

      localStorage.setItem('opticsys_active_loja_id', novaLojaId);
      sessionStorage.setItem('opticsys_is_authenticated', 'true');
      sessionStorage.setItem('opticsys_logged_user_id', novoAdmin.id);
      sessionStorage.setItem('opticsys_active_loja_id', novaLojaId);
    } catch (e) {
      console.warn('Persistência local storage:', e);
    }

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

    // Se o caixa estiver aberto, atualiza valores no turno ativo
    if (turnoCaixaAtivo) {
      const movVenda: MovimentacaoCaixa = {
        id: `mov-${Date.now()}`,
        loja_id: lojaAtiva.id,
        tipo: 'VENDA',
        valor: vendaData.valor_final,
        forma_pagamento: vendaData.forma_pagamento as any,
        descricao: `Venda PDV #${proximaVenda}`,
        operador_nome: usuarioAtual.nome,
        data_hora: new Date().toISOString()
      };

      setTurnosCaixa(prev => prev.map(t => {
        if (t.id === turnoCaixaAtivo.id) {
          const din = vendaData.forma_pagamento === 'DINHEIRO' ? t.total_dinheiro_sistema + vendaData.valor_final : t.total_dinheiro_sistema;
          const pix = vendaData.forma_pagamento === 'PIX' ? t.total_pix_sistema + vendaData.valor_final : t.total_pix_sistema;
          const deb = vendaData.forma_pagamento === 'CARTAO_DEBITO' ? t.total_cartao_debito_sistema + vendaData.valor_final : t.total_cartao_debito_sistema;
          const cred = vendaData.forma_pagamento === 'CARTAO_CREDITO' ? t.total_cartao_credito_sistema + vendaData.valor_final : t.total_cartao_credito_sistema;
          const crediario = vendaData.forma_pagamento === 'CREDIARIO_PROPRIO' ? t.total_crediario_sistema + vendaData.valor_final : t.total_crediario_sistema;
          
          return {
            ...t,
            total_dinheiro_sistema: din,
            total_pix_sistema: pix,
            total_cartao_debito_sistema: deb,
            total_cartao_credito_sistema: cred,
            total_crediario_sistema: crediario,
            movimentacoes: [movVenda, ...t.movimentacoes]
          };
        }
        return t;
      }));
    }

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
    setFuncionarios(prev => {
      const atualizados = prev.map(f => {
        if (f.id === id) {
          return { ...f, ...dados };
        }
        return f;
      });
      localStorage.setItem('opticsys_funcionarios', JSON.stringify(atualizados));
      return atualizados;
    });

    if (usuarioAtual?.id === id) {
      setUsuarioAtual(prev => ({ ...prev, ...dados }));
    }
  };

  const toggleFuncionarioAtivo = (id: string) => {
    setFuncionarios(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, ativo: !f.ativo };
      }
      return f;
    }));
  };

  const removerFuncionario = (id: string) => {
    const restantes = funcionarios.filter(f => f.id !== id);
    setFuncionarios(restantes);
    localStorage.setItem('opticsys_funcionarios', JSON.stringify(restantes));
    if (usuarioAtual?.id === id && restantes.length > 0) {
      setUsuarioAtual(restantes[0]);
    }
  };

  const adicionarTransacao = (traData: Omit<TransacaoFinanceira, 'id' | 'loja_id'>) => {
    const novaTra: TransacaoFinanceira = {
      ...traData,
      id: `tra-${Date.now()}`,
      loja_id: lojaAtiva.id
    };
    setTransacoes(prev => [novaTra, ...prev]);
  };

  // Médicos e Optometristas Prescritores
  const adicionarMedico = (dados: Omit<MedicoPrescritor, 'id' | 'loja_id'>): MedicoPrescritor => {
    const novo: MedicoPrescritor = {
      ...dados,
      id: `med-${Date.now()}`,
      loja_id: lojaAtiva.id
    };
    setMedicos(prev => [novo, ...prev]);
    return novo;
  };

  const atualizarMedico = (id: string, dados: Partial<MedicoPrescritor>) => {
    setMedicos(prev => prev.map(m => m.id === id ? { ...m, ...dados } : m));
  };

  const removerMedico = (id: string) => {
    setMedicos(prev => prev.filter(m => m.id !== id));
  };

  // Notificação via WhatsApp do Médico com Ficha Completa do Paciente
  const notificarMedicoWhatsApp = async (agendamentoId: string): Promise<{ success: boolean; message: string }> => {
    const ag = agendamentos.find(a => a.id === agendamentoId);
    if (!ag) return { success: false, message: 'Agendamento não encontrado.' };

    // Identificar telefone do médico ou optometrista
    let telMedico = '';
    let nomeMedico = ag.profissional;

    if (ag.profissional_id) {
      const medEncontrado = medicos.find(m => m.id === ag.profissional_id);
      if (medEncontrado) {
        telMedico = medEncontrado.telefone;
        nomeMedico = medEncontrado.nome;
      } else {
        const funcEncontrado = funcionarios.find(f => f.id === ag.profissional_id);
        if (funcEncontrado) {
          telMedico = funcEncontrado.telefone || '';
          nomeMedico = funcEncontrado.nome;
        }
      }
    }

    if (!telMedico) {
      // Tenta achar por nome nos médicos cadastrados
      const medPorNome = medicos.find(m => ag.profissional.toLowerCase().includes(m.nome.toLowerCase()) || m.nome.toLowerCase().includes(ag.profissional.toLowerCase()));
      if (medPorNome) {
        telMedico = medPorNome.telefone;
      } else {
        const funcPorNome = funcionarios.find(f => ag.profissional.toLowerCase().includes(f.nome.toLowerCase()) || f.nome.toLowerCase().includes(ag.profissional.toLowerCase()));
        if (funcPorNome) {
          telMedico = funcPorNome.telefone || '';
        }
      }
    }

    // Buscar histórico e dados completos do paciente
    const paciente = ag.cliente_id ? clientes.find(c => c.id === ag.cliente_id) : null;
    const receitasPaciente = paciente ? receitas.filter(r => r.cliente_id === paciente.id) : [];
    const ultimaReceita = receitasPaciente.length > 0 ? receitasPaciente[0] : null;

    let historicoGrau = 'Primeira consulta na loja (Sem histórico cadastrado).';
    if (ultimaReceita) {
      const od = `OD: Esf ${ultimaReceita.od_longe.esferico > 0 ? '+' : ''}${ultimaReceita.od_longe.esferico.toFixed(2)} Cil ${ultimaReceita.od_longe.cilindrico.toFixed(2)} Eixo ${ultimaReceita.od_longe.eixo}°`;
      const oe = `OE: Esf ${ultimaReceita.oe_longe.esferico > 0 ? '+' : ''}${ultimaReceita.oe_longe.esferico.toFixed(2)} Cil ${ultimaReceita.oe_longe.cilindrico.toFixed(2)} Eixo ${ultimaReceita.oe_longe.eixo}°`;
      const ad = ultimaReceita.adicao ? ` Ad: +${ultimaReceita.adicao.toFixed(2)}` : '';
      historicoGrau = `Último exame em ${new Date(ultimaReceita.data_emissao).toLocaleDateString('pt-BR')} (${od} | ${oe}${ad})`;
    }

    const dataFormatada = ag.data ? new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR') : ag.data;

    const textoNotificacao = 
      `🩺 *OpticSys • Ficha de Agendamento Clínico*\n\n` +
      `Olá, *${nomeMedico}*! Há um novo agendamento marcado para seu atendimento na *${lojaAtiva.nome_fantasia}*:\n\n` +
      `👤 *Paciente:* ${ag.paciente_nome}\n` +
      `📱 *WhatsApp Paciente:* ${ag.telefone || 'Não informado'}\n` +
      `🎂 *Nascimento / Idade:* ${paciente?.data_nascimento || ag.data_nascimento || 'Não informada'}\n` +
      `🏠 *Cidade / Bairro:* ${paciente?.cidade ? `${paciente.cidade} - ${paciente.uf || 'CE'}` : 'Morada Nova - CE'}\n` +
      `📅 *Data & Horário:* ${dataFormatada} às ${ag.horario}\n` +
      `🔬 *Tipo de Exame:* ${ag.tipo}\n` +
      `📝 *Queixa / Motivo:* ${ag.observacoes || 'Exame de vista / refração de rotina.'}\n` +
      `👓 *Histórico Anterior:* ${historicoGrau}\n\n` +
      `📋 *Ficha pronta no seu Gabinete OpticSys.* Tenha um excelente atendimento!`;

    const instanceLoja = lojaAtiva.nome_fantasia.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'opticsys_matriz';

    let enviado = false;
    if (telMedico && telMedico.replace(/\D/g, '').length >= 10) {
      try {
        enviado = await evolutionService.enviarMensagemTexto(instanceLoja, telMedico, textoNotificacao);
      } catch (e) {
        console.warn('Erro ao disparar WhatsApp do médico via Evolution API:', e);
      }
    }

    if (!enviado && telMedico) {
      const fone = telMedico.replace(/\D/g, '');
      const encoded = encodeURIComponent(textoNotificacao);
      window.open(`https://wa.me/55${fone}?text=${encoded}`, '_blank');
      enviado = true;
    }

    // Atualiza status de notificado
    setAgendamentos(prev => prev.map(a => a.id === agendamentoId ? {
      ...a,
      notificado_medico: true,
      data_notificacao_medico: new Date().toISOString()
    } : a));

    return { 
      success: true, 
      message: telMedico ? `Ficha enviada com sucesso para o WhatsApp do Dr(a) (${telMedico})!` : `Agendamento registrado. Telefone do médico não informado para disparo automático.` 
    };
  };

  const adicionarAgendamento = async (
    agData: Omit<AgendamentoConsulta, 'id' | 'loja_id' | 'created_at'>,
    autoNotificarWhatsApp = true
  ): Promise<AgendamentoConsulta> => {
    const novo: AgendamentoConsulta = {
      ...agData,
      id: `ag-${Date.now()}`,
      loja_id: lojaAtiva.id,
      status: agData.status || 'CONFIRMADO',
      created_at: new Date().toISOString()
    };

    setAgendamentos(prev => [novo, ...prev]);

    if (autoNotificarWhatsApp) {
      setTimeout(() => {
        notificarMedicoWhatsApp(novo.id);
      }, 300);
    }

    return novo;
  };

  const atualizarStatusAgendamento = (id: string, status: AgendamentoConsulta['status'], extras?: Partial<AgendamentoConsulta>) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status, ...(extras || {}) } : a));
  };

  const removerAgendamento = (id: string) => {
    setAgendamentos(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AuthAndTenantContext.Provider value={{
      lojas,
      lojaAtiva,
      setLojaAtiva,
      funcionarios: funcionarios.filter(f => f.loja_id === lojaAtiva.id),
      usuarioAtual,
      setUsuarioAtual,
      clientes: clientes.filter(c => c.loja_id === lojaAtiva.id),
      receitas: receitas.filter(r => r.loja_id === lojaAtiva.id),
      ordensServico: ordensServico.filter(o => o.loja_id === lojaAtiva.id),
      produtos: produtos.filter(p => p.loja_id === lojaAtiva.id),
      laboratorios: laboratorios.filter(l => l.loja_id === lojaAtiva.id),
      vendas: vendas.filter(v => v.loja_id === lojaAtiva.id),
      transacoes: transacoes.filter(t => t.loja_id === lojaAtiva.id),
      turnosCaixa: turnosCaixa.filter(t => t.loja_id === lojaAtiva.id),
      turnoCaixaAtivo,
      abrirTurnoCaixa,
      fecharTurnoCaixa,
      realizarSangria,
      realizarSuprimento,
      refacoesOS: refacoesOS.filter(r => r.loja_id === lojaAtiva.id),
      adicionarRefacaoOS,
      atualizarStatusRefacao,
      trocasDevolucoes: trocasDevolucoes.filter(td => td.loja_id === lojaAtiva.id),
      registrarTrocaDevolucao,
      utilizarValeCredito,
      importarClientesEmLote,
      importarProdutosEmLote,
      exportarBackupCompleto,
      leadsSaaS,
      tenantsSaaS,
      adicionarLeadSaaS,
      atualizarStatusLead,
      adicionarInteracaoLead,
      atualizarLeadCRM,
      atualizarTenantStatus,
      atualizarTenantSaaS,
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
      removerFuncionario,
      toggleFuncionarioAtivo,
      realizarVendaPDV,
      adicionarTransacao,
      limparTodosOsDadosLocais,
      medicos: medicos.filter(m => m.loja_id === lojaAtiva.id),
      adicionarMedico,
      atualizarMedico,
      removerMedico,
      agendamentos: agendamentos.filter(a => a.loja_id === lojaAtiva.id),
      adicionarAgendamento,
      atualizarStatusAgendamento,
      removerAgendamento,
      notificarMedicoWhatsApp,
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

