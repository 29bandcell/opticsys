import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  Eye, 
  FileText, 
  ShoppingBag,
  ExternalLink,
  Plus,
  Edit2,
  Check,
  X,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Cliente } from '../types';
import { Badge } from '../components/common/Badge';

export const Clientes: React.FC = () => {
  const { clientes, adicionarCliente, atualizarCliente, receitas, ordensServico } = useAuthAndTenant();
  
  const [busca, setBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clienteParaEditar, setClienteParaEditar] = useState<Cliente | null>(null);

  // Form State para Novo Cliente
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    whatsapp: '',
    email: '',
    cep: '',
    endereco: '',
    cidade: '',
    uf: 'CE',
    origem: 'BALCÃO',
    observacoes: ''
  });

  // Form State para Edição
  const [editForm, setEditForm] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    whatsapp: '',
    email: '',
    cep: '',
    endereco: '',
    cidade: '',
    uf: 'CE',
    origem: 'BALCÃO',
    observacoes: ''
  });

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.cpf && c.cpf.includes(busca)) ||
    (c.telefone && c.telefone.includes(busca)) ||
    (c.whatsapp && c.whatsapp.includes(busca))
  );

  const handleSubmitNovo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCliente.nome || !novoCliente.telefone) {
      alert('Nome e Telefone são obrigatórios.');
      return;
    }

    const created = adicionarCliente({
      ...novoCliente,
      whatsapp: novoCliente.whatsapp || novoCliente.telefone
    });
    setIsModalOpen(false);
    setNovoCliente({
      nome: '',
      cpf: '',
      data_nascimento: '',
      telefone: '',
      whatsapp: '',
      email: '',
      cep: '',
      endereco: '',
      cidade: '',
      uf: 'CE',
      origem: 'BALCÃO',
      observacoes: ''
    });
    setClienteSelecionado(created);
  };

  const handleAbrirEditar = (cli: Cliente) => {
    setClienteParaEditar(cli);
    setEditForm({
      nome: cli.nome || '',
      cpf: cli.cpf || '',
      data_nascimento: cli.data_nascimento || '',
      telefone: cli.telefone || '',
      whatsapp: cli.whatsapp || cli.telefone || '',
      email: cli.email || '',
      cep: cli.cep || '',
      endereco: cli.endereco || '',
      cidade: cli.cidade || '',
      uf: cli.uf || 'CE',
      origem: cli.origem || 'BALCÃO',
      observacoes: cli.observacoes || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteParaEditar) return;
    if (!editForm.nome.trim() || !editForm.telefone.trim()) {
      alert('Nome e Telefone são obrigatórios.');
      return;
    }

    const dadosAtualizados = {
      ...editForm,
      whatsapp: editForm.whatsapp || editForm.telefone
    };

    atualizarCliente(clienteParaEditar.id, dadosAtualizados);

    // Atualiza o cliente selecionado na visualização
    setClienteSelecionado(prev => prev && prev.id === clienteParaEditar.id ? { ...prev, ...dadosAtualizados } : prev);
    setIsEditModalOpen(false);
    setClienteParaEditar(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Clientes & Pacientes
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Histórico oftalmológico, fichas de medidas e pedidos de óculos.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="neo-button-primary !py-2 text-xs flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" /> Cadastrar Novo Paciente
        </button>
      </div>

      {/* Grid: Lista de Clientes + Ficha Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Tabela de Clientes */}
        <div className="lg:col-span-2 bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por nome do paciente, CPF ou telefone..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="neo-input !pl-9"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 font-semibold border-y border-slate-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Nome / Paciente</th>
                  <th className="py-2.5 px-3">CPF</th>
                  <th className="py-2.5 px-3">WhatsApp / Telefone</th>
                  <th className="py-2.5 px-3">Origem</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {clientesFiltrados.map(cli => {
                  const isSelected = clienteSelecionado?.id === cli.id;

                  return (
                    <tr 
                      key={cli.id} 
                      onClick={() => setClienteSelecionado(cli)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-2 border-blue-600' 
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-zinc-100">
                        {cli.nome}
                        {cli.observacoes && (
                          <span className="block text-[10px] text-slate-400 font-normal truncate max-w-xs">
                            {cli.observacoes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">
                        {cli.cpf || 'Não informado'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-zinc-400">
                        {cli.whatsapp || cli.telefone}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="default">{cli.origem || 'BALCÃO'}</Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAbrirEditar(cli);
                            }}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors"
                            title="Editar dados do cliente"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] font-semibold text-blue-600 hover:underline">
                            Ver Ficha
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {clientesFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Nenhum paciente encontrado. Clique em <strong>"Cadastrar Novo Paciente"</strong> para iniciar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Coluna 3: Ficha Detalhada do Paciente */}
        <div className="bg-white dark:bg-[#101014] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
          {clienteSelecionado ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ficha do Paciente</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 mt-0.5">
                    {clienteSelecionado.nome}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    CPF: {clienteSelecionado.cpf || 'Não informado'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAbrirEditar(clienteSelecionado)}
                  className="neo-button-secondary !py-1 !px-2.5 text-xs flex items-center gap-1 font-bold text-blue-600"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                    {clienteSelecionado.whatsapp || clienteSelecionado.telefone}
                  </span>
                </div>
                {clienteSelecionado.email && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>{clienteSelecionado.email}</span>
                  </div>
                )}
                {clienteSelecionado.data_nascimento && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-purple-600" />
                    <span>Nascimento: {new Date(clienteSelecionado.data_nascimento).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
                {(clienteSelecionado.endereco || clienteSelecionado.cidade) && (
                  <div className="flex items-start gap-2 text-slate-600 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>
                      {clienteSelecionado.endereco} {clienteSelecionado.cidade && `- ${clienteSelecionado.cidade}/${clienteSelecionado.uf}`}
                    </span>
                  </div>
                )}
                {clienteSelecionado.observacoes && (
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-100 dark:border-zinc-800 text-[11px] text-slate-600 dark:text-zinc-400 italic">
                    "{clienteSelecionado.observacoes}"
                  </div>
                )}
              </div>

              {/* Receitas Anexadas */}
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-600" /> Receitas Oftalmológicas
                  </h4>
                  <span className="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                    {receitas.filter(r => r.cliente_id === clienteSelecionado.id).length}
                  </span>
                </div>

                {receitas
                  .filter(r => r.cliente_id === clienteSelecionado.id)
                  .map(r => (
                    <div key={r.id} className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-800 dark:text-zinc-200">
                        <span>{r.medico_prescritor}</span>
                        <span className="font-mono text-[11px] text-slate-500">{new Date(r.data_emissao).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">
                        OD: {r.od_longe.esferico > 0 ? `+${r.od_longe.esferico}` : r.od_longe.esferico} ESF | OE: {r.oe_longe.esferico > 0 ? `+${r.oe_longe.esferico}` : r.oe_longe.esferico} ESF
                      </p>
                    </div>
                  ))}
              </div>

              {/* Histórico de Ordens de Serviço */}
              <div className="border-t border-slate-100 dark:border-zinc-800 pt-3 space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Ordens de Serviço (O.S.)
                </h4>

                {ordensServico
                  .filter(o => o.cliente_id === clienteSelecionado.id)
                  .map(o => (
                    <div key={o.id} className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 text-xs space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>O.S. #{o.numero_os}</span>
                        <span className="font-mono text-emerald-600">R$ {o.valor_total.toFixed(2)}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 truncate">{o.armacao_descricao}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Status: {o.status}</p>
                    </div>
                  ))}
              </div>

            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4 text-slate-400">
              <Users className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-xs">Selecione um paciente na lista para visualizar o histórico oftalmológico e pedidos.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Novo Paciente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-lg shadow-2xl w-full max-w-lg p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Cadastrar Novo Cliente / Paciente
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNovo} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={novoCliente.nome}
                  onChange={e => setNovoCliente({ ...novoCliente, nome: e.target.value })}
                  className="neo-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={novoCliente.cpf}
                    onChange={e => setNovoCliente({ ...novoCliente, cpf: e.target.value })}
                    className="neo-input font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    placeholder="(88) 98888-8888"
                    value={novoCliente.telefone}
                    onChange={e => setNovoCliente({ ...novoCliente, telefone: e.target.value, whatsapp: e.target.value })}
                    className="neo-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="email@cliente.com"
                    value={novoCliente.email}
                    onChange={e => setNovoCliente({ ...novoCliente, email: e.target.value })}
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={novoCliente.data_nascimento}
                    onChange={e => setNovoCliente({ ...novoCliente, data_nascimento: e.target.value })}
                    className="neo-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Cidade</label>
                  <input
                    type="text"
                    placeholder="Morada Nova"
                    value={novoCliente.cidade}
                    onChange={e => setNovoCliente({ ...novoCliente, cidade: e.target.value })}
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="CE"
                    value={novoCliente.uf}
                    onChange={e => setNovoCliente({ ...novoCliente, uf: e.target.value.toUpperCase() })}
                    className="neo-input uppercase text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Origem do Cliente</label>
                <select
                  value={novoCliente.origem}
                  onChange={e => setNovoCliente({ ...novoCliente, origem: e.target.value })}
                  className="neo-select"
                >
                  <option value="BALCÃO">Balcão / Loja Física</option>
                  <option value="INDICAÇÃO MÉDICA">Indicação Médica</option>
                  <option value="INSTAGRAM">Instagram / Redes</option>
                  <option value="CONVÊNIO">Convênio / Parceria</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Observações do Paciente</label>
                <textarea
                  rows={2}
                  placeholder="Preferência por armação leve, histórico de cirurgia refrativa, etc."
                  value={novoCliente.observacoes}
                  onChange={e => setNovoCliente({ ...novoCliente, observacoes: e.target.value })}
                  className="neo-input"
                />
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
                  Salvar Paciente
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal: Editar Paciente */}
      {isEditModalOpen && clienteParaEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-lg shadow-2xl w-full max-w-lg p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" /> Editar Dados do Cliente
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={editForm.nome}
                  onChange={e => setEditForm({ ...editForm, nome: e.target.value })}
                  className="neo-input font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">CPF</label>
                  <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={editForm.cpf}
                    onChange={e => setEditForm({ ...editForm, cpf: e.target.value })}
                    className="neo-input font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="text"
                    required
                    placeholder="(88) 98888-8888"
                    value={editForm.telefone}
                    onChange={e => setEditForm({ ...editForm, telefone: e.target.value, whatsapp: e.target.value })}
                    className="neo-input font-mono font-bold text-emerald-700 dark:text-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={editForm.data_nascimento}
                    onChange={e => setEditForm({ ...editForm, data_nascimento: e.target.value })}
                    className="neo-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Endereço / Cidade</label>
                  <input
                    type="text"
                    placeholder="Rua, Número, Bairro, Cidade"
                    value={editForm.endereco}
                    onChange={e => setEditForm({ ...editForm, endereco: e.target.value })}
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={editForm.uf}
                    onChange={e => setEditForm({ ...editForm, uf: e.target.value.toUpperCase() })}
                    className="neo-input uppercase text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Origem do Cliente</label>
                <select
                  value={editForm.origem}
                  onChange={e => setEditForm({ ...editForm, origem: e.target.value })}
                  className="neo-select"
                >
                  <option value="BALCÃO">Balcão / Loja Física</option>
                  <option value="INDICAÇÃO MÉDICA">Indicação Médica</option>
                  <option value="INSTAGRAM">Instagram / Redes</option>
                  <option value="CONVÊNIO">Convênio / Parceria</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">Observações do Paciente</label>
                <textarea
                  rows={2}
                  value={editForm.observacoes}
                  onChange={e => setEditForm({ ...editForm, observacoes: e.target.value })}
                  className="neo-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="neo-button-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="neo-button-primary flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Atualizar Dados
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
