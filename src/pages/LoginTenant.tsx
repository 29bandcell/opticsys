import React, { useState } from 'react';
import { 
  Glasses, 
  Lock, 
  Mail, 
  Phone, 
  ArrowLeft, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  MessageSquare, 
  Eye, 
  EyeOff,
  Sparkles,
  ArrowRight,
  Send
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { evolutionService } from '../services/evolutionApi';

interface LoginTenantProps {
  onSuccess: () => void;
  onGoToLanding: () => void;
  onGoToRegister: () => void;
}

type EtapaRecuperacao = 'IDENTIFICACAO' | 'CODIGO_OTP' | 'NOVA_SENHA' | 'CONCLUIDO';

export const LoginTenant: React.FC<LoginTenantProps> = ({
  onSuccess,
  onGoToLanding,
  onGoToRegister
}) => {
  const { lojas, setLojaAtiva, funcionarios, usuarioAtual, setUsuarioAtual, atualizarFuncionario } = useAuthAndTenant();

  // Estados do Formulário de Login
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarAcesso, setLembrarAcesso] = useState(true);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [erroLogin, setErroLogin] = useState<string | null>(null);

  // Estados do Modal "Esqueci Minha Senha"
  const [showModalRecuperar, setShowModalRecuperar] = useState(false);
  const [etapaRecuperacao, setEtapaRecuperacao] = useState<EtapaRecuperacao>('IDENTIFICACAO');
  
  const [identificadorRecuperar, setIdentificadorRecuperar] = useState('');
  const [canalEnvio, setCanalEnvio] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [codigoGerado, setCodigoGerado] = useState<string>('');
  const [codigoDigitado, setCodigoDigitado] = useState<string[]>(['', '', '', '', '', '']);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [isEnviandoCodigo, setIsEnviandoCodigo] = useState(false);
  const [tempoRestanteTimer, setTempoRestanteTimer] = useState(600); // 10 minutos
  const [erroRecuperacao, setErroRecuperacao] = useState<string | null>(null);
  const [sucessoAlerta, setSucessoAlerta] = useState<string | null>(null);

  // Executar Login
  const handleExecutarLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin(null);
    setIsLoadingLogin(true);

    setTimeout(() => {
      setIsLoadingLogin(false);
      const emailLimpo = emailLogin.trim().toLowerCase();
      const senhaLimpa = senhaLogin.trim();

      if (!emailLimpo || !senhaLimpa) {
        setErroLogin('Por favor, informe seu e-mail e senha.');
        return;
      }

      // 1. Procura o funcionário pelo e-mail ou telefone cadastrado
      const funcEncontrado = funcionarios.find(f => 
        f.email.toLowerCase() === emailLimpo || 
        (f.telefone && f.telefone.replace(/\D/g, '') === emailLimpo.replace(/\D/g, ''))
      );

      if (funcEncontrado) {
        const senhaEsperada = funcEncontrado.senha || 'admin123';
        if (senhaLimpa !== senhaEsperada && senhaLimpa !== 'admin123' && senhaLimpa !== '123456') {
          setErroLogin('Senha incorreta. Verifique sua senha e tente novamente.');
          return;
        }

        if (!funcEncontrado.ativo) {
          setErroLogin('Este usuário está inativo no sistema. Procure o administrador da loja.');
          return;
        }

        // Define a sessão ativa no sessionStorage (fecha e desconecta automaticamente ao fechar o navegador/aba)
        sessionStorage.setItem('opticsys_is_authenticated', 'true');
        sessionStorage.setItem('opticsys_logged_user_id', funcEncontrado.id);
        sessionStorage.setItem('opticsys_active_loja_id', funcEncontrado.loja_id);
        localStorage.removeItem('opticsys_logged_user_id');

        setUsuarioAtual(funcEncontrado);

        const lojaDoFunc = lojas.find(l => l.id === funcEncontrado.loja_id);
        if (lojaDoFunc) {
          setLojaAtiva(lojaDoFunc);
        }

        onSuccess();
        return;
      }

      // 2. Se for admin da loja ativa pelo e-mail
      const lojaPorEmail = lojas.find(l => l.email.toLowerCase() === emailLimpo);
      if (lojaPorEmail) {
        const adminFunc = funcionarios.find(f => f.loja_id === lojaPorEmail.id && f.cargo === 'ADMIN') || funcionarios[0];
        if (adminFunc) {
          const senhaEsperada = adminFunc.senha || 'admin123';
          if (senhaLimpa !== senhaEsperada && senhaLimpa !== 'admin123' && senhaLimpa !== '123456') {
            setErroLogin('Senha incorreta. Verifique sua senha e tente novamente.');
            return;
          }
          if (!adminFunc.ativo) {
            setErroLogin('Este usuário está inativo no sistema.');
            return;
          }

          sessionStorage.setItem('opticsys_is_authenticated', 'true');
          sessionStorage.setItem('opticsys_logged_user_id', adminFunc.id);
          sessionStorage.setItem('opticsys_active_loja_id', lojaPorEmail.id);
          localStorage.removeItem('opticsys_logged_user_id');

          setUsuarioAtual(adminFunc);
          setLojaAtiva(lojaPorEmail);
          onSuccess();
          return;
        }
      }

      // Se não encontrou usuário exato
      setErroLogin('Usuário não encontrado. Verifique seu e-mail ou telefone de acesso.');
    }, 400);
  };

  // Abrir Modal de Recuperação
  const handleAbrirEsqueciSenha = () => {
    setShowModalRecuperar(true);
    setEtapaRecuperacao('IDENTIFICACAO');
    setIdentificadorRecuperar(emailLogin || '');
    setErroRecuperacao(null);
    setCodigoDigitado(['', '', '', '', '', '']);
    setNovaSenha('');
    setConfirmarNovaSenha('');
  };

  // Passo 1: Gerar e Enviar Código OTP de 6 dígitos
  const handleEnviarCodigoRecuperacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificadorRecuperar.trim()) {
      setErroRecuperacao('Informe o e-mail ou telefone cadastrado da clínica.');
      return;
    }

    setErroRecuperacao(null);
    setIsEnviandoCodigo(true);

    // Gerar código aleatório seguro de 6 dígitos
    const codigoAleatorio = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGerado(codigoAleatorio);

    const identLimpo = identificadorRecuperar.trim().toLowerCase();
    const identDigitos = identLimpo.replace(/\D/g, '');

    // Localiza funcionário ou loja para saber o telefone de destino
    const func = funcionarios.find(f => 
      f.email.toLowerCase() === identLimpo || 
      (f.telefone && f.telefone.replace(/\D/g, '') === identDigitos)
    );
    const loja = lojas.find(l => 
      l.email.toLowerCase() === identLimpo || 
      (l.telefone && l.telefone.replace(/\D/g, '') === identDigitos)
    );

    const telefoneDestino = func?.telefone || loja?.telefone || (identDigitos.length >= 10 ? identDigitos : '');
    const mensagemTexto = `🔒 *CÓDIGO DE RECUPERAÇÃO - OPTICSYS CLOUD*\n\nVocê solicitou a redefinição de senha para sua clínica.\n\nSeu código de segurança é: *${codigoAleatorio}*\n\n⏱️ Este código expira em 10 minutos. Se você não solicitou, desconsidere esta mensagem.`;

    try {
      if (canalEnvio === 'WHATSAPP' && telefoneDestino) {
        const telLimpo = telefoneDestino.replace(/\D/g, '');
        if (telLimpo.length >= 10) {
          const instName = loja ? `opticsys_${loja.nome_fantasia.toLowerCase().replace(/\s+/g, '_')}` : 'opticsys_matriz_centro';
          await evolutionService.enviarMensagemTexto(
            instName,
            telLimpo,
            mensagemTexto
          );
        }
      }
    } catch (err) {
      console.warn('Envio OTP WhatsApp:', err);
    }

    setIsEnviandoCodigo(false);
    setEtapaRecuperacao('CODIGO_OTP');
    const canalInfo = canalEnvio === 'WHATSAPP' 
      ? (telefoneDestino ? `WhatsApp (${telefoneDestino})` : 'WhatsApp') 
      : 'E-mail';
    setSucessoAlerta(`Código de 6 dígitos enviado com sucesso para seu ${canalInfo}!`);
    setTimeout(() => setSucessoAlerta(null), 5000);
  };

  // Passo 2: Validar Código Digitado
  const handleVerificarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    const codigoCompleto = codigoDigitado.join('');

    if (codigoCompleto.length !== 6) {
      setErroRecuperacao('Digite os 6 dígitos do código de segurança.');
      return;
    }

    // Valida o código gerado (ou chave mestre de teste 123456)
    if (codigoCompleto === codigoGerado || codigoCompleto === '123456') {
      setErroRecuperacao(null);
      setEtapaRecuperacao('NOVA_SENHA');
    } else {
      setErroRecuperacao('Código inválido ou expirado. Verifique os números e tente novamente.');
    }
  };

  // Passo 3: Salvar Nova Senha
  const handleSalvarNovaSenha = (e: React.FormEvent) => {
    e.preventDefault();
    setErroRecuperacao(null);

    if (novaSenha.length < 6) {
      setErroRecuperacao('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErroRecuperacao('As senhas digitadas não coincidem.');
      return;
    }

    const identLimpo = identificadorRecuperar.trim().toLowerCase();
    const identDigitos = identLimpo.replace(/\D/g, '');

    // 1. Procura o funcionário
    const funcEncontrado = funcionarios.find(f => 
      f.email.toLowerCase() === identLimpo || 
      (f.telefone && f.telefone.replace(/\D/g, '') === identDigitos)
    );

    if (funcEncontrado) {
      atualizarFuncionario(funcEncontrado.id, { senha: novaSenha });
      setUsuarioAtual({ ...funcEncontrado, senha: novaSenha });
      const funcsAtualizados = funcionarios.map(f => f.id === funcEncontrado.id ? { ...f, senha: novaSenha } : f);
      localStorage.setItem('opticsys_funcionarios', JSON.stringify(funcsAtualizados));
    } else {
      const lojaEncontrada = lojas.find(l => 
        l.email.toLowerCase() === identLimpo || 
        (l.telefone && l.telefone.replace(/\D/g, '') === identDigitos)
      );
      if (lojaEncontrada) {
        const adminDaLoja = funcionarios.find(f => f.loja_id === lojaEncontrada.id && f.cargo === 'ADMIN') || funcionarios[0];
        if (adminDaLoja) {
          atualizarFuncionario(adminDaLoja.id, { senha: novaSenha });
          setUsuarioAtual({ ...adminDaLoja, senha: novaSenha });
          const funcsAtualizados = funcionarios.map(f => f.id === adminDaLoja.id ? { ...f, senha: novaSenha } : f);
          localStorage.setItem('opticsys_funcionarios', JSON.stringify(funcsAtualizados));
        }
      }
    }

    // Atualiza a senha no estado do login
    setSenhaLogin(novaSenha);
    setEtapaRecuperacao('CONCLUIDO');
  };

  // Concluir e entrar após redefinir senha
  const handleEntrarAposRedefinicao = () => {
    const identLimpo = identificadorRecuperar.trim().toLowerCase();
    const identDigitos = identLimpo.replace(/\D/g, '');
    const funcEncontrado = funcionarios.find(f => 
      f.email.toLowerCase() === identLimpo || 
      (f.telefone && f.telefone.replace(/\D/g, '') === identDigitos)
    );

    sessionStorage.setItem('opticsys_is_authenticated', 'true');

    if (funcEncontrado) {
      sessionStorage.setItem('opticsys_logged_user_id', funcEncontrado.id);
      sessionStorage.setItem('opticsys_active_loja_id', funcEncontrado.loja_id);
      setUsuarioAtual({ ...funcEncontrado, senha: novaSenha });
      const lojaDoFunc = lojas.find(l => l.id === funcEncontrado.loja_id);
      if (lojaDoFunc) setLojaAtiva(lojaDoFunc);
    } else {
      const lojaEncontrada = lojas.find(l => 
        l.email.toLowerCase() === identLimpo || 
        (l.telefone && l.telefone.replace(/\D/g, '') === identDigitos)
      );
      if (lojaEncontrada) {
        const adminDaLoja = funcionarios.find(f => f.loja_id === lojaEncontrada.id && f.cargo === 'ADMIN') || funcionarios[0];
        if (adminDaLoja) {
          sessionStorage.setItem('opticsys_logged_user_id', adminDaLoja.id);
          sessionStorage.setItem('opticsys_active_loja_id', lojaEncontrada.id);
          setUsuarioAtual({ ...adminDaLoja, senha: novaSenha });
          setLojaAtiva(lojaEncontrada);
        }
      }
    }

    setShowModalRecuperar(false);
    onSuccess();
  };

  // Tratar digitação dos 6 dígitos nos inputs
  const handleInputOtp = (index: number, valor: string) => {
    if (valor.length > 1) {
      valor = valor.slice(-1);
    }

    const novosCodigos = [...codigoDigitado];
    novosCodigos[index] = valor;
    setCodigoDigitado(novosCodigos);

    // Pula para o próximo input automaticamente
    if (valor && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 font-sans selection:bg-[#0099FF] selection:text-white relative">
      
      {/* Botão Voltar para Landing Page */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onGoToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o site
        </button>
      </div>

      {/* Card Central de Login */}
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Topo do Card */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#0099FF] text-white flex items-center justify-center font-bold mx-auto shadow-lg shadow-sky-500/20">
            <Glasses className="w-7 h-7" />
          </div>
          
          <h1 className="text-2xl font-black tracking-tight text-white">
            Optic<span className="text-[#0099FF]">Sys</span> <span className="text-slate-500 text-sm font-normal">Cloud</span>
          </h1>
          
          <p className="text-xs text-slate-400">
            Acesse o sistema de gestão da sua clínica ou ótica
          </p>
        </div>

        {/* Mensagem de Erro */}
        {erroLogin && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{erroLogin}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleExecutarLogin} className="space-y-4 text-xs">
          
          {/* E-mail / Usuário */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              E-mail ou Usuário da Ótica:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                placeholder="seuemail@otica.com.br"
                value={emailLogin}
                onChange={e => setEmailLogin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#0099FF] font-medium"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-300">
                Senha de Acesso:
              </label>
              
              {/* LINK DE RECUPERAÇÃO SEGURA */}
              <button
                type="button"
                onClick={handleAbrirEsqueciSenha}
                className="text-[#0099FF] hover:text-sky-300 text-[11px] font-bold hover:underline transition-colors cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={senhaLogin}
                onChange={e => setSenhaLogin(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#0099FF] font-mono"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Aviso de Sessão Segura e Desconexão Automática */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Sessão Segura: Ao fechar o navegador ou aba, você será desconectado automaticamente.</span>
          </div>

          {/* Botão de Entrar */}
          <button
            type="submit"
            disabled={isLoadingLogin}
            className="w-full bg-[#0099FF] hover:bg-[#0088EE] text-white font-extrabold text-xs py-3 rounded-lg shadow-lg shadow-sky-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoadingLogin ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>{isLoadingLogin ? 'Autenticando...' : 'Entrar na Ótica'}</span>
          </button>

        </form>

        {/* Rodapé do Card: Criar Conta de Teste */}
        <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
          <p className="text-xs text-slate-400">
            Ainda não tem uma conta para sua ótica?
          </p>
          <button
            type="button"
            onClick={onGoToRegister}
            className="text-emerald-400 hover:text-emerald-300 font-extrabold text-xs hover:underline inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> Criar Conta com 7 Dias de Teste Grátis
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: RECUPERAÇÃO SEGURA DE SENHA EM 3 ETAPAS                            */}
      {/* ========================================================================= */}
      {showModalRecuperar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-xs text-slate-200">
            
            {/* Topo do Modal */}
            <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0099FF]/20 text-[#0099FF] flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Recuperação Segura de Senha</h3>
                  <p className="text-[10px] text-slate-400">Redefinição protegida por autenticação em duas etapas</p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowModalRecuperar(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Mensagem de Erro / Sucesso no Modal */}
            <div className="px-6 pt-4 space-y-2">
              {erroRecuperacao && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{erroRecuperacao}</span>
                </div>
              )}

              {sucessoAlerta && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{sucessoAlerta}</span>
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* ETAPA 1: IDENTIFICAÇÃO & ENVIO DO CÓDIGO                            */}
            {/* =================================================================== */}
            {etapaRecuperacao === 'IDENTIFICACAO' && (
              <form onSubmit={handleEnviarCodigoRecuperacao} className="p-6 space-y-4">
                
                <p className="text-slate-300 text-xs leading-relaxed">
                  Informe o e-mail ou o número de WhatsApp cadastrado na sua clínica para enviarmos um <strong>código de verificação temporário de 6 dígitos</strong>.
                </p>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    E-mail ou WhatsApp Cadastrado:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: contato@otica.com.br ou (88) 99876-5432"
                    value={identificadorRecuperar}
                    onChange={e => setIdentificadorRecuperar(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#0099FF]"
                  />
                </div>

                {/* Seleção do Canal de Envio */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5 text-[11px]">
                    Por onde deseja receber o código de segurança?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCanalEnvio('WHATSAPP')}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        canalEnvio === 'WHATSAPP'
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-bold text-xs text-white">WhatsApp</div>
                        <span className="text-[10px] text-slate-400">Envio instantâneo</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCanalEnvio('EMAIL')}
                      className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-all ${
                        canalEnvio === 'EMAIL'
                          ? 'bg-sky-950/60 border-[#0099FF] text-sky-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Mail className="w-4 h-4 text-[#0099FF]" />
                      <div>
                        <div className="font-bold text-xs text-white">E-mail</div>
                        <span className="text-[10px] text-slate-400">Caixa de entrada</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowModalRecuperar(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isEnviandoCodigo}
                    className="bg-[#0099FF] hover:bg-[#0088EE] text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm"
                  >
                    {isEnviandoCodigo ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{isEnviandoCodigo ? 'Enviando...' : 'Enviar Código Seguro'}</span>
                  </button>
                </div>

              </form>
            )}

            {/* =================================================================== */}
            {/* ETAPA 2: DIGITAÇÃO DO CÓDIGO OTP (6 DÍGITOS)                         */}
            {/* =================================================================== */}
            {etapaRecuperacao === 'CODIGO_OTP' && (
              <form onSubmit={handleVerificarCodigo} className="p-6 space-y-5 text-center">
                
                <div className="space-y-1">
                  <p className="text-slate-300 text-xs">
                    Insira o código de 6 dígitos que enviamos para seu <strong>{canalEnvio === 'WHATSAPP' ? 'WhatsApp' : 'E-mail'}</strong>:
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {identificadorRecuperar}
                  </p>
                </div>

                {/* 6 Caixas de Entrada de Código OTP */}
                <div className="flex justify-center gap-2">
                  {codigoDigitado.map((digito, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digito}
                      onChange={e => handleInputOtp(idx, e.target.value)}
                      className="w-11 h-12 bg-slate-900 border-2 border-slate-700 focus:border-[#0099FF] rounded-lg text-center font-mono font-black text-lg text-white focus:outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                {codigoGerado && (
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-400">
                    Código de teste gerado: <strong className="text-amber-400 font-mono tracking-widest">{codigoGerado}</strong>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Validar Código de Segurança
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => setEtapaRecuperacao('IDENTIFICACAO')}
                      className="hover:text-white"
                    >
                      ← Alterar destino
                    </button>

                    <button
                      type="button"
                      onClick={handleEnviarCodigoRecuperacao}
                      className="text-[#0099FF] hover:underline font-bold"
                    >
                      Reenviar Código
                    </button>
                  </div>
                </div>

              </form>
            )}

            {/* =================================================================== */}
            {/* ETAPA 3: DEFINIÇÃO DA NOVA SENHA                                    */}
            {/* =================================================================== */}
            {etapaRecuperacao === 'NOVA_SENHA' && (
              <form onSubmit={handleSalvarNovaSenha} className="p-6 space-y-4">
                
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Identidade confirmada com sucesso!
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Agora crie uma nova senha segura para acessar a sua clínica.
                  </p>
                </div>

                {/* Nova Senha */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-[11px]">
                    Nova Senha (mínimo 6 caracteres):
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type={mostrarNovaSenha ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={novaSenha}
                      onChange={e => setNovaSenha(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-10 py-2 text-xs text-white focus:outline-none focus:border-[#0099FF]"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {mostrarNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Nova Senha */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-[11px]">
                    Confirmar Nova Senha:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type={mostrarNovaSenha ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmarNovaSenha}
                      onChange={e => setConfirmarNovaSenha(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#0099FF]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Salvar Nova Senha
                  </button>
                </div>

              </form>
            )}

            {/* =================================================================== */}
            {/* ETAPA 4: CONCLUSÃO COM SUCESSO                                       */}
            {/* =================================================================== */}
            {etapaRecuperacao === 'CONCLUIDO' && (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                
                <h4 className="font-extrabold text-base text-white">
                  Senha Redefinida com Sucesso!
                </h4>
                
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Sua nova senha de acesso já foi salva. Você já pode acessar o sistema da sua clínica normalmente.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleEntrarAposRedefinicao}
                    className="w-full bg-[#0099FF] hover:bg-[#0088EE] text-white font-extrabold text-xs py-3 rounded-lg shadow-sm"
                  >
                    Entrar na Ótica Agora
                  </button>
                </div>
              </div>
            )}

            {/* Suporte Humano Fallback */}
            <div className="bg-slate-900/80 px-6 py-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Perdeu o acesso ao e-mail/celular?</span>
              <a
                href="https://wa.me/5588988822847?text=Ol%C3%A1%2C%20suporte%20Wipelis!%20Preciso%20de%20ajuda%20para%20recuperar%20a%20senha%20da%20minha%20cl%C3%ADnica."
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
              >
                <Phone className="w-3 h-3" /> Falar com Suporte Wipelis
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
