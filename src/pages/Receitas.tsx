import React, { useState } from 'react';
import { 
  Eye, 
  Plus, 
  Search, 
  Calendar, 
  User, 
  Send, 
  CheckCircle, 
  AlertCircle,
  FileCheck,
  Camera
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { PrescricaoGrade } from '../components/optica/PrescricaoGrade';
import { ReceitaOptica } from '../types';
import { Badge } from '../components/common/Badge';
import { PupilometroDigitalModal } from '../components/common/PupilometroDigitalModal';

export const Receitas: React.FC = () => {
  const { receitas, clientes, adicionarReceita, medicos } = useAuthAndTenant();
  
  const [busca, setBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPupilometroOpen, setIsPupilometroOpen] = useState(false);
  const [receitaVisualizando, setReceitaVisualizando] = useState<ReceitaOptica | null>(null);

  // Form State para nova receita
  const [novoClienteId, setNovoClienteId] = useState(clientes[0]?.id || '');
  const [medico, setMedico] = useState('');
  const [registro, setRegistro] = useState('');
  const [tipoPrescritor, setTipoPrescritor] = useState<'OFTALMOLOGISTA' | 'OPTOMETRISTA'>('OFTALMOLOGISTA');
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  const [tipoLente, setTipoLente] = useState<'MONOFOCAL' | 'BIFOCAL' | 'MULTIFOCAL'>('MONOFOCAL');
  const [observacoes, setObservacoes] = useState('');

  // Graus OD e OE
  const [graus, setGraus] = useState({
    od_esferico: 0.00,
    od_cilindrico: 0.00,
    od_eixo: 0,
    od_dnp: 31.5,
    od_altura: 19.0,
    oe_esferico: 0.00,
    oe_cilindrico: 0.00,
    oe_eixo: 0,
    oe_dnp: 31.5,
    oe_altura: 19.0,
    adicao: 0.00
  });

  const handleGrauChange = (field: string, value: number) => {
    setGraus(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cliente = clientes.find(c => c.id === novoClienteId);
    if (!cliente || !medico) {
      alert('Selecione o paciente e informe o médico prescritor.');
      return;
    }

    const dataValidade = new Date(dataEmissao);
    dataValidade.setFullYear(dataValidade.getFullYear() + 1);

    const rec = adicionarReceita({
      cliente_id: cliente.id,
      cliente_nome: cliente.nome,
      medico_prescritor: medico,
      registro_profissional: registro || 'CRM / CROO',
      tipo_prescritor: tipoPrescritor,
      data_emissao: dataEmissao,
      data_validade: dataValidade.toISOString().split('T')[0],
      od_longe: {
        esferico: graus.od_esferico,
        cilindrico: graus.od_cilindrico,
        eixo: graus.od_eixo,
        dnp: graus.od_dnp,
        altura: graus.od_altura
      },
      oe_longe: {
        esferico: graus.oe_esferico,
        cilindrico: graus.oe_cilindrico,
        eixo: graus.oe_eixo,
        dnp: graus.oe_dnp,
        altura: graus.oe_altura
      },
      adicao: graus.adicao,
      tipo_lente_sugerida: tipoLente,
      observacoes
    });

    setIsModalOpen(false);
    setReceitaVisualizando(rec);
  };

  const handleWhatsAppAviso = (rec: ReceitaOptica) => {
    const cliente = clientes.find(c => c.id === rec.cliente_id);
    if (!cliente) return;
    const fone = cliente.telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(
      `Olá, ${cliente.nome}! Passando para lembrar que sua última receita oftalmológica prescreveu há quase 1 ano.\n` +
      `Para a saúde da sua visão, é recomendado realizar um exame preventivo anual. Agende com seu oftalmologista e venha conferir as novas armações!`
    );
    window.open(`https://wa.me/55${fone}?text=${mensagem}`, '_blank');
  };

  const receitasFiltradas = receitas.filter(r => 
    (r.cliente_nome && r.cliente_nome.toLowerCase().includes(busca.toLowerCase())) ||
    r.medico_prescritor.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" /> Receitas & Prescrições Ópticas
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Grade médica com Esférico, Cilíndrico, Eixo, DNP, Altura de Montagem e Adição.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsPupilometroOpen(true)}
            className="px-3.5 py-2 text-xs font-bold bg-[#0284C7] hover:bg-sky-600 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" /> Pupilômetro Digital
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="neo-button-primary !py-2 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Cadastrar Nova Receita
          </button>
        </div>
      </div>

      {/* Lista de Receitas e Visualizador */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Lista */}
        <div className="lg:col-span-2 bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar receita por nome do paciente ou médico..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="neo-input !pl-9"
            />
          </div>

          <div className="space-y-3">
            {receitasFiltradas.map(r => {
              const isSelected = receitaVisualizando?.id === r.id;
              
              return (
                <div
                  key={r.id}
                  onClick={() => setReceitaVisualizando(r)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30' 
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                        {r.cliente_nome}
                      </span>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Prescritor: {r.medico_prescritor} ({r.registro_profissional})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-mono text-slate-500">
                        Emissão: {new Date(r.data_emissao).toLocaleDateString('pt-BR')}
                      </span>
                      <div className="mt-1">
                        <Badge variant="info">{r.tipo_lente_sugerida || 'MONOFOCAL'}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Resumo rápido do grau */}
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-zinc-300">
                      OD: <strong>{r.od_longe.esferico > 0 ? `+${r.od_longe.esferico}` : r.od_longe.esferico}</strong> (Cil {r.od_longe.cilindrico} Eixo {r.od_longe.eixo}°)
                    </span>
                    <span className="text-slate-600 dark:text-zinc-300">
                      OE: <strong>{r.oe_longe.esferico > 0 ? `+${r.oe_longe.esferico}` : r.oe_longe.esferico}</strong> (Cil {r.oe_longe.cilindrico} Eixo {r.oe_longe.eixo}°)
                    </span>
                    {r.adicao ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        ADD: +{Number(r.adicao).toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Coluna 3: Visualizador da Grade de Grau */}
        <div className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
          {receitaVisualizando ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prescrição Médica</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 mt-0.5">
                  {receitaVisualizando.cliente_nome}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Médico: {receitaVisualizando.medico_prescritor} | {receitaVisualizando.registro_profissional}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-zinc-300 mb-2">
                  Dioptria & Medições
                </h4>
                <PrescricaoGrade receita={receitaVisualizando} readOnly={true} />
              </div>

              {receitaVisualizando.observacoes && (
                <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded border border-slate-200 dark:border-zinc-800 text-xs">
                  <span className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Recomendações do Médico:</span>
                  <p className="text-slate-600 dark:text-zinc-400">{receitaVisualizando.observacoes}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 space-y-2">
                <button
                  onClick={() => handleWhatsAppAviso(receitaVisualizando)}
                  className="w-full neo-button-secondary !py-2 text-xs flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" /> Enviar Mensagem de Retorno (WhatsApp)
                </button>
              </div>

            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <Eye className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-xs">Selecione uma receita na lista para visualizar a grade completa de dioptria.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Nova Receita */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-lg shadow-2xl w-full max-w-2xl p-6 space-y-4 my-8">
            
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" /> Cadastrar Prescrição Oftalmológica
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Paciente / Cliente *</label>
                  <select
                    value={novoClienteId}
                    onChange={e => setNovoClienteId(e.target.value)}
                    className="neo-select"
                    required
                  >
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nome} ({c.cpf || c.telefone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Data da Receita *</label>
                  <input
                    type="date"
                    required
                    value={dataEmissao}
                    onChange={e => setDataEmissao(e.target.value)}
                    className="neo-input"
                  />
                </div>
              </div>

              {/* Seletor Rápido de Prescritor Cadastrado */}
              {medicos.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Selecionar Prescritor Cadastrado:
                  </label>
                  <select
                    onChange={e => {
                      const m = medicos.find(med => med.id === e.target.value);
                      if (m) {
                        setMedico(m.nome);
                        setRegistro(m.registro);
                        setTipoPrescritor(m.tipo);
                      }
                    }}
                    className="neo-select w-full font-semibold"
                  >
                    <option value="">(Digitar manualmente abaixo ou selecionar da lista...)</option>
                    {medicos.map(m => (
                      <option key={m.id} value={m.id}>
                        🩺 {m.nome} • {m.tipo === 'OPTOMETRISTA' ? 'Optometrista' : 'Oftalmologista'} ({m.registro})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Médico / Optometrista *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr(a). Nome do Médico"
                    value={medico}
                    onChange={e => setMedico(e.target.value)}
                    className="neo-input"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Registro (CRM / CROO)</label>
                  <input
                    type="text"
                    placeholder="CRM-CE 12345 / CROO"
                    value={registro}
                    onChange={e => setRegistro(e.target.value)}
                    className="neo-input font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Tipo de Prescritor</label>
                  <select
                    value={tipoPrescritor}
                    onChange={e => setTipoPrescritor(e.target.value as any)}
                    className="neo-select"
                  >
                    <option value="OPTOMETRISTA">Optometrista</option>
                    <option value="OFTALMOLOGISTA">Oftalmologista</option>
                  </select>
                </div>
              </div>

              {/* Grade de Graus Editável */}
              <div className="border border-slate-300 dark:border-zinc-700 p-3 rounded-md space-y-2 bg-slate-50 dark:bg-zinc-900/40">
                <span className="font-bold text-slate-800 dark:text-zinc-200 block text-[11px] uppercase tracking-wider">
                  Preenchimento da Grade de Graus (OD / OE)
                </span>
                <PrescricaoGrade
                  readOnly={false}
                  values={graus}
                  onChange={handleGrauChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Design de Lente Recomendado</label>
                  <select
                    value={tipoLente}
                    onChange={e => setTipoLente(e.target.value as any)}
                    className="neo-select"
                  >
                    <option value="MONOFOCAL">Monofocal (Longe ou Perto)</option>
                    <option value="MULTIFOCAL">Multifocal / Progressiva</option>
                    <option value="BIFOCAL">Bifocal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Observações do Oftalmologista</label>
                  <input
                    type="text"
                    placeholder="Ex: Antirreflexo obrigatório, filtro azul..."
                    value={observacoes}
                    onChange={e => setObservacoes(e.target.value)}
                    className="neo-input"
                  />
                </div>
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
                  Salvar Prescrição
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal do Pupilômetro Digital */}
      <PupilometroDigitalModal
        isOpen={isPupilometroOpen}
        onClose={() => setIsPupilometroOpen(false)}
        clienteIdInicial={novoClienteId}
        pacienteNomeInicial={clientes.find(c => c.id === novoClienteId)?.nome}
        onAplicarMedidas={(medidas) => {
          setGraus(prev => ({
            ...prev,
            od_dnp: medidas.dnp_od,
            oe_dnp: medidas.dnp_oe,
            od_altura: medidas.altura_od,
            oe_altura: medidas.altura_oe
          }));
        }}
      />

    </div>
  );
};
