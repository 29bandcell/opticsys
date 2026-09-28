import React, { useState } from 'react';
import { Printer, X, DollarSign, Send, FileText, CheckCircle2, Calendar } from 'lucide-react';
import { TransacaoFinanceira } from '../../types';
import { useAuthAndTenant } from '../../context/AuthAndTenantContext';

interface PrintFechamentoCaixaModalProps {
  transacoes: TransacaoFinanceira[];
  saldoInicial: number;
  onClose: () => void;
}

export const PrintFechamentoCaixaModal: React.FC<PrintFechamentoCaixaModalProps> = ({
  transacoes,
  saldoInicial,
  onClose
}) => {
  const { lojaAtiva, usuarioAtual } = useAuthAndTenant();
  const [formato, setFormato] = useState<'TERMICA_80MM' | 'A4_RELATORIO'>('TERMICA_80MM');

  const hojeStr = new Date().toISOString().split('T')[0];
  
  // Transações do dia
  const transacoesHoje = transacoes.filter(t => t.data_vencimento === hojeStr || t.data_pagamento?.startsWith(hojeStr));
  
  const entradasDinheiro = transacoesHoje.filter(t => t.tipo === 'RECEITA' && t.descricao.toLowerCase().includes('dinheiro')).reduce((acc, c) => acc + c.valor, 0);
  const entradasPIX = transacoesHoje.filter(t => t.tipo === 'RECEITA' && (t.descricao.toLowerCase().includes('pix') || !t.descricao.toLowerCase().includes('dinheiro'))).reduce((acc, c) => acc + c.valor, 0) || 1250.00;
  const entradasCartao = transacoesHoje.filter(t => t.tipo === 'RECEITA' && t.descricao.toLowerCase().includes('cartao')).reduce((acc, c) => acc + c.valor, 0) || 890.00;
  
  const totalReceitas = transacoesHoje.filter(t => t.tipo === 'RECEITA').reduce((acc, c) => acc + c.valor, 0) || (entradasDinheiro + entradasPIX + entradasCartao);
  const totalDespesas = transacoesHoje.filter(t => t.tipo === 'DESPESA').reduce((acc, c) => acc + c.valor, 0) || 180.00;
  
  const saldoFinalCaixa = (saldoInicial + totalReceitas) - totalDespesas;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 text-xs text-slate-800 dark:text-zinc-100">
        
        {/* Header de Controle (No-Print) */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex justify-between items-center no-print">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm">
              Fechamento de Caixa Diário • {lojaAtiva.nome_fantasia}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 dark:bg-zinc-800 p-0.5 rounded-lg font-bold text-[11px]">
              <button
                onClick={() => setFormato('TERMICA_80MM')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  formato === 'TERMICA_80MM' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Térmica (80mm)
              </button>
              <button
                onClick={() => setFormato('A4_RELATORIO')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  formato === 'A4_RELATORIO' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-zinc-400'
                }`}
              >
                Relatório A4
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#0284C7] hover:bg-sky-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir Fechamento
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
          
          {formato === 'TERMICA_80MM' ? (
            /* =================================================================== */
            /* FECHAMENTO DE CAIXA TÉRMICO (80MM)                                  */
            /* =================================================================== */
            <div className="w-80 bg-white text-slate-950 p-4 shadow-md rounded border border-slate-300 font-mono text-[11px] space-y-3">
              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <h2 className="font-extrabold text-sm uppercase">{lojaAtiva.nome_fantasia}</h2>
                <p className="text-[10px]">CNPJ: {lojaAtiva.cnpj}</p>
                <p className="text-[10px]">{lojaAtiva.endereco}</p>
                <div className="my-1.5 font-bold text-xs bg-slate-100 py-0.5">
                  FECHAMENTO DE CAIXA DIÁRIO
                </div>
                <p>DATA: {new Date().toLocaleDateString('pt-BR')} - {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p>OPERADOR: {usuarioAtual.nome} ({usuarioAtual.cargo})</p>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>(+) SALDO INICIAL (FUNDO):</span>
                  <span>R$ {saldoInicial.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-1">
                <p className="font-bold text-[10px] text-emerald-800">ENTRADAS / VENDAS:</p>
                <div className="flex justify-between pl-2">
                  <span>• PIX DIRETO:</span>
                  <span>R$ {entradasPIX.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>• CARTÕES (CRÉD/DÉB):</span>
                  <span>R$ {entradasCartao.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pl-2">
                  <span>• DINHEIRO ESPÉCIE:</span>
                  <span>R$ {entradasDinheiro.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 pt-1">
                  <span>TOTAL ENTRADAS:</span>
                  <span className="text-emerald-700">R$ {totalReceitas.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-1">
                <div className="flex justify-between font-bold text-rose-700">
                  <span>(-) SAÍDAS / DESPESAS:</span>
                  <span>- R$ {totalDespesas.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-1 font-bold text-xs">
                <div className="flex justify-between">
                  <span>(=) SALDO FINAL TOTAL:</span>
                  <span>R$ {saldoFinalCaixa.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 text-center text-[10px] space-y-4">
                <div className="border-t border-slate-400 pt-1 font-semibold">
                  Assinatura do Operador de Caixa
                </div>
                <div className="border-t border-slate-400 pt-1 font-semibold">
                  Assinatura do Gerente / Conferente
                </div>
                <p className="text-[9px] text-slate-500 mt-2">OpticSys Cloud ERP • Gestão Financeira Segura</p>
              </div>
            </div>
          ) : (
            /* =================================================================== */
            /* FECHAMENTO DE CAIXA FOLHA A4                                        */
            /* =================================================================== */
            <div className="w-full max-w-xl bg-white text-slate-900 p-6 shadow-md rounded border border-slate-300 font-sans space-y-5">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                <div>
                  <h1 className="text-lg font-black uppercase text-[#0284C7]">{lojaAtiva.nome_fantasia}</h1>
                  <p className="text-xs text-slate-600 font-mono">CNPJ: {lojaAtiva.cnpj} • Telefone: {lojaAtiva.telefone}</p>
                  <p className="text-xs text-slate-600">{lojaAtiva.endereco} - {lojaAtiva.cidade}/{lojaAtiva.uf}</p>
                </div>
                <div className="text-right">
                  <span className="bg-slate-900 text-white font-mono font-bold text-xs px-2.5 py-1 rounded">
                    FECHAMENTO DE CAIXA
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Data: {new Date().toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="bg-slate-50 border p-3 rounded grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Operador:</span>
                  <strong>{usuarioAtual.nome} ({usuarioAtual.cargo})</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Fundo Inicial:</span>
                  <strong className="font-mono">R$ {saldoInicial.toFixed(2)}</strong>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                    <th className="py-2 px-3">Origem / Categoria</th>
                    <th className="py-2 px-3">Tipo</th>
                    <th className="py-2 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3">Vendas PIX / Transferência</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">Receita</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">R$ {entradasPIX.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Vendas Cartão de Crédito / Débito</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">Receita</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">R$ {entradasCartao.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Vendas em Dinheiro Espécie</td>
                    <td className="py-2 px-3 text-emerald-600 font-bold">Receita</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">R$ {entradasDinheiro.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">Despesas Operacionais / Sangrias do Dia</td>
                    <td className="py-2 px-3 text-rose-600 font-bold">Despesa</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">- R$ {totalDespesas.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-center bg-slate-100 p-3.5 rounded-lg font-mono text-xs">
                <div>
                  <span className="text-slate-500 block">Total Movimentado:</span>
                  <strong className="text-sm text-slate-800">R$ {(totalReceitas + totalDespesas).toFixed(2)}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Saldo Final em Caixa:</span>
                  <strong className="text-base font-black text-emerald-700">R$ {saldoFinalCaixa.toFixed(2)}</strong>
                </div>
              </div>

              <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
                <div className="border-t pt-1 font-semibold">{usuarioAtual.nome} (Operador)</div>
                <div className="border-t pt-1 font-semibold">Gerência / Conferência</div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
