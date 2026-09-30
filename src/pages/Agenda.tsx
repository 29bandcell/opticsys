import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus, 
  Phone, 
  CheckCircle, 
  Eye, 
  Stethoscope, 
  MessageSquare, 
  Send, 
  FileText, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  MapPin, 
  Glasses, 
  Activity, 
  Trash2, 
  ExternalLink 
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Badge } from '../components/common/Badge';
import { AgendamentoConsulta, Cliente, ReceitaOptica } from '../types';

export const Agenda: React.FC = () => {
  const { 
    clientes, 
    receitas, 
    medicos, 
    funcionarios, 
    agendamentos, 
    adicionarAgendamento, 
    atualizarStatusAgendamento, 
    removerAgendamento, 
    notificarMedicoWhatsApp 
  } = useAuthAndTenant();

  const [abaVisualizacao, setAbaVisualizacao] = useState<'RECEPCAO' | 'GABINETE'>('RECEPCAO');
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [filtroProfissional, setFiltroProfissional] = useState<string>('TODOS');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalFichaOpen, setIsModalFichaOpen] = useState(false);
  const [agendamentoSelecionadoFicha, setAgendamentoSelecionadoFicha] = useState<AgendamentoConsulta | null>(null);
  
  // Toast Alert
  const [mensagemAlerta, setMensagemAlerta] = useState<string | null>(null);

  // Form State para Novo Agendamento
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState('');
  const [pacienteNome, setPacienteNome] = useState('');
  const [pacienteTel, setPacienteTel] = useState('');
  const [pacienteCpf, setPacienteCpf] = useState('');
  const [pacienteNasc, setPacienteNasc] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('10:00');
  const [tipo, setTipo] = useState('Exame de Vista / Refração Completa');
  const [observacoesQueixa, setObservacoesQueixa] = useState('');
  const [profissionalId, setProfissionalId] = useState('');
  const [profissionalNome, setProfissionalNome] = useState('');
  const [notificarZap, setNotificarZap] = useState(true);

  // Combinar lista de profissionais cadastrados (Médicos/Optometristas do cadastro + Colaboradores Optometristas)
  const todosProfissionais = [
    ...medicos.map(m => ({
      id: m.id,
      nome: m.nome,
      registro: m.registro,
      tipo: m.tipo,
      telefone: m.telefone,
      cargo: m.tipo === 'OPTOMETRISTA' ? 'Optometrista' : 'Oftalmologista'
    })),
    ...funcionarios
      .filter(f => f.cargo === 'OPTOMETRISTA')
      .map(f => ({
        id: f.id,
        nome: f.nome,
        registro: 'Optometrista da Loja',
        tipo: 'OPTOMETRISTA' as const,
        telefone: f.telefone || '',
        cargo: 'Optometrista'
      }))
  ];

  // Auto-selecionar primeiro profissional se houver
  React.useEffect(() => {
    if (todosProfissionais.length > 0 && !profissionalId) {
      setProfissionalId(todosProfissionais[0].id);
      setProfissionalNome(`${todosProfissionais[0].nome} (${todosProfissionais[0].cargo})`);
    } else if (todosProfissionais.length === 0 && !profissionalNome) {
      setProfissionalNome('Optometrista Responsável');
    }
  }, [medicos, funcionarios]);

  const handleSelecionarCliente = (id: string) => {
    setClienteSelecionadoId(id);
    if (!id) {
      setPacienteNome('');
      setPacienteTel('');
      setPacienteCpf('');
      setPacienteNasc('');
      return;
    }
    const cli = clientes.find(c => c.id === id);
    if (cli) {
      setPacienteNome(cli.nome);
      setPacienteTel(cli.whatsapp || cli.telefone || '');
      setPacienteCpf(cli.cpf || '');
      setPacienteNasc(cli.data_nascimento || '');
    }
  };

  const handleSelecionarProfissional = (id: string) => {
    setProfissionalId(id);
    const prof = todosProfissionais.find(p => p.id === id);
    if (prof) {
      setProfissionalNome(`${prof.nome} (${prof.cargo})`);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteNome.trim()) {
      alert('Informe o nome do paciente.');
      return;
    }

    try {
      const novoAg = await adicionarAgendamento({
        cliente_id: clienteSelecionadoId || undefined,
        paciente_nome: pacienteNome.trim(),
        telefone: pacienteTel.trim(),
        cpf: pacienteCpf.trim() || undefined,
        data_nascimento: pacienteNasc.trim() || undefined,
        data,
        horario,
        profissional_id: profissionalId || undefined,
        profissional: profissionalNome || 'Optometrista Responsável',
        tipo,
        status: 'CONFIRMADO',
        observacoes: observacoesQueixa.trim() || 'Exame de vista / refração de rotina.'
      }, notificarZap);

      setIsModalOpen(false);
      setClienteSelecionadoId('');
      setPacienteNome('');
      setPacienteTel('');
      setPacienteCpf('');
      setPacienteNasc('');
      setObservacoesQueixa('');

      setMensagemAlerta(`Consulta de ${novoAg.paciente_nome} agendada com sucesso! ${notificarZap ? 'Notificação enviada ao WhatsApp do médico.' : ''}`);
      setTimeout(() => setMensagemAlerta(null), 4500);
    } catch (err) {
      console.error(err);
      alert('Erro ao agendar consulta.');
    }
  };

  const handleDispararNotificacaoManual = async (agId: string) => {
    const res = await notificarMedicoWhatsApp(agId);
    setMensagemAlerta(res.message);
    setTimeout(() => setMensagemAlerta(null), 4000);
  };

  // Filtragem dos Agendamentos
  const agendamentosFiltrados = agendamentos.filter(ag => {
    const matchData = !dataFiltro || ag.data === dataFiltro;
    const matchProf = filtroProfissional === 'TODOS' || ag.profissional_id === filtroProfissional || ag.profissional.includes(filtroProfissional);
    return matchData && matchProf;
  });

  // Estatísticas Rápidas do Dia
  const totalHoje = agendamentos.filter(a => a.data === dataFiltro).length;
  const aguardandoHoje = agendamentos.filter(a => a.data === dataFiltro && (a.status === 'CONFIRMADO' || a.status === 'AGENDADO')).length;
  const emAtendimentoHoje = agendamentos.filter(a => a.data === dataFiltro && a.status === 'EM_ATENDIMENTO').length;
  const concluidosHoje = agendamentos.filter(a => a.data === dataFiltro && a.status === 'CONCLUIDO').length;

  // Obter Histórico Clínico do Paciente Selecionado
  const getHistoricoPaciente = (clienteId?: string) => {
    if (!clienteId) return null;
    const cli = clientes.find(c => c.id === clienteId);
    const recs = receitas.filter(r => r.cliente_id === clienteId);
    return {
      cliente: cli,
      receitas: recs,
      ultimaReceita: recs[0] || null
    };
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      
      {/* Header Principal */}
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 p-4 sm:p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              Agenda & Gabinete do Optometrista
              <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                Ponte Clínica WhatsApp
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Agendamentos, notificações automáticas com ficha completa para o médico e fila de atendimento do consultório.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setClienteSelecionadoId('');
              setPacienteNome('');
              setPacienteTel('');
              setPacienteCpf('');
              setPacienteNasc('');
              setObservacoesQueixa('');
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto bg-[#0284C7] hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Novo Agendamento
          </button>
        </div>
      </div>

      {/* Alerta / Toast de Notificação WhatsApp */}
      {mensagemAlerta && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{mensagemAlerta}</span>
        </div>
      )}

      {/* Cards de Métricas Rápidas do Dia */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Agendados</span>
            <p className="text-lg font-black text-slate-900 dark:text-zinc-100">{totalHoje}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#121216] border border-amber-200 dark:border-amber-900/50 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-amber-600">Aguardando Chegada</span>
            <p className="text-lg font-black text-amber-600">{aguardandoHoje}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#121216] border border-blue-200 dark:border-blue-900/50 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-blue-600">Em Consulta Agora</span>
            <p className="text-lg font-black text-blue-600">{emAtendimentoHoje}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center animate-pulse">
            <Activity className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#121216] border border-emerald-200 dark:border-emerald-900/50 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-emerald-600">Exames Concluídos</span>
            <p className="text-lg font-black text-emerald-600">{concluidosHoje}</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navegação entre Abas: Recepção Geral vs Gabinete do Optometrista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-2">
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setAbaVisualizacao('RECEPCAO')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              abaVisualizacao === 'RECEPCAO'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Grade da Recepção ({agendamentosFiltrados.length})
          </button>

          <button
            onClick={() => setAbaVisualizacao('GABINETE')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              abaVisualizacao === 'GABINETE'
                ? 'bg-[#0284C7] text-white shadow-xs'
                : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" /> Gabinete do Optometrista / Consultório
            {aguardandoHoje > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black">
                {aguardandoHoje}
              </span>
            )}
          </button>
        </div>

        {/* Filtros por Data & Profissional */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400">Data:</span>
            <input
              type="date"
              value={dataFiltro}
              onChange={e => setDataFiltro(e.target.value)}
              className="bg-transparent font-mono font-bold text-slate-800 dark:text-zinc-200 outline-none text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400">Prescritor:</span>
            <select
              value={filtroProfissional}
              onChange={e => setFiltroProfissional(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-zinc-200 outline-none text-xs"
            >
              <option value="TODOS">Todos os Profissionais</option>
              {todosProfissionais.map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ABA 1: GRADE GERAL DA RECEPÇÃO */}
      {abaVisualizacao === 'RECEPCAO' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[750px]">
              <thead className="bg-[#F8FAFC] dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold border-b border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-4 text-[11px]">Horário / Data</th>
                  <th className="py-2.5 px-4 text-[11px]">Paciente</th>
                  <th className="py-2.5 px-4 text-[11px]">Contato</th>
                  <th className="py-2.5 px-4 text-[11px]">Profissional</th>
                  <th className="py-2.5 px-4 text-[11px]">Procedimento & Queixa</th>
                  <th className="py-2.5 px-4 text-center text-[11px]">Status</th>
                  <th className="py-2.5 px-4 text-center text-[11px]">Ações da Recepção</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {agendamentosFiltrados.map(ag => (
                  <tr key={ag.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="font-extrabold text-blue-600 block text-xs">{ag.horario}</span>
                      <span className="text-[10px] text-slate-400">{ag.data}</span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-zinc-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold">{ag.paciente_nome}</span>
                        {ag.cliente_id && (
                          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded" title="Cliente com cadastro ativo">
                            Cadastrado
                          </span>
                        )}
                      </div>
                      {ag.cpf && <span className="text-[10px] text-slate-400 font-mono block">CPF: {ag.cpf}</span>}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-zinc-300">
                      <span>{ag.telefone || 'Sem telefone'}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-200 font-medium">
                      <div className="flex items-center gap-1 text-xs">
                        <Stethoscope className="w-3 h-3 text-[#0284C7] shrink-0" />
                        <span>{ag.profissional}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 block">{ag.tipo}</span>
                      {ag.observacoes && (
                        <span className="text-[10px] text-slate-400 block line-clamp-1 italic">
                          "{ag.observacoes}"
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <select
                        value={ag.status}
                        onChange={e => {
                          const novoStatus = e.target.value as any;
                          atualizarStatusAgendamento(ag.id, novoStatus);
                          setMensagemAlerta(`Status de ${ag.paciente_nome} alterado para "${novoStatus === 'CONCLUIDO' ? 'Exame Concluído' : novoStatus}"!`);
                          setTimeout(() => setMensagemAlerta(null), 3000);
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition-all ${
                          ag.status === 'CONCLUIDO' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800' :
                          ag.status === 'EM_ATENDIMENTO'
                            ? 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800 animate-pulse' :
                          ag.status === 'CONFIRMADO'
                            ? 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-800' :
                            'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
                        }`}
                      >
                        <option value="AGENDADO">🟡 Agendado</option>
                        <option value="CONFIRMADO">🟣 Confirmado</option>
                        <option value="EM_ATENDIMENTO">🔵 Em Consulta</option>
                        <option value="CONCLUIDO">🟢 Exame Concluído</option>
                        <option value="CANCELADO">🔴 Cancelado</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Botão Rápido: Concluir Exame */}
                        {ag.status !== 'CONCLUIDO' ? (
                          <button
                            onClick={() => {
                              atualizarStatusAgendamento(ag.id, 'CONCLUIDO');
                              setMensagemAlerta(`Consulta de ${ag.paciente_nome} marcada como Exame Concluído!`);
                              setTimeout(() => setMensagemAlerta(null), 3000);
                            }}
                            className="p-1.5 px-2 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-[10px] font-bold flex items-center gap-1 transition-all shadow-2xs"
                            title="Marcar Exame como Concluído"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Concluir
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Finalizado
                          </span>
                        )}

                        {/* Botão Notificar WhatsApp do Médico */}
                        <button
                          onClick={() => handleDispararNotificacaoManual(ag.id)}
                          className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 dark:border-zinc-800 dark:hover:bg-zinc-800 text-[11px] font-semibold transition-all"
                          title="Enviar Ficha Completa do Paciente no WhatsApp do Médico"
                        >
                          <Send className="w-3.5 h-3.5 text-emerald-600" />
                        </button>

                        {/* Botão Ver Ficha Clínica */}
                        <button
                          onClick={() => {
                            setAgendamentoSelecionadoFicha(ag);
                            setIsModalFichaOpen(true);
                          }}
                          className="p-1.5 rounded-md border border-blue-200 hover:bg-blue-50 text-blue-600 dark:border-blue-900/50 dark:hover:bg-blue-950/40 text-[11px] font-semibold transition-all"
                          title="Ver Ficha Clínica e Histórico"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Botão Excluir Agendamento */}
                        <button
                          onClick={() => {
                            if (confirm(`Deseja cancelar o agendamento de "${ag.paciente_nome}"?`)) {
                              removerAgendamento(ag.id);
                            }
                          }}
                          className="p-1.5 rounded-md border border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:hover:bg-rose-950/40 text-[11px] font-semibold transition-all"
                          title="Excluir Agendamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}

                {agendamentosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                      Nenhum agendamento encontrado para esta data ou filtro.<br />
                      Clique em <strong>"+ Novo Agendamento"</strong> para marcar a consulta.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: GABINETE DO OPTOMETRISTA / CONSULTÓRIO CLÍNICO */}
      {abaVisualizacao === 'GABINETE' && (
        <div className="space-y-4">
          
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-medium">
              <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                <strong>Gabinete Clínico:</strong> Exibindo a fila de pacientes do dia com histórico de refração e anamnese.
              </span>
            </div>
            <span className="font-bold text-blue-700 dark:text-blue-300 font-mono">
              {agendamentosFiltrados.length} consultas na lista
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agendamentosFiltrados.map(ag => {
              const hist = getHistoricoPaciente(ag.cliente_id);

              return (
                <div 
                  key={ag.id}
                  className={`bg-white dark:bg-[#121216] border rounded-xl p-4 space-y-3.5 shadow-xs transition-all ${
                    ag.status === 'EM_ATENDIMENTO'
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                      : ag.status === 'CONCLUIDO'
                      ? 'border-emerald-300 dark:border-emerald-900/60 opacity-90'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  {/* Cabeçalho do Card */}
                  <div className="flex justify-between items-start border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                          {ag.paciente_nome}
                        </span>
                        <Badge 
                          variant={
                            ag.status === 'CONCLUIDO' ? 'success' : 
                            ag.status === 'EM_ATENDIMENTO' ? 'info' : 
                            ag.status === 'CONFIRMADO' ? 'purple' : 'warning'
                          }
                        >
                          {ag.status}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-blue-600" /> Horário: <strong>{ag.horario}</strong> ({ag.data})
                      </span>
                    </div>

                    <button
                      onClick={() => handleDispararNotificacaoManual(ag.id)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-[10px] font-bold rounded-md flex items-center gap-1 transition-all"
                      title="Disparar Ficha no WhatsApp"
                    >
                      <Send className="w-2.5 h-2.5" /> Zap Dr(a)
                    </button>
                  </div>

                  {/* Detalhes do Paciente & Queixa */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-zinc-900/60 p-2.5 rounded-lg">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">WhatsApp</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                        {ag.telefone || 'Não informado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Procedimento</span>
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {ag.tipo}
                      </span>
                    </div>
                    <div className="col-span-2 mt-1 pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Queixa Anotada</span>
                      <p className="text-slate-700 dark:text-zinc-300 italic text-[11px]">
                        "{ag.observacoes || 'Exame preventivo / refração de rotina.'}"
                      </p>
                    </div>
                  </div>

                  {/* Histórico Clínico Prévio */}
                  <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-lg text-xs space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <Glasses className="w-3 h-3" /> Histórico Óptico Anterior
                    </span>
                    {hist?.ultimaReceita ? (
                      <div className="font-mono text-[11px] text-slate-700 dark:text-zinc-300">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Último exame: {new Date(hist.ultimaReceita.data_emissao).toLocaleDateString('pt-BR')}
                        </span>
                        <div className="grid grid-cols-2 gap-1 text-[10px] mt-0.5">
                          <span>OD: {hist.ultimaReceita.od_longe.esferico > 0 ? '+' : ''}{hist.ultimaReceita.od_longe.esferico.toFixed(2)} Cil {hist.ultimaReceita.od_longe.cilindrico.toFixed(2)} {hist.ultimaReceita.od_longe.eixo}°</span>
                          <span>OE: {hist.ultimaReceita.oe_longe.esferico > 0 ? '+' : ''}{hist.ultimaReceita.oe_longe.esferico.toFixed(2)} Cil {hist.ultimaReceita.oe_longe.cilindrico.toFixed(2)} {hist.ultimaReceita.oe_longe.eixo}°</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 block">
                        Primeira consulta registrada no sistema (Sem histórico prévio).
                      </span>
                    )}
                  </div>

                  {/* Ações do Gabinete Clínico */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      onClick={() => {
                        setAgendamentoSelecionadoFicha(ag);
                        setIsModalFichaOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#0284C7]" /> Ver Ficha Completa
                    </button>

                    <div className="flex items-center gap-1.5">
                      {ag.status !== 'EM_ATENDIMENTO' && ag.status !== 'CONCLUIDO' && (
                        <button
                          onClick={() => {
                            atualizarStatusAgendamento(ag.id, 'EM_ATENDIMENTO');
                            setMensagemAlerta(`Paciente ${ag.paciente_nome} chamado para a sala de exame!`);
                            setTimeout(() => setMensagemAlerta(null), 3000);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                        >
                          <Activity className="w-3.5 h-3.5" /> Chamar
                        </button>
                      )}

                      {ag.status !== 'CONCLUIDO' ? (
                        <button
                          onClick={() => {
                            atualizarStatusAgendamento(ag.id, 'CONCLUIDO');
                            setMensagemAlerta(`Consulta de ${ag.paciente_nome} concluída com sucesso!`);
                            setTimeout(() => setMensagemAlerta(null), 3000);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Concluir Exame
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" /> Exame Concluído
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}

            {agendamentosFiltrados.length === 0 && (
              <div className="col-span-2 py-12 text-center text-slate-400 text-xs bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-xl">
                Nenhum paciente agendado no momento para esta data.<br />
                Os novos agendamentos aparecerão automaticamente nesta fila.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: NOVO AGENDAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs my-6 animate-in zoom-in-95">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  Novo Agendamento Clínico
                </h3>
                <p className="text-[11px] text-slate-500">
                  Agende a consulta e dispare a ficha completa diretamente no WhatsApp do médico.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5">
              
              {/* Seleção Rápida de Paciente Cadastrado */}
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Buscar Paciente Cadastrado:
                </label>
                <select
                  value={clienteSelecionadoId}
                  onChange={e => handleSelecionarCliente(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-600"
                >
                  <option value="">(Digitar manualmente novo paciente ou selecionar abaixo...)</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      👤 {c.nome} • {c.whatsapp || c.telefone || 'Sem telefone'} ({c.cidade || 'Morada Nova'}) {c.cpf ? `• CPF: ${c.cpf}` : ''}
                    </option>
                  ))}
                </select>
                {clienteSelecionadoId && (
                  <div className="p-2.5 mt-2 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Paciente vinculado à base de cadastros!
                    </span>
                    <span className="text-[10px] font-mono font-semibold">
                      {receitas.filter(r => r.cliente_id === clienteSelecionadoId).length} receitas no histórico
                    </span>
                  </div>
                )}
              </div>

              {/* Nome do Paciente */}
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Nome Completo do Paciente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do paciente..."
                  value={pacienteNome}
                  onChange={e => {
                    setPacienteNome(e.target.value);
                    if (clienteSelecionadoId) setClienteSelecionadoId('');
                  }}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-600"
                />
              </div>

              {/* WhatsApp + CPF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                    WhatsApp / Telefone do Paciente *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(88) 98888-0000"
                    value={pacienteTel}
                    onChange={e => setPacienteTel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                    CPF (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={pacienteCpf}
                    onChange={e => setPacienteCpf(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Seleção do Médico / Optometrista Prescritor */}
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Profissional / Prescritor Responsável *
                </label>
                <select
                  value={profissionalId}
                  onChange={e => handleSelecionarProfissional(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-600"
                >
                  {todosProfissionais.map(p => (
                    <option key={p.id} value={p.id}>
                      🩺 {p.nome} • {p.cargo} ({p.registro}) {p.telefone ? `• Zap: ${p.telefone}` : ''}
                    </option>
                  ))}
                  {todosProfissionais.length === 0 && (
                    <option value="">Optometrista Responsável da Ótica</option>
                  )}
                </select>
              </div>

              {/* Data & Horário */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">Data da Consulta *</label>
                  <input
                    type="date"
                    required
                    value={data}
                    onChange={e => setData(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">Horário *</label>
                  <input
                    type="time"
                    required
                    value={horario}
                    onChange={e => setHorario(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Procedimento */}
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">Tipo de Exame / Consulta</label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-600"
                >
                  <option value="Exame de Vista / Refração Completa">Exame de Vista / Refração Completa</option>
                  <option value="Adaptação de Lentes de Contato">Adaptação de Lentes de Contato</option>
                  <option value="Retorno de Prescrição / Ajuste">Retorno de Prescrição / Ajuste</option>
                  <option value="Avaliação de Lentes Multifocais">Avaliação de Lentes Multifocais</option>
                  <option value="Medição de Acuidade & Tonometria">Medição de Acuidade & Tonometria</option>
                </select>
              </div>

              {/* Motivo / Queixa Principal */}
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Queixa Principal / Motivo Relatado pelo Paciente
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Queixa de visão embaçada para perto, dores de cabeça ao ler, deseja trocar os óculos antigos..."
                  value={observacoesQueixa}
                  onChange={e => setObservacoesQueixa(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-600"
                />
              </div>

              {/* Checkbox: Notificar Médico no WhatsApp */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="notificarZapAgendamento"
                  checked={notificarZap}
                  onChange={e => setNotificarZap(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5"
                />
                <label htmlFor="notificarZapAgendamento" className="text-[11px] text-blue-950 dark:text-blue-200 leading-tight cursor-pointer font-medium">
                  <strong>📲 Enviar notificação imediata com ficha completa para o WhatsApp do Médico</strong>
                  <span className="block text-blue-700 dark:text-blue-400 text-[10px] mt-0.5">
                    Dispara automaticamente o nome, horário, queixa e histórico anterior de graus OD/OE para o profissional.
                  </span>
                </label>
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0284C7] hover:bg-sky-700 text-white rounded-lg font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Agendar & Notificar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FICHA CLÍNICA DETALHADA DO PACIENTE */}
      {isModalFichaOpen && agendamentoSelecionadoFicha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 text-xs my-6 animate-in zoom-in-95">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#0284C7]" />
                  Ficha Clínica: {agendamentoSelecionadoFicha.paciente_nome}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Prontuário de atendimento, histórico de refrações e anamnese.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalFichaOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Informações Cadastrais */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Nome do Paciente</span>
                <span className="font-bold text-slate-900 dark:text-white">{agendamentoSelecionadoFicha.paciente_nome}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">WhatsApp / Contato</span>
                <span className="font-mono font-bold text-blue-600">{agendamentoSelecionadoFicha.telefone}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Data & Horário</span>
                <span className="font-mono text-slate-700 dark:text-zinc-200">
                  {agendamentoSelecionadoFicha.data} às {agendamentoSelecionadoFicha.horario}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Profissional</span>
                <span className="text-slate-700 dark:text-zinc-200">{agendamentoSelecionadoFicha.profissional}</span>
              </div>
            </div>

            {/* Queixa Principal */}
            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Queixa Principal & Observações:
              </span>
              <p className="text-slate-800 dark:text-zinc-200 italic font-medium">
                "{agendamentoSelecionadoFicha.observacoes || 'Exame preventivo de rotina.'}"
              </p>
            </div>

            {/* Histórico de Receitas Ópticas Anteriores */}
            <div className="space-y-2">
              <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs flex items-center gap-1.5">
                <Glasses className="w-4 h-4 text-blue-600" /> Histórico de Receitas Ópticas Registradas:
              </span>

              {(() => {
                const hist = getHistoricoPaciente(agendamentoSelecionadoFicha.cliente_id);
                const recs = hist?.receitas || [];

                if (recs.length === 0) {
                  return (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-center text-slate-400">
                      Nenhuma receita anterior encontrada para este paciente.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {recs.map(r => (
                      <div key={r.id} className="p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                          <span>Emissão: {new Date(r.data_emissao).toLocaleDateString('pt-BR')}</span>
                          <span>Dr(a): {r.medico_prescritor}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                          <div className="p-1.5 bg-white dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-700">
                            <strong>OD:</strong> {r.od_longe.esferico > 0 ? '+' : ''}{r.od_longe.esferico.toFixed(2)} Cil {r.od_longe.cilindrico.toFixed(2)} Eixo {r.od_longe.eixo}°
                          </div>
                          <div className="p-1.5 bg-white dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-700">
                            <strong>OE:</strong> {r.oe_longe.esferico > 0 ? '+' : ''}{r.oe_longe.esferico.toFixed(2)} Cil {r.oe_longe.cilindrico.toFixed(2)} Eixo {r.oe_longe.eixo}°
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Ações da Ficha */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => handleDispararNotificacaoManual(agendamentoSelecionadoFicha.id)}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg font-bold flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" /> Reenviar no WhatsApp do Dr(a)
              </button>

              <button
                type="button"
                onClick={() => setIsModalFichaOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg font-bold"
              >
                Fechar Ficha
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
