import React, { useState, Component, ReactNode } from 'react';
import { 
  Crown, 
  Lock, 
  Glasses, 
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import { SuperAdminWipelis } from './SuperAdminWipelis';

interface WipelisMasterPortalProps {
  onBackToApp: () => void;
  onGoToLanding: () => void;
}

// Error Boundary para capturar crash no painel e exibir mensagem amigável
interface EBState { hasError: boolean; errorMsg: string; }
class MasterErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error?.message || 'Erro desconhecido' };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
          <AlertTriangle className="w-12 h-12 text-rose-400" />
          <h2 className="text-lg font-bold text-white">Erro ao carregar o Painel Master</h2>
          <p className="text-sm text-slate-400 max-w-md">{this.state.errorMsg}</p>
          <button
            onClick={() => this.setState({ hasError: false, errorMsg: '' })}
            className="mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-sm"
          >
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const WipelisMasterPortal: React.FC<WipelisMasterPortalProps> = ({
  onBackToApp,
  onGoToLanding
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [senhaMaster, setSenhaMaster] = useState('');
  const [erroSenha, setErroSenha] = useState(false);
  const [tentativas, setTentativas] = useState(0);

  const SENHA_CORRETA = 'wipelis2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaMaster === SENHA_CORRETA) {
      setIsAuthenticated(true);
      setErroSenha(false);
      setTentativas(0);
    } else {
      setErroSenha(true);
      setTentativas(prev => prev + 1);
      setSenhaMaster('');
    }
  };

  // Se não estiver autenticado, exibe a tela de login exclusiva do Master
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans selection:bg-amber-500 selection:text-slate-950">
        
        {/* Card de Login Master */}
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black mx-auto shadow-lg shadow-amber-500/20">
              <Crown className="w-8 h-8 fill-current" />
            </div>
            
            <h1 className="text-xl font-black tracking-tight text-white">
              WIPELIS<span className="text-amber-400">HUB</span>
            </h1>
            
            <p className="text-xs text-slate-400">
              Portal Master Exclusivo • <strong>WIPELISCREATIVESOLUTION</strong>
            </p>
            <span className="inline-block bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
              ACESSO SUPER ADMIN (DONO DO SAAS)
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Senha Master de Acesso:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  placeholder="Digite sua senha master..."
                  value={senhaMaster}
                  onChange={e => setSenhaMaster(e.target.value)}
                  autoComplete="current-password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              {erroSenha && (
                <p className="text-rose-400 text-[11px] mt-1 font-semibold">
                  Senha incorreta.{tentativas >= 3 ? ' Verifique sua senha master e tente novamente.' : ' Tente novamente.'}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3 rounded-lg shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Entrar no Painel Master
            </button>

            <div className="pt-2 border-t border-slate-800/80 flex justify-end text-[11px] text-slate-400">
              <button
                type="button"
                onClick={onBackToApp}
                className="text-slate-400 hover:text-white"
              >
                ← Voltar para a Ótica
              </button>
            </div>
          </form>

        </div>

        {/* Rodapé discreto */}
        <p className="text-[11px] text-slate-600 mt-6 text-center">
          Wipelis Creative Solution • Gestão Central de Licenças, Leads & Assinaturas
        </p>

      </div>
    );
  }

  // Se autenticado, exibe o painel SuperAdmin completo com header dedicado
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Header Superior Master Wipelis */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-6 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black">
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <span className="font-black text-sm tracking-tight text-white">
              WIPELIS<span className="text-amber-400">HUB</span>
            </span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
              SUPER ADMIN PORTAL
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={onBackToApp}
              className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-1.5 rounded font-bold flex items-center gap-1.5 transition-colors"
            >
              <Glasses className="w-3.5 h-3.5 text-sky-400" /> Acessar Sistema da Ótica
            </button>

            <button
              onClick={onGoToLanding}
              className="text-slate-400 hover:text-white px-2 py-1 transition-colors"
            >
              Ver Site / Landing
            </button>

            <button
              onClick={() => { setIsAuthenticated(false); setSenhaMaster(''); }}
              className="text-rose-400 hover:text-rose-300 border border-rose-900/50 hover:bg-rose-950/50 px-3 py-1.5 rounded font-bold transition-colors"
            >
              Sair do Master
            </button>
          </div>

        </div>
      </header>

      {/* Conteúdo do Super Admin envolto em Error Boundary */}
      <main className="max-w-7xl mx-auto p-6">
        <MasterErrorBoundary>
          <SuperAdminWipelis />
        </MasterErrorBoundary>
      </main>

    </div>
  );
};
