import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  ShoppingCart, 
  Menu
} from 'lucide-react';
import { useAuthAndTenant } from '../../context/AuthAndTenantContext';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenMobileMenu
}) => {
  const { ordensServico } = useAuthAndTenant();

  const osAtivasCount = ordensServico.filter(
    os => os.status !== 'ENTREGUE' && os.status !== 'CANCELADA'
  ).length;

  const quickNav = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { 
      id: 'os', 
      label: 'O.S.', 
      icon: ClipboardList, 
      badge: osAtivasCount > 0 ? osAtivasCount : undefined 
    },
    { id: 'pdv', label: 'PDV', icon: ShoppingCart },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0D0D11]/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 flex items-center justify-around py-1.5 px-2 safe-area-bottom shadow-lg select-none">
      {quickNav.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg relative transition-all min-w-[54px] ${
              isActive
                ? 'text-[#0284C7] dark:text-[#38BDF8] font-bold scale-105'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {item.badge !== undefined && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-mono font-bold px-1 rounded-full min-w-[14px] text-center shadow-xs">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
          </button>
        );
      })}

      {/* Botão "Mais Menu" que abre a gaveta lateral completa */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 transition-all min-w-[54px]"
      >
        <Menu className="w-5 h-5 stroke-2" />
        <span className="text-[10px] tracking-tight mt-0.5">Mais</span>
      </button>
    </nav>
  );
};
