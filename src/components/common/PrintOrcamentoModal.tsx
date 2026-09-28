import React, { useState } from 'react';
import { Printer, X, FileText, Send, Eye, ShieldCheck, Check } from 'lucide-react';
import { useAuthAndTenant } from '../../context/AuthAndTenantContext';

export interface OrcamentoData {
  id: string;
  cliente_nome: string;
  telefone: string;
  armacao: string;
  lente: string;
  tratamentos?: string;
  valor_total: number;
  data: string;
  validade: string;
  status: string;
  esferico_od?: number;
  cilindrico_od?: number;
  esferico_oe?: number;
  cilindrico_oe?: number;
  adicao?: number;
}

interface PrintOrcamentoModalProps {
  orcamento: OrcamentoData;
  onClose: () => void;
}

export const PrintOrcamentoModal: React.FC<PrintOrcamentoModalProps> = ({
  orcamento,
  onClose
}) => {
  const { lojaAtiva } = useAuthAndTenant();
  const [formato, setFormato] = useState<'A4_PROPOSTA' | 'TERMICA_80MM'>('A4_PROPOSTA');

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const fone = orcamento.telefone.replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Olá, *${orcamento.cliente_nome}*!\n\n` +
      `Aqui está o resumo da sua proposta na *${lojaAtiva.nome_fantasia}*:\n` +
      `👓 *Armação:* ${orcamento.armacao}\n` +
      `🔍 *Lentes:* ${orcamento.lente}\n` +
      `✨ *Tratamentos:* ${orcamento.tratamentos || 'Antirreflexo Premium'}\n` +
      `💰 *Valor Total:* R$ ${orcamento.valor_total.toFixed(2)} (em até 10x sem juros)\n` +
      `📅 *Validade da Proposta:* ${new Date(orcamento.validade).toLocaleDateString('pt-BR')}\n\n` +
      `Venha nos visitar ou responda aqui para confeccionarmos seus óculos!`
    );
    window.open(`https://wa.me/55${fone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden my-6 text-xs text-slate-800 dark:text-zinc-100">
        
        {/* Header de Controle (Não Imprime) */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-3 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0284C7]" />
            <h3 className="font-bold text-sm">
              Impressão de Orçamento • {orcamento.cliente_nome}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 dark:bg-zinc-800 p-0.5 rounded-lg font-bold text-[11px]">
              <button
                onClick={() => setFormato('A4_PROPOSTA')}
                className={`px-3 py-1 rounded-md transition-all ${
                  formato === 'A4_PROPOSTA' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Folha A4 Completa
              </button>
              <button
                onClick={() => setFormato('TERMICA_80MM')}
                className={`px-3 py-1 rounded-md transition-all ${
                  formato === 'TERMICA_80MM' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Cupom Térmico (80mm)
              </button>
            </div>

            <button
              onClick={handleSendWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" /> WhatsApp
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#0284C7] hover:bg-sky-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir Agora
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área de Impressão */}
        <div className="p-6 bg-slate-100 dark:bg-zinc-950 flex justify-center">
          
          {formato === 'A4_PROPOSTA' ? (
            /* =================================================================== */
            /* MODELO 1: FOLHA A4 COMPLETA                                         */
            /* =================================================================== */
            <div className="w-full max-w-2xl bg-white text-slate-900 p-8 shadow-md rounded border border-slate-300 font-sans space-y-6">
              
              {/* Topo / Cabeçalho da Loja */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-[#0284C7]">
                    {lojaAtiva.nome_fantasia}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">Razão Social: {lojaAtiva.razao_social}</p>
                  <p className="text-xs text-slate-600 font-mono">CNPJ: {lojaAtiva.cnpj} • Telefone: {lojaAtiva.telefone}</p>
                  <p className="text-xs text-slate-600">{lojaAtiva.endereco} • {lojaAtiva.cidade}/{lojaAtiva.uf}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-slate-900 text-white font-mono font-bold text-xs px-3 py-1 rounded">
                    ORÇAMENTO #{orcamento.id.toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Data: {new Date(orcamento.data).toLocaleDateString('pt-BR')}</p>
                  <p className="text-xs text-amber-700 font-bold">Válido até: {new Date(orcamento.validade).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Dados do Paciente */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Paciente / Cliente:</span>
                  <strong className="text-slate-900 text-sm">{orcamento.cliente_nome}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Telefone / WhatsApp:</span>
                  <strong className="font-mono text-slate-800">{orcamento.telefone}</strong>
                </div>
              </div>

              {/* Detalhes da Composição */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-1">
                  Composição do Pedido Óptico
                </h3>

                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                      <th className="py-2 px-3">Item / Especificação</th>
                      <th className="py-2 px-3">Categoria</th>
                      <th className="py-2 px-3 text-right">Valor Estimado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2.5 px-3">
                        <strong className="block text-slate-900">{orcamento.armacao}</strong>
                        <span className="text-[10px] text-slate-500">Armação de Grau / Solar Selecionada</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">Armação</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">R$ {(orcamento.valor_total * 0.45).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3">
                        <strong className="block text-slate-900">{orcamento.lente}</strong>
                        <span className="text-[10px] text-slate-500">Tratamentos: {orcamento.tratamentos || 'Antirreflexo Digital + Proteção UV'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">Lentes Oftálmicas</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">R$ {(orcamento.valor_total * 0.55).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Condições de Pagamento */}
              <div className="bg-sky-50/60 border border-sky-200 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-bold text-[#0284C7] block uppercase">Condições Especiais de Pagamento:</span>
                  <ul className="text-xs text-slate-700 space-y-0.5 mt-1">
                    <li>• <strong>À Vista (PIX / Dinheiro):</strong> R$ {(orcamento.valor_total * 0.95).toFixed(2)} (5% de desconto)</li>
                    <li>• <strong>Cartão de Crédito:</strong> Até 10x de R$ {(orcamento.valor_total / 10).toFixed(2)} sem juros</li>
                    <li>• <strong>Carnê / Crediário:</strong> Entrada + 4x de R$ {(orcamento.valor_total / 5).toFixed(2)}</li>
                  </ul>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Valor Total:</span>
                  <span className="text-2xl font-black font-mono text-slate-900">
                    R$ {orcamento.valor_total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Termo de Garantia e Assinaturas */}
              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-4">
                <p>
                  * Este orçamento tem validade de 10 dias a contar da data de emissão. Os valores e disponibilidade de estoque estão sujeitos a confirmação no momento do fechamento da Ordem de Serviço.
                </p>
                
                <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="border-t border-slate-400 text-center pt-1 font-semibold text-slate-700">
                    Assinatura do Atendente / Consultor
                  </div>
                  <div className="border-t border-slate-400 text-center pt-1 font-semibold text-slate-700">
                    Assinatura do Paciente / Cliente
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* =================================================================== */
            /* MODELO 2: CUPOM TÉRMICO (80MM)                                      */
            /* =================================================================== */
            <div className="w-80 bg-white text-slate-950 p-4 shadow-md rounded border border-slate-300 font-mono text-[11px] space-y-3">
              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <h2 className="font-extrabold text-sm uppercase">{lojaAtiva.nome_fantasia}</h2>
                <p className="text-[10px]">CNPJ: {lojaAtiva.cnpj}</p>
                <p className="text-[10px]">{lojaAtiva.endereco}</p>
                <p className="text-[10px]">TEL: {lojaAtiva.telefone}</p>
                <div className="my-1 font-bold">--- PROPOSTA / ORÇAMENTO ---</div>
                <p>Nº: #{orcamento.id.toUpperCase()}</p>
                <p>DATA: {new Date(orcamento.data).toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2">
                <p><strong>CLIENTE:</strong> {orcamento.cliente_nome}</p>
                <p><strong>FONE:</strong> {orcamento.telefone}</p>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-1">
                <div className="flex justify-between">
                  <span>1. ARMAÇÃO:</span>
                </div>
                <p className="font-sans text-[10px] pl-2">{orcamento.armacao}</p>
                <div className="flex justify-between">
                  <span>2. LENTES:</span>
                </div>
                <p className="font-sans text-[10px] pl-2">{orcamento.lente}</p>
                <p className="font-sans text-[10px] pl-2">{orcamento.tratamentos}</p>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-0.5">
                <div className="flex justify-between font-bold text-xs">
                  <span>TOTAL ESTIMADO:</span>
                  <span>R$ {orcamento.valor_total.toFixed(2)}</span>
                </div>
                <p className="text-[10px]">À VISTA (PIX): R$ {(orcamento.valor_total * 0.95).toFixed(2)}</p>
                <p className="text-[10px]">CARTÃO: EM ATÉ 10X S/ JUROS</p>
              </div>

              <div className="text-center text-[10px] pt-1">
                <p>Válido até: {new Date(orcamento.validade).toLocaleDateString('pt-BR')}</p>
                <p className="mt-1">Agradecemos a sua preferência!</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
