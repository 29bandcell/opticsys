import React, { useState } from 'react';
import { FlaskConical, Phone, Mail, Clock, Plus, X, Check } from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Badge } from '../components/common/Badge';

export const Laboratorios: React.FC = () => {
  const { laboratorios, ordensServico, adicionarLaboratorio } = useAuthAndTenant();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [prazoMedioDias, setPrazoMedioDias] = useState<number>(3);
  const [tabelaPrecosResumo, setTabelaPrecosResumo] = useState('');

  const handleSalvar = (e: React.FormEvent) => {
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-600" /> Laboratórios de Surfaçagem & Montagem
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Monitoramento de pedidos enviados para laboratórios parceiros da sua ótica.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="neo-button-primary flex items-center gap-2 self-start sm:self-auto !py-2.5 text-xs font-bold"
        >
          <Plus className="w-4 h-4" /> Novo Laboratório
        </button>
      </div>

      {/* Grid de Laboratórios Cadastrados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {laboratorios.map(lab => {
          const pedidosAtivos = ordensServico.filter(
            os => os.laboratorio_id === lab.id && os.status !== 'ENTREGUE' && os.status !== 'CANCELADA'
          );

          return (
            <div
              key={lab.id}
              className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4 hover:border-purple-500 transition-all"
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

              <div className="bg-slate-50 dark:bg-zinc-900 p-2.5 rounded border border-slate-200 dark:border-zinc-800 text-[11px]">
                <strong className="block text-slate-700 dark:text-zinc-300 mb-1">Tabela de Lentes Suportadas:</strong>
                <p className="text-slate-500">{lab.tabela_precos_resumo}</p>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800 pt-3">
                <h4 className="text-[11px] font-bold uppercase text-slate-700 dark:text-zinc-300 mb-2">
                  Pedidos Recentes Neste Laboratório:
                </h4>
                <div className="space-y-1.5">
                  {pedidosAtivos.slice(0, 3).map(os => (
                    <div key={os.id} className="flex justify-between items-center text-[11px] font-mono p-1.5 bg-purple-50/50 dark:bg-purple-950/30 rounded">
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
      </div>

      {laboratorios.length === 0 && (
        <div className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-lg p-10 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center mx-auto text-purple-600">
            <FlaskConical className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Nenhum laboratório cadastrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cadastre os laboratórios de surfaçagem e montagem parceiros da sua ótica para poder selecioná-los ao emitir as Ordens de Serviço.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="neo-button-primary inline-flex items-center gap-2 !py-2 text-xs font-bold"
          >
            <Plus className="w-4 h-4" /> Cadastrar Primeiro Laboratório
          </button>
        </div>
      )}

      {/* Modal de Cadastro de Laboratório */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            
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
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-3.5 text-xs">
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
                  className="neo-input"
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
                    className="neo-input"
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
                    className="neo-input font-mono"
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
                    className="neo-input font-mono"
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
                    className="neo-input"
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
                  className="neo-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="neo-button-secondary !py-2 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="neo-button-primary !py-2 text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Salvar Laboratório
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
