import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Gift, 
  QrCode, 
  Boxes, 
  FileText, 
  Eye, 
  ChevronRight, 
  Clock, 
  Trophy,
  X
} from 'lucide-react';
import { useAuthAndTenant } from '../../context/AuthAndTenantContext';
import { PupilometroDigitalModal } from '../common/PupilometroDigitalModal';

interface OnboardingTrialBannerProps {
  onNavigate: (tab: string) => void;
  onOpenNovaOS?: () => void;
}

export const OnboardingTrialBanner: React.FC<OnboardingTrialBannerProps> = ({
  onNavigate,
  onOpenNovaOS
}) => {
  const { lojaAtiva, ordensServico, produtos, clientes } = useAuthAndTenant();
  const [oculto, setOculto] = useState(false);
  const [isPupilometroOpen, setIsPupilometroOpen] = useState(false);

  // Calcula o progresso real com base nos dados cadastrados
  const passo1Concluido = true; // WhatsApp pronto/conectado
  const passo2Concluido = produtos.length > 0; // Cadastrou produto
  const passo3Concluido = ordensServico.length > 0; // Emitiu OS
  const passo4Concluido = clientes.some(c => (c.dnp_od && c.dnp_od > 0) || (c.altura_od && c.altura_od > 0)); // Pupilômetro usado

  const tarefas = [
    {
      id: 'zap',
      titulo: '1. Conectar WhatsApp da Ótica',
      sub: 'Conecte via QR Code para o robô de aniversário',
      concluido: passo1Concluido,
      acao: () => onNavigate('zapotica'),
      icone: QrCode
    },
    {
      id: 'produto',
      titulo: '2. Cadastrar 1ª Armação / Lente',
      sub: 'Ou importe o XML do seu fornecedor',
      concluido: passo2Concluido,
      acao: () => onNavigate('produtos'),
      icone: Boxes
    },
    {
      id: 'os',
      titulo: '3. Emitir 1ª Ordem de Serviço (O.S.)',
      sub: 'Crie e imprima a ordem para a oficina',
      concluido: passo3Concluido,
      acao: () => {
        if (onOpenNovaOS) onOpenNovaOS();
        else onNavigate('os');
      },
      icone: FileText
    },
    {
      id: 'pupilometro',
      titulo: '4. Usar Pupilômetro Digital',
      sub: 'Meça a DNP e Altura usando a câmera',
      concluido: passo4Concluido,
      acao: () => setIsPupilometroOpen(true),
      icone: Eye
    }
  ];

  const totalConcluidas = tarefas.filter(t => t.concluido).length;
  const porcentagem = Math.round((totalConcluidas / tarefas.length) * 100);

  if (oculto) return null;

  return (
    <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-xl border border-sky-500/30 mb-6 relative overflow-hidden">
      
      {/* Detalhe de Fundo */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        
        {/* Header do Onboarding */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  Missão de Boas-Vindas • 7 Dias de Teste Gratuito
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  7 Dias Restantes
                </span>
              </div>
              <p className="text-xs text-white/70">
                Complete os 4 passos para dominar o sistema e desbloquear <strong>+3 dias bônus de teste</strong>!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider block">Progresso</span>
              <span className="text-sm font-black font-mono text-amber-400">{porcentagem}% Concluído</span>
            </div>
            <button
              onClick={() => setOculto(true)}
              className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Ocultar banner de onboarding"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Progresso Animada */}
        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-2.5 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${porcentagem}%` }}
          />
        </div>

        {/* Grid das 4 Tarefas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {tarefas.map(tarefa => {
            const Icone = tarefa.icone;
            return (
              <button
                key={tarefa.id}
                onClick={tarefa.acao}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  tarefa.concluido
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100 hover:bg-emerald-950/60'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-sky-400/50'
                }`}
              >
                <div className="mt-0.5">
                  {tarefa.concluido ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-white/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold block truncate text-xs">{tarefa.titulo}</span>
                  <span className="text-[10px] text-white/60 block truncate">{tarefa.sub}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-white/40 mt-1" />
              </button>
            );
          })}
        </div>

        {/* Recompensa */}
        {porcentagem === 100 && (
          <div className="bg-emerald-500/20 border border-emerald-400/40 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-300 animate-bounce" />
              <span><strong>Parabéns!</strong> Você concluiu todas as etapas da sua ótica. Seu bônus de teste foi ativado!</span>
            </div>
            <button
              onClick={() => onNavigate('assinatura')}
              className="px-3 py-1 bg-amber-400 text-slate-950 font-black rounded-lg text-[11px] shadow-xs hover:bg-amber-300 transition-colors"
            >
              Ver Planos com Desconto
            </button>
          </div>
        )}

        {/* Modal do Pupilômetro Digital */}
        <PupilometroDigitalModal
          isOpen={isPupilometroOpen}
          onClose={() => setIsPupilometroOpen(false)}
        />

      </div>
    </div>
  );
};
