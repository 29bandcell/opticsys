import React, { useState } from 'react';
import { AuthAndTenantProvider } from './context/AuthAndTenantContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { LandingPage } from './pages/LandingPage';
import { RegisterStore } from './pages/RegisterStore';
import { TermoDeUso } from './pages/TermoDeUso';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Receitas } from './pages/Receitas';
import { Orcamentos } from './pages/Orcamentos';
import { OrdensServico } from './pages/OrdensServico';
import { PDV } from './pages/PDV';
import { Agenda } from './pages/Agenda';
import { ZapOtica } from './pages/ZapOtica';
import { ProdutosEstoque } from './pages/ProdutosEstoque';
import { Laboratorios } from './pages/Laboratorios';
import { Financeiro } from './pages/Financeiro';
import { ModuloFiscal } from './pages/ModuloFiscal';
import { Cadastros } from './pages/Cadastros';
import { Assinatura } from './pages/Assinatura';
import { Configuracoes } from './pages/Configuracoes';
import { WipelisMasterPortal } from './pages/WipelisMasterPortal';
import { LoginTenant } from './pages/LoginTenant';
import { SupportBotWidget } from './components/common/SupportBotWidget';
import { TenantPlan } from './types';
import { useAuthAndTenant } from './context/AuthAndTenantContext';
import { ShieldAlert } from 'lucide-react';

