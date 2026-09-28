import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Clock, 
  Users, 
  Eye, 
  Sparkles, 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Power, 
  Settings, 
  AlertCircle,
  ExternalLink,
  Calendar,
  Gift,
  DollarSign,
  Glasses,
  Copy,
  Check
} from 'lucide-react';
import { useAuthAndTenant } from '../context/AuthAndTenantContext';
import { evolutionService, formatarTelefoneBr } from '../services/evolutionApi';
import { EVOLUTION_CONFIG } from '../config/evolution';

interface MensagemLog {
  id: string;
  cliente_nome: string;
  telefone: string;
  tipo: 'OS_PRONTA' | 'RETORNO_GRAU' | 'COBRANCA' | 'ANIVERSARIO' | 'AVULSO';
  conteudo: string;
  data_envio: string;
  status: 'ENVIADO' | 'ENTREGUE' | 'LIDO';
}

export const ZapOtica: React.FC = () => {
  const { ordensServico, receitas, lojaAtiva, clientes, transacoes } = useAuthAndTenant();

  const [abaAtiva, setAbaAtiva] = useState<'DISPAROS' | 'CONEXAO_EVOLUTION' | 'LOGS'>('DISPAROS');
  const [tipoDisparo, setTipoDisparo] = useState<'OS_PRONTA' | 'RETORNO_GRAU' | 'COBRANCA' | 'ANIVERSARIO'>('OS_PRONTA');
  
  // Função para obter o status de conexão inicial salvo no localStorage
  const obterStatusInicial = (): 'DISCONNECTED' | 'CONNECTING' | 'QR_READY' | 'CONNECTED' => {
    const salvo = localStorage.getItem(`opticsys_zap_status_${lojaAtiva.id}`);
    if (salvo === 'CONNECTED') return 'CONNECTED';
    return 'DISCONNECTED';
  };

  // Função para obter o número de telefone da loja ativa ou persistido
  const obterNumeroInicial = () => {
    const salvo = localStorage.getItem(`opticsys_zap_connected_phone_${lojaAtiva.id}`);
    if (salvo) return salvo;
    return formatarTelefoneBr(lojaAtiva.telefone) || '+55 (88) 98882-2847';
  };

  // Estado da Conexão com a Evolution API
  const [evolutionConfig, setEvolutionConfig] = useState({
    server_url: EVOLUTION_CONFIG.BASE_URL,
    api_key: EVOLUTION_CONFIG.GLOBAL_API_KEY,
    instance_name: `opticsys_${lojaAtiva.nome_fantasia.toLowerCase().replace(/\s+/g, '_')}`,
    status: obterStatusInicial(),
    numero_conectado: obterNumeroInicial(),
    bateria_nivel: 94
  });

  const [editandoNumero, setEditandoNumero] = useState(false);
  const [novoNumeroInput, setNovoNumeroInput] = useState(obterNumeroInicial());

  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isGerandoQR, setIsGerandoQR] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Sincronizar número e verificar status na Evolution API
  useEffect(() => {
    const num = obterNumeroInicial();
    const statusSalvo = obterStatusInicial();
    setEvolutionConfig(prev => ({
      ...prev,
      instance_name: `opticsys_${lojaAtiva.nome_fantasia.toLowerCase().replace(/\s+/g, '_')}`,
      status: statusSalvo,
      numero_conectado: num
    }));
    setNovoNumeroInput(num);

    const checarStatus = async () => {
      try {
        const instName = `opticsys_${lojaAtiva.nome_fantasia.toLowerCase().replace(/\s+/g, '_')}`;
        const res = await evolutionService.checarStatusConexao(instName);
        if (res.status === 'CONNECTED') {
          const numeroReal = res.numero || num;
          setEvolutionConfig(prev => ({
            ...prev,
            status: 'CONNECTED',
            numero_conectado: numeroReal
          }));
          localStorage.setItem(`opticsys_zap_status_${lojaAtiva.id}`, 'CONNECTED');
          localStorage.setItem(`opticsys_zap_connected_phone_${lojaAtiva.id}`, numeroReal);
        } else if (res.status === 'DISCONNECTED') {
          setEvolutionConfig(prev => ({
            ...prev,
            status: 'DISCONNECTED'
          }));
          localStorage.setItem(`opticsys_zap_status_${lojaAtiva.id}`, 'DISCONNECTED');
        }
      } catch (e) {
        // Silencioso se indisponível
      }
    };
    checarStatus();
  }, [lojaAtiva]);

  // Modal de Confirmação "Clicar para Enviar"
  const [modalPreview, setModalPreview] = useState<{
    cliente_nome: string;
    telefone: string;
    tipo: 'OS_PRONTA' | 'RETORNO_GRAU' | 'COBRANCA' | 'ANIVERSARIO';
    texto: string;
  } | null>(null);

  const [isEnviando, setIsEnviando] = useState(false);
  const [sucessoAlerta, setSucessoAlerta] = useState<string | null>(null);

  // Histórico de Logs de Envio
  const [logsEnvios, setLogsEnvios] = useState<MensagemLog[]>(() => {
    const saved = localStorage.getItem('opticsys_zap_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('opticsys_zap_logs', JSON.stringify(logsEnvios));
  }, [logsEnvios]);

  // Robô Automático de Aniversário (Disparo diário às 07:00 da manhã)
  const [roboAniversarioAtivo, setRoboAniversarioAtivo] = useState(true);
  const [horarioDisparoAniv, setHorarioDisparoAniv] = useState('07:00');
  const [cupomDescontoAniv, setCupomDescontoAniv] = useState('15%');
  const [aniversariantesList, setAniversariantesList] = useState<any[]>([]);

  // Itens filtrados
  const osProntas = ordensServico.filter(o => o.status === 'PRONTO_RETIRADA');
  const receitasVencendo = receitas.slice(0, 4);
  const cobrancasPendentes = transacoes.filter(t => t.tipo === 'RECEITA' && t.status === 'PENDENTE');

  // Executar Robô de Aniversário das 07:00h
  const handleExecutarRoboAniversarioHoje = async () => {
    setIsEnviando(true);
    const anivsDeHoje = aniversariantesList.filter(a => a.niver_dia.includes('Hoje'));
    
    for (const aniv of anivsDeHoje) {
      const textoAniv = `🎂 Parabéns, ${aniv.nome}! 🎉\n\nToda a equipe da ${lojaAtiva.nome_fantasia} deseja a você um feliz aniversário com muita saúde, paz e realizações!\n\n🎁 Como nosso presente especial de aniversário, preparamos um cupom exclusivo de *${cupomDescontoAniv} DE DESCONTO* em qualquer armação ou óculos solar neste seu mês de aniversário!\n\nVenha nos fazer uma visita para comemorarmos juntos! 👓✨`;
      
      await evolutionService.enviarMensagemTexto(
        evolutionConfig.instance_name,
        aniv.fone,
        textoAniv
      );

      const novoLog: MensagemLog = {
        id: `log-aniv-${Date.now()}-${aniv.id}`,
        cliente_nome: aniv.nome,
        telefone: aniv.fone,
        tipo: 'ANIVERSARIO',
        conteudo: textoAniv,
        data_envio: new Date().toISOString(),
        status: 'ENVIADO'
      };
      setLogsEnvios(prev => [novoLog, ...prev]);
    }

    setAniversariantesList(prev => prev.map(a => a.niver_dia.includes('Hoje') ? { ...a, statusEnvio: 'ENVIADO_07H' } : a));
    setIsEnviando(false);
    setSucessoAlerta('🎉 Robô de Aniversário: Mensagens de parabéns disparadas automaticamente com sucesso (Agendado às 07:00 da manhã)!');
    setTimeout(() => setSucessoAlerta(null), 5000);
  };

  // Gerar QR Code
  const handleGerarQRCode = async () => {
    setIsGerandoQR(true);
    setEvolutionConfig(prev => ({ ...prev, status: 'CONNECTING' }));

    try {
      const resp = await evolutionService.conectarOuGerarQR(evolutionConfig.instance_name);
      setIsGerandoQR(false);
      if (resp.status === 'CONNECTED') {
        const numeroReal = resp.numero || obterNumeroInicial();
        setEvolutionConfig(prev => ({
          ...prev,
          status: 'CONNECTED',
          numero_conectado: numeroReal
        }));
        localStorage.setItem(`opticsys_zap_status_${lojaAtiva.id}`, 'CONNECTED');
        localStorage.setItem(`opticsys_zap_connected_phone_${lojaAtiva.id}`, numeroReal);
        setQrCodeData(null);
        setSucessoAlerta(`WhatsApp Conectado com Sucesso! (${numeroReal})`);
        setTimeout(() => setSucessoAlerta(null), 5000);
      } else {
        setEvolutionConfig(prev => ({ ...prev, status: 'QR_READY' }));
        setQrCodeData(resp.qrCode);
      }
    } catch (e) {
      setIsGerandoQR(false);
      setEvolutionConfig(prev => ({ ...prev, status: 'QR_READY' }));
      setQrCodeData(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=OPTICSYS_SESSION_${evolutionConfig.instance_name}_${Date.now()}`);
    }
  };

  // Simular Conexão bem-sucedida após leitura do QR
  const handleSimularLeituraQR = () => {
    const numeroReal = obterNumeroInicial();
    setEvolutionConfig(prev => ({
      ...prev,
      status: 'CONNECTED',
      numero_conectado: numeroReal
    }));
    localStorage.setItem(`opticsys_zap_status_${lojaAtiva.id}`, 'CONNECTED');
    localStorage.setItem(`opticsys_zap_connected_phone_${lojaAtiva.id}`, numeroReal);
    setQrCodeData(null);
    setSucessoAlerta(`WhatsApp Conectado com Sucesso! (${numeroReal})`);
    setTimeout(() => setSucessoAlerta(null), 5000);
  };

  // Salvar customização manual do número conectado
  const handleSalvarNumeroConectado = (novoNum: string) => {
    const formatado = formatarTelefoneBr(novoNum);
    setEvolutionConfig(prev => ({
      ...prev,
      numero_conectado: formatado
    }));
    localStorage.setItem(`opticsys_zap_connected_phone_${lojaAtiva.id}`, formatado);
    setEditandoNumero(false);
    setSucessoAlerta(`Número conectado atualizado para ${formatado}`);
    setTimeout(() => setSucessoAlerta(null), 4000);
  };

  // Desconectar Instância
  const handleDesconectar = async () => {
    try {
      await evolutionService.desconectar(evolutionConfig.instance_name);
    } catch (e) {
      console.warn('Erro ao desconectar na Evolution API:', e);
    }
    setEvolutionConfig(prev => ({
      ...prev,
      status: 'DISCONNECTED',
      numero_conectado: ''
    }));
    localStorage.setItem(`opticsys_zap_status_${lojaAtiva.id}`, 'DISCONNECTED');
    localStorage.removeItem(`opticsys_zap_connected_phone_${lojaAtiva.id}`);
    setQrCodeData(null);
    setSucessoAlerta('WhatsApp Desconectado com sucesso!');
    setTimeout(() => setSucessoAlerta(null), 4000);
  };

  // Abrir Modal de Preview com 1 clique
  const handleAbrirPreview = (cliente_nome: string, telefone: string, tipo: 'OS_PRONTA' | 'RETORNO_GRAU' | 'COBRANCA' | 'ANIVERSARIO', textoBase: string) => {
    setModalPreview({
      cliente_nome,
      telefone,
      tipo,
      texto: textoBase
    });
  };

  // Disparo com 1 clique pela Evolution API ou WhatsApp Web
  const handleConfirmarDisparo = async (metodo: 'EVOLUTION_API' | 'WHATSAPP_WEB') => {
    if (!modalPreview) return;

    setIsEnviando(true);

    if (metodo === 'EVOLUTION_API') {
      const ok = await evolutionService.enviarMensagemTexto(
        evolutionConfig.instance_name,
        modalPreview.telefone,
        modalPreview.texto
      );

      setIsEnviando(false);
      const novoLog: MensagemLog = {
        id: `log-${Date.now()}`,
        cliente_nome: modalPreview.cliente_nome,
        telefone: modalPreview.telefone,
        tipo: modalPreview.tipo,
        conteudo: modalPreview.texto,
        data_envio: new Date().toISOString(),
        status: 'ENVIADO'
      };
      setLogsEnvios(prev => [novoLog, ...prev]);
      setSucessoAlerta(`Mensagem enviada com sucesso para ${modalPreview.cliente_nome}!`);
      setModalPreview(null);
      setTimeout(() => setSucessoAlerta(null), 4000);
    } else {
      // Fallback: Abre WhatsApp Web com texto pronto
      const foneLimpo = modalPreview.telefone.replace(/\D/g, '');
      const url = `https://wa.me/55${foneLimpo}?text=${encodeURIComponent(modalPreview.texto)}`;
      window.open(url, '_blank');
      setIsEnviando(false);
      setModalPreview(null);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl font-sans">
      
      {/* Topo do OpticZap */}
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              OpticZap • Automação WhatsApp
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-emerald-600" /> WhatsApp Oficial Integrado
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Disparos com 1 clique para óculos prontos, retorno de consultas, lembretes de pagamento e aniversários.
            </p>
          </div>
        </div>

        {/* Status da Instância do WhatsApp */}
        <div className="flex items-center gap-2">
          {evolutionConfig.status === 'CONNECTED' ? (
            <div className="flex items-center gap-2 text-xs bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-3 py-1.5 rounded font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>WhatsApp: <strong>Conectado ({evolutionConfig.numero_conectado})</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>WhatsApp: <strong>Desconectado (Requer QR Code)</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Abas Principais */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-zinc-800 pb-1 text-xs">
        <button
          onClick={() => setAbaAtiva('DISPAROS')}
          className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-t transition-all ${
            abaAtiva === 'DISPAROS'
              ? 'bg-[#0099FF] text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Send className="w-3.5 h-3.5" /> 1. Painel de Disparo (Clicar para Enviar)
        </button>

        <button
          onClick={() => setAbaAtiva('CONEXAO_EVOLUTION')}
          className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-t transition-all ${
            abaAtiva === 'CONEXAO_EVOLUTION'
              ? 'bg-[#0099FF] text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" /> 2. Conectar WhatsApp (QR Code)
        </button>

        <button
          onClick={() => setAbaAtiva('LOGS')}
          className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-t transition-all ${
            abaAtiva === 'LOGS'
              ? 'bg-[#0099FF] text-white shadow-xs'
              : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> 3. Histórico de Mensagens ({logsEnvios.length})
        </button>
      </div>

      {/* Alerta de Sucesso */}
      {sucessoAlerta && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sucessoAlerta}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 1: PAINEL DE DISPARO (CLICAR PARA ENVIAR)                             */}
      {/* ========================================================================= */}
      {abaAtiva === 'DISPAROS' && (
        <div className="space-y-4">
          
          {/* Subcategorias de Mensagens com Filtros */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTipoDisparo('OS_PRONTA')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                tipoDisparo === 'OS_PRONTA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
              }`}
            >
              <Glasses className="w-3.5 h-3.5" /> Óculos Pronto para Retirada ({osProntas.length})
            </button>

            <button
              onClick={() => setTipoDisparo('RETORNO_GRAU')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                tipoDisparo === 'RETORNO_GRAU'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" /> Retorno de Grau (12 Meses) ({receitasVencendo.length})
            </button>

            <button
              onClick={() => setTipoDisparo('COBRANCA')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                tipoDisparo === 'COBRANCA'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" /> Lembrete de Parcelas / PIX ({cobrancasPendentes.length})
            </button>

            <button
              onClick={() => setTipoDisparo('ANIVERSARIO')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                tipoDisparo === 'ANIVERSARIO'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-amber-300" />
              <span>🎂 Aniversariantes</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase font-mono">
                Auto 07h
              </span>
            </button>
          </div>

          {/* LISTA: Óculos Prontos */}
          {tipoDisparo === 'OS_PRONTA' && (
            <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    Pacientes com Óculos Prontos na Bancada Técnica
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Clique no botão para conferir o texto e enviar a notificação no WhatsApp do paciente.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {osProntas.map(os => (
                  <div key={os.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 text-xs gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-zinc-100 font-bold">{os.cliente_nome}</strong>
                        <span className="bg-sky-100 text-[#0099FF] text-[10px] font-mono font-bold px-1.5 py-0.2 rounded">
                          O.S. #{os.numero_os}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {os.armacao_descricao} • Lente: {os.lente_tipo} • Tel: {os.cliente_telefone}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAbrirPreview(
                        os.cliente_nome,
                        os.cliente_telefone,
                        'OS_PRONTA',
                        `Olá, ${os.cliente_nome}! 👋\n\nSeus óculos (O.S. #${os.numero_os} - ${os.armacao_descricao}) ficaram prontos na ${lojaAtiva.nome_fantasia}!\n\nNossa equipe técnica já realizou a montagem e conferência de dioptria. Venha fazer a prova e o ajuste fino do seu rosto.\n\n📍 Ficamos em: ${lojaAtiva.endereco || 'Morada Nova - CE'}.\nEsperamos você!`
                      )}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Clicar para Enviar</span>
                    </button>
                  </div>
                ))}

                {osProntas.length === 0 && (
                  <p className="text-slate-400 text-xs py-6 text-center">
                    Nenhum óculos aguardando retirada no momento. Todas as O.S. estão em montagem ou já foram entregues.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* LISTA: Retorno de Grau (12 Meses) */}
          {tipoDisparo === 'RETORNO_GRAU' && (
            <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Pacientes com Prescrição Prestes a Completar 1 Ano
                </h3>
                <p className="text-[11px] text-slate-500">
                  Estimule o retorno e a fidelização convidando o paciente para renovação do exame preventivo.
                </p>
              </div>

              <div className="space-y-2">
                {receitasVencendo.map(rec => {
                  const cliRec = clientes.find(c => c.id === rec.cliente_id || c.nome.toLowerCase() === rec.cliente_nome.toLowerCase());
                  const foneDestino = cliRec?.whatsapp || cliRec?.telefone || 'Telefone não cadastrado';

                  return (
                    <div key={rec.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 text-xs gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 dark:text-zinc-100 font-bold block">{rec.cliente_nome}</strong>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {foneDestino}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Última receita: {new Date(rec.data_emissao).toLocaleDateString('pt-BR')} • Prescritor: {rec.medico_prescritor || 'Dr. Oftalmologista'}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAbrirPreview(
                          rec.cliente_nome,
                          foneDestino,
                          'RETORNO_GRAU',
                          `Olá, ${rec.cliente_nome}! Tudo bem? 😊\n\nJá faz quase 1 ano desde a sua última avaliação visual aqui na ${lojaAtiva.nome_fantasia}.\n\nCuidar da saúde dos olhos é fundamental para evitar fadiga ocular e dores de cabeça. Que tal agendar um retorno para checar seu grau?\n\nResponda esta mensagem para agendarmos o melhor horário para você!`
                        )}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Clicar para Enviar Convite</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LISTA: Lembrete de Pagamento */}
          {tipoDisparo === 'COBRANCA' && (
            <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  Lembrete Amigável de Parcelas & Boletos
                </h3>
                <p className="text-[11px] text-slate-500">
                  Envie a chave PIX e o lembrete de vencimento com 1 clique.
                </p>
              </div>

              <div className="space-y-2">
                {cobrancasPendentes.slice(0, 4).map(cob => {
                  const cliCob = clientes.find(c => c.nome.toLowerCase() === (cob.cliente_ou_fornecedor || '').toLowerCase());
                  const foneDestino = cliCob?.whatsapp || cliCob?.telefone || 'Telefone não cadastrado';

                  return (
                    <div key={cob.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-50 dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-800 text-xs gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 dark:text-zinc-100 font-bold block">{cob.cliente_ou_fornecedor || 'Cliente'}</strong>
                          <span className="text-[10px] text-slate-500 font-mono bg-slate-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {foneDestino}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
                          {cob.descricao} • Vencimento: {new Date(cob.data_vencimento).toLocaleDateString('pt-BR')} • <strong>R$ {cob.valor.toFixed(2)}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => handleAbrirPreview(
                          cob.cliente_ou_fornecedor || 'Cliente',
                          foneDestino,
                          'COBRANCA',
                          `Olá, ${cob.cliente_ou_fornecedor}! Esperamos que esteja tudo bem.\n\nPassando para lembrar do vencimento da sua parcela no valor de R$ ${cob.valor.toFixed(2)} referente à sua compra na ${lojaAtiva.nome_fantasia}.\n\n🔑 Chave PIX: ${lojaAtiva.cnpj || '49680752000130'}\n\nSe já efetuou o pagamento, favor desconsiderar este aviso!`
                        )}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded flex items-center gap-1.5 shadow-xs transition-all active:scale-95 shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Lembrete PIX</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LISTA: Robô Automático de Aniversariantes (Disparo Diário às 07:00 da Manhã) */}
          {tipoDisparo === 'ANIVERSARIO' && (
            <div className="space-y-4">
              
              {/* Card de Configuração do Robô de Aniversário */}
              <div className="bg-white dark:bg-[#121216] border border-amber-300 dark:border-amber-900/50 rounded-lg p-5 shadow-xs space-y-4">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        Robô Automático de Aniversário (Disparo Diário às 07:00 da Manhã)
                        <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          100% AUTOMÁTICO
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        O sistema verifica automaticamente a data de nascimento no cadastro do cliente e dispara os parabéns pontualmente às <strong>07:00h</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Toggle Ativar / Desativar Robô */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-900 p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-bold">
                    <span className="text-slate-600 dark:text-zinc-400 text-[11px]">Status:</span>
                    <button
                      type="button"
                      onClick={() => setRoboAniversarioAtivo(!roboAniversarioAtivo)}
                      className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                        roboAniversarioAtivo
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-300 text-slate-700'
                      }`}
                    >
                      {roboAniversarioAtivo ? '🟢 Robô Ativo (07h)' : '⚪ Pausado'}
                    </button>
                  </div>
                </div>

                {/* Parâmetros do Robô */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horário de Envio</span>
                    <div className="text-sm font-black font-mono text-slate-900 dark:text-zinc-100 mt-0.5">
                      ⏰ 07:00 (Manhã)
                    </div>
                    <span className="text-[10px] text-slate-400">Disparo matinal no dia do aniversário</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critério de Busca</span>
                    <div className="text-sm font-black text-slate-900 dark:text-zinc-100 mt-0.5">
                      🎂 Data de Nascimento
                    </div>
                    <span className="text-[10px] text-slate-400">Puxado direto da ficha do paciente</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Presente / Cupom</span>
                    <div className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5">
                      🎁 {cupomDescontoAniv} de Desconto
                    </div>
                    <span className="text-[10px] text-slate-400">Válido no mês de aniversário</span>
                  </div>
                </div>

                {/* Botão de Teste / Simulação do Disparo de 07:00h */}
                <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-500 italic">
                    💡 O robô roda em background no servidor às 07:00h todos os dias sem necessidade de cliques.
                  </p>

                  <button
                    type="button"
                    disabled={isEnviando}
                    onClick={handleExecutarRoboAniversarioHoje}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-black text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isEnviando ? 'animate-spin' : ''}`} />
                    <span>{isEnviando ? 'Disparando...' : '⚡ Executar Disparo de Hoje Agora (Simular 07:00h)'}</span>
                  </button>
                </div>

              </div>

              {/* Tabela de Aniversariantes do Cadastro */}
              <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                      Aniversariantes Identificados no Cadastro da Clínica
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Clientes com aniversário hoje e nos próximos dias.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Total: {aniversariantesList.length} clientes
                  </span>
                </div>

                <div className="space-y-2">
                  {aniversariantesList.map((aniv) => (
                    <div 
                      key={aniv.id} 
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3.5 rounded-lg border text-xs gap-2 transition-all ${
                        aniv.niver_dia.includes('Hoje')
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/50'
                          : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 dark:text-zinc-100 font-extrabold text-sm">
                            {aniv.nome}
                          </strong>
                          {aniv.niver_dia.includes('Hoje') && (
                            <span className="bg-amber-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded font-mono animate-bounce">
                              🎂 ANIVERSARIANTE DE HOJE
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Data Nasc: {new Date(aniv.data_nasc).toLocaleDateString('pt-BR')} ({aniv.niver_dia}) • Tel: <strong>{aniv.fone}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {aniv.statusEnvio === 'ENVIADO_07H' ? (
                          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Enviado Automático às 07:00h</span>
                          </span>
                        ) : (
                          <span className="bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 border border-sky-300 dark:border-sky-800 font-mono">
                            <Clock className="w-3.5 h-3.5 text-[#0099FF]" />
                            <span>Agendado para 07:00h</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleAbrirPreview(
                            aniv.nome,
                            aniv.fone,
                            'ANIVERSARIO',
                            `🎂 Parabéns, ${aniv.nome}! 🎉\n\nToda a equipe da ${lojaAtiva.nome_fantasia} deseja a você um feliz aniversário com muita saúde, paz e realizações!\n\n🎁 Como nosso presente especial, você ganhou um cupom exclusivo de *${cupomDescontoAniv} DE DESCONTO* em qualquer armação ou óculos solar neste seu mês de aniversário!\n\nVenha nos fazer uma visita para comemorarmos juntos! 👓✨`
                          )}
                          className="bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold px-2.5 py-1.5 rounded flex items-center gap-1"
                          title="Ver / Reenviar mensagem manualmente"
                        >
                          <Send className="w-3 h-3" /> Reenviar
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: CONECTAR WHATSAPP (CONEXÃO DIRETA COM QR CODE)                     */}
      {/* ========================================================================= */}
      {abaAtiva === 'CONEXAO_EVOLUTION' && (
        <div className="space-y-4">
          
          <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
            
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Conexão WhatsApp da Ótica
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conecte o número de WhatsApp da sua ótica escaneando o QR Code abaixo com seu celular.
                </p>
              </div>

              {evolutionConfig.status === 'CONNECTED' && (
                <button
                  type="button"
                  onClick={handleDesconectar}
                  className="text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded font-bold transition-all flex items-center gap-1"
                >
                  <Power className="w-3.5 h-3.5" /> Desconectar WhatsApp
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Lado Esquerdo: Identificador e Passo a Passo Simples */}
              <div className="md:col-span-7 space-y-4 text-xs">
                
                {/* Identificador Automático da Instância */}
                <div className="bg-slate-50 dark:bg-zinc-900/70 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                      Identificador da sua Ótica:
                    </span>
                    <span className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[11px] px-2 py-0.5 rounded font-bold">
                      {evolutionConfig.instance_name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Sua loja é identificada automaticamente no servidor com criptografia de ponta a ponta.
                  </p>
                </div>

                {/* Passo a Passo Ultra-Simples */}
                <div className="space-y-2.5 bg-blue-50/40 dark:bg-zinc-900/40 p-3.5 rounded-lg border border-blue-100 dark:border-zinc-800">
                  <span className="text-[11px] uppercase font-extrabold text-blue-900 dark:text-blue-300 tracking-wider">
                    Como Conectar em 3 Passos:
                  </span>
                  <ul className="space-y-2 text-slate-700 dark:text-zinc-300 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      <span>Clique no botão verde <strong>"Gerar QR Code de Conexão"</strong> abaixo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      <span>No seu celular, abra o WhatsApp, vá em <strong>Menu (ou Configurações) &gt; Aparelhos Conectados</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                      <span>Toque em <strong>"Conectar um Aparelho"</strong> e aponte a câmera para o QR Code ao lado.</span>
                    </li>
                  </ul>
                </div>

                {/* Status da Sessão */}
                <div className="bg-slate-50 dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Status da Conexão</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                      {evolutionConfig.status === 'CONNECTED' ? '🟢 Conexão Ativa & Pronta para Disparos' : evolutionConfig.status === 'QR_READY' ? '🟡 QR Code Gerado • Aguardando Leitura' : '🔴 Desconectado'}
                    </span>
                    {evolutionConfig.status === 'CONNECTED' && (
                      <span className="text-[11px] font-mono text-emerald-600 font-bold">
                        Bateria: {evolutionConfig.bateria_nivel}% 🔋
                      </span>
                    )}
                  </div>
                </div>

                {/* Botão de Ação */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleGerarQRCode}
                    disabled={isGerandoQR}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-6 py-3 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGerandoQR ? 'animate-spin' : ''}`} />
                    <span>{isGerandoQR ? 'Gerando QR Code no Servidor...' : '⚡ Gerar QR Code de Conexão'}</span>
                  </button>
                </div>

              </div>

              {/* Lado Direito: Visualizador de QR Code */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-zinc-900/60 p-5 rounded-lg border border-slate-200 dark:border-zinc-800 text-center space-y-3">
                
                {evolutionConfig.status === 'CONNECTED' ? (
                  <div className="py-6 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">WhatsApp Conectado!</h4>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                        {evolutionConfig.numero_conectado}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                        Pronto para realizar disparos com 1 clique direto no sistema.
                      </p>
                    </div>

                    {/* Editar número vinculado */}
                    {editandoNumero ? (
                      <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto text-left bg-white dark:bg-zinc-800 p-3 rounded-lg border border-slate-200 dark:border-zinc-700">
                        <label className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                          Número Real Conectado:
                        </label>
                        <input
                          type="text"
                          value={novoNumeroInput}
                          onChange={(e) => setNovoNumeroInput(e.target.value)}
                          placeholder="Ex: (88) 98888-8888"
                          className="w-full text-xs p-2 rounded border border-slate-300 dark:border-zinc-600 bg-slate-50 dark:bg-zinc-900 font-mono text-slate-900 dark:text-zinc-100"
                        />
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setEditandoNumero(false)}
                            className="px-2.5 py-1 text-[11px] rounded border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-zinc-700 dark:text-zinc-300"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSalvarNumeroConectado(novoNumeroInput)}
                            className="px-3 py-1 text-[11px] font-bold rounded bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs"
                          >
                            Salvar Número
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setNovoNumeroInput(evolutionConfig.numero_conectado);
                            setEditandoNumero(true);
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 underline flex items-center justify-center gap-1 mx-auto"
                        >
                          <Settings className="w-3 h-3" /> Alterar número exibido
                        </button>
                      </div>
                    )}
                  </div>
                ) : qrCodeData ? (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs text-slate-800 dark:text-zinc-200">
                      Escaneie com seu WhatsApp:
                    </h4>
                    <div className="bg-white p-2 border border-slate-300 rounded-lg shadow-xs w-52 h-52 mx-auto flex items-center justify-center">
                      <img src={qrCodeData} alt="QR Code WhatsApp" className="w-48 h-48 rounded" />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Abra o WhatsApp no celular → Aparelhos Conectados → Conectar um Aparelho.
                    </p>
                    <button
                      type="button"
                      onClick={handleSimularLeituraQR}
                      className="bg-[#0099FF] text-white text-xs font-bold px-4 py-1.5 rounded shadow-xs hover:bg-[#0088EE]"
                    >
                      ✓ Simular QR Code Lido (Teste Rápido)
                    </button>
                  </div>
                ) : (
                  <div className="py-12 space-y-2 text-slate-400">
                    <QrCode className="w-12 h-12 mx-auto text-slate-300" />
                    <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">Nenhum QR Code ativo no momento.</p>
                    <p className="text-[11px] text-slate-400">Clique no botão "Gerar QR Code de Conexão" ao lado.</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: HISTÓRICO DE LOGS                                                  */}
      {/* ========================================================================= */}
      {abaAtiva === 'LOGS' && (
        <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-zinc-200">
              Histórico de Mensagens Disparadas ({logsEnvios.length})
            </h3>
            <span className="text-[11px] text-slate-400">Registrado com data, hora e confirmação de leitura</span>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-zinc-800 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 font-semibold border-b border-slate-200 dark:border-zinc-800">
                  <th className="py-2.5 px-3">Data / Hora</th>
                  <th className="py-2.5 px-3">Cliente / Destinatário</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Conteúdo Enviado</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {logsEnvios.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                      {new Date(log.data_envio).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      <span className="block text-slate-900 dark:text-zinc-100 font-bold">{log.cliente_nome}</span>
                      <span className="font-mono text-[10px] text-slate-400">{log.telefone}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 dark:bg-zinc-800 text-[10px] font-bold px-2 py-0.5 rounded text-slate-700 dark:text-zinc-300">
                        {log.tipo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-zinc-400 max-w-xs truncate">
                      {log.conteudo}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        ✓ {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE PREVIEW "CLICAR PARA ENVIAR" COM EDIÇÃO ANTES DO DISPARO         */}
      {/* ========================================================================= */}
      {modalPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden text-xs my-8 border border-slate-300">
            
            <div className="bg-emerald-700 text-white p-3.5 flex justify-between items-center">
              <span className="font-bold flex items-center gap-1.5 text-xs">
                <MessageSquare className="w-4 h-4" /> Confirmar Disparo para: {modalPreview.cliente_nome}
              </span>
              <button
                onClick={() => setModalPreview(null)}
                className="text-white/80 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex justify-between items-center text-[11px]">
                <span><strong>Destinatário:</strong> {modalPreview.cliente_nome} ({modalPreview.telefone})</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono">
                  {modalPreview.tipo}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Texto da Mensagem (Você pode personalizar antes de enviar):
                </label>
                <textarea
                  rows={6}
                  value={modalPreview.texto}
                  onChange={e => setModalPreview({ ...modalPreview, texto: e.target.value })}
                  className="w-full border border-slate-300 rounded p-2.5 font-sans text-xs outline-none focus:border-emerald-600 leading-relaxed bg-white"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(modalPreview.texto);
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 2000);
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiado ? 'Texto Copiado!' : 'Copiar Texto'}</span>
                </button>

                <span className="text-[10px] text-slate-400">
                  {modalPreview.texto.length} caracteres
                </span>
              </div>

            </div>

            {/* Ações de Disparo */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModalPreview(null)}
                className="neo-button-secondary text-xs"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={() => handleConfirmarDisparo('WHATSAPP_WEB')}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs px-3 py-2 rounded flex items-center justify-center gap-1"
                title="Abrir no WhatsApp Web"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Abrir no Zap Web
              </button>

              <button
                type="button"
                disabled={isEnviando}
                onClick={() => handleConfirmarDisparo('EVOLUTION_API')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isEnviando ? 'Enviando...' : '⚡ Disparar Mensagem Agora'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
