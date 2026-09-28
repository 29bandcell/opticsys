import React, { useState } from 'react';
import { OrdemServicoOptica, Loja, ReceitaOptica } from '../../types';
import { Printer, X, FileText, CheckCircle, Send } from 'lucide-react';
import { PrescricaoGrade } from './PrescricaoGrade';

interface PrintOSModalProps {
  os: OrdemServicoOptica;
  loja: Loja;
  receita?: ReceitaOptica;
  onClose: () => void;
}

export const PrintOSModal: React.FC<PrintOSModalProps> = ({
  os,
  loja,
  receita,
  onClose
}) => {
  const [tipoImpressao, setTipoImpressao] = useState<'ENVELOPE_LAB' | 'COMPROVANTE_CLIENTE' | 'CUPOM_TERMICO'>('ENVELOPE_LAB');

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const telefone = os.cliente_telefone.replace(/\D/g, '');
    const mensagem = encodeURIComponent(
      `Olá, ${os.cliente_nome}! Aqui é da ${loja.nome_fantasia}.\n\n` +
      `Sua Ordem de Serviço *#${os.numero_os}* está com o status: *${os.status}*.\n` +
      `📦 Armação: ${os.armacao_descricao}\n` +
      `👓 Lentes: ${os.lente_descricao}\n` +
      `📅 Previsão de entrega: ${new Date(os.data_prometida).toLocaleDateString('pt-BR')}\n\n` +
      `Qualquer dúvida estamos à disposição!`
    );
    window.open(`https://wa.me/55${telefone}?text=${mensagem}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden my-8">
        
        {/* Header (No-Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 no-print">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 dark:text-zinc-100">
              Impressão da O.S. #{os.numero_os} - {os.cliente_nome}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-200 dark:bg-zinc-800 p-0.5 rounded-md text-xs font-semibold">
              <button
                onClick={() => setTipoImpressao('ENVELOPE_LAB')}
                className={`px-2.5 py-1 rounded ${tipoImpressao === 'ENVELOPE_LAB' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'}`}
              >
                Envelope Lab
              </button>
              <button
                onClick={() => setTipoImpressao('COMPROVANTE_CLIENTE')}
                className={`px-2.5 py-1 rounded ${tipoImpressao === 'COMPROVANTE_CLIENTE' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'}`}
              >
                Comprovante A4
              </button>
              <button
                onClick={() => setTipoImpressao('CUPOM_TERMICO')}
                className={`px-2.5 py-1 rounded ${tipoImpressao === 'CUPOM_TERMICO' ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-zinc-400'}`}
              >
                Térmica (80mm)
              </button>
            </div>
            <button
              onClick={handleWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="neo-button-primary !py-1.5 !px-3 text-xs flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div id="printable-os-area" className="p-8 text-slate-900 bg-white font-sans text-sm">
          
          {tipoImpressao === 'ENVELOPE_LAB' ? (
            /* ENVELOPE TÉCNICO DE LABORATÓRIO / MONTAGEM */
            <div className="border-2 border-slate-900 p-6 space-y-5 rounded-sm">
              
              {/* Cabeçalho */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold uppercase tracking-tight">{loja.nome_fantasia}</h1>
                  <p className="text-xs text-slate-600 font-mono">CNPJ: {loja.cnpj} | Tel: {loja.telefone}</p>
                  <p className="text-xs text-slate-600">{loja.endereco} - {loja.cidade}/{loja.uf}</p>
                </div>
                <div className="text-right">
                  <div className="border-2 border-slate-900 px-3 py-1 rounded bg-slate-100 font-mono font-bold text-lg">
                    O.S. #{os.numero_os}
                  </div>
                  <p className="text-xs mt-1 text-slate-600 font-mono">
                    Data: {new Date(os.data_abertura).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Paciente e Laboratório */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 border border-slate-300 rounded font-mono text-xs">
                <div>
                  <p><strong className="text-slate-700">CLIENTE:</strong> {os.cliente_nome}</p>
                  <p><strong className="text-slate-700">TELEFONE:</strong> {os.cliente_telefone}</p>
                  <p><strong className="text-slate-700">ATENDENTE:</strong> {os.atendente_nome}</p>
                </div>
                <div>
                  <p><strong className="text-slate-700">LABORATÓRIO:</strong> {os.laboratorio_nome || 'Montagem Própria / Bancada'}</p>
                  <p><strong className="text-slate-700">PEDIDO LAB:</strong> {os.numero_pedido_laboratorio || 'N/A'}</p>
                  <p><strong className="text-slate-700">ENTREGA PROMETIDA:</strong> <span className="bg-amber-200 px-1 font-bold">{new Date(os.data_prometida).toLocaleDateString('pt-BR')}</span></p>
                </div>
              </div>

              {/* Grade de Graus da Receita */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    DIOPTRIA / GRADE DE GRAU (RECEITA MÉDICA)
                  </h4>
                  {receita && (
                    <span className="text-xs font-mono text-slate-600">
                      Prescritor: {receita.medico_prescritor} ({receita.registro_profissional})
                    </span>
                  )}
                </div>
                <PrescricaoGrade receita={receita} readOnly={true} />
              </div>

              {/* Especificações da Armação e Lente */}
              <div className="grid grid-cols-2 gap-4 border border-slate-900 p-3 text-xs">
                <div>
                  <h5 className="font-bold uppercase border-b border-slate-400 pb-1 mb-2">1. Dados da Armação</h5>
                  <p><strong>Descrição:</strong> {os.armacao_descricao}</p>
                  <p><strong>Ref / Código:</strong> {os.armacao_referencia || 'N/A'}</p>
                  <p><strong>Tipo:</strong> {os.armacao_propria ? 'Armação Própria do Cliente (Usada)' : 'Armação Nova da Loja'}</p>
                  <div className="mt-2 grid grid-cols-4 gap-1 text-[11px] font-mono bg-slate-100 p-1.5 border border-slate-300">
                    <div>Aro: {os.aro_horizontal_mm || '-'}mm</div>
                    <div>Ponte: {os.ponte_mm || '-'}mm</div>
                    <div>Alt: {os.aro_vertical_mm || '-'}mm</div>
                    <div>Diag: {os.maior_diagonal_mm || '-'}mm</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold uppercase border-b border-slate-400 pb-1 mb-2">2. Especificações das Lentes</h5>
                  <p><strong>Lente:</strong> {os.lente_descricao}</p>
                  <p><strong>Material:</strong> {os.lente_material}</p>
                  <p><strong>Design:</strong> {os.lente_design}</p>
                  <div className="mt-2">
                    <strong className="block text-[11px] text-slate-700">Tratamentos Selecionados:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {os.tratamentos.map((t, idx) => (
                        <span key={idx} className="bg-slate-200 border border-slate-400 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações e Check de Qualidade */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="col-span-2 border border-slate-300 p-2.5 rounded">
                  <strong className="block text-slate-700">Observações de Montagem:</strong>
                  <p className="text-slate-600 text-[11px] mt-1 italic">
                    {os.observacoes_internas || 'Nenhuma observação técnica extra.'}
                  </p>
                </div>
                <div className="border border-slate-900 p-2.5 rounded text-center">
                  <strong className="block text-slate-900 uppercase text-[10px]">Controle de Qualidade</strong>
                  <div className="mt-4 border-b border-dashed border-slate-400"></div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Assinatura do Técnico / Lensômetro</span>
                </div>
              </div>

            </div>
          ) : tipoImpressao === 'COMPROVANTE_CLIENTE' ? (
            /* COMPROVANTE DO CLIENTE / CUPOM DE RETIRADA */
            <div className="max-w-md mx-auto border-2 border-slate-800 p-6 space-y-4 font-mono text-xs">
              <div className="text-center border-b border-slate-400 pb-3">
                <h2 className="text-base font-bold uppercase">{loja.nome_fantasia}</h2>
                <p className="text-[11px]">{loja.razao_social}</p>
                <p className="text-[11px]">CNPJ: {loja.cnpj} - Tel: {loja.telefone}</p>
                <p className="text-[11px]">{loja.endereco}</p>
              </div>

              <div className="text-center font-bold text-sm bg-slate-100 py-1.5 border border-slate-300">
                COMPROVANTE DE PEDIDO / O.S. #{os.numero_os}
              </div>

              <div>
                <p><strong>Cliente:</strong> {os.cliente_nome}</p>
                <p><strong>Telefone:</strong> {os.cliente_telefone}</p>
                <p><strong>Data Pedido:</strong> {new Date(os.data_abertura).toLocaleDateString('pt-BR')}</p>
                <p><strong>Previsão Retirada:</strong> <span className="underline font-bold">{new Date(os.data_prometida).toLocaleDateString('pt-BR')}</span></p>
              </div>

              <div className="border-t border-b border-dashed border-slate-400 py-2 space-y-1">
                <p><strong>Armação:</strong> {os.armacao_descricao}</p>
                <p><strong>Lentes:</strong> {os.lente_descricao}</p>
                <p><strong>Tratamentos:</strong> {os.tratamentos.join(', ')}</p>
              </div>

              <div className="space-y-1 text-right">
                <p>Subtotal Produtos/Lentes: R$ {(os.valor_armacao + os.valor_lentes + os.valor_tratamentos).toFixed(2)}</p>
                <p>Serviços de Montagem: R$ {os.valor_servicos_montagem.toFixed(2)}</p>
                {os.valor_desconto > 0 && (
                  <p className="text-rose-600">Desconto: - R$ {os.valor_desconto.toFixed(2)}</p>
                )}
                <p className="text-sm font-bold border-t border-slate-800 pt-1">
                  TOTAL: R$ {os.valor_total.toFixed(2)}
                </p>
              </div>

              <div className="border-t border-slate-300 pt-3 text-[10px] text-slate-600 text-center space-y-1">
                <p><strong>Termo de Garantia:</strong></p>
                <p>Garantia de 1 ano contra defeitos de fabricação e tratamentos. Não cobre riscos por mau uso.</p>
                <p className="font-bold mt-2">Apresente este comprovante no momento da retirada.</p>
              </div>
            </div>
          ) : (
            /* =================================================================== */
            /* MODELO 3: CUPOM TÉRMICO (80MM / 58MM)                               */
            /* =================================================================== */
            <div className="w-80 bg-white text-slate-950 p-4 shadow-md rounded border border-slate-300 font-mono text-[11px] space-y-3 mx-auto">
              <div className="text-center border-b border-dashed border-slate-400 pb-2">
                <h2 className="font-extrabold text-sm uppercase">{loja.nome_fantasia}</h2>
                <p className="text-[10px]">CNPJ: {loja.cnpj}</p>
                <p className="text-[10px]">{loja.endereco} - {loja.cidade}/{loja.uf}</p>
                <p className="text-[10px]">TEL: {loja.telefone}</p>
                <div className="my-1.5 font-bold text-xs bg-slate-100 py-0.5">
                  ORDEM DE SERVIÇO #{os.numero_os}
                </div>
                <p>ABERTURA: {new Date(os.data_abertura).toLocaleDateString('pt-BR')}</p>
                <p className="font-bold">ENTREGA: {new Date(os.data_prometida).toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2">
                <p><strong>CLIENTE:</strong> {os.cliente_nome}</p>
                <p><strong>FONE:</strong> {os.cliente_telefone}</p>
                <p><strong>ATENDENTE:</strong> {os.atendente_nome}</p>
              </div>

              {receita && (
                <div className="border-b border-dashed border-slate-400 pb-2 text-[10px]">
                  <p className="font-bold text-[11px] mb-0.5">DIOPTRIA MÉDICA:</p>
                  <p>OD: {receita.esferico_od > 0 ? '+' : ''}{receita.esferico_od} Esf | {receita.cilindrico_od} Cil | {receita.eixo_od}° Eixo</p>
                  <p>OE: {receita.esferico_oe > 0 ? '+' : ''}{receita.esferico_oe} Esf | {receita.cilindrico_oe} Cil | {receita.eixo_oe}° Eixo</p>
                  {receita.adicao && <p>ADIÇÃO: +{receita.adicao}</p>}
                  <p>DNP: OD {os.medicoes_dnp_od || receita.dnp_od}mm | OE {os.medicoes_dnp_oe || receita.dnp_oe}mm</p>
                </div>
              )}

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-1">
                <p><strong>ARMAÇÃO:</strong> {os.armacao_descricao}</p>
                <p><strong>LENTES:</strong> {os.lente_descricao}</p>
                <p><strong>TRATAMENTOS:</strong> {os.tratamentos.join(', ')}</p>
              </div>

              <div className="border-b border-dashed border-slate-400 pb-2 space-y-0.5">
                <div className="flex justify-between font-bold text-xs">
                  <span>VALOR TOTAL:</span>
                  <span>R$ {os.valor_total.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-right">STATUS: {os.status}</p>
              </div>

              <div className="text-center text-[9px] pt-1 space-y-1">
                <p>Garantia de 1 ano nas lentes e armação.</p>
                <p className="font-bold">Apresente este cupom para retirar seus óculos.</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 no-print">
          <button
            onClick={onClose}
            className="neo-button-secondary"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="neo-button-primary flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Imprimir Documento
          </button>
        </div>

      </div>
    </div>
  );
};
