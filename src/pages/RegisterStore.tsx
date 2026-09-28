import React, { useState, useEffect, useRef } from 'react';
import { 
  Glasses, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  MessageCircle, 
  KeyRound, 
  RefreshCw, 
  AlertCircle,
  Phone,
  Lock,
  Mail,
  Building,
  User,
  ExternalLink
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { TenantPlan } from '../types';
import { evolutionService } from '../services/evolutionApi';
import { EVOLUTION_CONFIG } from '../config/evolution';

interface RegisterStoreProps {
  initialPlan?: TenantPlan;
  onSuccess: () => void;
  onBack: () => void;
  onOpenTermos: () => void;
}

export const RegisterStore: React.FC<RegisterStoreProps> = ({
  initialPlan = 'pro',
  onSuccess,
  onBack,
  onOpenTermos
}) => {
  const { cadastrarNovaOtica } = useAuthAndTenant();

  // Etapas: 1. FORMULARIO | 2. VERIFICACAO_WHATSAPP | 3. SUCESSO
  const [etapa, setEtapa] = useState<'FORMULARIO' | 'VERIFICACAO_WHATSAPP' | 'SUCESSO'>('FORMULARIO');

  const [formData, setFormData] = useState({
    nome_responsavel: '',
    nome_fantasia: '',
    telefone: '',
    email: '',
    senha: '',
    plano: (initialPlan === 'pro_nf' ? 'pro_nf' : 'pro') as TenantPlan,
    concorda_termos: true
  });

  // Estado de verificação de código OTP WhatsApp
  const [codigoEnviado, setCodigoEnviado] = useState<string>('');
  const [codigoDigitado, setCodigoDigitado] = useState<string[]>(['', '', '', '', '', '']);
  const [isEnviandoCodigo, setIsEnviandoCodigo] = useState(false);
  const [isVerificando, setIsVerificando] = useState(false);
  const [erroVerificacao, setErroVerificacao] = useState<string | null>(null);
  const [countdownReenvio, setCountdownReenvio] = useState<number>(45);
  const [podeReenviar, setPodeReenviar] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Contador para reenvio de código
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (etapa === 'VERIFICACAO_WHATSAPP' && countdownReenvio > 0) {
      timer = setTimeout(() => {
        setCountdownReenvio(prev => prev - 1);
      }, 1000);
    } else if (countdownReenvio === 0) {
      setPodeReenviar(true);
    }
    return () => clearTimeout(timer);
  }, [etapa, countdownReenvio]);

  // Formatação de telefone / celular
  const formatarTelefone = (valor: string) => {
    const nums = valor.replace(/\D/g, '').slice(0, 11);
    if (nums.length <= 2) return nums;
    if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
  };

  // Gerar código de 6 dígitos aleatório
  const gerarCodigoOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Enviar código para o WhatsApp do Lead
  const dispararCodigoWhatsApp = async (codigo: string, telefone: string, nome: string, otica: string) => {
    const textoMensagem = 
      `🔐 *OpticSys Cloud - Confirmação de Cadastro*\n\n` +
      `Olá, *${nome || 'Doutor(a)'}*!\n\n` +
      `Seu código de confirmação para ativar seus *7 dias de teste grátis* na *${otica || 'sua Ótica'}* é:\n\n` +
      `👉 *${codigo}*\n\n` +
      `Insira este código na tela de cadastro para liberar seu acesso imediato ao sistema.\n\n` +
      `_Equipe OpticSys • Wipelis (88) 98882-2847_`;

    try {
      // Dispara via Evolution API global
      await evolutionService.enviarMensagemTexto(
        EVOLUTION_CONFIG.INSTANCE_NAME,
        telefone,
        textoMensagem
      );
    } catch (e) {
      console.warn('Disparo WhatsApp via API:', e);
    }
  };

  // Submissão do Formulário Inicial
  const handleIniciarCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroVerificacao(null);

    if (!formData.nome_responsavel.trim()) {
      alert('Por favor, digite seu nome completo.');
      return;
    }
    if (!formData.nome_fantasia.trim()) {
      alert('Por favor, digite o nome da sua ótica.');
      return;
    }
    if (!formData.telefone.trim() || formData.telefone.replace(/\D/g, '').length < 10) {
      alert('Por favor, informe um número de celular/WhatsApp válido com DDD.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      alert('Por favor, informe um e-mail válido.');
      return;
    }
    if (!formData.senha || formData.senha.length < 4) {
      alert('Por favor, defina uma senha de no mínimo 4 caracteres.');
      return;
    }
    if (!formData.concorda_termos) {
      alert('É necessário concordar com os Termos de Uso para prosseguir.');
      return;
    }

    setIsEnviandoCodigo(true);
    const novoCodigo = gerarCodigoOTP();
    setCodigoEnviado(novoCodigo);
    setCodigoDigitado(['', '', '', '', '', '']);

    await dispararCodigoWhatsApp(
      novoCodigo,
      formData.telefone,
      formData.nome_responsavel,
      formData.nome_fantasia
    );

    setIsEnviandoCodigo(false);
    setEtapa('VERIFICACAO_WHATSAPP');
    setCountdownReenvio(45);
    setPodeReenviar(false);

    // Foca no primeiro input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
  };

  // Reenviar código
  const handleReenviarCodigo = async () => {
    if (!podeReenviar) return;
    setIsEnviandoCodigo(true);
    setErroVerificacao(null);

    const novoCodigo = gerarCodigoOTP();
    setCodigoEnviado(novoCodigo);
    setCodigoDigitado(['', '', '', '', '', '']);

    await dispararCodigoWhatsApp(
      novoCodigo,
      formData.telefone,
      formData.nome_responsavel,
      formData.nome_fantasia
    );

    setIsEnviandoCodigo(false);
    setCountdownReenvio(45);
    setPodeReenviar(false);
    inputRefs.current[0]?.focus();
  };

  // Tratar digitação dos 6 dígitos
  const handleDigitChange = (index: number, value: string) => {
    // Tratar colagem de código completo
    if (value.length > 1) {
      const pasteData = value.replace(/\D/g, '').slice(0, 6).split('');
      if (pasteData.length > 0) {
        const novo = [...codigoDigitado];
        pasteData.forEach((char, i) => {
          if (i < 6) novo[i] = char;
        });
        setCodigoDigitado(novo);
        const nextIndex = Math.min(pasteData.length, 5);
        inputRefs.current[nextIndex]?.focus();
        
        // Se preencheu 6 dígitos, valida automaticamente
        if (pasteData.length === 6) {
          validarCodigo(pasteData.join(''));
        }
      }
      return;
    }

    const char = value.replace(/\D/g, '');
    const novo = [...codigoDigitado];
    novo[index] = char;
    setCodigoDigitado(novo);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Se completou 6 dígitos
    const codigoCompleto = novo.join('');
    if (codigoCompleto.length === 6) {
      validarCodigo(codigoCompleto);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codigoDigitado[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Validar código digitado
  const validarCodigo = (codigoTestar?: string) => {
    const finalCode = codigoTestar || codigoDigitado.join('');
    setErroVerificacao(null);

    if (finalCode.length < 6) {
      setErroVerificacao('Digite todos os 6 dígitos do código.');
      return;
    }

    setIsVerificando(true);

    setTimeout(() => {
      // Aceita o código gerado enviado no WhatsApp
      if (finalCode === codigoEnviado) {
        setEtapa('SUCESSO');
        
        // Cria a ótica no Contexto e LocalStorage
        cadastrarNovaOtica({
          nome_fantasia: formData.nome_fantasia,
          nome_responsavel: formData.nome_responsavel,
          telefone: formData.telefone,
          email: formData.email,
          plano: formData.plano,
          cnpj: '' // Não exige CNPJ para trial!
        });

        // Redireciona com sucesso após 1.5s
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setErroVerificacao('Código incorreto. Verifique a mensagem no seu WhatsApp e tente novamente.');
        setIsVerificando(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between py-6 px-4">
      
      {/* Topo / Header Minimalista */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between py-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0099FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao site
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#0099FF] text-white flex items-center justify-center font-bold shadow-xs">
            <Glasses className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            Optic<span className="text-[#0099FF]">Sys</span>
          </span>
        </div>

        <button
          onClick={onBack}
          className="text-xs font-bold text-[#0099FF] hover:underline"
        >
          Entrar
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-md w-full mx-auto my-auto">
        
        {/* =================================================================== */}
        {/* ETAPA 1: FORMULÁRIO DE CADASTRO LIMPO (SEM CNPJ)                     */}
        {/* =================================================================== */}
        {etapa === 'FORMULARIO' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 p-6 sm:p-8 space-y-5 animate-in fade-in">
            
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Iniciar Teste Gratuito de 7 Dias
              </h1>
              <p className="text-xs text-slate-500">
                Acesso imediato e completo. Sem necessidade de cartão ou CNPJ.
              </p>
            </div>

            <form onSubmit={handleIniciarCadastro} className="space-y-3.5 text-xs">
              
              {/* 1. Nome Completo */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Digite seu nome completo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nome"
                    value={formData.nome_responsavel}
                    onChange={e => setFormData({ ...formData, nome_responsavel: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF] transition-all"
                  />
                </div>
              </div>

              {/* 2. Nome da Ótica */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nome da Ótica
                </label>
                <input
                  type="text"
                  required
                  placeholder="Digite o nome da sua ótica"
                  value={formData.nome_fantasia}
                  onChange={e => setFormData({ ...formData, nome_fantasia: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF] transition-all"
                />
              </div>

              {/* 3. Celular / Whats */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Celular / Whats
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Digite o número do seu whatsapp"
                    value={formData.telefone}
                    onChange={e => setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF] transition-all font-mono"
                  />
                  <div className="absolute right-3 top-2.5 flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                    <MessageCircle className="w-3 h-3" /> Receberá código
                  </div>
                </div>
              </div>

              {/* 4. Email */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Digite o email para o cadastro"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF] transition-all"
                />
              </div>

              {/* 5. Senha */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  placeholder="Digite uma senha"
                  value={formData.senha}
                  onChange={e => setFormData({ ...formData, senha: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-md px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0099FF] focus:ring-1 focus:ring-[#0099FF] transition-all font-mono"
                />
              </div>

              {/* 6. Selecione o Plano */}
              <div className="pt-1">
                <label className="block font-medium text-slate-700 mb-2">
                  Selecione o Plano
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, plano: 'pro' })}
                    className={`py-3 px-3 rounded-lg text-center transition-all cursor-pointer ${
                      formData.plano === 'pro'
                        ? 'border-2 border-dashed border-[#0099FF] bg-sky-50/80 text-[#0099FF] font-extrabold shadow-xs'
                        : 'border-2 border-dashed border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-semibold'
                    }`}
                  >
                    <span className="block text-xs">Plano Pro</span>
                    <span className="block text-[10px] text-slate-500 font-normal font-mono mt-0.5">R$ 99,90/mês</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, plano: 'pro_nf' })}
                    className={`py-3 px-3 rounded-lg text-center transition-all cursor-pointer ${
                      formData.plano === 'pro_nf'
                        ? 'border-2 border-dashed border-[#0099FF] bg-sky-50/80 text-[#0099FF] font-extrabold shadow-xs'
                        : 'border-2 border-dashed border-slate-200 bg-white text-slate-700 hover:border-slate-300 font-semibold'
                    }`}
                  >
                    <span className="block text-xs">Plano Pro + NF</span>
                    <span className="block text-[10px] text-slate-500 font-normal font-mono mt-0.5">R$ 149,90/mês</span>
                  </button>
                </div>
              </div>

              {/* 7. Checkbox Termos de Uso */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="termo_uso"
                  required
                  checked={formData.concorda_termos}
                  onChange={e => setFormData({ ...formData, concorda_termos: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-[#0099FF] focus:ring-[#0099FF] cursor-pointer"
                />
                <label htmlFor="termo_uso" className="text-[11px] text-slate-700 cursor-pointer">
                  Declaro ter lido e aceitado o{' '}
                  <button
                    type="button"
                    onClick={onOpenTermos}
                    className="font-bold text-slate-900 hover:text-[#0099FF] underline"
                  >
                    Termo de Uso
                  </button>.
                </label>
              </div>

              {/* Botão de Envio */}
              <button
                type="submit"
                disabled={isEnviandoCodigo}
                className="w-full bg-[#0099FF] hover:bg-[#0088EE] text-white font-bold text-xs py-3 rounded-md shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-3"
              >
                {isEnviandoCodigo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enviando código no WhatsApp...</span>
                  </>
                ) : (
                  <span>Iniciar Teste Gratuito</span>
                )}
              </button>

            </form>

          </div>
        )}

        {/* =================================================================== */}
        {/* ETAPA 2: DIGITAÇÃO DO CÓDIGO RECEBIDO NO WHATSAPP                   */}
        {/* =================================================================== */}
        {etapa === 'VERIFICACAO_WHATSAPP' && (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200/80 p-6 sm:p-8 space-y-5 animate-in zoom-in-95">
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                <MessageCircle className="w-6 h-6" />
              </div>
              
              <h2 className="text-lg font-black text-slate-900">
                Confirme seu WhatsApp
              </h2>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                Enviamos um código de 6 dígitos para o número:
              </p>
              <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-xs font-mono font-bold text-slate-800">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {formData.telefone}
              </div>
            </div>

            {/* Alerta de Erro */}
            {erroVerificacao && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erroVerificacao}</span>
              </div>
            )}

            {/* 6 Inputs de Código OTP */}
            <div className="space-y-4">
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {codigoDigitado.map((digito, idx) => (
                  <input
                    key={idx}
                    ref={el => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digito}
                    onChange={e => handleDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-mono font-black border-2 border-slate-200 rounded-lg focus:outline-none focus:border-[#0099FF] focus:ring-2 focus:ring-[#0099FF]/20 bg-slate-50 focus:bg-white transition-all text-slate-900"
                  />
                ))}
              </div>

              {/* Mensagem de segurança / instrução */}
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-lg p-3 text-center text-[11px] text-emerald-800 space-y-0.5">
                <p className="font-bold flex items-center justify-center gap-1.5 text-emerald-700">
                  <MessageCircle className="w-3.5 h-3.5" /> Código enviado via WhatsApp!
                </p>
                <p className="text-slate-500 text-[10px]">
                  Consulte a mensagem recebida no seu celular e digite os 6 dígitos acima.
                </p>
              </div>

              {/* Botão de Validar */}
              <button
                type="button"
                onClick={() => validarCodigo()}
                disabled={isVerificando || codigoDigitado.join('').length < 6}
                className="w-full bg-[#0099FF] hover:bg-[#0088EE] text-white font-bold text-xs py-3 rounded-md shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerificando ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Liberando acesso...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Confirmar & Acessar OpticSys</span>
                  </>
                )}
              </button>

              {/* Opções de Reenvio e Troca de Número */}
              <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2 text-xs">
                {podeReenviar ? (
                  <button
                    type="button"
                    onClick={handleReenviarCodigo}
                    className="text-[#0099FF] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Reenviar código agora
                  </button>
                ) : (
                  <span className="text-slate-400 font-mono text-[11px]">
                    Reenviar novo código em <strong className="text-slate-700">{countdownReenvio}s</strong>
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setEtapa('FORMULARIO')}
                  className="text-slate-500 hover:text-slate-800 text-[11px] underline cursor-pointer"
                >
                  Número errado? Voltar e alterar dados
                </button>
              </div>

            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* ETAPA 3: SUCESSO & REDIRECIONAMENTO                                 */}
        {/* =================================================================== */}
        {etapa === 'SUCESSO' && (
          <div className="bg-white rounded-xl shadow-lg border border-emerald-200 p-8 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                Conta Criada com Sucesso! 🎉
              </h2>
              <p className="text-xs text-slate-600">
                Seus <strong>7 dias de teste grátis</strong> na <strong>{formData.nome_fantasia}</strong> já foram ativados.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg text-[11px] text-emerald-800 font-medium">
              Carregando ambiente exclusivo da sua ótica...
            </div>
          </div>
        )}

      </main>

      {/* Footer Minimalista */}
      <footer className="max-w-xl mx-auto w-full text-center text-[10px] text-slate-400 py-2">
        <span>OpticSys Cloud ERP • Mantido por WIPELIS • Suporte (88) 98882-2847</span>
      </footer>

    </div>
  );
};
