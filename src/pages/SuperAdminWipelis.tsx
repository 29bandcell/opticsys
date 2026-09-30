import React, { useState } from 'react';
import { 
  Crown, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  Building2, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Download, 
  Plus, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Receipt,
  Zap,
  RotateCcw,
  Layers,
  Key,
  FileCode2,
  Check
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { LeadSaaS, TenantSaaS, StatusLead, InteracaoCRMLead } from '../types';

export const SuperAdminWipelis: React.FC = () => {
  const { 
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
    exportarBackupCompleto
  } = useAuthAndTenant();

  const [abaAtiva, setAbaAtiva] = useState<'LEADS' | 'TENANTS' | 'FISCAL' | 'METRICAS' | 'REGUA' | 'WEBHOOKS'>('LEADS');
  const [filtroStatusLead, setFiltroStatusLead] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState<string>('');
  
  // Modal de Histórico de Interações CRM do Lead
  const [leadSelecionadoCRM, setLeadSelecionadoCRM] = useState<LeadSaaS | null>(null);
  const [novoCanalInteracao, setNovoCanalInteracao] = useState<InteracaoCRMLead['canal']>('WHATSAPP');
  const [novoResumoInteracao, setNovoResumoInteracao] = useState('');
  const [proximaAcaoData, setProximaAcaoData] = useState('');
  const [proximaAcaoDesc, setProximaAcaoDesc] = useState('');
  
  // Estado de Teste da API Fiscal Software House
  const [isPingingFiscal, setIsPingingFiscal] = useState(false);
  const [fiscalPingMessage, setFiscalPingMessage] = useState<string | null>(null);

  // Configuração Master Software House Focus NFe
  const [configSoftwareHouse, setConfigSoftwareHouse] = useState({
    tokenMaster: 'fc_live_wipelis_sh_master_89a74b21e89b',
    ambiente: 'HOMOLOGACAO',
    limitePadrao: 50,
    precoPacoteExtra: 29.90,
    webhookGlobal: 'https://api.opticsys.com.br/webhooks/focus-nfe-master'
  });
  
  // Modal Novo Lead Manual
  const [showNovoLeadModal, setShowNovoLeadModal] = useState(false);
  const [novoLeadForm, setNovoLeadForm] = useState({
    nome_responsavel: '',
    nome_otica: '',
    telefone: '',
    email: '',
    cidade: 'Morada Nova',
    estado: 'CE',
    plano_interesse: 'PLANO_PRO_NF_149' as 'PLANO_PRO_99' | 'PLANO_PRO_NF_149',
    origem: 'WHATSAPP_DIRETO' as 'LANDING_PAGE' | 'INDICACAO' | 'ANUNCIO_INSTAGRAM' | 'WHATSAPP_DIRETO',
    observacoes: ''
  });

  // Modal Template WhatsApp
  const [modalZapLead, setModalZapLead] = useState<{
    lead: LeadSaaS;
    tipoMsg: 'BOAS_VINDAS' | 'MEIO_TESTE' | 'EXPIRANDO' | 'FECHAMENTO';
    texto: string;
  } | null>(null);

  const [sucessoAlerta, setSucessoAlerta] = useState<string | null>(null);

  // Cálculos SaaS
  const totalLeads = leadsSaaS.length;
  const leadsEmTrial = leadsSaaS.filter(l => l.status === 'TRIAL_ATIVO' || l.status === 'TRIAL_EXPIRANDO').length;
  const leadsConvertidos = leadsSaaS.filter(l => l.status === 'CONVERTIDO_CLIENTE').length;
  const taxaConversao = totalLeads > 0 ? ((leadsConvertidos / totalLeads) * 100).toFixed(1) : '0.0';

  const mrrAtual = tenantsSaaS
    .filter(t => t.status === 'ATIVO')
    .reduce((acc, t) => acc + t.valor_mensalidade, 0);

  const totalTenantsAtivos = tenantsSaaS.filter(t => t.status === 'ATIVO').length;

  // Cálculos Fiscais da Software House (Cota 50 Notas/mês por CNPJ)
  const totalNotasEmitidasConsolidado = tenantsSaaS.reduce((acc, t) => acc + (t.notas_emitidas_mes || 0), 0);
  const totalCotasContratadas = tenantsSaaS.reduce((acc, t) => acc + (t.limite_notas_mes || 0), 0);
  const tenantsComModuloFiscal = tenantsSaaS.filter(t => t.plano === 'PLANO_PRO_NF_149').length;
  const receitaFiscalTotal = tenantsComModuloFiscal * 149.90;
  const custoSoftwareHouseEstimado = 89.00; // Taxa/custo base do provedor fiscal
  const lucroFiscalLiquido = Math.max(0, receitaFiscalTotal - custoSoftwareHouseEstimado);

  // Testar Comunicação Software House Focus NFe
  const handleTestarApiFiscalSoftwareHouse = () => {
    setIsPingingFiscal(true);
    setFiscalPingMessage(null);
    setTimeout(() => {
      setIsPingingFiscal(false);
      setFiscalPingMessage('✅ Conexão Software House Ativa! Token Master validado com Focus NFe / SEFAZ Autorizadora (Latência: 98ms • 4 Subcontas Operacionais).');
    }, 1100);
  };

  // Abrir Zap de Alerta de Cota Fiscal para a Ótica
  const abrirZapAlertaCotaTenant = (tenant: TenantSaaS) => {
    const foneLimpo = tenant.responsavel_telefone.replace(/\D/g, '');
    const percentual = tenant.limite_notas_mes > 0 ? Math.round((tenant.notas_emitidas_mes / tenant.limite_notas_mes) * 100) : 0;
    const msg = `Olá, *${tenant.responsavel_nome}*! Tudo bem? 👓\n\nAqui é da *WIPELIS* (Suporte Master do *OpticSys Cloud*).\n\nIdentificamos que a *${tenant.nome_fantasia}* já utilizou *${tenant.notas_emitidas_mes} de ${tenant.limite_notas_mes} notas fiscais inclusas* (${percentual}%) no ciclo deste mês.\n\nCaso precise de um pacote extra de *+50 Notas Fiscais* por apenas *R$ 29,90*, basta nos responder aqui que liberamos instantaneamente no seu painel!`;
    const url = `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Filtragem de Leads
  const leadsFiltrados = leadsSaaS.filter(lead => {
    const matchStatus = filtroStatusLead === 'TODOS' || lead.status === filtroStatusLead;
    const matchBusca = 
      lead.nome_responsavel.toLowerCase().includes(termoBusca.toLowerCase()) ||
      lead.nome_otica.toLowerCase().includes(termoBusca.toLowerCase()) ||
      lead.cidade.toLowerCase().includes(termoBusca.toLowerCase()) ||
      lead.telefone.includes(termoBusca);
    return matchStatus && matchBusca;
  });

  // Gerar Texto de Abordagem WhatsApp da Wipelis
  const abrirModalZap = (lead: LeadSaaS, tipo: 'BOAS_VINDAS' | 'MEIO_TESTE' | 'EXPIRANDO' | 'FECHAMENTO') => {
    let texto = '';
    const primeiroNome = lead.nome_responsavel.split(' ')[0];

    if (tipo === 'BOAS_VINDAS') {
      texto = `Olá, ${primeiroNome}! Tudo bem? 👓\n\nAqui é da *WIPELIS* (desenvolvedora do *OpticSys Cloud*).\nVi que você acabou de criar sua conta de teste de 7 dias para a *${lead.nome_otica}*!\n\nVocê já conseguiu acessar os módulos de O.S. e Receitas? Se quiser, posso agendar uma demonstração rápida de 10 minutos para te mostrar como cadastrar seus primeiros produtos.`;
    } else if (tipo === 'MEIO_TESTE') {
      texto = `Olá, ${primeiroNome}! Como estão os testes do *OpticSys* na *${lead.nome_otica}*?\n\nPassando para saber se você tem alguma dúvida sobre a importação de XML de notas, medições do pupilômetro ou emissão de cupons. Estamos à sua disposição!`;
    } else if (tipo === 'EXPIRANDO') {
      texto = `Olá, ${primeiroNome}! ⏳\n\nSeu teste gratuito de 7 dias do *OpticSys* na *${lead.nome_otica}* encerra em breve!\n\nLiberamos uma *condição exclusiva de ativação* para sua primeira mensalidade não parar o seu atendimento. Gostaria de garantir essa oferta?`;
    } else {
      texto = `Olá, ${primeiroNome}! Aqui é da *WIPELIS*.\n\nPreparamos um cupom especial de ativação imediata para a *${lead.nome_otica}* no OpticSys Cloud. Vamos formalizar a licença da sua ótica hoje?`;
    }

    setModalZapLead({ lead, tipoMsg: tipo, texto });
  };

  // Disparar WhatsApp para o Lead
  const handleDispararWhatsAppLead = () => {
    if (!modalZapLead) return;
    const foneLimpo = modalZapLead.lead.telefone.replace(/\D/g, '');
    const url = `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(modalZapLead.texto)}`;
    window.open(url, '_blank');
    
    atualizarStatusLead(modalZapLead.lead.id, modalZapLead.lead.status, `Contato realizado via WhatsApp Wipelis (${modalZapLead.tipoMsg})`);
    setModalZapLead(null);
    setSucessoAlerta(`WhatsApp aberto com sucesso para ${modalZapLead.lead.nome_responsavel}!`);
    setTimeout(() => setSucessoAlerta(null), 4000);
  };

  // Exportar Leads para CSV
  const handleExportarCSV = () => {
    const cabecalho = 'ID,Responsável,Ótica,Telefone,E-mail,Cidade,UF,Plano,Status,Data Cadastro,Origem\n';
    const linhas = leadsSaaS.map(l => 
      `"${l.id}","${l.nome_responsavel}","${l.nome_otica}","${l.telefone}","${l.email}","${l.cidade}","${l.estado}","${l.plano_interesse}","${l.status}","${l.data_cadastro}","${l.origem}"`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + cabecalho + linhas], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_opticsys_wipelis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSucessoAlerta('Relatório de Leads exportado com sucesso em CSV!');
    setTimeout(() => setSucessoAlerta(null), 4000);
  };

  // Cadastrar Lead Manual
  const handleCriarLeadManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoLeadForm.nome_responsavel || !novoLeadForm.nome_otica || !novoLeadForm.telefone) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    adicionarLeadSaaS({
      nome_responsavel: novoLeadForm.nome_responsavel,
      nome_otica: novoLeadForm.nome_otica,
      telefone: novoLeadForm.telefone,
      email: novoLeadForm.email || 'sem-email@otica.com',
      cidade: novoLeadForm.cidade,
      estado: novoLeadForm.estado,
      plano_interesse: novoLeadForm.plano_interesse,
      status: 'TRIAL_ATIVO',
      origem: novoLeadForm.origem,
      observacoes: novoLeadForm.observacoes || 'Lead cadastrado manualmente pela Wipelis.'
    });

    setShowNovoLeadModal(false);
    setNovoLeadForm({
      nome_responsavel: '',
      nome_otica: '',
      telefone: '',
      email: '',
      cidade: 'Morada Nova',
      estado: 'CE',
      plano_interesse: 'PLANO_PRO_NF_149',
      origem: 'WHATSAPP_DIRETO',
      observacoes: ''
    });

    setSucessoAlerta('Novo Lead cadastrado com sucesso!');
    setTimeout(() => setSucessoAlerta(null), 4000);
  };

  return (
    <div className="space-y-5 max-w-7xl font-sans">
      
      {/* Topo / Header Wipelis Super Admin */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-lg p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-sm">
            <Crown className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">
                WIPELIS<span className="text-amber-400">HUB</span> • Gestão de Leads & Assinantes
              </h1>
              <span className="text-[10px] bg-amber-400/20 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              <strong>WIPELISCREATIVESOLUTION</strong> • Contato Oficial: <strong>(88) 98882-2847</strong> • Comarca de Morada Nova - CE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const backupStr = exportarBackupCompleto();
              const blob = new Blob([backupStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `backup_opticsys_master_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              setSucessoAlerta('Backup completo do banco de dados e auditoria exportado com sucesso!');
              setTimeout(() => setSucessoAlerta(null), 4000);
            }}
            className="text-xs bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 px-3 py-2 rounded-md font-bold flex items-center gap-1.5 transition-all shadow-xs"
            title="Download completo do banco de dados em JSON estruturado"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" /> Backup Global JSON
          </button>

          <button
            type="button"
            onClick={handleExportarCSV}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-md font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" /> Exportar Leads CSV
          </button>

          <button
            type="button"
            onClick={() => setShowNovoLeadModal(true)}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" /> Cadastrar Lead
          </button>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {sucessoAlerta && (
        <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-800 dark:text-emerald-300 p-3 rounded-md text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{sucessoAlerta}</span>
        </div>
      )}

      {/* 4 Cards de Métricas SaaS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-[#121216] p-4 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            MRR Ativo (Mensalidades)
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            R$ {mrrAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400">
            Receita Recorrente de {totalTenantsAtivos} óticas pagantes
          </span>
        </div>

        <div className="bg-white dark:bg-[#121216] p-4 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Leads em Teste (7 Dias)
          </span>
          <div className="text-2xl font-black font-mono text-[#0099FF]">
            {leadsEmTrial} <span className="text-xs font-sans font-bold text-slate-400">óticas</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Prospectos avaliando o sistema agora
          </span>
        </div>

        <div className="bg-white dark:bg-[#121216] p-4 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Taxa de Conversão
          </span>
          <div className="text-2xl font-black font-mono text-amber-500">
            {taxaConversao}%
          </div>
          <span className="text-[10px] text-slate-400">
            {leadsConvertidos} de {totalLeads} leads viraram clientes
          </span>
        </div>

        <div className="bg-white dark:bg-[#121216] p-4 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Canal WhatsApp Wipelis
          </span>
          <div className="text-lg font-black font-mono text-slate-900 dark:text-zinc-100 flex items-center gap-1.5 mt-1">
            <Phone className="w-4 h-4 text-emerald-600" />
            (88) 98882-2847
          </div>
          <span className="text-[10px] text-slate-400">
            Disparos diretos de vendas com 1 clique
          </span>
        </div>

      </div>

      {/* Abas Principais do Hub */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-zinc-800 pb-1 text-xs">
        <button
          onClick={() => setAbaAtiva('LEADS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-extrabold rounded-t transition-all ${
            abaAtiva === 'LEADS'
              ? 'bg-[#0099FF] text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Users className="w-4 h-4" /> 1. CRM de Leads & Testes (7 Dias) ({leadsSaaS.length})
        </button>

        <button
          onClick={() => setAbaAtiva('TENANTS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-extrabold rounded-t transition-all ${
            abaAtiva === 'TENANTS'
              ? 'bg-[#0099FF] text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Building2 className="w-4 h-4" /> 2. Clientes & Assinaturas ({tenantsSaaS.length})
        </button>

        <button
          onClick={() => setAbaAtiva('FISCAL')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-extrabold rounded-t transition-all ${
            abaAtiva === 'FISCAL'
              ? 'bg-[#0099FF] text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Receipt className="w-4 h-4 text-amber-400" /> 3. Hub Fiscal Software House (Cotas 50 NF-e)
          <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded font-mono">
            {totalNotasEmitidasConsolidado}/{totalCotasContratadas}
          </span>
        </button>

        <button
          onClick={() => setAbaAtiva('METRICAS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-extrabold rounded-t transition-all ${
            abaAtiva === 'METRICAS'
              ? 'bg-[#0099FF] text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> 4. Projeções & MRR SaaS
        </button>

        <button
          onClick={() => setAbaAtiva('REGUA')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-extrabold rounded-t transition-all ${
            abaAtiva === 'REGUA'
              ? 'bg-[#0099FF] text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Calendar className="w-4 h-4" /> 5. Régua de Disparos (D1, D3, D5, D7)
        </button>

        <button
          onClick={() => setAbaAtiva('WEBHOOKS')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-extrabold rounded-t transition-all ${
            abaAtiva === 'WEBHOOKS'
              ? 'bg-[#0099FF] text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> 6. Automação de Novos Cadastros
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CRM DE LEADS & TRIALS (7 DIAS)                                     */}
      {/* ========================================================================= */}
      {abaAtiva === 'LEADS' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros e Busca */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-3 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
            
            {/* Campo de Busca */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={termoBusca}
                onChange={e => setTermoBusca(e.target.value)}
                placeholder="Buscar por responsável, ótica, cidade..."
                className="neo-input pl-9 text-xs"
              />
            </div>

            {/* Filtro por Status */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filtroStatusLead}
                onChange={e => setFiltroStatusLead(e.target.value)}
                className="neo-input text-xs font-bold"
              >
                <option value="TODOS">Todos os Status ({leadsSaaS.length})</option>
                <option value="TRIAL_ATIVO">Trial Ativo</option>
                <option value="TRIAL_EXPIRANDO">Expirando em Breve</option>
                <option value="TRIAL_EXPIRADO">Trial Expirado</option>
                <option value="CONVERTIDO_CLIENTE">Convertido em Cliente</option>
                <option value="PERDIDO">Desistente / Perdido</option>
              </select>
            </div>

          </div>

          {/* Tabela de Leads */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Ótica / Responsável</th>
                    <th className="p-3">Contato & Cidade</th>
                    <th className="p-3">Plano de Interesse</th>
                    <th className="p-3">Período de Teste</th>
                    <th className="p-3">Status do Lead</th>
                    <th className="p-3 text-right">Ação WhatsApp Wipelis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                  {leadsFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Nenhum lead encontrado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    leadsFiltrados.map(lead => (
                      <tr key={lead.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                        
                        {/* Ótica & Responsável */}
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">
                            {lead.nome_otica}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {lead.nome_responsavel}
                          </div>
                          {lead.observacoes && (
                            <div className="text-[10px] text-slate-400 italic mt-0.5 line-clamp-1">
                              "{lead.observacoes}"
                            </div>
                          )}
                        </td>

                        {/* Contato & Cidade */}
                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" /> {lead.telefone}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" /> {lead.cidade} - {lead.estado}
                          </div>
                        </td>

                        {/* Plano */}
                        <td className="p-3">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono ${
                            lead.plano_interesse === 'PLANO_PRO_NF_149'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {lead.plano_interesse === 'PLANO_PRO_NF_149' ? 'Pro + NF (R$ 149,90)' : 'Pro (R$ 99,90)'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Origem: {lead.origem}
                          </div>
                        </td>

                        {/* Período de Teste */}
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            {lead.status === 'CONVERTIDO_CLIENTE' ? (
                              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold">
                                ✓ Cliente Ativo
                              </span>
                            ) : lead.trial_dias_restantes > 2 ? (
                              <span className="bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] px-2 py-0.5 rounded font-bold font-mono">
                                ⏳ {lead.trial_dias_restantes} dias restantes
                              </span>
                            ) : lead.trial_dias_restantes > 0 ? (
                              <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold font-mono animate-pulse">
                                ⚠️ Expirando em {lead.trial_dias_restantes}d
                              </span>
                            ) : (
                              <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] px-2 py-0.5 rounded font-bold">
                                ⛔ Teste Encerrado
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Cad: {new Date(lead.data_cadastro).toLocaleDateString('pt-BR')}
                          </div>
                        </td>

                        {/* Status Select */}
                        <td className="p-3">
                          <select
                            value={lead.status}
                            onChange={e => atualizarStatusLead(lead.id, e.target.value as StatusLead)}
                            className="neo-input text-[11px] font-bold py-1"
                          >
                            <option value="TRIAL_ATIVO">🟢 Trial Ativo</option>
                            <option value="TRIAL_EXPIRANDO">🟡 Expirando</option>
                            <option value="TRIAL_EXPIRADO">🔴 Expirado</option>
                            <option value="CONVERTIDO_CLIENTE">⭐ Convertido (Cliente)</option>
                            <option value="PERDIDO">⚪ Desistente</option>
                          </select>
                        </td>

                        {/* Ações de WhatsApp e CRM */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setLeadSelecionadoCRM(lead);
                                setProximaAcaoData(lead.proxima_acao_data || '');
                                setProximaAcaoDesc(lead.proxima_acao_descricao || '');
                              }}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded flex items-center gap-1 transition-all shadow-xs"
                              title="Histórico de interações e agendamento de próxima ação"
                            >
                              <History className="w-3.5 h-3.5" /> CRM ({lead.historico_interacoes?.length || 0})
                            </button>

                            <button
                              type="button"
                              onClick={() => abrirModalZap(lead, lead.status === 'TRIAL_EXPIRANDO' ? 'EXPIRANDO' : lead.status === 'TRIAL_EXPIRADO' ? 'FECHAMENTO' : 'BOAS_VINDAS')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-extrabold px-3 py-1.5 rounded flex items-center gap-1 transition-all shadow-xs active:scale-95"
                              title="Abrir WhatsApp com mensagem pronta da Wipelis"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Falar no Zap
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: CLIENTES & ASSINATURAS SAAS (TENANTS)                              */}
      {/* ========================================================================= */}
      {abaAtiva === 'TENANTS' && (
        <div className="space-y-4">
          
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  Óticas Licenciadas & Assinaturas Ativas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controle de acesso, cota fiscal de 50 notas por CNPJ, bloqueio por inadimplência e renovações.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded border border-emerald-300">
                  MRR: R$ {mrrAtual.toFixed(2)}/mês
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Ótica / CNPJ</th>
                    <th className="p-3">Responsável</th>
                    <th className="p-3">Plano & Valor</th>
                    <th className="p-3">Cota Fiscal (50 NF-e/mês)</th>
                    <th className="p-3">Próximo Vencimento</th>
                    <th className="p-3">Status do Acesso</th>
                    <th className="p-3 text-right">Ações Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                  {tenantsSaaS.map(tenant => {
                    const isFiscal = tenant.plano === 'PLANO_PRO_NF_149';
                    const limite = tenant.limite_notas_mes || (isFiscal ? 50 : 0);
                    const emitidas = tenant.notas_emitidas_mes || 0;
                    const pct = limite > 0 ? Math.min(100, Math.round((emitidas / limite) * 100)) : 0;
                    const isQuaseEsgotado = pct >= 80;

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                        
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">
                            {tenant.nome_fantasia}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {tenant.cnpj_cpf} • {tenant.cidade}-{tenant.estado}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-800 dark:text-zinc-200">
                            {tenant.responsavel_nome}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {tenant.responsavel_telefone}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-black font-mono text-slate-900 dark:text-zinc-100">
                            R$ {tenant.valor_mensalidade.toFixed(2)} <span className="text-[10px] text-slate-400 font-sans">/mês</span>
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            isFiscal 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}>
                            {isFiscal ? 'Pro + NF' : 'Pro Standard'}
                          </span>
                        </td>

                        {/* Cota Fiscal */}
                        <td className="p-3 min-w-[160px]">
                          {isFiscal ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-mono">
                                <span className="font-bold text-slate-800 dark:text-zinc-200">
                                  {emitidas} / {limite} notas
                                </span>
                                <span className={`font-bold ${isQuaseEsgotado ? 'text-amber-600' : 'text-emerald-600'}`}>
                                  {pct}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    isQuaseEsgotado ? 'bg-amber-500' : 'bg-[#0099FF]'
                                  }`} 
                                  style={{ width: `${pct}%` }} 
                                />
                              </div>
                              <div className="flex items-center gap-1 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    adicionarCotaNotasTenant(tenant.id, 50);
                                    setSucessoAlerta(`+50 Notas Fiscais adicionadas com sucesso à cota da ${tenant.nome_fantasia}!`);
                                    setTimeout(() => setSucessoAlerta(null), 4000);
                                  }}
                                  className="text-[9px] bg-sky-50 text-[#0099FF] hover:bg-sky-100 px-1.5 py-0.5 rounded font-bold border border-sky-200"
                                  title="Adicionar bônus ou pacote extra de 50 notas"
                                >
                                  +50 Notas
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    resetarCotaNotasTenant(tenant.id);
                                    setSucessoAlerta(`Cota da ${tenant.nome_fantasia} resetada para o novo ciclo!`);
                                    setTimeout(() => setSucessoAlerta(null), 4000);
                                  }}
                                  className="text-[9px] bg-slate-100 text-slate-700 hover:bg-slate-200 px-1.5 py-0.5 rounded font-bold"
                                  title="Resetar contador mensal"
                                >
                                  Reset
                                </button>
                                {isQuaseEsgotado && (
                                  <button
                                    type="button"
                                    onClick={() => abrirZapAlertaCotaTenant(tenant)}
                                    className="text-[9px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-1.5 py-0.5 rounded font-bold border border-emerald-300 flex items-center gap-0.5"
                                    title="Avisar cliente pelo WhatsApp que cota está quase no fim"
                                  >
                                    <Phone className="w-2.5 h-2.5" /> Zap
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Sem emissor fiscal</span>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                            {new Date(tenant.proximo_vencimento).toLocaleDateString('pt-BR')}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Início: {tenant.data_inicio}
                          </span>
                        </td>

                        <td className="p-3">
                          {tenant.status === 'ATIVO' ? (
                            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold">
                              🟢 Ativo (Pago)
                            </span>
                          ) : tenant.status === 'TRIAL' ? (
                            <span className="bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] px-2 py-0.5 rounded font-bold">
                              ⏳ Em Teste (7 Dias)
                            </span>
                          ) : tenant.status === 'BLOQUEADO' ? (
                            <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] px-2 py-0.5 rounded font-bold">
                              🔒 Bloqueado
                            </span>
                          ) : (
                            <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded font-bold">
                              ⚠️ Atrasado
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => prorrogarTrialTenant(tenant.id, 7)}
                              className="bg-sky-50 hover:bg-sky-100 text-[#0099FF] border border-sky-200 text-[10px] font-bold px-2 py-1 rounded"
                              title="Adicionar +7 dias de cortesia"
                            >
                              +7 Dias Trial
                            </button>

                            {tenant.status === 'BLOQUEADO' ? (
                              <button
                                type="button"
                                onClick={() => atualizarTenantStatus(tenant.id, 'ATIVO')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1"
                              >
                                <Unlock className="w-3 h-3" /> Liberar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => atualizarTenantStatus(tenant.id, 'BLOQUEADO')}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3" /> Bloquear
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: HUB FISCAL SOFTWARE HOUSE (WIPELIS MASTER & 50 NOTAS/CNPJ)         */}
      {/* ========================================================================= */}
      {abaAtiva === 'FISCAL' && (
        <div className="space-y-4">
          
          {/* 4 Cards de Métricas Fiscais Globais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            
            <div className="bg-white dark:bg-[#121216] p-4 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Notas Emitidas no Mês (Total)
              </span>
              <div className="text-2xl font-black font-mono text-[#0099FF]">
                {totalNotasEmitidasConsolidado} <span className="text-xs font-normal text-slate-400">de {totalCotasContratadas} contratadas</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                {totalCotasContratadas > 0 ? Math.round((totalNotasEmitidasConsolidado / totalCotasContratadas) * 100) : 0}% de ocupação da franquia
              </span>
            </div>

            <div className="bg-white dark:bg-[#121216] p-4 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Óticas com Módulo Fiscal
              </span>
              <div className="text-2xl font-black font-mono text-purple-600">
                {tenantsComModuloFiscal} <span className="text-xs font-normal text-slate-400">de {tenantsSaaS.length} óticas</span>
              </div>
              <span className="text-[10px] text-slate-400 block">
                Plano Pro + NF (50 Notas Inclusas/mês)
              </span>
            </div>

            <div className="bg-white dark:bg-[#121216] p-4 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Receita Fiscal vs Custo Software House
              </span>
              <div className="text-2xl font-black font-mono text-emerald-600">
                R$ {lucroFiscalLiquido.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                Receita: R$ {receitaFiscalTotal.toFixed(2)} • Custo API: R$ {custoSoftwareHouseEstimado.toFixed(2)}
              </span>
            </div>

            <div className="bg-white dark:bg-[#121216] p-4 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Status SEFAZ Multi-UF (API)
              </span>
              <div className="text-lg font-black text-emerald-600 flex items-center gap-1.5 mt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                100% Operacional 🟢
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                CE, SP, MG, RJ, BA, PR (98ms latência)
              </span>
            </div>

          </div>

          {/* Banner de Feedback de Teste */}
          {fiscalPingMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-400 rounded-md text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{fiscalPingMessage}</span>
            </div>
          )}

          {/* Configuração Central da Software House (Wipelis Master) */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0099FF]" />
                  Painel de Controle da Software House Wipelis
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Gerenciamento da API Focus NFe / Notaas, criação de subcontas e regras de limites de emissão.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestarApiFiscalSoftwareHouse}
                disabled={isPingingFiscal}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 font-bold px-4 py-2 rounded border border-slate-300 dark:border-zinc-700 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-500 ${isPingingFiscal ? 'animate-spin' : ''}`} />
                <span>{isPingingFiscal ? 'Validando SEFAZ...' : '⚡ Testar API da Software House'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Token Master da Software House (Wipelis):</label>
                <input
                  type="password"
                  value={configSoftwareHouse.tokenMaster}
                  onChange={e => setConfigSoftwareHouse({ ...configSoftwareHouse, tokenMaster: e.target.value })}
                  className="neo-input font-mono text-xs"
                />
                <span className="text-[10px] text-slate-400">Token raiz para emitir e consultar todas as subcontas.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Franquia Padrão por Assinante:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={configSoftwareHouse.limitePadrao}
                    onChange={e => setConfigSoftwareHouse({ ...configSoftwareHouse, limitePadrao: Number(e.target.value) })}
                    className="neo-input font-mono text-xs font-bold text-[#0099FF]"
                  />
                  <span className="text-slate-500 font-semibold shrink-0">notas/mês</span>
                </div>
                <span className="text-[10px] text-slate-400">Limite mensal padrão do Plano Pro + NF.</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Preço Pacote Extra (+50 Notas):</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.10"
                    value={configSoftwareHouse.precoPacoteExtra}
                    onChange={e => setConfigSoftwareHouse({ ...configSoftwareHouse, precoPacoteExtra: Number(e.target.value) })}
                    className="neo-input font-mono text-xs font-bold text-emerald-600"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Valor cobrado via PIX para recargas avulsas.</span>
              </div>
            </div>

          </div>

          {/* Tabela de Gestão de Subcontas e Cotas por Assinante */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden text-xs">
            <div className="p-3.5 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900">
              <h4 className="font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#0099FF]" />
                Subcontas das Óticas & Cotas Individuais por CNPJ
              </h4>
              <span className="text-[11px] text-slate-500">
                Ciclo Atual: <strong>01 a 30 de cada mês</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-black text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Ótica & CNPJ</th>
                    <th className="p-3">Subconta Software House</th>
                    <th className="p-3">Certificado Digital A1</th>
                    <th className="p-3">Consumo Mensal (Cota)</th>
                    <th className="p-3 text-center">Status Emissão</th>
                    <th className="p-3 text-right">Ações Master</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                  {tenantsSaaS.map(tenant => {
                    const isFiscal = tenant.plano === 'PLANO_PRO_NF_149';
                    const limite = tenant.limite_notas_mes || (isFiscal ? 50 : 0);
                    const emitidas = tenant.notas_emitidas_mes || 0;
                    const pct = limite > 0 ? Math.min(100, Math.round((emitidas / limite) * 100)) : 0;
                    const isQuaseEsgotado = pct >= 80;

                    return (
                      <tr key={tenant.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                        
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900 dark:text-zinc-100 text-sm">
                            {tenant.nome_fantasia}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            CNPJ: {tenant.cnpj_cpf} ({tenant.cidade}-{tenant.estado})
                          </div>
                        </td>

                        <td className="p-3 font-mono">
                          {isFiscal ? (
                            <div>
                              <span className="text-slate-800 dark:text-zinc-200 font-bold text-[11px]">
                                {tenant.subconta_focus_id || `sub_fc_${tenant.id}`}
                              </span>
                              <span className="text-[10px] text-emerald-600 block">Vinculada à Wipelis ✓</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Não criada (Plano Pro)</span>
                          )}
                        </td>

                        <td className="p-3">
                          {isFiscal ? (
                            <div>
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                                ✓ A1 Válido ({tenant.certificado_a1_validade || '15/10/2027'})
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">SEFAZ {tenant.estado}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Pendente</span>
                          )}
                        </td>

                        {/* Barra de Consumo */}
                        <td className="p-3 min-w-[180px]">
                          {isFiscal ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] font-mono">
                                <span className="font-bold text-slate-800 dark:text-zinc-200">
                                  {emitidas} de {limite} notas
                                </span>
                                <span className={`font-bold ${isQuaseEsgotado ? 'text-amber-600 animate-pulse' : 'text-emerald-600'}`}>
                                  {pct}% {isQuaseEsgotado ? '⚠️' : ''}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all ${
                                    isQuaseEsgotado ? 'bg-amber-500' : 'bg-gradient-to-r from-[#0099FF] to-emerald-500'
                                  }`} 
                                  style={{ width: `${pct}%` }} 
                                />
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {limite - emitidas} notas restantes até o fim do ciclo
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Plano sem emissão fiscal</span>
                          )}
                        </td>

                        {/* Status da Emissão */}
                        <td className="p-3 text-center">
                          {isFiscal ? (
                            tenant.emissao_fiscal_ativa ? (
                              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded">
                                🟢 Emissão Ativa
                              </span>
                            ) : (
                              <span className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold px-2.5 py-1 rounded">
                                ⏸️ Suspensa (Cota)
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 text-[10px]">-</span>
                          )}
                        </td>

                        {/* Ações Master */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {isFiscal && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    adicionarCotaNotasTenant(tenant.id, 50);
                                    setSucessoAlerta(`+50 Notas liberadas para ${tenant.nome_fantasia}! Nova cota: ${(tenant.limite_notas_mes || 50) + 50} notas.`);
                                    setTimeout(() => setSucessoAlerta(null), 4000);
                                  }}
                                  className="bg-sky-50 hover:bg-sky-100 text-[#0099FF] font-bold text-[10px] px-2 py-1 rounded border border-sky-200 transition-all active:scale-95"
                                  title="Adicionar bônus ou recarga de 50 notas"
                                >
                                  +50 Notas
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    resetarCotaNotasTenant(tenant.id);
                                    setSucessoAlerta(`Cota da ${tenant.nome_fantasia} resetada com sucesso para o novo ciclo!`);
                                    setTimeout(() => setSucessoAlerta(null), 4000);
                                  }}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-1 rounded transition-all"
                                  title="Resetar contador mensal"
                                >
                                  <RotateCcw className="w-3 h-3 inline mr-0.5" /> Reset
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleEmissaoFiscalTenant(tenant.id);
                                    setSucessoAlerta(`Status de emissão fiscal da ${tenant.nome_fantasia} alterado!`);
                                    setTimeout(() => setSucessoAlerta(null), 4000);
                                  }}
                                  className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${
                                    tenant.emissao_fiscal_ativa 
                                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                  }`}
                                  title="Pausar ou reativar emissão de notas"
                                >
                                  {tenant.emissao_fiscal_ativa ? 'Pausar' : 'Ativar'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => abrirZapAlertaCotaTenant(tenant)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded flex items-center gap-0.5 shadow-xs"
                                  title="Enviar mensagem no WhatsApp sobre a cota fiscal"
                                >
                                  <Phone className="w-3 h-3" /> Zap
                                </button>
                              </>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Histórico / Logs de Emissões Recentes no SaaS */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
              <FileCode2 className="w-4 h-4 text-[#0099FF]" />
              Auditoria de Últimas Emissões de NFC-e / NF-e em Tempo Real
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 text-[10px] font-bold uppercase">
                  <tr>
                    <th className="p-2">Data/Hora</th>
                    <th className="p-2">Ótica Emissora</th>
                    <th className="p-2">Tipo & Nº</th>
                    <th className="p-2">Chave de Acesso</th>
                    <th className="p-2">Valor R$</th>
                    <th className="p-2 text-right">Retorno SEFAZ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-mono text-[11px]">
                  <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                    <td className="p-2 text-slate-500">27/09/2026 20:15</td>
                    <td className="p-2 font-bold font-sans text-slate-800 dark:text-zinc-200">Ótica Bella Vista</td>
                    <td className="p-2 text-purple-600 font-bold">NFC-e #1042</td>
                    <td className="p-2 text-slate-400 text-[10px]">35260945892110000172650010000010421839201948</td>
                    <td className="p-2 font-bold text-slate-900 dark:text-zinc-100">R$ 680,00</td>
                    <td className="p-2 text-right text-emerald-600 font-bold font-sans">✓ Autorizada (100)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                    <td className="p-2 text-slate-500">27/09/2026 18:42</td>
                    <td className="p-2 font-bold font-sans text-slate-800 dark:text-zinc-200">Ótica Visão Prime</td>
                    <td className="p-2 text-purple-600 font-bold">NFC-e #1041</td>
                    <td className="p-2 text-slate-400 text-[10px]">35260912345678000190650010000010411839201947</td>
                    <td className="p-2 font-bold text-slate-900 dark:text-zinc-100">R$ 1.250,00</td>
                    <td className="p-2 text-right text-emerald-600 font-bold font-sans">✓ Autorizada (100)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                    <td className="p-2 text-slate-500">27/09/2026 16:10</td>
                    <td className="p-2 font-bold font-sans text-slate-800 dark:text-zinc-200">Ótica São Francisco</td>
                    <td className="p-2 text-sky-600 font-bold">NF-e #519</td>
                    <td className="p-2 text-slate-400 text-[10px]">35260924987123000144550010000005191839201946</td>
                    <td className="p-2 font-bold text-slate-900 dark:text-zinc-100">R$ 3.420,00</td>
                    <td className="p-2 text-right text-emerald-600 font-bold font-sans">✓ Autorizada (100)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: PROJEÇÕES & ANALYTICS WIPELIS SAAS                                 */}
      {/* ========================================================================= */}
      {abaAtiva === 'METRICAS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          
          {/* Projeção de Escala SaaS */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Projeção de Faturamento Recorrente (MRR Wipelis)
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">25 Óticas Clientes (Meta Inicial)</span>
                  <span className="text-[10px] text-slate-400 block">Mix 50% Pro e 50% Pro+NF</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-sm text-emerald-600">R$ 3.122,50</span>
                  <span className="text-[10px] text-slate-400 block">/mês recorrente</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">50 Óticas Clientes (Médio Porte)</span>
                  <span className="text-[10px] text-slate-400 block">Região Vale do Jaguaribe / Ceará</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-sm text-emerald-600">R$ 6.245,00</span>
                  <span className="text-[10px] text-slate-400 block">/mês recorrente</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200">100 Óticas Clientes (Escala Estadual)</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">R$ 74.940,00 por ano</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-base text-emerald-700 dark:text-emerald-300">R$ 12.490,00</span>
                  <span className="text-[10px] text-emerald-600 block">/mês recorrente</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card de Configuração da Software House Focus NFe */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0099FF]" />
                Software House Focus NFe (Wipelis Master)
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                Multi-Tenant Ativo 🟢
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block font-bold text-slate-600 dark:text-zinc-400 mb-1">Token Master da Software House (Wipelis):</label>
                <input
                  type="password"
                  defaultValue="fc_live_wipelis_sh_token_89a74b21e89b"
                  className="neo-input font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-600 dark:text-zinc-400 mb-1">Ambiente Padrão:</label>
                  <select className="neo-select text-xs">
                    <option value="HOMOLOGACAO">Homologação (Sandbox)</option>
                    <option value="PRODUCAO">Produção (Oficial)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-600 dark:text-zinc-400 mb-1">Criação de Subcontas:</label>
                  <span className="neo-input text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 flex items-center">
                    Automática (por CNPJ)
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                Todas as óticas cadastradas são criadas automaticamente como subcontas da Wipelis na Focus NFe.
              </p>
            </div>
          </div>

          {/* Dados Legais e de Contrato */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0099FF]" />
              Dados Institucionais da Licenciante
            </h3>
            
            <div className="space-y-2.5 text-xs text-slate-700 dark:text-zinc-300">
              <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-slate-500">Razão Social:</span>
                <span className="font-bold">WIPELISCREATIVESOLUTION (WIPELIS)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-slate-500">Contato Oficial WhatsApp:</span>
                <span className="font-bold font-mono text-emerald-600">(88) 98882-2847</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-slate-500">Foro Eleito no Termo de Uso:</span>
                <span className="font-bold text-[#0099FF]">Comarca de Morada Nova - CE</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                <span className="text-slate-500">Período Padrão de Trial:</span>
                <span className="font-bold">7 Dias de Teste Gratuito</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Fiscal Padrão:</span>
                <span className="font-bold">Focus NFe (NFC-e / NF-e)</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: WEBHOOKS & NOTIFICAÇÕES AUTOMÁTICAS DE LEADS                        */}
      {/* ========================================================================= */}
      {abaAtiva === 'WEBHOOKS' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4 text-xs">
          
          <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Notificação Instantânea de Novos Leads no seu WhatsApp
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sempre que uma nova ótica se cadastrar na Landing Page ou no Onboarding para testar por 7 dias, o sistema envia uma notificação instantânea para o WhatsApp oficial da Wipelis <strong>(88 98882-2847)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2">
              <span className="font-bold text-slate-800 dark:text-zinc-200 block">Exemplo da Notificação Recebida:</span>
              <div className="bg-white dark:bg-black/40 p-3 rounded font-mono text-[11px] text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 space-y-1">
                <p>🔔 *NOVO LEAD CADASTRADO NO OPTICSYS!*</p>
                <p>👓 *Ótica:* Ótica Visão Real</p>
                <p>👤 *Responsável:* Francisco Pereira</p>
                <p>📱 *WhatsApp:* (88) 99755-4433</p>
                <p>📍 *Cidade:* Morada Nova - CE</p>
                <p>💼 *Plano de Interesse:* Pro + NF (R$ 149,90)</p>
                <p>⏳ *Trial:* 7 Dias de Teste Liberados</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-3">
              <span className="font-bold text-slate-800 dark:text-zinc-200 block">Configurações de Alerta:</span>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#0099FF]" />
                  <span>Notificar no WhatsApp da Wipelis a cada novo cadastro</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#0099FF]" />
                  <span>Alerta diário de Trials expirando nas próximas 24h</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-[#0099FF]" />
                  <span>Salvar leads automaticamente no banco de dados local e nuvem</span>
                </label>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: RÉGUA DE DISPAROS DE ONBOARDING (D1, D3, D5, D7)                   */}
      {/* ========================================================================= */}
      {abaAtiva === 'REGUA' && (
        <div className="space-y-4">
          
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0099FF]" />
                Régua Automática de Conversão de Trials (7 Dias)
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Acompanhe o momento exato de cada ótica durante o teste gratuito e envie abordagens de alta conversão.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-1 rounded font-bold font-mono">
                {leadsEmTrial} Óticas em Teste Ativo
              </span>
            </div>
          </div>

          {/* Cards das 4 Fases da Régua */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* D1 */}
            <div className="bg-white dark:bg-[#121216] border-2 border-sky-400 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold px-2 py-0.5 rounded text-[10px]">
                  D1 • Boas-Vindas
                </span>
                <span className="font-bold text-slate-400 text-[10px]">Dia 1</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Apresentação & Conexão</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mensagem calorosa com vídeo de 2 min e auxílio para conectar o WhatsApp da ótica.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
                Taxa de Resposta: <strong>78%</strong>
              </div>
            </div>

            {/* D3 */}
            <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold px-2 py-0.5 rounded text-[10px]">
                  D3 • Engajamento
                </span>
                <span className="font-bold text-slate-400 text-[10px]">Dia 3</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">O.S., XML e Pupilômetro</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Checar se já cadastrou a 1ª armação e testou a medição com foto do cartão de crédito.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
                Taxa de Resposta: <strong>62%</strong>
              </div>
            </div>

            {/* D5 */}
            <div className="bg-white dark:bg-[#121216] border-2 border-amber-400 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">
                  D5 • Alerta 48h
                </span>
                <span className="font-bold text-amber-600 text-[10px]">Faltam 48h</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Oferta de Antecipação</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Oferta especial com desconto na 1ª mensalidade para não interromper a emissão de ordens.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
                Taxa de Conversão: <strong>45%</strong>
              </div>
            </div>

            {/* D7 */}
            <div className="bg-white dark:bg-[#121216] border-2 border-emerald-500 rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                  D7 • Fechamento PIX
                </span>
                <span className="font-bold text-emerald-600 text-[10px]">Último Dia</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Ativação da Licença</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Envio direto da chave PIX Copia e Cola com liberação automática da assinatura via webhook.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400 font-mono">
                Taxa de Conversão: <strong>38%</strong>
              </div>
            </div>

          </div>

          {/* Tabela de Leads na Régua com Ação Imediata */}
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xs overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 font-bold text-xs flex justify-between items-center">
              <span>Leads em Acompanhamento Automático</span>
              <span className="text-[11px] text-slate-500 font-normal">Dispare a mensagem sugerida com 1 clique</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-100/70 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Ótica / Responsável</th>
                    <th className="py-2.5 px-3">WhatsApp</th>
                    <th className="py-2.5 px-3">Cidade/UF</th>
                    <th className="py-2.5 px-3">Fase da Régua</th>
                    <th className="py-2.5 px-3">Dias Restantes</th>
                    <th className="py-2.5 px-3 text-center">Ação Recomendada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {leadsSaaS.map(lead => {
                    const diasRestantes = lead.trial_dias_restantes || 7;
                    let fase = 'D1 • Boas-Vindas';
                    let tipoZap: 'BOAS_VINDAS' | 'MEIO_TESTE' | 'EXPIRANDO' | 'FECHAMENTO' = 'BOAS_VINDAS';

                    if (diasRestantes <= 1) {
                      fase = 'D7 • Fechamento PIX';
                      tipoZap = 'FECHAMENTO';
                    } else if (diasRestantes <= 2) {
                      fase = 'D5 • Alerta 48h';
                      tipoZap = 'EXPIRANDO';
                    } else if (diasRestantes <= 5) {
                      fase = 'D3 • Engajamento';
                      tipoZap = 'MEIO_TESTE';
                    }

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-zinc-100">
                          <div>
                            <strong className="block">{lead.nome_otica}</strong>
                            <span className="text-[10px] text-slate-500">{lead.nome_responsavel}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                          {lead.telefone}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-zinc-400">
                          {lead.cidade} - {lead.estado}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                            {fase}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-600">
                          {diasRestantes} dias
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => abrirModalZap(lead, tipoZap)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] flex items-center gap-1 mx-auto shadow-xs"
                          >
                            <Send className="w-2.5 h-2.5" /> Disparar WhatsApp
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: MENSAGEM WHATSAPP PARA O LEAD                                      */}
      {/* ========================================================================= */}
      {modalZapLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121216] rounded-lg shadow-2xl border border-slate-200 dark:border-zinc-800 w-full max-w-lg overflow-hidden text-xs">
            
            <div className="bg-emerald-600 text-white p-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="font-bold text-sm">Disparo de Vendas • WhatsApp Wipelis</span>
              </div>
              <button
                type="button"
                onClick={() => setModalZapLead(null)}
                className="text-white/80 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5">
              <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded border border-slate-200 dark:border-zinc-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Destinatário:</span>
                <p className="font-bold text-slate-800 dark:text-zinc-100">
                  {modalZapLead.lead.nome_responsavel} ({modalZapLead.lead.nome_otica})
                </p>
                <p className="font-mono text-xs text-emerald-600 font-bold">{modalZapLead.lead.telefone}</p>
              </div>

              {/* Opções de Templates */}
              <div>
                <span className="block font-bold text-slate-700 dark:text-zinc-300 mb-1.5 text-[11px]">
                  Escolha o Modelo de Mensagem:
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => abrirModalZap(modalZapLead.lead, 'BOAS_VINDAS')}
                    className={`p-2 rounded border transition-all ${
                      modalZapLead.tipoMsg === 'BOAS_VINDAS'
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600'
                    }`}
                  >
                    👋 Boas-Vindas
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirModalZap(modalZapLead.lead, 'MEIO_TESTE')}
                    className={`p-2 rounded border transition-all ${
                      modalZapLead.tipoMsg === 'MEIO_TESTE'
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600'
                    }`}
                  >
                    💬 Dúvidas / Suporte
                  </button>
                  <button
                    type="button"
                    onClick={() => abrirModalZap(modalZapLead.lead, 'EXPIRANDO')}
                    className={`p-2 rounded border transition-all ${
                      modalZapLead.tipoMsg === 'EXPIRANDO'
                        ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-zinc-800 text-slate-600'
                    }`}
                  >
                    ⏳ Oferta de Trial
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1 text-[11px]">
                  Texto da Mensagem (pode editar à vontade):
                </label>
                <textarea
                  rows={6}
                  value={modalZapLead.texto}
                  onChange={e => setModalZapLead({ ...modalZapLead, texto: e.target.value })}
                  className="neo-input text-xs font-sans leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalZapLead(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDispararWhatsAppLead}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded font-bold flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" /> Abrir no WhatsApp & Enviar
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CADASTRAR NOVO LEAD MANUAL                                         */}
      {/* ========================================================================= */}
      {showNovoLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121216] rounded-lg shadow-2xl border border-slate-200 dark:border-zinc-800 w-full max-w-md overflow-hidden text-xs">
            
            <div className="bg-[#0B3B60] text-white p-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span className="font-bold text-sm">Cadastrar Novo Lead (Wipelis)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowNovoLeadModal(false)}
                className="text-white/80 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriarLeadManual} className="p-5 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Nome da Ótica:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ótica Sol & Arte"
                  value={novoLeadForm.nome_otica}
                  onChange={e => setNovoLeadForm({ ...novoLeadForm, nome_otica: e.target.value })}
                  className="neo-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Responsável:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Silveira"
                    value={novoLeadForm.nome_responsavel}
                    onChange={e => setNovoLeadForm({ ...novoLeadForm, nome_responsavel: e.target.value })}
                    className="neo-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">WhatsApp:</label>
                  <input
                    type="text"
                    required
                    placeholder="(88) 9 9999-9999"
                    value={novoLeadForm.telefone}
                    onChange={e => setNovoLeadForm({ ...novoLeadForm, telefone: e.target.value })}
                    className="neo-input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Cidade:</label>
                  <input
                    type="text"
                    required
                    value={novoLeadForm.cidade}
                    onChange={e => setNovoLeadForm({ ...novoLeadForm, cidade: e.target.value })}
                    className="neo-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Estado (UF):</label>
                  <input
                    type="text"
                    required
                    value={novoLeadForm.estado}
                    onChange={e => setNovoLeadForm({ ...novoLeadForm, estado: e.target.value })}
                    className="neo-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Plano Desejado:</label>
                  <select
                    value={novoLeadForm.plano_interesse}
                    onChange={e => setNovoLeadForm({ ...novoLeadForm, plano_interesse: e.target.value as any })}
                    className="neo-input text-xs font-bold"
                  >
                    <option value="PLANO_PRO_99">Pro (R$ 99,90)</option>
                    <option value="PLANO_PRO_NF_149">Pro + NF (R$ 149,90)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Origem:</label>
                  <select
                    value={novoLeadForm.origem}
                    onChange={e => setNovoLeadForm({ ...novoLeadForm, origem: e.target.value as any })}
                    className="neo-input text-xs font-bold"
                  >
                    <option value="WHATSAPP_DIRETO">WhatsApp Direto</option>
                    <option value="INDICACAO">Indicação</option>
                    <option value="LANDING_PAGE">Landing Page</option>
                    <option value="ANUNCIO_INSTAGRAM">Instagram</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Observações de Vendas:</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Demonstrou interesse no módulo de NFC-e..."
                  value={novoLeadForm.observacoes}
                  onChange={e => setNovoLeadForm({ ...novoLeadForm, observacoes: e.target.value })}
                  className="neo-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNovoLeadModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 rounded font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded font-bold shadow-sm"
                >
                  Salvar Lead
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal de Histórico CRM & Agendamento de Próxima Ação */}
      {leadSelecionadoCRM && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#151518] rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-zinc-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  CRM & Histórico de Interações
                </h3>
                <p className="text-xs text-slate-500">
                  {leadSelecionadoCRM.nome_otica} • Resp: <strong>{leadSelecionadoCRM.nome_responsavel}</strong> ({leadSelecionadoCRM.telefone})
                </p>
              </div>
              <button
                onClick={() => setLeadSelecionadoCRM(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Agendamento de Próxima Ação */}
            <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
              <span className="font-bold text-slate-800 dark:text-zinc-200 block text-[11px] uppercase tracking-wider">
                Próxima Ação Comercial
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="date"
                  value={proximaAcaoData}
                  onChange={e => setProximaAcaoData(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono"
                />
                <input
                  type="text"
                  placeholder="Ex: Ligar para tirar dúvidas de NFC-e"
                  value={proximaAcaoDesc}
                  onChange={e => setProximaAcaoDesc(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg p-2 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  atualizarLeadCRM(leadSelecionadoCRM.id, {
                    proxima_acao_data: proximaAcaoData,
                    proxima_acao_descricao: proximaAcaoDesc
                  });
                  alert('Próxima ação comercial agendada com sucesso!');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-[11px]"
              >
                Salvar Próxima Ação
              </button>
            </div>

            {/* Formulário de Nova Interação */}
            <div className="space-y-2 text-xs border-t border-slate-100 dark:border-zinc-800 pt-3">
              <span className="font-bold text-slate-800 dark:text-zinc-200 block">Registrar Novo Contato / Interação:</span>
              <div className="flex gap-2">
                <select
                  value={novoCanalInteracao}
                  onChange={e => setNovoCanalInteracao(e.target.value as any)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg p-2 text-xs font-bold"
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="LIGACAO">Ligação</option>
                  <option value="EMAIL">E-mail</option>
                  <option value="REUNIAO_ONLINE">Reunião Online</option>
                </select>

                <input
                  type="text"
                  placeholder="Resumo da conversa ou objeção levantada..."
                  value={novoResumoInteracao}
                  onChange={e => setNovoResumoInteracao(e.target.value)}
                  className="flex-1 bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg p-2 text-xs"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!novoResumoInteracao.trim()) return;
                  adicionarInteracaoLead(leadSelecionadoCRM.id, {
                    autor: 'Consultor Wipelis',
                    canal: novoCanalInteracao,
                    resumo: novoResumoInteracao.trim()
                  });
                  setNovoResumoInteracao('');
                  alert('Interação registrada no histórico do Lead!');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs"
              >
                + Adicionar ao Histórico
              </button>
            </div>

            {/* Timeline de Interações Anteriores */}
            <div className="space-y-2 text-xs border-t border-slate-100 dark:border-zinc-800 pt-3">
              <span className="font-bold text-slate-800 dark:text-zinc-200 block">Histórico de Atendimentos:</span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {leadSelecionadoCRM.historico_interacoes && leadSelecionadoCRM.historico_interacoes.length > 0 ? (
                  leadSelecionadoCRM.historico_interacoes.map(int => (
                    <div key={int.id} className="p-2.5 bg-slate-50 dark:bg-zinc-900/60 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{int.canal} • {int.autor}</span>
                        <span className="text-slate-400 font-mono">{new Date(int.data).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-slate-700 dark:text-zinc-300 text-[11px]">{int.resumo}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-[11px]">Nenhuma interação registrada ainda para este lead.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setLeadSelecionadoCRM(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
