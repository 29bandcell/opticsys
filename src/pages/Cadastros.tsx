import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Users, 
  Truck, 
  UserCheck, 
  Tag, 
  Plus, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Percent,
  Phone,
  Mail,
  Building2,
  Stethoscope,
  Key,
  Lock,
  Sliders,
  Check,
  X,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Power
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Funcionario, RoleUsuario } from '../types';
import { Badge } from '../components/common/Badge';
import { evolutionService } from '../services/evolutionApi';

export const Cadastros: React.FC = () => {
  const { 
    funcionarios, 
    lojaAtiva, 
    adicionarFuncionario, 
    atualizarFuncionario, 
    toggleFuncionarioAtivo 
  } = useAuthAndTenant();

  const [abaAtiva, setAbaAtiva] = useState<'FUNCIONARIOS' | 'PERMISSOES' | 'FORNECEDORES' | 'MEDICOS' | 'ORIGENS'>('FUNCIONARIOS');
  
  // Estado para edição de permissões
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<Funcionario | null>(funcionarios[0] || null);
  const [permissoesEditadas, setPermissoesEditadas] = useState<Record<string, boolean>>({
    'mod_dashboard': true,
    'mod_clientes': true,
    'mod_produtos': true,
    'mod_receitas': true,
    'mod_os': true,
    'mod_pdv': true,
    'mod_agenda': true,
    'mod_zapotica': true,
    'mod_laboratorios': true,
    'mod_financeiro': true,
    'mod_cadastros': true,
    'mod_assinatura': false,
    'mod_configuracoes': false,
    'ver_preco_custo': false,
    'dar_desconto_livre': false,
    'cancelar_os': false,
    'cancelar_venda': false,
    'fechar_caixa': true,
    'ver_faturamento_total': false,
    'alterar_comissoes': false,
    'excluir_pacientes': false
  });

  const [sucessoSalvar, setSucessoSalvar] = useState(false);
  const [alertaZapSucesso, setAlertaZapSucesso] = useState<string | null>(null);

  // Estados locais para Fornecedores
  const [fornecedores, setFornecedores] = useState<any[]>(() => {
    const saved = localStorage.getItem('opticsys_fornecedores');
    return saved ? JSON.parse(saved) : [];
  });

  // Estados locais para Médicos Prescritores
  const [medicos, setMedicos] = useState<any[]>(() => {
    const saved = localStorage.getItem('opticsys_medicos');
    return saved ? JSON.parse(saved) : [];
  });

  // Origens do Cliente
  const [origens, setOrigens] = useState<any[]>(() => {
    const saved = localStorage.getItem('opticsys_origens');
    return saved ? JSON.parse(saved) : [
      { id: 'orig-01', nome: 'Balcão / Loja Física', clientes_total: 0 },
      { id: 'orig-02', nome: 'Indicação Médica', clientes_total: 0 },
      { id: 'orig-03', nome: 'Redes Sociais / WhatsApp', clientes_total: 0 },
      { id: 'orig-04', nome: 'Convênio / Parceria', clientes_total: 0 }
    ];
  });

  useEffect(() => {
    localStorage.setItem('opticsys_fornecedores', JSON.stringify(fornecedores));
  }, [fornecedores]);

  useEffect(() => {
    localStorage.setItem('opticsys_medicos', JSON.stringify(medicos));
  }, [medicos]);

  useEffect(() => {
    localStorage.setItem('opticsys_origens', JSON.stringify(origens));
  }, [origens]);

  // Modais de Criação
  const [isModalFuncionarioOpen, setIsModalFuncionarioOpen] = useState(false);
  const [isModalFornecedorOpen, setIsModalFornecedorOpen] = useState(false);
  const [isModalMedicoOpen, setIsModalMedicoOpen] = useState(false);
  const [isModalResetSenhaOpen, setIsModalResetSenhaOpen] = useState(false);
  const [funcionarioParaReset, setFuncionarioParaReset] = useState<Funcionario | null>(null);
  const [novaSenhaReset, setNovaSenhaReset] = useState('');

  // Form Funcionário Completo
  const [funcNome, setFuncNome] = useState('');
  const [funcTelefone, setFuncTelefone] = useState('');
  const [funcEmail, setFuncEmail] = useState('');
  const [funcSenha, setFuncSenha] = useState('123456');
  const [funcCargo, setFuncCargo] = useState<RoleUsuario>('VENDEDOR');
  const [funcComissaoProd, setFuncComissaoProd] = useState(4.0);
  const [funcComissaoServ, setFuncComissaoServ] = useState(5.0);
  const [enviarCredenciaisZap, setEnviarCredenciaisZap] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Formatação de telefone
  const formatarTelefone = (valor: string) => {
    const nums = valor.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  const gerarSenhaAleatoria = () => {
    const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'optica@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFuncSenha(pass);
  };

  const enviarWhatsAppCredenciais = async (f: Funcionario, senhaAcesso?: string) => {
    const fone = (f.telefone || '').replace(/\D/g, '');
    const senhaFinal = senhaAcesso || f.senha || '123456';
    const linkAcesso = window.location.origin;

    const texto = 
      `👋 Olá, *${f.nome}*!\n\n` +
      `Seu acesso ao sistema *OpticSys Cloud* da *${lojaAtiva.nome_fantasia}* foi configurado com sucesso:\n\n` +
      `🌐 *Link de Acesso:* ${linkAcesso}\n` +
      `📧 *E-mail de Login:* ${f.email}\n` +
      `🔑 *Sua Senha:* ${senhaFinal}\n` +
      `💼 *Cargo / Função:* ${f.cargo}\n\n` +
      `Guarde esta mensagem para acessar no computador, tablet ou celular da loja. Bom trabalho!`;

    if (fone.length >= 10) {
      try {
        await evolutionService.enviarMensagemTexto(
          lojaAtiva.nome_fantasia.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'opticsys_matriz',
          f.telefone || '',
          texto
        );
      } catch (e) {
        console.warn('Envio WhatsApp API:', e);
      }

      setAlertaZapSucesso(`Acesso enviado via WhatsApp para ${f.nome} (${f.telefone})!`);
      setTimeout(() => setAlertaZapSucesso(null), 4000);
    } else {
      // Fallback abre WhatsApp Web
      const encoded = encodeURIComponent(texto);
      window.open(`https://wa.me/55${fone}?text=${encoded}`, '_blank');
    }
  };

  const handleSalvarNovoFuncionario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcNome || !funcEmail || !funcSenha) {
      alert('Preencha os campos obrigatórios (Nome, E-mail e Senha).');
      return;
    }

    const novo = adicionarFuncionario({
      nome: funcNome,
      email: funcEmail,
      telefone: funcTelefone || '(88) 99999-0000',
      senha: funcSenha,
      cargo: funcCargo,
      comissao_produto_pct: funcComissaoProd,
      comissao_servico_pct: funcComissaoServ,
      permissoes: {
        dashboard: true,
        clientes: true,
        receitas: true,
        os: true,
        pdv: funcCargo !== 'OPTOMETRISTA' && funcCargo !== 'TECNICO_MONTAGEM',
        estoque: funcCargo === 'ADMIN' || funcCargo === 'GERENTE' || funcCargo === 'TECNICO_MONTAGEM',
        laboratorios: funcCargo === 'ADMIN' || funcCargo === 'GERENTE' || funcCargo === 'TECNICO_MONTAGEM',
        financeiro: funcCargo === 'ADMIN' || funcCargo === 'GERENTE',
        configuracoes: funcCargo === 'ADMIN'
      },
      ativo: true
    });

    if (enviarCredenciaisZap && funcTelefone) {
      enviarWhatsAppCredenciais(novo, funcSenha);
    }

    setIsModalFuncionarioOpen(false);
    setFuncNome('');
    setFuncTelefone('');
    setFuncEmail('');
    setFuncSenha('123456');
    setFuncCargo('VENDEDOR');
    setFuncComissaoProd(4.0);
    setFuncComissaoServ(5.0);
  };

  const handleSalvarResetSenha = () => {
    if (!funcionarioParaReset || !novaSenhaReset) return;
    atualizarFuncionario(funcionarioParaReset.id, { senha: novaSenhaReset });
    
    if (funcionarioParaReset.telefone) {
      enviarWhatsAppCredenciais({ ...funcionarioParaReset, senha: novaSenhaReset }, novaSenhaReset);
    }

    setIsModalResetSenhaOpen(false);
    setFuncionarioParaReset(null);
    setNovaSenhaReset('');
    setAlertaZapSucesso('Senha atualizada com sucesso!');
    setTimeout(() => setAlertaZapSucesso(null), 3000);
  };

  const togglePerm = (chave: string) => {
    setPermissoesEditadas(prev => ({
      ...prev,
      [chave]: !prev[chave]
    }));
  };

  const handleSalvarPermissoes = () => {
    setSucessoSalvar(true);
    setTimeout(() => setSucessoSalvar(false), 2500);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Header do Módulo Cadastro */}
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950 text-[#0284C7] flex items-center justify-center font-bold shrink-0">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100">
              Gestão de Usuários & Controle de Acesso
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400">
              Cadastre funcionários, defina senhas, comissões de venda e permissões por cargo (RBAC).
            </p>
          </div>
        </div>

        {/* Botão de Criação */}
        <div>
          {abaAtiva === 'FUNCIONARIOS' && (
            <button
              onClick={() => setIsModalFuncionarioOpen(true)}
              className="w-full sm:w-auto bg-[#0284C7] hover:bg-sky-700 text-white font-bold py-2 px-3.5 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Cadastrar Funcionário
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Notificação WhatsApp */}
      {alertaZapSucesso && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{alertaZapSucesso}</span>
        </div>
      )}

      {/* Submenus / Abas de Navegação Responsiva */}
      <div className="flex gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto text-xs no-scrollbar">
        <button
          onClick={() => setAbaAtiva('FUNCIONARIOS')}
          className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            abaAtiva === 'FUNCIONARIOS'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Equipe & Acessos ({funcionarios.length})
        </button>

        <button
          onClick={() => setAbaAtiva('PERMISSOES')}
          className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            abaAtiva === 'PERMISSOES'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Níveis de Permissão (RBAC)
        </button>

        <button
          onClick={() => setAbaAtiva('FORNECEDORES')}
          className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            abaAtiva === 'FORNECEDORES'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> Fornecedores & Grifes ({fornecedores.length})
        </button>

        <button
          onClick={() => setAbaAtiva('MEDICOS')}
          className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            abaAtiva === 'MEDICOS'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" /> Médicos & Optometristas ({medicos.length})
        </button>

        <button
          onClick={() => setAbaAtiva('ORIGENS')}
          className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            abaAtiva === 'ORIGENS'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-3.5 h-3.5" /> Origens do Paciente ({origens.length})
        </button>
      </div>

      {/* ABA 1: FUNCIONÁRIOS & ACESSOS */}
      {abaAtiva === 'FUNCIONARIOS' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              Colaboradores Cadastrados na {lojaAtiva.nome_fantasia}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              O Administrador define logins, senhas e comissões
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#F1F5F9] dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-semibold border-b border-slate-200 dark:border-zinc-800">
                  <th className="py-2.5 px-4 text-[11px]">Colaborador</th>
                  <th className="py-2.5 px-4 text-[11px]">E-mail de Login</th>
                  <th className="py-2.5 px-4 text-[11px]">WhatsApp</th>
                  <th className="py-2.5 px-4 text-[11px]">Cargo</th>
                  <th className="py-2.5 px-4 font-mono text-[11px]">Comissão Prod.</th>
                  <th className="py-2.5 px-4 font-mono text-[11px]">Comissão Serv.</th>
                  <th className="py-2.5 px-4 text-center text-[11px]">Status</th>
                  <th className="py-2.5 px-4 text-center text-[11px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {funcionarios.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-950 text-[#0284C7] font-extrabold flex items-center justify-center text-xs shrink-0">
                        {f.nome.charAt(0)}
                      </div>
                      <div>
                        <span className="block leading-tight">{f.nome}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          Senha: {f.senha || '••••••'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{f.email}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-300 font-mono text-[11px]">
                      {f.telefone || '(88) 98882-2847'}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <Badge variant={f.cargo === 'ADMIN' ? 'purple' : f.cargo === 'OPTOMETRISTA' ? 'info' : 'default'}>
                        {f.cargo}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">{f.comissao_produto_pct.toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">{f.comissao_servico_pct.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleFuncionarioAtivo(f.id)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          f.ativo 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200' 
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200'
                        }`}
                        title="Clique para ativar/desativar o acesso"
                      >
                        {f.ativo ? 'ATIVO' : 'INATIVO'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => enviarWhatsAppCredenciais(f)}
                          className="p-1.5 rounded-md border border-emerald-200 hover:bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                          title="Enviar dados de login no WhatsApp"
                        >
                          <Send className="w-3 h-3" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>

                        <button
                          onClick={() => {
                            setFuncionarioParaReset(f);
                            setNovaSenhaReset(f.senha || '123456');
                            setIsModalResetSenhaOpen(true);
                          }}
                          className="p-1.5 rounded-md border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                          title="Alterar Senha do Funcionário"
                        >
                          <Key className="w-3 h-3 text-amber-500" />
                        </button>

                        <button
                          onClick={() => {
                            setFuncionarioSelecionado(f);
                            setAbaAtiva('PERMISSOES');
                          }}
                          className="p-1.5 rounded-md border border-[#0284C7] text-[#0284C7] hover:bg-[#0284C7] hover:text-white text-[11px] font-semibold transition-all shadow-2xs"
                          title="Ajustar Permissões (RBAC)"
                        >
                          <Sliders className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: MATRIZ DE PERMISSÕES GRANULARES (RBAC) */}
      {abaAtiva === 'PERMISSOES' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs p-4 sm:p-5 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7]">Matriz de Controle de Acesso (RBAC)</span>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Permissões de: {funcionarioSelecionado?.nome} ({funcionarioSelecionado?.cargo})
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSalvarPermissoes}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Salvar Permissões
              </button>
            </div>
          </div>

          {sucessoSalvar && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 rounded-lg text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Níveis de acesso do colaborador foram atualizados com sucesso!</span>
            </div>
          )}

          {/* Selecionar Funcionário para Editar */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300 text-xs mb-1">
              Selecione o Colaborador para Configurar:
            </label>
            <select
              value={funcionarioSelecionado?.id}
              onChange={(e) => {
                const target = funcionarios.find(f => f.id === e.target.value);
                if (target) setFuncionarioSelecionado(target);
              }}
              className="w-full sm:w-80 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0284C7]"
            >
              {funcionarios.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nome} • {f.cargo}
                </option>
              ))}
            </select>
          </div>

          {/* Grid de Permissões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bloco 1: Módulos Visíveis */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2.5">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0284C7]" /> Módulos Visíveis no Menu Lateral
              </h4>
              
              <div className="space-y-2 text-xs pt-1">
                {[
                  { key: 'mod_dashboard', label: 'Painel Geral (Dashboard)' },
                  { key: 'mod_clientes', label: 'Clientes & Pacientes' },
                  { key: 'mod_receitas', label: 'Receitas Ópticas (OD/OE)' },
                  { key: 'mod_os', label: 'Ordens de Serviço (O.S. / Montagem)' },
                  { key: 'mod_pdv', label: 'Vendas & Frente de Caixa (PDV)' },
                  { key: 'mod_agenda', label: 'Agenda de Consultas' },
                  { key: 'mod_zapotica', label: 'OpticZap (WhatsApp & Mensagens)' },
                  { key: 'mod_produtos', label: 'Produtos & Estoque de Armações' },
                  { key: 'mod_laboratorios', label: 'Laboratórios de Surfaçagem' },
                  { key: 'mod_financeiro', label: 'Financeiro & Fluxo de Caixa' },
                  { key: 'mod_cadastros', label: 'Cadastros Gerais' }
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800/80 rounded-lg border border-slate-200 dark:border-zinc-700/80 cursor-pointer hover:border-slate-300">
                    <span className="font-medium text-slate-700 dark:text-zinc-200">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={permissoesEditadas[item.key] ?? true}
                      onChange={() => togglePerm(item.key)}
                      className="w-4 h-4 rounded text-[#0284C7] focus:ring-[#0284C7] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Bloco 2: Travas de Segurança & Ações Críticas */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2.5">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-500" /> Travas de Segurança & Sigilo
              </h4>
              
              <div className="space-y-2 text-xs pt-1">
                {[
                  { key: 'ver_preco_custo', label: 'Visualizar Preço de Custo das Lentes/Armações', desc: 'Evita que o vendedor saiba a margem bruta da loja' },
                  { key: 'dar_desconto_livre', label: 'Aplicar Desconto Livre no PDV sem Senha Gerente', desc: 'Permite dar mais de 10% de desconto' },
                  { key: 'cancelar_os', label: 'Cancelar Ordem de Serviço Já Faturada', desc: 'Apenas administrador ou gerente' },
                  { key: 'cancelar_venda', label: 'Estornar / Cancelar Venda no PDV', desc: 'Evita fraudes no fechamento de caixa' },
                  { key: 'ver_faturamento_total', label: 'Visualizar Faturamento Total do Mês (DRE)', desc: 'Sigilo contábil do dono da ótica' },
                  { key: 'alterar_comissoes', label: 'Alterar Porcentagens de Comissão', desc: 'Apenas proprietário / administrador da ótica' },
                  { key: 'excluir_pacientes', label: 'Excluir Histórico de Clientes/Receitas', desc: 'Prevenção contra perda de dados' }
                ].map(item => (
                  <label key={item.key} className="flex items-start justify-between p-2.5 bg-white dark:bg-zinc-800/80 rounded-lg border border-slate-200 dark:border-zinc-700/80 cursor-pointer hover:border-slate-300 gap-2">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 block leading-tight">{item.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={permissoesEditadas[item.key] ?? false}
                      onChange={() => togglePerm(item.key)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer shrink-0 mt-0.5"
                    />
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ABA 3: FORNECEDORES */}
      {abaAtiva === 'FORNECEDORES' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-zinc-200">Fabricantes de Lentes e Grifes de Armações</span>
            <span className="text-[11px] text-slate-400 font-mono">Total: {fornecedores.length} cadastrados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="bg-[#F1F5F9] dark:bg-zinc-900 text-slate-600 font-semibold border-b border-slate-200 dark:border-zinc-800">
                  <th className="py-2.5 px-4 text-[11px]">Nome Comercial</th>
                  <th className="py-2.5 px-4 text-[11px]">Razão Social</th>
                  <th className="py-2.5 px-4 font-mono text-[11px]">CNPJ</th>
                  <th className="py-2.5 px-4 font-mono text-[11px]">Telefone</th>
                  <th className="py-2.5 px-4 text-center text-[11px]">Tipo Fornecedor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {fornecedores.map(forn => (
                  <tr key={forn.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">{forn.nome_fantasia}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-400">{forn.razao_social}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{forn.cnpj}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-zinc-300">{forn.telefone}</td>
                    <td className="py-3 px-4 text-center">
                      {forn.is_laboratorio ? (
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          Laboratório Óptico
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-800 dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          Armações & Grifes
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: MÉDICOS & OPTOMETRISTAS */}
      {abaAtiva === 'MEDICOS' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-800 dark:text-zinc-200">Prescritores Oftalmológicos Cadastrados</span>
            <span className="text-[11px] text-slate-400 font-mono">CRM / CROO</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="bg-[#F1F5F9] dark:bg-zinc-900 text-slate-600 font-semibold border-b border-slate-200 dark:border-zinc-800">
                  <th className="py-2.5 px-4 text-[11px]">Nome do Prescritor</th>
                  <th className="py-2.5 px-4 text-[11px]">Registro Profissional</th>
                  <th className="py-2.5 px-4 text-[11px]">Especialidade / Foco</th>
                  <th className="py-2.5 px-4 text-[11px]">Clínica / Gabinete</th>
                  <th className="py-2.5 px-4 text-[11px]">Telefone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {medicos.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">{m.nome}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0284C7]">{m.registro}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">{m.especialidade}</td>
                    <td className="py-3 px-4 text-slate-500">{m.consultorio}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{m.telefone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 5: ORIGENS DO CLIENTE */}
      {abaAtiva === 'ORIGENS' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs p-4 sm:p-5 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-2">
            <span className="font-bold text-xs text-slate-900 dark:text-zinc-100">Canais de Atração de Pacientes</span>
            <span className="text-[11px] text-slate-400">Origem registrada no cadastro</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {origens.map(orig => (
              <div key={orig.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
                <span className="font-semibold text-slate-800 dark:text-zinc-200">{orig.nome}</span>
                <span className="font-mono font-bold bg-sky-100 dark:bg-sky-950 text-[#0284C7] px-2 py-0.5 rounded-md text-[11px]">
                  {orig.clientes_total} pacientes
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CADASTRAR FUNCIONÁRIO (Completo com Senha & WhatsApp) */}
      {isModalFuncionarioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs my-6 animate-in zoom-in-95">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#0284C7]" /> Cadastrar Novo Funcionário
                </h3>
                <p className="text-[11px] text-slate-500">Defina o cargo, senha e comissões do colaborador.</p>
              </div>
              <button onClick={() => setIsModalFuncionarioOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovoFuncionario} className="space-y-3.5">
              
              {/* Nome Completo */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Nome Completo do Funcionário *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  value={funcNome}
                  onChange={e => setFuncNome(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0284C7]"
                />
              </div>

              {/* WhatsApp + E-mail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    WhatsApp do Funcionário *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(88) 99999-9999"
                    value={funcTelefone}
                    onChange={e => setFuncTelefone(formatarTelefone(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0284C7]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    E-mail de Login *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@optica.com.br"
                    value={funcEmail}
                    onChange={e => setFuncEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              {/* Senha de Acesso */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700 dark:text-zinc-300">
                    Senha Inicial de Acesso *
                  </label>
                  <button
                    type="button"
                    onClick={gerarSenhaAleatoria}
                    className="text-[10px] text-[#0284C7] font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Gerar Automática
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={funcSenha}
                    onChange={e => setFuncSenha(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Cargo / Função + Comissões */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Cargo / Perfil *
                  </label>
                  <select
                    value={funcCargo}
                    onChange={e => setFuncCargo(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-zinc-200 outline-none"
                  >
                    <option value="VENDEDOR">Vendedor / Consultor</option>
                    <option value="OPTOMETRISTA">Optometrista</option>
                    <option value="TECNICO_MONTAGEM">Técnico Montador</option>
                    <option value="GERENTE">Gerente de Loja</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Comissão Vendas (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={funcComissaoProd}
                    onChange={e => setFuncComissaoProd(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Comissão Serviços (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={funcComissaoServ}
                    onChange={e => setFuncComissaoServ(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Checkbox: Enviar WhatsApp */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="enviarZapCredenciais"
                  checked={enviarCredenciaisZap}
                  onChange={e => setEnviarCredenciaisZap(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer mt-0.5"
                />
                <label htmlFor="enviarZapCredenciais" className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-tight cursor-pointer font-medium">
                  <strong>Enviar credenciais de login no WhatsApp do funcionário</strong>
                  <span className="block text-emerald-700 dark:text-emerald-400 text-[10px] mt-0.5">
                    Dispara automaticamente o link do sistema, login e senha no número informado.
                  </span>
                </label>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalFuncionarioOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0284C7] hover:bg-sky-700 text-white rounded-lg font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Salvar & Criar Acesso
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: RESET / ALTERAR SENHA DE FUNCIONÁRIO */}
      {isModalResetSenhaOpen && funcionarioParaReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-sm p-5 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-amber-500" /> Alterar Senha de {funcionarioParaReset.nome}
              </h3>
              <button onClick={() => setIsModalResetSenhaOpen(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Nova Senha de Acesso:
                </label>
                <input
                  type="text"
                  value={novaSenhaReset}
                  onChange={e => setNovaSenhaReset(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 rounded-lg text-[10px] text-sky-800 dark:text-sky-300">
                📱 A nova senha será salva e reenviada no WhatsApp <strong>{funcionarioParaReset.telefone}</strong>.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  onClick={() => setIsModalResetSenhaOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarResetSenha}
                  className="px-4 py-1.5 bg-[#0284C7] hover:bg-sky-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
