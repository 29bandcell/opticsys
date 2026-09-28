import React, { useState } from 'react';
import { FileText, Plus, Search, CheckCircle, Send, Printer, ArrowRight } from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Badge } from '../components/common/Badge';
import { PrintOrcamentoModal, OrcamentoData } from '../components/common/PrintOrcamentoModal';

export const Orcamentos: React.FC = () => {
  const { clientes, produtos, lojaAtiva } = useAuthAndTenant();

  const [orcamentos, setOrcamentos] = useState<OrcamentoData[]>([
    {
      id: 'orc-101',
      cliente_nome: 'Mariana Silveira Albuquerque',
      telefone: '(88) 98765-4321',
      armacao: 'Ray-Ban Clubmaster Acetato',
      lente: 'Zeiss SmartLife Monofocal 1.67',
      tratamentos: 'DuraVision Platinum + BlueProtect',
      valor_total: 2190.00,
      data: '2026-09-25',
      validade: '2026-10-05',
      status: 'EM_ABERTO'
    },
    {
      id: 'orc-102',
      cliente_nome: 'Rodrigo Augusto Fontana',
      telefone: '(88) 99742-1049',
      armacao: 'Oakley Holbrook RX Titânio',
      lente: 'Varilux Comfort Max Resina 1.59',
      tratamentos: 'Crizal Rock + Transitions Cinza',
      valor_total: 2700.00,
      data: '2026-09-26',
      validade: '2026-10-06',
      status: 'APROVADO'
    }
  ]);

  const [busca, setBusca] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orcamentoParaImprimir, setOrcamentoParaImprimir] = useState<OrcamentoData | null>(null);

  // Form
  const [clienteNome, setClienteNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [armacao, setArmacao] = useState('');
  const [lente, setLente] = useState('');
  const [valor, setValor] = useState(0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setOrcamentos(prev => [
      ...prev,
      {
        id: `orc-${Date.now().toString().slice(-3)}`,
        cliente_nome: clienteNome,
        telefone,
        armacao,
        lente,
        tratamentos: 'Antirreflexo Premium',
        valor_total: valor,
        data: new Date().toISOString().split('T')[0],
        validade: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        status: 'EM_ABERTO'
      }
    ]);
    setIsModalOpen(false);
    setClienteNome('');
    setTelefone('');
    setArmacao('');
    setLente('');
    setValor(0);
  };

  const enviarZap = (orc: any) => {
    const fone = orc.telefone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá, ${orc.cliente_nome}! Segue seu orçamento na ${lojaAtiva.nome_fantasia}:\n` +
      `👓 Armação: ${orc.armacao}\n` +
      `🔍 Lentes: ${orc.lente}\n` +
      `💰 Valor Total: R$ ${orc.valor_total.toFixed(2)} (parcelamos em até 10x sem juros).\n` +
      `Validade da proposta: ${orc.validade}. Ficamos à disposição!`
    );
    window.open(`https://wa.me/55${fone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-sky-50 dark:bg-sky-950 text-[#0284C7] flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              Orçamentos Ópticos
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Propostas comerciais de armações e lentes com envio instantâneo no WhatsApp.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="neo-button-primary !py-1.5 text-xs flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Novo Orçamento
        </button>
      </div>

      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#F1F5F9] dark:bg-zinc-900 text-slate-600 font-semibold border-b border-slate-200 dark:border-zinc-800">
              <th className="py-2.5 px-4 text-[11px]">Nº Proposta</th>
              <th className="py-2.5 px-4 text-[11px]">Cliente / Telefone</th>
              <th className="py-2.5 px-4 text-[11px]">Armação & Lente</th>
              <th className="py-2.5 px-4 font-mono text-[11px]">Validade</th>
              <th className="py-2.5 px-4 font-mono text-[11px]">Valor Total</th>
              <th className="py-2.5 px-4 text-center text-[11px]">Status</th>
              <th className="py-2.5 px-4 text-center text-[11px]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
            {orcamentos.map(orc => (
              <tr key={orc.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                <td className="py-3 px-4 font-mono font-bold text-[#0284C7]">{orc.id}</td>
                <td className="py-3 px-4">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 block">{orc.cliente_nome}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{orc.telefone}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-700 dark:text-zinc-300">{orc.armacao}</div>
                  <div className="text-[10px] text-slate-400">{orc.lente}</div>
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">{orc.validade}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                  R$ {orc.valor_total.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={orc.status === 'APROVADO' ? 'success' : 'warning'}>
                    {orc.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => setOrcamentoParaImprimir(orc)}
                      className="border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                      title="Imprimir Orçamento (A4 ou Térmica)"
                    >
                      <Printer className="w-3 h-3 text-[#0284C7]" /> Imprimir
                    </button>
                    <button
                      onClick={() => enviarZap(orc)}
                      className="border border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Send className="w-3 h-3" /> WhatsApp
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-lg shadow-2xl w-full max-w-md p-5 space-y-3 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Gerar Orçamento de Óculos</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">Nome do Cliente *</label>
                <input type="text" required value={clienteNome} onChange={e => setClienteNome(e.target.value)} className="neo-input" />
              </div>
              <div>
                <label className="block font-bold mb-1">Telefone / WhatsApp *</label>
                <input type="text" required value={telefone} onChange={e => setTelefone(e.target.value)} className="neo-input font-mono" />
              </div>
              <div>
                <label className="block font-bold mb-1">Armação Selecionada *</label>
                <input type="text" required placeholder="Ex: Ray-Ban Clubmaster Acetato" value={armacao} onChange={e => setArmacao(e.target.value)} className="neo-input" />
              </div>
              <div>
                <label className="block font-bold mb-1">Lentes & Tratamentos *</label>
                <input type="text" required placeholder="Ex: Par Lentes Zeiss 1.67 Antirreflexo" value={lente} onChange={e => setLente(e.target.value)} className="neo-input" />
              </div>
              <div>
                <label className="block font-bold mb-1">Valor Total Proposto (R$) *</label>
                <input type="number" step="0.01" required value={valor || ''} placeholder="0.00" onChange={e => setValor(parseFloat(e.target.value) || 0)} className="neo-input font-mono font-bold" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="neo-button-secondary">Cancelar</button>
                <button type="submit" className="neo-button-primary">Salvar Orçamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Impressão de Orçamento (A4 & Térmica 80mm) */}
      {orcamentoParaImprimir && (
        <PrintOrcamentoModal
          orcamento={orcamentoParaImprimir}
          onClose={() => setOrcamentoParaImprimir(null)}
        />
      )}

    </div>
  );
};
