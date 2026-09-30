import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Plus, Phone, CheckCircle, Eye } from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Badge } from '../components/common/Badge';

export const Agenda: React.FC = () => {
  const { clientes } = useAuthAndTenant();

  const [agendamentos, setAgendamentos] = useState<any[]>(() => {
    const saved = localStorage.getItem('opticsys_agenda');
    return saved ? JSON.parse(saved) : [];
  });

  React.useEffect(() => {
    localStorage.setItem('opticsys_agenda', JSON.stringify(agendamentos));
  }, [agendamentos]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState('');
  const [pacienteNome, setPacienteNome] = useState('');
  const [tel, setTel] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('10:00');
  const [tipo, setTipo] = useState('Exame de Vista / Refração');

  const handleSelecionarCliente = (id: string) => {
    setClienteSelecionadoId(id);
    if (!id) {
      setPacienteNome('');
      setTel('');
      return;
    }
    const cli = clientes.find(c => c.id === id);
    if (cli) {
      setPacienteNome(cli.nome);
      setTel(cli.whatsapp || cli.telefone || '');
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteNome.trim()) {
      alert('Informe o nome do paciente.');
      return;
    }
    setAgendamentos(prev => [
      ...prev,
      {
        id: `ag-${Date.now()}`,
        cliente_id: clienteSelecionadoId || undefined,
        paciente_nome: pacienteNome.trim(),
        telefone: tel.trim(),
        data,
        horario,
        profissional: 'Dra. Vanessa Lima (Optometrista)',
        tipo,
        status: 'CONFIRMADO'
      }
    ]);
    setIsModalOpen(false);
    setClienteSelecionadoId('');
    setPacienteNome('');
    setTel('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 p-6 rounded-lg shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" /> Agenda de Consultas & Exames
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Agendamentos de refração, optometria e consultas oftalmológicas na ótica.
          </p>
        </div>
        <button
          onClick={() => {
            setClienteSelecionadoId('');
            setPacienteNome('');
            setTel('');
            setIsModalOpen(true);
          }}
          className="neo-button-primary !py-2 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Novo Agendamento
        </button>
      </div>

      <div className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 font-semibold border-y border-slate-200 dark:border-zinc-800">
            <tr>
              <th className="py-2.5 px-3">Horário</th>
              <th className="py-2.5 px-3">Paciente</th>
              <th className="py-2.5 px-3">Telefone</th>
              <th className="py-2.5 px-3">Profissional</th>
              <th className="py-2.5 px-3">Procedimento</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {agendamentos.map(ag => (
              <tr key={ag.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                <td className="py-3 px-3 font-mono font-bold text-blue-600">
                  {ag.data} às {ag.horario}
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900 dark:text-zinc-100">
                  {ag.paciente_nome}
                </td>
                <td className="py-3 px-3 font-mono text-slate-500">{ag.telefone}</td>
                <td className="py-3 px-3 text-slate-700 dark:text-zinc-300">{ag.profissional}</td>
                <td className="py-3 px-3">{ag.tipo}</td>
                <td className="py-3 px-3">
                  <Badge variant={ag.status === 'CONFIRMADO' ? 'success' : 'warning'}>
                    {ag.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {agendamentos.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Nenhuma consulta agendada. Clique em <strong>"Novo Agendamento"</strong> para agendar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Novo Agendamento
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3.5 text-xs">
              {/* Seleção de Paciente Cadastrado */}
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Buscar Paciente Cadastrado:
                </label>
                <select
                  value={clienteSelecionadoId}
                  onChange={e => handleSelecionarCliente(e.target.value)}
                  className="neo-select w-full font-semibold"
                >
                  <option value="">(Digitar manualmente ou selecionar abaixo...)</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      👤 {c.nome} • {c.whatsapp || c.telefone || 'Sem telefone'} ({c.cidade || 'Sem cidade'})
                    </option>
                  ))}
                </select>
                {clienteSelecionadoId && (
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                    ✓ Paciente selecionado da base de cadastros!
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Nome do Paciente *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do paciente..."
                  value={pacienteNome}
                  onChange={e => {
                    setPacienteNome(e.target.value);
                    if (clienteSelecionadoId) setClienteSelecionadoId('');
                  }}
                  className="neo-input"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="(88) 98888-0000"
                  value={tel}
                  onChange={e => setTel(e.target.value)}
                  className="neo-input font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">Data *</label>
                  <input
                    type="date"
                    required
                    value={data}
                    onChange={e => setData(e.target.value)}
                    className="neo-input font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">Horário *</label>
                  <input
                    type="time"
                    required
                    value={horario}
                    onChange={e => setHorario(e.target.value)}
                    className="neo-input font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-zinc-300">Tipo de Consulta</label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="neo-select"
                >
                  <option value="Exame de Vista / Refração">Exame de Vista / Refração</option>
                  <option value="Adaptação de Lentes de Contato">Adaptação de Lentes de Contato</option>
                  <option value="Retorno de Prescrição">Retorno de Prescrição</option>
                  <option value="Avaliação de Multifocais">Avaliação de Multifocais</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="neo-button-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="neo-button-primary"
                >
                  Agendar Consulta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
