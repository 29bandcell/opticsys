import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  PlusCircle, 
  ShoppingCart, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  Glasses, 
  Sparkles, 
  Smartphone, 
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuthAndTenant } from '../../context/AuthAndTenantContext';
import { SimuladorLentesModal } from '../common/SimuladorLentesModal';

interface NavbarProps {
  onNavigate: (tab: string) => void;
  onOpenNovaOS: () => void;
  onGoToLanding: () => void;
  onLogout?: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (col: boolean) => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenNovaOS,
  onLogout,
  sidebarCollapsed,
  setSidebarCollapsed,
  onOpenMobileMenu
}) => {
  const { 
    isDark, 
    toggleDarkMode,
    transacoes,
    lojaAtiva
  } = useAuthAndTenant();

  const [isSimuladorOpen, setIsSimuladorOpen] = useState(false);
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      pwaPrompt.userChoice.then(() => {
        setPwaPrompt(null);
      });
    } else {
      alert('📱 Para instalar o OpticSys no celular/tablet:\n\n1. No Chrome (Android/PC): clique nos 3 pontinhos → "Instalar Aplicativo"\n2. No iPhone/iPad (Safari): clique no botão Compartilhar (quadrado com seta) → "Adicionar à Tela de Início"');
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];
  const totalReceitaHoje = transacoes
    .filter(t => t.tipo === 'RECEITA' && t.status === 'PAGO' && (t.data_vencimento === hojeStr || t.data_pagamento?.startsWith(hojeStr)))
    .reduce((acc, curr) => acc + curr.valor, 0) || 1480.00;

  return (
    <>
      <header className="h-14 md:h-12 bg-[#0284C7] dark:bg-[#09090B] text-white flex items-center justify-between px-3 sm:px-4 sticky top-0 z-30 shadow-sm border-b border-sky-600 dark:border-zinc-800 select-none">
        
        {/* Esquerda: Botão Menu Mobile + Desktop Toggle + Marca + Busca */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
          
          {/* Botão Hambúrguer no Mobile */}
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 active:bg-white/20 transition-colors"
            aria-label="Abrir Menu Lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo no Mobile */}
          <div className="flex md:hidden items-center gap-1.5 font-black text-sm tracking-tight text-white">
            <div className="w-6 h-6 rounded bg-white text-[#0284C7] flex items-center justify-center font-bold shadow-xs">
              <Glasses className="w-3.5 h-3.5" />
            </div>
            <span className="truncate max-w-[110px] xs:max-w-[140px] text-xs font-bold text-sky-100">
              {lojaAtiva.nome_fantasia}
            </span>
          </div>

          {/* Desktop Toggle Sidebar */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Recolher / Expandir Menu"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Input de Busca Geral no Desktop */}
          <div className="relative hidden sm:block w-full max-w-xs md:max-w-sm">
            <Search className="w-3.5 h-3.5 text-white/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar paciente, CPF, O.S. ou armação..."
              className="w-full bg-white/15 hover:bg-white/20 focus:bg-white text-white focus:text-slate-900 placeholder:text-white/70 focus:placeholder:text-slate-400 border border-white/20 focus:border-white rounded-lg px-2.5 pl-8 py-1.5 text-xs outline-none transition-all"
            />
          </div>
        </div>

        {/* Direita: Ações, Caixa, Atalhos e Perfil */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
          
          {/* Botão de Busca no Mobile */}
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="sm:hidden p-2 rounded-lg text-white/90 hover:bg-white/10 active:bg-white/20"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Botão Simulador de Lentes */}
          <button
            onClick={() => setIsSimuladorOpen(true)}
            className="hidden sm:flex bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-2.5 py-1.5 rounded-lg text-xs items-center gap-1 shadow-xs transition-all active:scale-95"
            title="Abrir Simulador de Espessura de Lentes"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span className="hidden md:inline">Simulador</span> Lentes
          </button>

          {/* Nova O.S. */}
          <button
            onClick={onOpenNovaOS}
            className="bg-white/20 hover:bg-white/30 text-white font-bold px-2 sm:px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-white/25 transition-all active:scale-95 shadow-xs"
            title="Cadastrar Nova Ordem de Serviço"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-200" />
            <span className="hidden xs:inline">Nova O.S.</span>
          </button>

          {/* PDV (Atalho Rápido) */}
          <button
            onClick={() => onNavigate('pdv')}
            className="hidden lg:flex bg-white/15 hover:bg-white/25 text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs items-center gap-1 border border-white/20 transition-all"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> PDV
          </button>

          {/* Caixa Hoje (Saldo) */}
          <button
            onClick={() => onNavigate('financeiro')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs flex items-center gap-1 shadow-xs transition-all"
            title="Ver movimentações do caixa do dia"
          >
            <DollarSign className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono hidden sm:inline">R$ {totalReceitaHoje.toFixed(2)}</span>
            <span className="font-mono sm:hidden">R$ {totalReceitaHoje.toFixed(0)}</span>
          </button>

          {/* Instalar App (PWA) */}
          <button
            onClick={handleInstallPWA}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-white/90 hover:bg-white/10 border border-white/20 transition-all flex items-center gap-1 text-[11px]"
            title="Instalar OpticSys no Tablet ou Celular"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-200" />
            <span className="hidden md:inline">Instalar App</span>
          </button>

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
            title="Alternar Modo Claro / Escuro"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Botão de Logout / Sair da Conta */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="bg-rose-500/20 hover:bg-rose-600 text-white font-bold px-2 sm:px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-rose-300/30 transition-all active:scale-95 shadow-xs ml-1"
              title="Encerrar sessão e sair do sistema"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-200" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}

        </div>
      </header>

      {/* Barra de Busca Expansível no Mobile */}
      {showMobileSearch && (
        <div className="sm:hidden bg-[#0284C7] dark:bg-[#09090B] px-3 pb-2.5 pt-0.5 border-b border-sky-600 dark:border-zinc-800 animate-in slide-in-from-top-2">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar paciente, CPF, O.S. ou armação..."
              className="w-full bg-white text-slate-900 placeholder:text-slate-400 rounded-lg px-3 pl-8 py-2 text-xs outline-none shadow-sm"
            />
            <button
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Simulador de Lentes */}
      {isSimuladorOpen && (
        <SimuladorLentesModal 
          isOpen={isSimuladorOpen}
          onClose={() => setIsSimuladorOpen(false)} 
        />
      )}
    </>
  );
};
