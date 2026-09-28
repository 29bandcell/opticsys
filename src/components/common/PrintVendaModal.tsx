import React, { useState } from 'react';
import { Printer, X, ShoppingCart, Send, FileText, QrCode, CreditCard, DollarSign } from 'lucide-react';
import { VendaPDV } from '../../types';
import { useAuthAndTenant } from '../../context/AuthAndTenantContext';

interface PrintVendaModalProps {
  venda: VendaPDV;
  onClose: () => void;
}

export const PrintVendaModal: React.FC<PrintVendaModalProps> = ({
  venda,
  onClose
}) => {
  const { lojaAtiva } = useAuthAndTenant();
  const [formato, setFormato] = useState<'CUPOM_80MM' | 'CARNE_PROMISSO RIA' | 'A4_RECIBO'>('CUPOM_80MM');

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    const msg = encodeURIComponent(
      `Olá, *${venda.cliente_nome}*!\n\n` +
      `Obrigado por sua compra na *${lojaAtiva.nome_fantasia}*!\n` +
      `🧾 *Comprovante da Venda #${venda.numero_venda}*\n` +
      `📦 *Itens:*\n` +
      venda.itens.map(i => `• ${i.quantidade}x ${i.nome} - R$ ${i.subtotal.toFixed(2)}`).join('\n') +
      `\n\n💰 *Total:* R$ ${venda.valor_final.toFixed(2)} (${venda.forma_pagamento})\n` +
      `📅 *Data:* ${new Date(venda.data_venda).toLocaleDateString('pt-BR')}\n\n` +
      `Agradecemos a sua preferência!`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  // Simulação de parcelas se for crediário
  const numeroParcelas = venda.forma_pagamento === 'CREDIARIO_PROPRIO' ? 3 : 1;
  const valorParcela = venda.valor_final / numeroParcelas;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden my-6 text-xs text-slate-800 dark:text-zinc-100">
        
        {/* Header de Controle (No-Print) */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-3 no-print">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm">
              Impressão de Venda #{venda.numero_venda} • {venda.cliente_nome}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 dark:bg-zinc-800 p-0.5 rounded-lg font-bold text-[11px]">
              <button
                onClick={() => setFormato('CUPOM_80MM')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  formato === 'CUPOM_80MM' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Cupom (80mm)
              </button>
              <button
                onClick={() => setFormato('CARNE_PROMISSO RIA')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  formato === 'CARNE_PROMISSO RIA' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Carnê / Promissória
              </button>
              <button
                onClick={() => setFormato('A4_RECIBO')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  formato === 'A4_RECIBO' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Recibo A4
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
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área de Impressão */}
        <div className="p-6 bg-slate-100 dark:bg-zinc-950 flex justify-center">
          
          {formato === 'CUPOM_80MM' && (
            /* =================================================================== */
            /* CUPOM TÉRMICO 80MM / 58MM DE VENDA                                 */
            /* =================================================================== */
            <div className="w-80 bg-white text-slate-950 p-4 shadow-md rounded border border-slate-300 font-mono text-[11px] space-y-3">
              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <h2 className="font-extrabold text-sm uppercase">{lojaAtiva.nome_fantasia}</h2>
                <p className="text-[10px]">CNPJ: {lojaAtiva.cnpj}</p>
                <p className="text-[10px]">{lojaAtiva.endereco}</p>
                <p className="text-[10px]">TEL: {lojaAtiva.telefone}</p>
                <div className="my-1.5 font-bold text-xs bg-slate-100 py-0.5">
                  CUPOM NÃO FISCAL DE VENDA
                </div>
                <p>CUPOM: #{venda.numero_venda}</p>
                <p>DATA: {new Date(venda.data_venda).toLocaleString('pt-BR')}</p>
                <p>OPERADOR: {venda.vendedor_nome}</p>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2">
                <p><strong>CLIENTE:</strong> {venda.cliente_nome}</p>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-1">
                <div className="font-bold border-b border-slate-200 pb-0.5 flex justify-between text-[10px]">
                  <span>ITEM / DESCRIÇÃO</span>
                  <span>QTD x VL (R$)</span>
                </div>
                {venda.itens.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="font-sans text-[11px] font-semibold">{item.nome}</p>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>{item.quantidade} UN x R$ {item.preco_unitario.toFixed(2)}</span>
                      <span className="font-mono font-bold">R$ {item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>R$ {venda.valor_bruto.toFixed(2)}</span>
                </div>
                {venda.valor_desconto > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>DESCONTO:</span>
                    <span>- R$ {venda.valor_desconto.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>TOTAL PAGO:</span>
                  <span>R$ {venda.valor_final.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>FORMA PAGTO:</span>
                  <span>{venda.forma_pagamento}</span>
                </div>
              </div>

              <div className="text-center text-[10px] pt-1 space-y-1">
                <p>Obrigado pela preferência!</p>
                <p className="text-[9px] text-slate-500">OpticSys Cloud • Sistema de Gestão Óptica</p>
              </div>
            </div>
          )}

          {formato === 'CARNE_PROMISSO RIA' && (
            /* =================================================================== */
            /* CARNÊ COM QR CODE PIX DA ÓTICA (LÂMINAS DE PARCELAS)                */
            /* =================================================================== */
            <div className="w-full max-w-2xl bg-white text-slate-900 p-6 shadow-md rounded border border-slate-300 font-sans space-y-4">
              <div className="border-b pb-2 flex justify-between items-center">
                <div>
                  <h2 className="font-black text-base uppercase text-[#0284C7]">{lojaAtiva.nome_fantasia}</h2>
                  <p className="text-[10px] text-slate-500">Carnê de Pagamento / Crediário • Venda #{venda.numero_venda}</p>
                </div>
                <div className="text-right font-mono text-xs">
                  <span className="font-bold block">TOTAL: R$ {venda.valor_final.toFixed(2)}</span>
                  <span className="text-slate-500 text-[10px]">{numeroParcelas}x de R$ {valorParcela.toFixed(2)}</span>
                </div>
              </div>

              {/* Lâminas de Parcelas */}
              {Array.from({ length: numeroParcelas }).map((_, idx) => {
                const numParc = idx + 1;
                const dataVenc = new Date();
                dataVenc.setDate(dataVenc.getDate() + (numParc * 30));

                return (
                  <div key={idx} className="border-2 border-dashed border-slate-300 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-900 text-white px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                          PARCELA {numParc}/{numeroParcelas}
                        </span>
                        <strong className="text-xs text-slate-800">{venda.cliente_nome}</strong>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Vencimento: <strong className="text-rose-600 font-mono">{dataVenc.toLocaleDateString('pt-BR')}</strong>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Valor da Parcela: <strong className="font-mono text-slate-900 text-xs">R$ {valorParcela.toFixed(2)}</strong>
                      </p>
                    </div>

                    {/* QR Code PIX da Ótica */}
                    <div className="flex items-center gap-2 border-l pl-3 border-slate-200">
                      <div className="w-16 h-16 bg-white p-1 border rounded flex items-center justify-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`PIX-${lojaAtiva.cnpj}-PARC-${numParc}-VALOR-${valorParcela.toFixed(2)}`)}`}
                          alt="PIX da Loja"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-[9px] text-slate-500 max-w-[100px] leading-tight">
                        <span>Pague via <strong>PIX</strong> apontando a câmera</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 text-[10px] text-slate-500 border-t flex justify-between items-center">
                <span>Não receber após 30 dias de atraso sem encargos.</span>
                <span className="font-mono">CNPJ: {lojaAtiva.cnpj}</span>
              </div>
            </div>
          )}

          {formato === 'A4_RECIBO' && (
            /* =================================================================== */
            /* RECIBO A4 DE COMPRA & QUITAÇÃO                                      */
            /* =================================================================== */
            <div className="w-full max-w-2xl bg-white text-slate-900 p-8 shadow-md rounded border border-slate-300 font-sans space-y-6">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-[#0284C7]">{lojaAtiva.nome_fantasia}</h1>
                  <p className="text-xs text-slate-600 font-mono">CNPJ: {lojaAtiva.cnpj} • Tel: {lojaAtiva.telefone}</p>
                  <p className="text-xs text-slate-600">{lojaAtiva.endereco} - {lojaAtiva.cidade}/{lojaAtiva.uf}</p>
                </div>
                <div className="text-right">
                  <span className="bg-slate-900 text-white font-mono font-bold text-xs px-3 py-1 rounded">
                    RECIBO DE VENDA #{venda.numero_venda}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Data: {new Date(venda.data_venda).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              <div className="bg-slate-50 border p-3 rounded grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Cliente:</span>
                  <strong>{venda.cliente_nome}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Vendedor:</span>
                  <strong>{venda.vendedor_nome}</strong>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                    <th className="py-2 px-3">Produto / Serviço</th>
                    <th className="py-2 px-3 text-center">Qtd</th>
                    <th className="py-2 px-3 text-right">Unitário</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {venda.itens.map((i, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold">{i.nome}</td>
                      <td className="py-2 px-3 text-center font-mono">{i.quantidade}</td>
                      <td className="py-2 px-3 text-right font-mono">R$ {i.preco_unitario.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">R$ {i.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg font-mono">
                <div>
                  <span className="text-xs text-slate-600 block">Forma de Pagamento:</span>
                  <strong className="text-sm">{venda.forma_pagamento}</strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-600 block">Valor Total:</span>
                  <strong className="text-xl font-black text-slate-900">R$ {venda.valor_final.toFixed(2)}</strong>
                </div>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
                <div className="border-t pt-1 font-semibold">{lojaAtiva.nome_fantasia} (Vendedor)</div>
                <div className="border-t pt-1 font-semibold">{venda.cliente_nome} (Comprador)</div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
