import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Glasses, 
  ClipboardList, 
  ShoppingCart, 
  Boxes, 
  FlaskConical, 
  DollarSign, 
  Settings, 
  FolderOpen,
  Calendar,
  MessageSquare,
  CreditCard,
  FileText,
  Receipt,
  Lock,
  X,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuthAndTenant } from '../../context/AuthAndTenantContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (col: boolean) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  mobileOpen = false,
  setMobileOpen,
  onLogout
}) => {
  const { lojaAtiva, lojas, setLojaAtiva, ordensServico, usuarioAtual } = useAuthAndTenant();

  const osAtivasCount = ordensServico.filter(
    os => os.status !== 'ENTREGUE' && os.status !== 'CANCELADA'
  ).length;

  const isFiscalAllowed = lojaAtiva.plano === 'pro_nf' || lojaAtiva.plano === 'enterprise';

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes & Pacientes', icon: Users },
    { id: 'produtos', label: 'Produtos & Estoque', icon: Boxes },
    { id: 'receitas', label: 'Receitas Ópticas', icon: Glasses },
    { id: 'orcamentos', label: 'Orçamento Óptico', icon: FileText },
    { 
      id: 'os', 
      label: 'Ordem de Serviço', 
      icon: ClipboardList, 
      badge: osAtivasCount > 0 ? osAtivasCount : undefined
    },
    { id: 'pdv', label: 'Vendas (PDV)', icon: ShoppingCart },
    { id: 'agenda', label: 'Agenda de Consultas', icon: Calendar },
    { id: 'zapotica', label: 'OpticZap WhatsApp', icon: MessageSquare },
    { id: 'laboratorios', label: 'Laboratórios de Lentes', icon: FlaskConical },
    { id: 'financeiro', label: 'Financeiro & Caixa', icon: DollarSign },
    { 
      id: 'fiscal', 
      label: 'Fiscal & NFC-e', 
      icon: isFiscalAllowed ? Receipt : Lock, 
      badge: isFiscalAllowed ? '50/mês' : '🔒 Pro+NF',
      locked: !isFiscalAllowed
    },
    { id: 'cadastros', label: 'Cadastros Gerais', icon: FolderOpen },
    { id: 'assinatura', label: 'Meu Plano', icon: CreditCard, highlight: true },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    if (setMobileOpen) {
      setMobileOpen(false);
    }
  };

  const sidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full justify-between select-none">
      
      {/* Topo / Marca & Seleção de Loja */}
      <div className="overflow-y-auto flex-1 overscroll-contain">
        
        {/* Logo */}
        <div className="h-14 md:h-12 flex items-center justify-between px-4 md:px-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 md:bg-transparent">
          {(!collapsed || isMobile) ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-6 md:h-6 rounded bg-[#0284C7] text-white flex items-center justify-center font-bold shadow-sm">
                <Glasses className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base md:text-sm tracking-tight text-slate-900 dark:text-white">
                Optic<span className="text-[#0284C7]">Sys</span>
              </span>
            </div>
          ) : (
            <div className="mx-auto w-6 h-6 rounded bg-[#0284C7] text-white flex items-center justify-center font-bold">
              <Glasses className="w-4 h-4" />
            </div>
          )}

          {/* Botão fechar no mobile */}
          {isMobile && setMobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Fechar Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Loja Ativa */}
        {(!collapsed || isMobile) && (
          <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/80 dark:bg-zinc-900/40 text-[11px]">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase tracking-wider">Unidade / Loja Ativa:</span>
            <select
              value={lojaAtiva.id}
              onChange={(e) => {
                const target = lojas.find(l => l.id === e.target.value);
                if (target) setLojaAtiva(target);
              }}
              className="w-full mt-0.5 bg-transparent font-bold text-slate-800 dark:text-zinc-200 focus:outline-none cursor-pointer truncate py-0.5"
            >
              {lojas.map(loja => (
                <option key={loja.id} value={loja.id} className="dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                  {loja.nome_fantasia}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Menu de Navegação Vertical */}
        <nav className="p-2 md:p-1.5 space-y-1 md:space-y-0.5 text-xs">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 md:px-2.5 py-2.5 md:py-1.5 rounded-lg md:rounded font-medium transition-all text-left touch-manipulation ${
                  isActive
                    ? 'bg-[#0284C7] text-white font-bold shadow-xs'
                    : 'text-slate-700 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100 active:bg-slate-200'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3 md:gap-2.5 truncate">
                  <Icon className={`w-4 h-4 md:w-4 md:h-4 shrink-0 ${isActive ? 'text-white' : item.id === 'cadastros' ? 'text-amber-500' : 'text-sky-600 dark:text-sky-400'}`} />
                  {(!collapsed || isMobile) && <span className="truncate text-[13px] md:text-xs">{item.label}</span>}
                </div>

                {(!collapsed || isMobile) && item.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 md:py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-white text-[#0284C7]' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {(!collapsed || isMobile) && item.highlight && !isActive && (
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-mono px-1.5 py-0.5 rounded font-extrabold">
                    {lojaAtiva.status === 'trial' ? 'TESTE' : 'PRO'}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Rodapé da Sidebar: Perfil do Usuário & Logout */}
      <div className="p-2 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/60">
        {(!collapsed || isMobile) ? (
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/80 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0284C7] to-sky-400 text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-xs">
                {(usuarioAtual?.nome || 'OP').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate leading-tight">
                  {usuarioAtual?.nome || 'Operador'}
                </p>
                <span className="text-[9px] text-slate-400 block truncate">
                  {usuarioAtual?.cargo || 'Consultor Óptico'}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Sair da Conta (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex justify-center py-1">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
                title="Sair da Conta (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP / TABLET SIDEBAR (Fixo na lateral esquerda) */}
      <aside
        className={`hidden md:flex flex-col justify-between fixed top-0 left-0 z-40 h-screen transition-all duration-200 bg-white dark:bg-[#0D0D11] border-r border-slate-200 dark:border-zinc-800 select-none ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {sidebarContent(false)}
      </aside>

      {/* 2. MOBILE SLIDE-OVER DRAWER (Smartphone e Mini Tablet) */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Escuro */}
          <div 
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Gaveta Lateral */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#0D0D11] h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200 border-r border-slate-200 dark:border-zinc-800">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
