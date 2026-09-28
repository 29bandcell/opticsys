import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Eye, 
  Glasses, 
  Send, 
  Check, 
  ShieldCheck, 
  Sun, 
  Laptop, 
  Layers, 
  DollarSign, 
  Printer, 
  Copy,
  ChevronRight,
  TrendingUp,
  Info,
  Plus,
  Minus,
  Sparkle
} from 'lucide-react';
import { useAuthAndTenant } from '../../context/AuthAndTenantContext';
import { evolutionService } from '../../services/evolutionApi';

interface SimuladorLentesModalProps {
  isOpen?: boolean;
  onClose: () => void;
  initialEsferico?: number;
  initialCilindrico?: number;
  clienteNome?: string;
  clienteFone?: string;
}

export const SimuladorLentesModal: React.FC<SimuladorLentesModalProps> = ({
  isOpen = true,
  onClose,
  initialEsferico = -3.50,
  initialCilindrico = -1.00,
  clienteNome = '',
  clienteFone = ''
}) => {
  const { lojaAtiva } = useAuthAndTenant();
  
  // Inputs com estado em string para aceitar tanto vírgula quanto ponto
  const [esfericoInput, setEsfericoInput] = useState<string>(initialEsferico.toFixed(2));
  const [cilindricoInput, setCilindricoInput] = useState<string>(initialCilindrico.toFixed(2));
  const [diametroArmacao, setDiametroArmacao] = useState<number>(54); // mm
  const [nomeCliente, setNomeCliente] = useState<string>(clienteNome);
  const [foneCliente, setFoneCliente] = useState<string>(clienteFone);

  // Seleção de Índice (permite manual ou cálculo automático)
  const [indiceSelecionadoId, setIndiceSelecionadoId] = useState<string | null>(null);

  // Tratamentos Selecionados
  const [antirreflexo, setAntirreflexo] = useState<boolean>(true);
  const [blueUV, setBlueUV] = useState<boolean>(true);
  const [fotossensivel, setFotossensivel] = useState<boolean>(false);
  const [hidrorrepelente, setHidrorrepelente] = useState<boolean>(true);

  const [isEnviandoZap, setIsEnviandoZap] = useState<boolean>(false);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);

  if (isOpen === false) return null;

  // Conversão segura de string (aceita vírgula e ponto)
  const parseGrau = (val: string): number => {
    if (!val) return 0;
    const clean = val.replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const esferico = parseGrau(esfericoInput);
  const cilindrico = parseGrau(cilindricoInput);

  // Cálculo Dinâmico de Dioptria Total
  const grauTotal = Math.abs(esferico) + Math.abs(cilindrico) * 0.5;
  const isMiopia = esferico <= 0;

  // Ajustar grau com stepper (+ / -)
  const ajustarGrau = (tipo: 'ESF' | 'CIL', delta: number) => {
    if (tipo === 'ESF') {
      const novo = esferico + delta;
      setEsfericoInput(novo.toFixed(2));
    } else {
      const novo = Math.min(0, cilindrico + delta); // Astigmatismo normalmente negativo
      setCilindricoInput(novo.toFixed(2));
    }
  };

  // Determina automaticamente o índice ideal para o grau informado
  const getIndiceIdealId = (): string => {
    if (grauTotal <= 2.0) return 'cr39';
    if (grauTotal <= 4.0) return 'resina156';
    if (grauTotal <= 6.0) return 'alto167';
    return 'ultra174';
  };

  const indiceAtivoId = indiceSelecionadoId || getIndiceIdealId();

  // Tabela Oficial dos Índices de Refração
  const indices = [
    {
      id: 'cr39',
      nome: 'CR-39 (1.50)',
      subtitulo: 'Resina Convencional',
      fatorReducao: 1.0,
      pesoFator: 1.0,
      precoMedio: 160,
      indicacao: 'Ideal para graus baixos (até ±2.00)',
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
    },
    {
      id: 'resina156',
      nome: 'Resina 1.56',
      subtitulo: 'Intermediária Leve',
      fatorReducao: 0.82,
      pesoFator: 0.88,
      precoMedio: 270,
      indicacao: 'Para graus médios (±2.00 a ±4.00)',
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
    },
    {
      id: 'poli159',
      nome: 'Policarbonato 1.59',
      subtitulo: 'Alta Resistência Anti-Quebra',
      fatorReducao: 0.76,
      pesoFator: 0.78,
      precoMedio: 390,
      indicacao: 'Ideal para crianças, esportes e parafusadas',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
    },
    {
      id: 'alto167',
      nome: 'Alto Índice 1.67',
      subtitulo: 'Slim Fina & Estética',
      fatorReducao: 0.65,
      pesoFator: 0.70,
      precoMedio: 690,
      indicacao: 'Recomendada para ±4.00 a ±7.00 graus',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
    },
    {
      id: 'ultra174',
      nome: 'Ultra Fina 1.74',
      subtitulo: 'Máxima Finura & Leveza',
      fatorReducao: 0.52,
      pesoFator: 0.60,
      precoMedio: 1290,
      indicacao: 'Alta miopia/hipermetropia (acima de ±6.00)',
      badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300'
    }
  ];

  // Cálculo físico estimado de espessura de borda e centro em mm
  const calcularEspessuras = (fator: number) => {
    let espBorda = 0;
    let espCentro = 0;

    const fatorAro = Math.max(0.8, (diametroArmacao / 52));

    if (isMiopia) {
      // Miopia: Centro fino (1.2mm), Borda grossa proporcional ao grau e diâmetro
      espCentro = 1.2;
      const baseBorda = 1.2 + (grauTotal * 0.92 * fatorAro);
      espBorda = Math.max(1.2, baseBorda * fator);
    } else {
      // Hipermetropia: Borda fina (1.2mm), Centro grosso
      espBorda = 1.2 * fator;
      const baseCentro = 1.2 + (grauTotal * 0.85 * fatorAro);
      espCentro = Math.max(1.2, baseCentro * fator);
    }

    return {
      borda: espBorda.toFixed(1),
      centro: espCentro.toFixed(1),
      bordaNum: espBorda,
      centroNum: espCentro
    };
  };

  const enviarComparativoWhatsApp = async () => {
    if (!foneCliente) {
      alert('Por favor, informe o WhatsApp do cliente.');
      return;
    }

    setIsEnviandoZap(true);
    const instanceName = lojaAtiva.nome_fantasia.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'opticsys_matriz';

    const textoComparativo = `👓 *COMPARATIVO DE LENTES PERSONALIZADO - ${lojaAtiva.nome_fantasia.toUpperCase()}*\n\nOlá, *${nomeCliente || 'Cliente'}*! Segue a simulação de espessura e tratamentos para sua receita (${esferico > 0 ? '+' : ''}${esferico.toFixed(2)} Esf / ${cilindrico.toFixed(2)} Cil):\n\n` +
      indices.map(idx => {
        const esp = calcularEspessuras(idx.fatorReducao);
        const redPerc = Math.round((1 - idx.fatorReducao) * 100);
        const recomendada = idx.id === getIndiceIdealId() ? ' ⭐ *[RECOMENDADA PELA ÓTICA]*' : '';
        return `• *${idx.nome}:* Espessura aprox. *${esp.borda} mm* ${redPerc > 0 ? `(_${redPerc}% mais fina_)` : '(_Padrão_)'}${recomendada}`;
      }).join('\n') +
      `\n\n✨ *Tratamentos Selecionados:*\n` +
      `${antirreflexo ? '✅ Antirreflexo Digital de Alta Performance\n' : ''}` +
      `${blueUV ? '✅ Filtro Blue UV (Proteção Telas e Celular)\n' : ''}` +
      `${fotossensivel ? '✅ Fotossensível Transitions (Escurece ao Sol)\n' : ''}` +
      `${hidrorrepelente ? '✅ Camada Hidrorrepelente (Fácil Limpeza)\n' : ''}` +
      `\n📍 Venha conferir as armações na *${lojaAtiva.nome_fantasia}*! Qualquer dúvida estamos à disposição.`;

    try {
      await evolutionService.enviarMensagemTexto(instanceName, foneCliente, textoComparativo);
      setSucessoMsg('Simulação enviada com sucesso para o WhatsApp do cliente!');
      setTimeout(() => setSucessoMsg(null), 4000);
    } catch (e) {
      window.open(`https://wa.me/55${foneCliente.replace(/\D/g, '')}?text=${encodeURIComponent(textoComparativo)}`, '_blank');
    } finally {
      setIsEnviandoZap(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[94vh] flex flex-col overflow-hidden text-slate-800 dark:text-zinc-100">
        
        {/* Header Visual de Balcão */}
        <div className="bg-gradient-to-r from-[#0284C7] to-teal-700 text-white px-5 py-3.5 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                Simulador de Espessura & Comparador de Lentes
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Ferramenta de Balcão
                </span>
              </h2>
              <p className="text-[11px] text-white/80">
                Altere os graus abaixo e visualize a diferença real de espessura de borda entre cada índice de refração.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {sucessoMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              {sucessoMsg}
            </div>
          )}

          {/* Painel de Controles da Dioptria com Steppers Rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 dark:bg-zinc-900/70 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
            
            {/* 1. Grau Esférico */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Grau Esférico (OD/OE):
                </label>
                <span className="text-[10px] font-mono font-bold text-[#0284C7] bg-sky-50 dark:bg-sky-950 px-1.5 py-0.2 rounded">
                  {esferico > 0 ? `+${esferico.toFixed(2)}` : esferico.toFixed(2)} DE
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => ajustarGrau('ESF', -0.25)}
                  className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-slate-800 dark:text-white transition-all active:scale-95 cursor-pointer"
                  title="Diminuir 0.25"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="text"
                  value={esfericoInput}
                  onChange={e => setEsfericoInput(e.target.value)}
                  placeholder="-3.50"
                  className="flex-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono font-black text-center text-slate-900 dark:text-white text-xs outline-none focus:border-[#0284C7]"
                />

                <button
                  type="button"
                  onClick={() => ajustarGrau('ESF', +0.25)}
                  className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-slate-800 dark:text-white transition-all active:scale-95 cursor-pointer"
                  title="Aumentar 0.25"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[10px] text-slate-400 mt-1 block">
                {esferico < 0 ? '🔵 Miopia (Borda mais grossa)' : esferico > 0 ? '🟠 Hipermetropia (Centro grosso)' : '⚪ Lente Plana (Sem grau)'}
              </span>
            </div>

            {/* 2. Grau Cilíndrico */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Cilíndrico (Astigmatismo):
                </label>
                <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-300 bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.2 rounded">
                  {cilindrico.toFixed(2)} DC
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => ajustarGrau('CIL', -0.25)}
                  className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-slate-800 dark:text-white transition-all active:scale-95 cursor-pointer"
                  title="Diminuir 0.25"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="text"
                  value={cilindricoInput}
                  onChange={e => setCilindricoInput(e.target.value)}
                  placeholder="-1.00"
                  className="flex-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 font-mono font-black text-center text-slate-900 dark:text-white text-xs outline-none focus:border-[#0284C7]"
                />

                <button
                  type="button"
                  onClick={() => ajustarGrau('CIL', +0.25)}
                  className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-slate-800 dark:text-white transition-all active:scale-95 cursor-pointer"
                  title="Aumentar 0.25"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[10px] text-slate-400 mt-1 block">Correção de Astigmatismo</span>
            </div>

            {/* 3. Tamanho do Aro */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Aro da Armação:
                </label>
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-zinc-400">
                  {diametroArmacao} mm
                </span>
              </div>

              <div className="flex gap-1">
                {[
                  { label: 'P (48mm)', val: 48 },
                  { label: 'M (52mm)', val: 52 },
                  { label: 'G (56mm)', val: 56 }
                ].map(item => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setDiametroArmacao(item.val)}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      diametroArmacao === item.val
                        ? 'bg-[#0284C7] text-white shadow-xs'
                        : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <span className="text-[10px] text-slate-400 mt-1 block">Aros menores deixam a borda mais fina</span>
            </div>

            {/* 4. WhatsApp do Cliente */}
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                WhatsApp do Paciente:
              </label>
              <input
                type="text"
                placeholder="(88) 99999-9999"
                value={foneCliente}
                onChange={e => setFoneCliente(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 font-mono text-slate-900 dark:text-white placeholder:text-slate-400 text-xs outline-none focus:border-[#0284C7]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Para enviar proposta comparativa</span>
            </div>

          </div>

          {/* Comparador Visual de Lentes & Espessura em Tempo Real */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#0284C7]" />
                  Comparativo de Espessura em Milímetros (Corte Transversal Lateral)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Clique em qualquer lente para selecioná-la ou siga a recomendação automática da ótica.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full font-mono">
                  Grau Total: <strong className="text-[#0284C7] dark:text-sky-400 font-bold">{grauTotal.toFixed(2)} D</strong>
                </span>
              </div>
            </div>

            {/* Grid dos 5 Índices de Refração */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {indices.map((idx) => {
                const esp = calcularEspessuras(idx.fatorReducao);
                const percentualReducao = Math.round((1 - idx.fatorReducao) * 100);
                const isIdeal = idx.id === getIndiceIdealId();
                const isSelected = idx.id === indiceAtivoId;

                // Dimensões físicas para o desenho do corte da lente (SVG)
                const hBorda = Math.min(68, Math.max(12, esp.bordaNum * 6.5));
                const hCentro = Math.min(68, Math.max(10, esp.centroNum * 6.5));

                return (
                  <div
                    key={idx.id}
                    onClick={() => setIndiceSelecionadoId(idx.id)}
                    className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all cursor-pointer relative select-none group active:scale-[0.98] ${
                      isSelected
                        ? 'bg-sky-50/90 dark:bg-sky-950/40 border-[#0284C7] ring-4 ring-[#0284C7]/20 shadow-lg'
                        : isIdeal
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 shadow-sm'
                        : 'bg-white dark:bg-zinc-900/80 border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                    }`}
                  >
                    {/* Badge Recomendado ou Selecionado */}
                    {isIdeal && (
                      <div className="absolute -top-2.5 right-3 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1">
                        <Sparkle className="w-2.5 h-2.5 fill-current" /> Recomendada
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${idx.badgeColor}`}>
                          {idx.nome}
                        </span>
                        {percentualReducao > 0 && (
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-1.5 py-0.5 rounded-md font-mono">
                            -{percentualReducao}%
                          </span>
                        )}
                      </div>

                      <p className="font-extrabold text-slate-900 dark:text-zinc-100 text-xs mt-1">{idx.subtitulo}</p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5 min-h-[26px]">{idx.indicacao}</p>

                      {/* Silhueta Visual Realista da Lente (Perfil de Corte Lateral) */}
                      <div className="my-3 p-2 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-zinc-800 dark:to-zinc-900 rounded-xl flex flex-col items-center justify-center h-28 relative overflow-hidden border border-slate-200 dark:border-zinc-700/80 shadow-inner">
                        
                        <svg className="w-28 h-20" viewBox="0 0 100 80">
                          <defs>
                            <linearGradient id={`grad-${idx.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
                              <stop offset="50%" stopColor="#7DD3FC" stopOpacity="0.6" />
                              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.9" />
                            </linearGradient>
                          </defs>

                          {/* Desenho da Lente Côncava (Miopia) ou Convexa (Hipermetropia) */}
                          <path
                            d={isMiopia 
                              ? `M 12,${40 - hBorda/2} Q 50,${40 - hCentro/2} 88,${40 - hBorda/2} L 88,${40 + hBorda/2} Q 50,${40 + hCentro/2} 12,${40 + hBorda/2} Z`
                              : `M 12,${40 - hBorda/2} Q 50,${40 - hCentro/2} 88,${40 - hBorda/2} L 88,${40 + hBorda/2} Q 50,${40 + hCentro/2} 12,${40 + hBorda/2} Z`
                            }
                            fill={`url(#grad-${idx.id})`}
                            stroke="#0284C7"
                            strokeWidth="1.5"
                            className="transition-all duration-300"
                          />

                          {/* Linha guia de medição da borda */}
                          <line x1="8" y1={40 - hBorda/2} x2="8" y2={40 + hBorda/2} stroke="#0369A1" strokeWidth="1.5" strokeDasharray="2,2" />
                        </svg>

                        {/* Medidas em Milímetros */}
                        <div className="flex justify-between items-center w-full px-2 text-[10px] font-mono font-bold text-slate-700 dark:text-zinc-200 mt-1">
                          <span>Borda: <strong className="text-slate-900 dark:text-white">{esp.borda}mm</strong></span>
                          <span>Centro: <strong>{esp.centro}mm</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Preço e Botão de Escolha */}
                    <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Preço Estimado:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white font-mono text-xs">
                        R$ {idx.precoMedio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seção de Tratamentos Especiais */}
          <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Adicionar Tratamentos de Proteção Óptica
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${antirreflexo ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 shadow-2xs' : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'}`}>
                <input
                  type="checkbox"
                  checked={antirreflexo}
                  onChange={e => setAntirreflexo(e.target.checked)}
                  className="rounded text-[#0284C7] w-4 h-4"
                />
                <div>
                  <strong className="block text-slate-800 dark:text-zinc-200 text-xs">Antirreflexo Digital</strong>
                  <span className="text-[10px] text-slate-500">Elimina reflexos e brilho noturno de faróis</span>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${blueUV ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 shadow-2xs' : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'}`}>
                <input
                  type="checkbox"
                  checked={blueUV}
                  onChange={e => setBlueUV(e.target.checked)}
                  className="rounded text-[#0284C7] w-4 h-4"
                />
                <div>
                  <strong className="block text-slate-800 dark:text-zinc-200 text-xs">Filtro Blue UV</strong>
                  <span className="text-[10px] text-slate-500">Bloqueia luz azul nociva de telas e celulares</span>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${fotossensivel ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 shadow-2xs' : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'}`}>
                <input
                  type="checkbox"
                  checked={fotossensivel}
                  onChange={e => setFotossensivel(e.target.checked)}
                  className="rounded text-[#0284C7] w-4 h-4"
                />
                <div>
                  <strong className="block text-slate-800 dark:text-zinc-200 text-xs">Fotossensível (Transitions)</strong>
                  <span className="text-[10px] text-slate-500">Escurece no sol (Conforto 2 em 1)</span>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${hidrorrepelente ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 shadow-2xs' : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'}`}>
                <input
                  type="checkbox"
                  checked={hidrorrepelente}
                  onChange={e => setHidrorrepelente(e.target.checked)}
                  className="rounded text-[#0284C7] w-4 h-4"
                />
                <div>
                  <strong className="block text-slate-800 dark:text-zinc-200 text-xs">Hidrorrepelente</strong>
                  <span className="text-[10px] text-slate-500">Repele água, gordura e poeira com facilidade</span>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Footer com Ações */}
        <div className="bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 text-xs">
            <Info className="w-4 h-4 text-[#0284C7] shrink-0" />
            <span>Dica de Balcão: Lentes 1.67 e 1.74 proporcionam <strong>estética perfeita sem efeito fundo de garrafa</strong>.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none px-3.5 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl hover:bg-white dark:hover:bg-zinc-800 font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir Proposta
            </button>

            <button
              onClick={enviarComparativoWhatsApp}
              disabled={isEnviandoZap}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {isEnviandoZap ? 'Enviando...' : 'Enviar Comparativo no WhatsApp'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
