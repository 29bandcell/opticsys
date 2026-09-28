import React, { useState } from 'react';
import { 
  Crown, 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  Glasses, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { SuperAdminWipelis } from './SuperAdminWipelis';

interface WipelisMasterPortalProps {
  onBackToApp: () => void;
  onGoToLanding: () => void;
}

export const WipelisMasterPortal: React.FC<WipelisMasterPortalProps> = ({
  onBackToApp,
  onGoToLanding
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [senhaMaster, setSenhaMaster] = useState('');
  const [erroSenha, setErroSenha] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha Master padrão para o Dono do SaaS
    if (senhaMaster === 'wipelis2026' || senhaMaster === 'admin' || senhaMaster === 'master') {
      setIsAuthenticated(true);
      setErroSenha(false);
    } else {
      setErroSenha(true);
    }
  };

  const handleAcessoRapido = () => {
    setIsAuthenticated(true);
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
              {erroSenha && (
                <p className="text-rose-400 text-[11px] mt-1 font-semibold">
                  Senha incorreta. (Dica: utilize a chave padrão <code className="text-amber-300 font-mono">wipelis2026</code>)
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3 rounded-lg shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Entrar no Painel Master
            </button>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <button
                type="button"
                onClick={handleAcessoRapido}
                className="text-amber-400 hover:underline font-semibold"
              >
                ⚡ Entrar Direto (Acesso Rápido)
              </button>

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
              onClick={() => setIsAuthenticated(false)}
              className="text-rose-400 hover:text-rose-300 border border-rose-900/50 hover:bg-rose-950/50 px-3 py-1.5 rounded font-bold transition-colors"
            >
              Sair do Master
            </button>
          </div>

        </div>
      </header>

      {/* Conteúdo do Super Admin */}
      <main className="max-w-7xl mx-auto p-6">
        <SuperAdminWipelis />
      </main>

    </div>
  );
};
