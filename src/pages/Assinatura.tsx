import React, { useState } from 'react';
import { 
  CreditCard, 
  Store, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Download, 
  Sparkles, 
  Building2,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { Loja, TenantPlan } from '../types';
import { mercadoPagoService, PixPaymentResponse } from '../services/mercadoPagoService';
import { MERCADO_PAGO_CONFIG } from '../config/mercadopago';

export const Assinatura: React.FC = () => {
  const { lojas, lojaAtiva, adicionarFilial, removerLoja } = useAuthAndTenant();

  const [isModalCheckoutOpen, setIsModalCheckoutOpen] = useState(false);
  const [isModalNovaFilialOpen, setIsModalNovaFilialOpen] = useState(false);
  const [formFilial, setFormFilial] = useState({
    nome_fantasia: '',
    razao_social: '',
    cnpj: '',
    telefone: '',
    email: '',
    cidade: '',
    uf: 'CE',
    endereco: ''
  });
  const [lojaParaAssinar, setLojaParaAssinar] = useState<Loja | null>(null);
  const [planoSelecionado, setPlanoSelecionado] = useState<TenantPlan>('pro');
  const [ciclo, setCiclo] = useState<'MENSAL' | 'ANUAL'>('ANUAL');
  const [metodoPagamento, setMetodoPagamento] = useState<'PIX' | 'CARTAO'>('PIX');
  const [pixCopiado, setPixCopiado] = useState(false);
  const [pagamentoConfirmado, setPagamentoConfirmado] = useState(false);
  const [pixData, setPixData] = useState<PixPaymentResponse | null>(null);
  const [isGerandoPix, setIsGerandoPix] = useState(false);
  const [sucessoAlerta, setSucessoAlerta] = useState<string | null>(null);

  const carregarPixMercadoPago = async (loja: Loja, plano: TenantPlan, cicloEscolhido: 'MENSAL' | 'ANUAL') => {
    setIsGerandoPix(true);
    const valor = cicloEscolhido === 'ANUAL' 
      ? (plano === 'pro_nf' ? 1438.80 : 958.80)
      : (plano === 'pro_nf' ? 149.90 : 99.90);

    const res = await mercadoPagoService.criarPixCobranca({
      tenantId: loja.id,
      nomeOtica: loja.nome_fantasia,
      email: loja.email || 'opticcsys@gmail.com',
      telefone: loja.telefone || '(88) 98882-2847',
      cnpj: loja.cnpj,
      valor: valor,
      descricao: plano === 'pro_nf' ? 'Plano Pro + NF' : 'Plano Pro'
    });

    setPixData(res);
    setIsGerandoPix(false);
  };

  const handleOpenCheckout = (loja: Loja) => {
    setLojaParaAssinar(loja);
    const plan = (loja.plano || 'pro') as TenantPlan;
    setPlanoSelecionado(plan);
    setIsModalCheckoutOpen(true);
    setPagamentoConfirmado(false);
    carregarPixMercadoPago(loja, plan, ciclo);
  };

  const handleChangePlano = (novoPlano: TenantPlan) => {
    setPlanoSelecionado(novoPlano);
    if (lojaParaAssinar) {
      carregarPixMercadoPago(lojaParaAssinar, novoPlano, ciclo);
    }
  };

  const handleChangeCiclo = (novoCiclo: 'MENSAL' | 'ANUAL') => {
    setCiclo(novoCiclo);
    if (lojaParaAssinar) {
      carregarPixMercadoPago(lojaParaAssinar, planoSelecionado, novoCiclo);
    }
  };

  const handleConfirmarAssinatura = async () => {
    if (!lojaParaAssinar) return;
    setPagamentoConfirmado(true);

    const valor = ciclo === 'ANUAL' 
      ? (planoSelecionado === 'pro_nf' ? 1438.80 : 958.80)
      : (planoSelecionado === 'pro_nf' ? 149.90 : 99.90);

    const planType = planoSelecionado === 'pro_nf' ? 'pro_nf' : 'pro';

    const resultado = await mercadoPagoService.processarConfirmacaoPagamento(
      lojaParaAssinar.id,
      lojaParaAssinar.nome_fantasia,
      lojaParaAssinar.telefone,
      valor,
      planType
    );

    setTimeout(() => {
      lojaParaAssinar.status = 'ativo';
      lojaParaAssinar.plano = planoSelecionado;
      setIsModalCheckoutOpen(false);
      setPagamentoConfirmado(false);
      setSucessoAlerta(`🎉 Assinatura da ${lojaParaAssinar.nome_fantasia} ativada com sucesso via Mercado Pago! Validade: ${resultado.novaDataExpiracao}. Notificações enviadas no WhatsApp.`);
      setTimeout(() => setSucessoAlerta(null), 6000);
    }, 1200);
  };

  const copiarPix = () => {
    const textoParaCopiar = pixData?.qr_code || '00020126580014br.gov.bcb.pix0136wipelis-opticsys-2026';
    navigator.clipboard.writeText(textoParaCopiar);
    setPixCopiado(true);
    setTimeout(() => setPixCopiado(false), 3000);
  };

  return (
    <div className="space-y-4 max-w-5xl">
      
      {/* Título da Página - Clean & Profissional */}
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm flex items-center gap-2.5">
        <div className="text-xl">🗺️</div>
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100">
            Assinatura
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
            Gerencie as licenças, filiais e planos contratados para suas lojas.
          </p>
        </div>
      </div>

      {/* Alerta de Sucesso de Pagamento / Ativação */}
      {sucessoAlerta && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{sucessoAlerta}</span>
        </div>
      )}

      {/* Seção "Minhas Óticas" */}
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded shadow-sm overflow-hidden">
        
        <div className="px-4 py-3 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
            Minhas Óticas ({lojas.length})
          </h2>

          <button
            onClick={() => setIsModalNovaFilialOpen(true)}
            className="text-[11px] font-semibold text-[#0284C7] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Unidade / Filial
          </button>
        </div>

        {/* Tabela de Lojas */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 font-semibold border-b border-slate-200 dark:border-zinc-800">
                <th className="py-2.5 px-4 font-semibold text-[11px]">Razão Social</th>
                <th className="py-2.5 px-4 font-semibold text-[11px]">CNPJ</th>
                <th className="py-2.5 px-4 font-semibold text-[11px]">Nome da Ótica</th>
                <th className="py-2.5 px-4 text-center font-semibold text-[11px]">Status Licença</th>
                <th className="py-2.5 px-4 text-center font-semibold text-[11px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {lojas.map(loja => (
                <tr key={loja.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40 transition-colors">
                  
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                    <span className="text-base">🗺️</span>
                    <span>{loja.razao_social || loja.nome_fantasia}</span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                    {loja.cnpj || '-'}
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200">
                    {loja.nome_fantasia}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {loja.status === 'trial' ? (
                      <span className="inline-block bg-[#F59E0B] text-white font-bold text-[11px] px-3 py-0.5 rounded shadow-sm">
                        Teste (7 Dias)
                      </span>
                    ) : (
                      <span className="inline-block bg-[#10B981] text-white font-bold text-[11px] px-3 py-0.5 rounded shadow-sm">
                        Ativo
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenCheckout(loja)}
                        className="border border-[#0284C7] text-[#0284C7] hover:bg-[#0284C7] hover:text-white px-3 py-1 rounded text-xs font-semibold transition-all shadow-xs active:scale-95"
                      >
                        Assinar Plano
                      </button>

                      {lojas.length > 1 && (
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover a unidade "${loja.nome_fantasia}" desta conta?`)) {
                              removerLoja(loja.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Remover unidade desta conta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Resumo do Plano Contratado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plano Selecionado</span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">{lojaAtiva.plano} - MULTI-LOJAS</p>
          <span className="text-[11px] text-slate-500">Gestão de bancada, O.S., receitas e PDV liberados.</span>
        </div>

        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Período de Teste</span>
          <p className="text-sm font-extrabold text-amber-600">7 DIAS GRÁTIS</p>
          <span className="text-[11px] text-slate-500">Sem compromisso. Assine para garantir suporte contínuo.</span>
        </div>

        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unidades Cadastradas</span>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">{lojas.length} Óticas</p>
          <span className="text-[11px] text-slate-500">Matriz e filiais com isolamento seguro RLS.</span>
        </div>
      </div>

      {/* Modal de Checkout / Assinatura */}
      {isModalCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-lg shadow-2xl w-full max-w-xl p-5 space-y-4 my-8 text-xs">
            
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-2.5 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#0284C7]">Checkout de Licença</span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  Assinar Plano para: {lojaParaAssinar?.nome_fantasia}
                </h3>
              </div>
              <button
                onClick={() => setIsModalCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Ciclo Mensal / Anual */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-900 p-2 rounded">
              <span className="font-bold text-slate-700 dark:text-zinc-300">Ciclo de Cobrança:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleChangeCiclo('MENSAL')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${ciclo === 'MENSAL' ? 'bg-[#0284C7] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => handleChangeCiclo('ANUAL')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${ciclo === 'ANUAL' ? 'bg-[#0284C7] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  Anual (20% OFF)
                </button>
              </div>
            </div>

            {/* Planos Oficiais Wipelis */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { 
                  id: 'pro', 
                  name: 'Plano Pro ⚡', 
                  mensal: 99.90, 
                  anual: 79.90, 
                  desc: 'O.S., Receitas, PDV, Estoque, Pupilômetro & OpticZap (Sem emissor fiscal)' 
                },
                { 
                  id: 'pro_nf', 
                  name: 'Plano Pro + NF 🧾', 
                  mensal: 149.90, 
                  anual: 119.90, 
                  desc: 'Tudo do Pro + Emissor de NFC-e/NF-e com 50 Notas/mês por CNPJ e Importador de XML',
                  destaque: true
                }
              ].map(p => (
                <div
                  key={p.id}
                  onClick={() => handleChangePlano(p.id as TenantPlan)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    planoSelecionado === p.id 
                      ? 'border-[#0284C7] bg-sky-50/80 dark:bg-sky-950/40 ring-2 ring-[#0284C7]/20 shadow-md' 
                      : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</span>
                    {p.destaque && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
                        Recomendado
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-0.5 leading-tight">{p.desc}</span>
                  <div className="mt-2 font-mono font-black text-sm text-[#0284C7]">
                    R$ {ciclo === 'ANUAL' ? p.anual.toFixed(2) : p.mensal.toFixed(2)}
                    <span className="text-[10px] text-slate-400 font-normal">/mês</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagamento */}
            <div className="border-t border-slate-200 dark:border-zinc-800 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-zinc-300 block">
                  Forma de Pagamento (Mercado Pago Gateway):
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  ⚡ Liberação Instantânea via Webhook
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoPagamento('PIX')}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    metodoPagamento === 'PIX' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-slate-300 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" /> PIX (QR Code & Copia e Cola)
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoPagamento('CARTAO')}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    metodoPagamento === 'CARTAO' ? 'border-[#0284C7] bg-sky-50 text-[#0284C7] dark:bg-sky-950/40 dark:text-sky-300' : 'border-slate-300 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Cartão de Crédito (Até 12x)
                </button>
              </div>

              {metodoPagamento === 'PIX' ? (
                <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 text-center space-y-2">
                  <div className="w-32 h-32 bg-white p-1.5 border border-slate-300 mx-auto rounded-xl flex items-center justify-center shadow-xs">
                    {isGerandoPix ? (
                      <div className="text-slate-400 text-xs font-mono animate-pulse">Gerando PIX...</div>
                    ) : pixData?.qr_code_base64 && pixData.qr_code_base64.startsWith('data:image') ? (
                      <img
                        src={pixData.qr_code_base64}
                        alt="PIX Mercado Pago"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={pixData?.qr_code_base64 || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixData?.qr_code || '00020126580014br.gov.bcb.pix0136wipelis-2026')}`}
                        alt="PIX QR Code"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Escaneie no app do seu banco ou copie o código PIX abaixo:
                  </p>
                  
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={copiarPix}
                      className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 text-slate-700 dark:text-zinc-200 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 shadow-xs"
                    >
                      {pixCopiado ? '✓ Código PIX Copiado!' : '📋 Copiar Código PIX'}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarAssinatura}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-xs"
                      title="Simula a confirmação imediata do Webhook do Mercado Pago"
                    >
                      ⚡ Simular Webhook (Aprovar)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 bg-slate-50 dark:bg-zinc-900 p-3 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-0.5 text-[11px]">Número do Cartão</label>
                    <input type="text" placeholder="4532 •••• •••• 8847" className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 font-mono text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-0.5 text-[11px]">Validade</label>
                      <input type="text" placeholder="12/29" className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 font-mono text-xs" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-0.5 text-[11px]">CVV</label>
                      <input type="text" placeholder="847" className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded px-2.5 py-1.5 font-mono text-xs" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Total e Ação */}
            <div className="bg-slate-100 dark:bg-zinc-900 p-3 rounded-xl flex justify-between items-center font-mono border border-slate-200 dark:border-zinc-800">
              <div>
                <span className="text-[10px] text-slate-500 block">Total da Fatura:</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  R$ {ciclo === 'ANUAL' 
                    ? (planoSelecionado === 'pro_nf' ? 1438.80 : 958.80).toFixed(2) 
                    : (planoSelecionado === 'pro_nf' ? 149.90 : 99.90).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleConfirmarAssinatura}
                disabled={pagamentoConfirmado}
                className="px-5 py-2.5 bg-[#0284C7] hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {pagamentoConfirmado ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-spin" />
                    Ativando Licença via Webhook...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Ativar Assinatura Imediatamente
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal Adicionar Nova Filial */}
      {isModalNovaFilialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-lg shadow-2xl w-full max-w-lg p-5 space-y-4 text-xs">
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-2.5 flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#0284C7]">Multi-Lojas</span>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  Adicionar Nova Unidade / Filial
                </h3>
              </div>
              <button
                onClick={() => setIsModalNovaFilialOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!formFilial.nome_fantasia.trim()) {
                  alert('Informe o nome da unidade / filial.');
                  return;
                }
                const nova = adicionarFilial(formFilial);
                setIsModalNovaFilialOpen(false);
                setFormFilial({
                  nome_fantasia: '',
                  razao_social: '',
                  cnpj: '',
                  telefone: '',
                  email: '',
                  cidade: '',
                  uf: 'CE',
                  endereco: ''
                });
                setSucessoAlerta(`✅ Nova unidade "${nova.nome_fantasia}" cadastrada com sucesso!`);
                setTimeout(() => setSucessoAlerta(null), 5000);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Nome Fantasia da Unidade *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ótica Matriz - Filial 02"
                    value={formFilial.nome_fantasia}
                    onChange={(e) => setFormFilial(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                    className="w-full text-xs p-2 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Razão Social
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Ótica Principal Filial Ltda"
                    value={formFilial.razao_social}
                    onChange={(e) => setFormFilial(prev => ({ ...prev, razao_social: e.target.value }))}
                    className="w-full text-xs p-2 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0002-00"
                    value={formFilial.cnpj}
                    onChange={(e) => setFormFilial(prev => ({ ...prev, cnpj: e.target.value }))}
                    className="w-full text-xs p-2 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    WhatsApp / Telefone da Filial
                  </label>
                  <input
                    type="text"
                    placeholder="(88) 98888-8888"
                    value={formFilial.telefone}
                    onChange={(e) => setFormFilial(prev => ({ ...prev, telefone: e.target.value }))}
                    className="w-full text-xs p-2 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Fortaleza"
                    value={formFilial.cidade}
                    onChange={(e) => setFormFilial(prev => ({ ...prev, cidade: e.target.value }))}
                    className="w-full text-xs p-2 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    UF
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="CE"
                    value={formFilial.uf}
                    onChange={(e) => setFormFilial(prev => ({ ...prev, uf: e.target.value.toUpperCase() }))}
                    className="w-full text-xs p-2 rounded border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center font-bold uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalNovaFilialOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#0284C7] hover:bg-sky-700 text-white font-bold shadow-xs"
                >
                  Cadastrar Filial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