const MainApp: React.FC = () => {
  const { usuarioAtual } = useAuthAndTenant();
  const [currentView, setCurrentView] = useState<'APP' | 'LANDING' | 'LOGIN' | 'REGISTER' | 'TERMOS' | 'MASTER'>(() => {
    if (window.location.hash === '#master' || window.location.hash === '#wipelis') {
      return 'MASTER';
    }
    const isAuth = sessionStorage.getItem('opticsys_is_authenticated') === 'true';
    if (!isAuth) {
      return 'LANDING';
    }
    return 'APP';
  });
  const [previousView, setPreviousView] = useState<'APP' | 'LANDING' | 'LOGIN' | 'REGISTER'>('LANDING');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isNovaOSOpen, setIsNovaOSOpen] = useState<boolean>(false);
  const [selectedPlanForTrial, setSelectedPlanForTrial] = useState<TenantPlan>('pro');

  const handleLogout = () => {
    sessionStorage.removeItem('opticsys_is_authenticated');
    sessionStorage.removeItem('opticsys_logged_user_id');
    sessionStorage.removeItem('opticsys_active_loja_id');
    setCurrentView('LOGIN');
  };

  const isTabAllowed = (tabId: string): boolean => {
    if (!usuarioAtual) return true;
    if (usuarioAtual.cargo === 'ADMIN') return true;

    // 1. Prioridade Máxima: Permissão individual configurada no usuário (true ou false)
    if (usuarioAtual.permissoes && typeof (usuarioAtual.permissoes as any)[tabId] === 'boolean') {
      return (usuarioAtual.permissoes as any)[tabId];
    }

    // 2. Fallbacks por cargo padrão
    if (usuarioAtual.cargo === 'VENDEDOR') {
      const allowedVendedor = ['dashboard', 'clientes', 'produtos', 'receitas', 'orcamentos', 'os', 'pdv', 'agenda', 'zapotica'];
      return allowedVendedor.includes(tabId);
    }

    if (usuarioAtual.cargo === 'OPTOMETRISTA') {
      const allowedOpto = ['dashboard', 'clientes', 'receitas', 'agenda'];
      return allowedOpto.includes(tabId);
    }

    if (usuarioAtual.cargo === 'TECNICO_MONTAGEM') {
      const allowedTec = ['dashboard', 'os', 'laboratorios', 'produtos'];
      return allowedTec.includes(tabId);
    }

    if (usuarioAtual.cargo === 'GERENTE') {
      const restrictedGerente = ['assinatura', 'configuracoes'];
      return !restrictedGerente.includes(tabId);
    }

    return true;
  };

  // Atalho de Teclado Secreto (Ctrl + Shift + W) para abrir o Painel Master Wipelis
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'W' || e.key === 'w')) {
        e.preventDefault();
        setCurrentView('MASTER');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenTermos = (from: 'APP' | 'LANDING' | 'LOGIN' | 'REGISTER') => {
    setPreviousView(from);
    setCurrentView('TERMOS');
  };

  // Roteamento Externo (Landing, Login, Cadastro, Termos & Master)
  if (currentView === 'TERMOS') {
    return (
      <TermoDeUso
        onBack={() => setCurrentView(previousView)}
        onAccept={() => {
          if (previousView === 'REGISTER') {
            setCurrentView('REGISTER');
          } else {
            const isAuth = sessionStorage.getItem('opticsys_is_authenticated') === 'true';
            setCurrentView(isAuth ? 'APP' : 'LOGIN');
          }
        }}
      />
    );
  }

  if (currentView === 'LANDING') {
    return (
      <LandingPage
        onStartTrial={(plano) => {
          setSelectedPlanForTrial(plano);
          setCurrentView('REGISTER');
        }}
        onEnterApp={() => {
          const isAuth = sessionStorage.getItem('opticsys_is_authenticated') === 'true';
          setCurrentView(isAuth ? 'APP' : 'LOGIN');
        }}
        onOpenTermos={() => handleOpenTermos('LANDING')}
        onOpenMaster={() => setCurrentView('MASTER')}
      />
    );
  }

  if (currentView === 'LOGIN') {
    return (
      <LoginTenant
        onSuccess={() => {
          setCurrentView('APP');
          setCurrentTab('dashboard');
        }}
        onGoToLanding={() => setCurrentView('LANDING')}
        onGoToRegister={() => setCurrentView('REGISTER')}
      />
    );
  }

  if (currentView === 'REGISTER') {
    return (
      <RegisterStore
        initialPlan={selectedPlanForTrial}
        onSuccess={() => {
          setCurrentView('APP');
          setCurrentTab('dashboard');
        }}
        onBack={() => setCurrentView('LANDING')}
        onOpenTermos={() => handleOpenTermos('REGISTER')}
      />
    );
  }

  // Portal Master Wipelis (Área 100% isolada para o Dono do SaaS)
  if (currentView === 'MASTER') {
    return (
      <WipelisMasterPortal
        onBackToApp={() => {
          const isAuth = sessionStorage.getItem('opticsys_is_authenticated') === 'true';
          setCurrentView(isAuth ? 'APP' : 'LOGIN');
        }}
        onGoToLanding={() => setCurrentView('LANDING')}
      />
    );
  }

  // Roteamento Interno do ERP da Ótica (Exclusivo do Assinante)
  return (
    <div className="min-h-screen bg-canvas-light dark:bg-canvas-dark text-slate-900 dark:text-zinc-100 flex relative overflow-x-hidden">
      
      {/* Sidebar Lateral (Desktop Fixo + Mobile Drawer Slide-over) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onLogout={handleLogout}
      />

      {/* Área Principal de Conteúdo */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ml-0 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-56'
        }`}
      >
        {/* Navbar Superior */}
        <Navbar
          onNavigate={(tab) => setCurrentTab(tab)}
          onOpenNovaOS={() => {
            setCurrentTab('os');
            setIsNovaOSOpen(true);
          }}
          onGoToLanding={() => setCurrentView('LANDING')}
          onLogout={handleLogout}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Conteúdo Dinâmico por Aba da Ótica */}
        <main className="p-3 sm:p-4 md:p-6 flex-1 max-w-7xl w-full mx-auto pb-24 md:pb-16 min-w-0">
          {!isTabAllowed(currentTab) ? (
            <div className="p-8 max-w-lg mx-auto bg-white dark:bg-[#121216] border border-amber-300 dark:border-amber-900/50 rounded-2xl shadow-sm text-center space-y-3 mt-10">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Acesso Restrito ao Módulo
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                O seu perfil de usuário <strong>({usuarioAtual?.cargo || 'Colaborador'})</strong> não possui permissão para acessar esta área restrita da ótica.
              </p>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="mt-2 px-4 py-2 bg-[#0284C7] hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Voltar ao Painel Geral
              </button>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <Dashboard 
                  onNavigate={(tab) => setCurrentTab(tab)} 
                  onOpenNovaOS={() => {
                    setCurrentTab('os');
                    setIsNovaOSOpen(true);
                  }} 
                />
              )}

              {currentTab === 'clientes' && <Clientes />}
              {currentTab === 'receitas' && <Receitas />}
              {currentTab === 'orcamentos' && <Orcamentos />}
              
              {currentTab === 'os' && (
                <OrdensServico 
                  isNovaOSOpen={isNovaOSOpen} 
                  setIsNovaOSOpen={setIsNovaOSOpen} 
                />
              )}

              {currentTab === 'pdv' && <PDV />}
              {currentTab === 'agenda' && <Agenda />}
              {currentTab === 'zapotica' && <ZapOtica />}
              {currentTab === 'produtos' && <ProdutosEstoque />}
              {currentTab === 'laboratorios' && <Laboratorios />}
              {currentTab === 'financeiro' && <Financeiro />}
              {currentTab === 'fiscal' && (
                <ModuloFiscal onNavigateToAssinatura={() => setCurrentTab('assinatura')} />
              )}
              {currentTab === 'cadastros' && <Cadastros />}
              {currentTab === 'assinatura' && <Assinatura />}
              {currentTab === 'configuracoes' && <Configuracoes />}
            </>
          )}
        </main>
      </div>

      {/* Barra de Navegação Inferior no Smartphone / Tablet */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Bot Flutuante de Suporte Global (OpticBot WhatsApp) */}
      <SupportBotWidget />

    </div>
  );
};

export default function App() {
  return (
    <AuthAndTenantProvider>
      <MainApp />
    </AuthAndTenantProvider>
  );
}
