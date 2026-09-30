import React, { useState } from 'react';
import { 
  FlaskConical, 
  Phone, 
  Mail, 
  Clock, 
  Plus, 
  X, 
  Check, 
  RotateCcw, 
  AlertTriangle, 
  DollarSign, 
  UserCheck, 
  Building2, 
  Calendar 
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Badge } from '../components/common/Badge';
import { MotivoRefacaoOS, RefacaoOS } from '../types';

export const Laboratorios: React.FC = () => {
  const { 
    laboratorios, 
    ordensServico, 
    adicionarLaboratorio,
    refacoesOS,
    adicionarRefacaoOS,
    atualizarStatusRefacao 
  } = useAuthAndTenant();

  const [abaAtiva, setAbaAtiva] = useState<'LABORATORIOS' | 'REFACOES'>('LABORATORIOS');

  // Modal Laboratório
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [prazoMedioDias, setPrazoMedioDias] = useState<number>(3);
  const [tabelaPrecosResumo, setTabelaPrecosResumo] = useState('');

  // Modal Refação
  const [modalRefacaoOpen, setModalRefacaoOpen] = useState(false);
  const [osSelecionadaId, setOsSelecionadaId] = useState('');
  const [laboratorioRefacaoId, setLaboratorioRefacaoId] = useState('');
  const [motivoRefacao, setMotivoRefacao] = useState<MotivoRefacaoOS>('ERRO_MONTAGEM_LABORATORIO');
  const [responsavelCusto, setResponsavelCusto] = useState<'OTICA' | 'LABORATORIO' | 'CLIENTE'>('LABORATORIO');
  const [custoRefacao, setCustoRefacao] = useState('0.00');
  const [dataPrevistaReentrega, setDataPrevistaReentrega] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [obsRefacao, setObsRefacao] = useState('');

  const handleSalvarLab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    adicionarLaboratorio({
      nome: nome.trim(),
      contato: contato.trim() || 'Atendimento / Expedição',
      telefone: telefone.trim() || 'Não informado',
      email: email.trim() || 'Não informado',
      prazo_medio_dias: Number(prazoMedioDias) || 3,
      tabela_precos_resumo: tabelaPrecosResumo.trim() || 'Lentes Monofocais e Multifocais'
    });

    setIsModalOpen(false);
    setNome('');
    setContato('');
    setTelefone('');
    setEmail('');
    setPrazoMedioDias(3);
    setTabelaPrecosResumo('');
  };

  const handleCriarRefacao = (e: React.FormEvent) => {
    e.preventDefault();
    const os = ordensServico.find(o => o.id === osSelecionadaId);
    if (!os) {
      alert('Selecione uma Ordem de Serviço válida.');
      return;
    }

    const lab = laboratorios.find(l => l.id === laboratorioRefacaoId) || (os.laboratorio_id ? laboratorios.find(l => l.id === os.laboratorio_id) : undefined);

    adicionarRefacaoOS({
      os_id: os.id,
      numero_os: os.numero_os,
      cliente_nome: os.cliente_nome,
      laboratorio_id: lab?.id,
      laboratorio_nome: lab?.nome || os.laboratorio_nome || 'Laboratório Não Definido',
      motivo: motivoRefacao,
      responsavel_custo: responsavelCusto,
      custo_refacao: parseFloat(custoRefacao) || 0,
      data_prevista_reentrega: dataPrevistaReentrega,
      observacoes: obsRefacao
    });

    setModalRefacaoOpen(false);
    setOsSelecionadaId('');
    setLaboratorioRefacaoId('');
    setCustoRefacao('0.00');
    setObsRefacao('');
    alert(`Refação para a O.S. #${os.numero_os} registrada com sucesso!`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-navegação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 p-5 rounded-xl shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-600" /> Laboratórios & Controle de Refações
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Monitoramento de produção, pedidos de lentes e retrabalhos técnicos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {abaAtiva === 'LABORATORIOS' ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Novo Laboratório
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModalRefacaoOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Abrir Refação / Retrabalho
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/80 dark:bg-zinc-800/80 p-1 rounded-xl text-xs font-bold gap-1 w-full sm:w-fit">
        <button
          onClick={() => setAbaAtiva('LABORATORIOS')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            abaAtiva === 'LABORATORIOS'
              ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-purple-600" />
          <span>Laboratórios ({laboratorios.length})</span>
        </button>

        <button
          onClick={() => setAbaAtiva('REFACOES')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            abaAtiva === 'REFACOES'
              ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400'
          }`}
        >
          <RotateCcw className="w-4 h-4 text-amber-600" />
          <span>Refações & Retrabalhos ({refacoesOS.length})</span>
        </button>
      </div>

      {/* Conteúdo Aba 1: Laboratórios */}
      {abaAtiva === 'LABORATORIOS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {laboratorios.map(lab => {
            const pedidosAtivos = ordensServico.filter(
              os => os.laboratorio_id === lab.id && os.status !== 'ENTREGUE' && os.status !== 'CANCELADA'
            );

            return (
              <div
                key={lab.id}
                className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4 hover:border-purple-500 transition-all"
              >
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-zinc-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-zinc-100">
                      {lab.nome}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">Contato: {lab.contato}</span>
                  </div>
                  <Badge variant="purple">
                    {pedidosAtivos.length} em produção
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    <span>{lab.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-purple-600" />
                    <span>{lab.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Prazo Médio: <strong>{lab.prazo_medio_dias} dias úteis</strong></span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px]">
                  <strong className="block text-slate-700 dark:text-zinc-300 mb-1">Tabela de Lentes Suportadas:</strong>
                  <p className="text-slate-500">{lab.tabela_precos_resumo}</p>
                </div>

                <div className="border-t border-slate-100 dark:border-zinc-800 pt-3">
                  <h4 className="text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300 mb-2">
                    Pedidos Recentes Neste Laboratório:
                  </h4>
                  <div className="space-y-1.5">
                    {pedidosAtivos.slice(0, 3).map(os => (
                      <div key={os.id} className="flex justify-between items-center text-[11px] font-mono p-1.5 bg-purple-50/50 dark:bg-purple-950/30 rounded-lg">
                        <span className="font-bold text-slate-800 dark:text-zinc-200">O.S. #{os.numero_os}</span>
                        <span className="text-purple-700 dark:text-purple-300 font-semibold">{os.status}</span>
                      </div>
                    ))}
                    {pedidosAtivos.length === 0 && (
                      <span className="text-slate-400 text-[11px] italic">Nenhum pedido em aberto.</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}

          {laboratorios.length === 0 && (
            <div className="col-span-3 bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center mx-auto text-purple-600">
                <FlaskConical className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Nenhum laboratório cadastrado</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Cadastre os laboratórios parceiros da sua ótica para vincular pedidos e controlar refações.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Cadastrar Primeiro Laboratório
              </button>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo Aba 2: Refações & Retrabalhos */}
      {abaAtiva === 'REFACOES' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 font-bold text-slate-600 dark:text-zinc-400">
                  <tr>
                    <th className="p-3">O.S. / Paciente</th>
                    <th className="p-3">Laboratório</th>
                    <th className="p-3">Motivo da Refação</th>
                    <th className="p-3">Responsável Custo</th>
                    <th className="p-3">Custo (R$)</th>
                    <th className="p-3">Previsão Reentrega</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {refacoesOS.map(ref => (
                    <tr key={ref.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 font-mono">
                      <td className="p-3">
                        <strong className="text-slate-900 dark:text-zinc-100 block">O.S. #{ref.numero_os}</strong>
                        <span className="text-[11px] text-slate-500 font-sans">{ref.cliente_nome}</span>
                      </td>
                      <td className="p-3 font-sans text-slate-800 dark:text-zinc-200">
                        {ref.laboratorio_nome || 'Laboratório Interno'}
                      </td>
                      <td className="p-3 font-sans">
                        <span className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">
                          {ref.motivo.replace(/_/g, ' ')}
                        </span>
                        {ref.observacoes && (
                          <p className="text-[10px] text-slate-400 mt-0.5 italic">{ref.observacoes}</p>
                        )}
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          ref.responsavel_custo === 'LABORATORIO'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : ref.responsavel_custo === 'OTICA'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {ref.responsavel_custo}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-zinc-100">
                        R$ {ref.custo_refacao.toFixed(2)}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-zinc-400">
                        {ref.data_prevista_reentrega}
                      </td>
                      <td className="p-3 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ref.status === 'CONCLUIDA'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : ref.status === 'EM_PROCESSO'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          {ref.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {ref.status !== 'CONCLUIDA' && (
                          <button
                            onClick={() => atualizarStatusRefacao(ref.id, ref.status === 'PENDENTE_ENVIO' ? 'EM_PROCESSO' : 'CONCLUIDA')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded cursor-pointer"
                          >
                            {ref.status === 'PENDENTE_ENVIO' ? 'Marcar em Produção' : 'Concluir Refação'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {refacoesOS.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        Nenhuma refação ou retrabalho técnico registrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Laboratório */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Novo Laboratório de Montagem</h3>
                  <p className="text-[11px] text-slate-400">Cadastre o laboratório parceiro para envio de envelopes de O.S.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarLab} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Nome do Laboratório / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Essilor Digital Lab, Zeiss Vision, Lab Óptico Regional..."
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                    Pessoa de Contato / Expedição
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Marcos (Expedição) / Patrícia"
                    value={contato}
                    onChange={e => setContato(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                    Prazo Médio de Retorno (Dias Úteis) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={prazoMedioDias}
                    onChange={e => setPrazoMedioDias(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(88) 98888-0000"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                    E-mail para Pedidos / Envelopes
                  </label>
                  <input
                    type="email"
                    placeholder="pedidos@laboratorio.com.br"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Tabela de Lentes Suportadas / Resumo
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Varilux Comfort, Physio, Eyezen + Tratamento Crizal Rock / Antirreflexo Premium..."
                  value={tabelaPrecosResumo}
                  onChange={e => setTabelaPrecosResumo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Salvar Laboratório
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal de Abertura de Refação */}
      {modalRefacaoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Registrar Refação de O.S.</h3>
                  <p className="text-[11px] text-slate-400">Controle técnico de erros, retrabalho e responsável pelo custo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalRefacaoOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCriarRefacao} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Selecione a Ordem de Serviço (O.S.) *
                </label>
                <select
                  required
                  value={osSelecionadaId}
                  onChange={e => setOsSelecionadaId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs"
                >
                  <option value="">Selecione uma O.S...</option>
                  {ordensServico.map(os => (
                    <option key={os.id} value={os.id}>
                      O.S. #{os.numero_os} - {os.cliente_nome} ({os.lente_descricao})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                    Motivo da Refação *
                  </label>
                  <select
                    value={motivoRefacao}
                    onChange={e => setMotivoRefacao(e.target.value as MotivoRefacaoOS)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs"
                  >
                    <option value="ERRO_MONTAGEM_LABORATORIO">Erro de Montagem / Laboratório</option>
                    <option value="DEFEITO_BLOCO_LENTE">Defeito no Bloco / Lente Riscou</option>
                    <option value="EIXO_DESALINHADO">Eixo Astigmatismo Desalinhado</option>
                    <option value="ALTURA_DNP_INCORRETA">Altura / DNP Incorreta</option>
                    <option value="ERRO_DIOPTRIA_RECEITA">Erro de Dioptria da Receita</option>
                    <option value="INSATISFACAO_PACIENTE">Não Adaptação do Paciente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                    Responsável pelo Custo *
                  </label>
                  <select
                    value={responsavelCusto}
                    onChange={e => setResponsavelCusto(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs font-bold"
                  >
                    <option value="LABORATORIO">Garantia Laboratório (Sem custo para ótica)</option>
                    <option value="OTICA">Custo da Ótica</option>
                    <option value="CLIENTE">Cobrado do Cliente / Paciente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                    Custo da Refação (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={custoRefacao}
                    onChange={e => setCustoRefacao(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                    Previsão de Reentrega *
                  </label>
                  <input
                    type="date"
                    required
                    value={dataPrevistaReentrega}
                    onChange={e => setDataPrevistaReentrega(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Descrição do Problema / Observações Técnicas
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva o que ocorreu e o procedimento acordado..."
                  value={obsRefacao}
                  onChange={e => setObsRefacao(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalRefacaoOpen(false)}
                  className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg text-xs flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> Registrar Refação
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

