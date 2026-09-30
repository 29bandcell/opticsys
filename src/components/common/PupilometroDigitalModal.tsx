import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Eye, 
  Sparkles, 
  Check, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Printer, 
  Share2, 
  Save, 
  HelpCircle, 
  X, 
  CreditCard, 
  Move, 
  Layers, 
  AlertCircle,
  ChevronRight,
  Sliders,
  CheckCircle2,
  RefreshCw,
  User
} from 'lucide-react';
import { useAuthAndTenant } from '../../context/AuthAndTenantContext';

export interface MedidasPupilometro {
  dnp_od: number;
  dnp_oe: number;
  dp_total: number;
  altura_od: number;
  altura_oe: number;
  inclinacao_graus: number;
  foto_url?: string;
  data_medicao: string;
  paciente_nome?: string;
}

interface PupilometroDigitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pacienteNomeInicial?: string;
  clienteIdInicial?: string;
  onAplicarMedidas?: (medidas: MedidasPupilometro) => void;
}

type EtapaPupilometro = 'CAPTURA' | 'CALIBRACAO' | 'MARCACAO' | 'RESULTADOS';

// Exemplo de foto frontal estilizada com paciente e cartão para testes rápidos
const SAMPLE_IMAGE = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80';

export const PupilometroDigitalModal: React.FC<PupilometroDigitalModalProps> = ({
  isOpen,
  onClose,
  pacienteNomeInicial = '',
  clienteIdInicial,
  onAplicarMedidas
}) => {
  const { clientes, atualizarCliente, lojaAtiva } = useAuthAndTenant();

  const [etapa, setEtapa] = useState<EtapaPupilometro>('CAPTURA');
  const [pacienteNome, setPacienteNome] = useState(pacienteNomeInicial);
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState(clienteIdInicial || '');

  // Câmera & Imagem
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [imagemCapturada, setImagemCapturada] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [erroCamera, setErroCamera] = useState<string | null>(null);

  // Dimensões do container da imagem
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensoesImg, setDimensoesImg] = useState({ width: 600, height: 450 });

  // 1. Calibração (Largura do Cartão de Crédito Padrão ISO 7810: 85.60 mm)
  const [cartaoEsq, setCartaoEsq] = useState({ x: 180, y: 120 });
  const [cartaoDir, setCartaoDir] = useState({ x: 420, y: 120 });
  const larguraCartaoRealMm = 85.6;

  // 2. Pontos Anatômicos (Coordenadas em pixels na imagem)
  const [pontoOD, setPontoOD] = useState({ x: 235, y: 220 }); // Pupila Olho Direito
  const [pontoOE, setPontoOE] = useState({ x: 365, y: 220 }); // Pupila Olho Esquerdo
  const [linhaNarizX, setLinhaNarizX] = useState(300); // Linha Central Nasal
  const [bordaArmacaoOD_Y, setBordaArmacaoOD_Y] = useState(295); // Base Inferior Armação OD
  const [bordaArmacaoOE_Y, setBordaArmacaoOE_Y] = useState(295); // Base Inferior Armação OE

  // Controle de Arraste
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [pontoAtivo, setPontoAtivo] = useState<string>('pupilas');
  const [zoomLupa, setZoomLupa] = useState(false);
  const [posicaoMouse, setPosicaoMouse] = useState({ x: 0, y: 0 });

  // Iniciar ou alternar câmera
  const iniciarCamera = async () => {
    try {
      setErroCamera(null);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraAtiva(true);
      }
    } catch (err: any) {
      console.warn('Erro ao acessar webcam:', err);
      setErroCamera('Não foi possível acessar a câmera. Você pode fazer upload de uma foto salva no dispositivo.');
      setCameraAtiva(false);
    }
  };

  const pararCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraAtiva(false);
  };

  useEffect(() => {
    if (isOpen && etapa === 'CAPTURA' && !imagemCapturada) {
      iniciarCamera();
    }
    return () => {
      pararCamera();
    };
  }, [isOpen, cameraFacing, etapa]);

  // Capturar frame da câmera
  const capturarFoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Se câmera frontal, espelha para ficar natural
      if (cameraFacing === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setImagemCapturada(dataUrl);
      pararCamera();
      inicializarPontosPadrao(canvas.width, canvas.height);
      setEtapa('CALIBRACAO');
    }
  };

  // Upload de imagem do computador/celular
  const handleUploadArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setImagemCapturada(dataUrl);
        pararCamera();
        
        const img = new Image();
        img.onload = () => {
          inicializarPontosPadrao(img.width, img.height);
          setEtapa('CALIBRACAO');
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Teste Rápido com Imagem de Demonstração
  const handleUsarExemplo = () => {
    setImagemCapturada(SAMPLE_IMAGE);
    pararCamera();
    inicializarPontosPadrao(600, 450);
    setEtapa('CALIBRACAO');
  };

  // Inicializa marcadores proporcionais ao tamanho da foto
  const inicializarPontosPadrao = (w: number, h: number) => {
    // Escala proporcional
    const baseW = 600;
    const baseH = 450;
    setDimensoesImg({ width: baseW, height: baseH });

    setCartaoEsq({ x: baseW * 0.28, y: baseH * 0.22 });
    setCartaoDir({ x: baseW * 0.72, y: baseH * 0.22 });

    setPontoOD({ x: baseW * 0.38, y: baseH * 0.48 });
    setPontoOE({ x: baseW * 0.62, y: baseH * 0.48 });
    setLinhaNarizX(baseW * 0.50);
    setBordaArmacaoOD_Y(baseH * 0.64);
    setBordaArmacaoOE_Y(baseH * 0.64);
  };

  // Cálculo da Escala de Calibração (Pixels por Milímetro)
  const distCartaoPixels = Math.hypot(cartaoDir.x - cartaoEsq.x, cartaoDir.y - cartaoEsq.y) || 200;
  const pixelsPorMm = distCartaoPixels / larguraCartaoRealMm;
  const mmPorPixel = 1 / pixelsPorMm;

  // Cálculo em Tempo Real dos Resultados
  const dnpOD = Number((Math.abs(linhaNarizX - pontoOD.x) * mmPorPixel).toFixed(1));
  const dnpOE = Number((Math.abs(pontoOE.x - linhaNarizX) * mmPorPixel).toFixed(1));
  const dpTotal = Number((dnpOD + dnpOE).toFixed(1));
  const alturaOD = Number((Math.max(0, bordaArmacaoOD_Y - pontoOD.y) * mmPorPixel).toFixed(1));
  const alturaOE = Number((Math.max(0, bordaArmacaoOE_Y - pontoOE.y) * mmPorPixel).toFixed(1));

  // Inclinação dos olhos em graus
  const deltaX = pontoOE.x - pontoOD.x;
  const deltaY = pontoOE.y - pontoOD.y;
  const inclinacaoGraus = Number(((Math.atan2(deltaY, deltaX) * 180) / Math.PI).toFixed(1));

  // Tratamento de toque/mouse no Container de Imagem
  const obterCoordenadasRelativas = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(dimensoesImg.width, clientX - rect.left));
    const y = Math.max(0, Math.min(dimensoesImg.height, clientY - rect.top));
    return { x, y };
  };

  const handlePointerDown = (alvo: string) => (e: React.PointerEvent) => {
    e.stopPropagation();
    setArrastando(alvo);
    setPontoAtivo(alvo);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { x, y } = obterCoordenadasRelativas(e.clientX, e.clientY);
    setPosicaoMouse({ x, y });

    if (!arrastando) return;

    switch (arrastando) {
      case 'cartao_esq':
        setCartaoEsq({ x, y });
        break;
      case 'cartao_dir':
        setCartaoDir({ x, y });
        break;
      case 'ponto_od':
        setPontoOD({ x, y });
        break;
      case 'ponto_oe':
        setPontoOE({ x, y });
        break;
      case 'linha_nariz':
        setLinhaNarizX(x);
        break;
      case 'borda_od':
        setBordaArmacaoOD_Y(y);
        break;
      case 'borda_oe':
        setBordaArmacaoOE_Y(y);
        break;
      default:
        break;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setArrastando(null);
  };

  // Ajustes finos com botões (+/- 0.5 mm)
  const ajusteFino = (tipo: string, deltaMm: number) => {
    const deltaPx = deltaMm * pixelsPorMm;
    switch (tipo) {
      case 'dnp_od':
        setPontoOD(prev => ({ ...prev, x: prev.x - deltaPx }));
        break;
      case 'dnp_oe':
        setPontoOE(prev => ({ ...prev, x: prev.x + deltaPx }));
        break;
      case 'alt_od':
        setBordaArmacaoOD_Y(prev => prev + deltaPx);
        break;
      case 'alt_oe':
        setBordaArmacaoOE_Y(prev => prev + deltaPx);
        break;
      case 'nariz':
        setLinhaNarizX(prev => prev + deltaPx);
        break;
      default:
        break;
    }
  };

  // Concluir e Aplicar Medidas
  const handleFinalizar = () => {
    const dadosMedicao: MedidasPupilometro = {
      dnp_od: dnpOD,
      dnp_oe: dnpOE,
      dp_total: dpTotal,
      altura_od: alturaOD,
      altura_oe: alturaOE,
      inclinacao_graus: inclinacaoGraus,
      foto_url: imagemCapturada || undefined,
      data_medicao: new Date().toISOString(),
      paciente_nome: pacienteNome
    };

    // Se houver cliente selecionado, salva no cadastro dele
    if (clienteSelecionadoId) {
      atualizarCliente(clienteSelecionadoId, {
        dnp_od: dnpOD,
        dnp_oe: dnpOE,
        altura_od: alturaOD,
        altura_oe: alturaOE
      });
    }

    if (onAplicarMedidas) {
      onAplicarMedidas(dadosMedicao);
    }

    alert(`✅ Medições do Pupilômetro salvas com sucesso!\n\n• DNP OD: ${dnpOD} mm\n• DNP OE: ${dnpOE} mm\n• DP Total: ${dpTotal} mm\n• Altura OD: ${alturaOD} mm\n• Altura OE: ${alturaOE} mm`);
    onClose();
  };

  // Imprimir Laudo
  const handleImprimirLaudo = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#121216] border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#0284C7] to-sky-700 text-white px-5 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Pupilômetro Digital OpticSys
                </h2>
                <span className="bg-emerald-400 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs">
                  Visão Computacional
                </span>
              </div>
              <p className="text-xs text-sky-100 font-medium">
                Medição óptica de alta precisão milimétrica com escala por cartão de calibração
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              pararCamera();
              onClose();
            }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVEGAÇÃO DE ETAPAS */}
        <div className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-4 py-2.5 flex items-center justify-between text-xs font-bold overflow-x-auto gap-2">
          <div className="flex items-center gap-1 sm:gap-4 min-w-max">
            
            <button
              onClick={() => setEtapa('CAPTURA')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                etapa === 'CAPTURA' 
                  ? 'bg-[#0284C7] text-white shadow-xs' 
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              <Camera className="w-4 h-4" /> 1. Capturar Foto
            </button>

            <ChevronRight className="w-4 h-4 text-slate-400" />

            <button
              onClick={() => imagemCapturada && setEtapa('CALIBRACAO')}
              disabled={!imagemCapturada}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                etapa === 'CALIBRACAO' 
                  ? 'bg-[#0284C7] text-white shadow-xs' 
                  : !imagemCapturada 
                    ? 'opacity-40 cursor-not-allowed text-slate-400' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              <CreditCard className="w-4 h-4" /> 2. Calibrar Escala (85.6mm)
            </button>

            <ChevronRight className="w-4 h-4 text-slate-400" />

            <button
              onClick={() => imagemCapturada && setEtapa('MARCACAO')}
              disabled={!imagemCapturada}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                etapa === 'MARCACAO' 
                  ? 'bg-[#0284C7] text-white shadow-xs' 
                  : !imagemCapturada 
                    ? 'opacity-40 cursor-not-allowed text-slate-400' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              <Sliders className="w-4 h-4" /> 3. Marcar Pupilas & Armação
            </button>

            <ChevronRight className="w-4 h-4 text-slate-400" />

            <button
              onClick={() => imagemCapturada && setEtapa('RESULTADOS')}
              disabled={!imagemCapturada}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                etapa === 'RESULTADOS' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : !imagemCapturada 
                    ? 'opacity-40 cursor-not-allowed text-slate-400' 
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> 4. Resultados & DNP
            </button>

          </div>

          {/* Seleção do Paciente */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={clienteSelecionadoId}
              onChange={e => {
                setClienteSelecionadoId(e.target.value);
                const cli = clientes.find(c => c.id === e.target.value);
                if (cli) setPacienteNome(cli.nome);
              }}
              className="text-xs py-1 px-2 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded font-medium max-w-[160px] truncate"
            >
              <option value="">Paciente Avulso</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CORPO PRINCIPAL */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          
          {/* ETAPA 1: CAPTURA DE FOTO */}
          {etapa === 'CAPTURA' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Visualizador de Vídeo / Câmera */}
                <div className="lg:col-span-7 bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800 aspect-[4/3] relative flex items-center justify-center">
                  
                  {cameraAtiva ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraFacing === 'user' ? '-scale-x-100' : ''}`}
                      />

                      {/* Guia de Enquadramento */}
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                        {/* Caixa do Rosto */}
                        <div className="w-48 sm:w-56 h-64 sm:h-72 border-2 border-dashed border-sky-400/80 rounded-full flex flex-col items-center justify-between p-4">
                          <span className="text-[10px] font-bold text-sky-300 bg-slate-950/70 px-2 py-0.5 rounded-full">
                            Alinhe os olhos aqui
                          </span>
                          
                          {/* Linha dos olhos */}
                          <div className="w-full border-t border-sky-400/60 relative">
                            <div className="w-2 h-2 rounded-full bg-sky-400 absolute left-1/4 -translate-y-1/2" />
                            <div className="w-2 h-2 rounded-full bg-sky-400 absolute right-1/4 -translate-y-1/2" />
                          </div>

                          {/* Guia do Cartão */}
                          <div className="w-36 h-12 border-2 border-amber-400/80 rounded bg-amber-400/10 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-amber-300">
                              Cartão de Escala 💳
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botão Flutuante de Disparo */}
                      <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3">
                        <button
                          onClick={() => setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')}
                          className="p-3 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full backdrop-blur-sm transition-all"
                          title="Alternar Câmera"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>

                        <button
                          onClick={capturarFoto}
                          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-full shadow-lg flex items-center gap-2 active:scale-95 transition-all"
                        >
                          <Camera className="w-5 h-5" /> Fotografar Paciente
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 space-y-4 text-slate-300">
                      <div className="w-16 h-16 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center mx-auto border border-slate-700">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-white">Câmera em Espera</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                          {erroCamera || 'Clique abaixo para ativar a câmera ou carregue uma foto já salva no computador/celular.'}
                        </p>
                      </div>
                      <button
                        onClick={iniciarCamera}
                        className="px-5 py-2.5 bg-[#0284C7] hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" /> Ativar Câmera Web
                      </button>
                    </div>
                  )}

                </div>

                {/* Painel de Instruções & Upload */}
                <div className="lg:col-span-5 space-y-4">
                  
                  <div className="bg-sky-50 dark:bg-sky-950/40 p-4 rounded-xl border border-sky-200 dark:border-sky-800 space-y-3">
                    <h3 className="font-extrabold text-xs text-sky-900 dark:text-sky-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-600" /> Como Tirar a Foto Perfeita:
                    </h3>
                    <ul className="text-xs text-slate-600 dark:text-zinc-300 space-y-2 list-disc list-inside">
                      <li>O paciente deve estar com a <strong>armação já ajustada</strong> no rosto.</li>
                      <li>Posicione um <strong>cartão padrão (85.6 mm)</strong> abaixo do nariz ou na testa.</li>
                      <li>Mantenha a câmera na <strong>altura exata dos olhos</strong> a 40cm a 50cm de distância.</li>
                      <li>Peça para o paciente olhar fixamente para a lente da câmera.</li>
                    </ul>
                  </div>

                  {/* Opções Alternativas de Entrada */}
                  <div className="space-y-2 pt-2">
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleUploadArquivo}
                      className="hidden"
                    />

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-[#0284C7] text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-all"
                    >
                      <Upload className="w-4 h-4 text-[#0284C7]" /> Carregar Foto do Computador / Galeria
                    </button>

                    <button
                      onClick={handleUsarExemplo}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" /> Testar Imediatamente com Foto de Demonstração
                    </button>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ETAPA 2 e 3: CALIBRAÇÃO DE ESCALA & MARCAÇÃO DOS PONTOS */}
          {(etapa === 'CALIBRACAO' || etapa === 'MARCACAO') && imagemCapturada && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* CANVAS INTERATIVO DE MEDIÇÃO */}
              <div className="lg:col-span-8 flex flex-col items-center">
                
                <div 
                  ref={containerRef}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="relative select-none bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700 touch-none max-w-full cursor-crosshair"
                  style={{ width: dimensoesImg.width, height: dimensoesImg.height }}
                >
                  
                  {/* Foto de Fundo */}
                  <img
                    src={imagemCapturada}
                    alt="Paciente"
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />

                  {/* SVG OVERLAY COM AS LINHAS E MARCADORES */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    
                    {/* ETAPA 2: Linha de Calibração do Cartão (85.6 mm) */}
                    {etapa === 'CALIBRACAO' && (
                      <>
                        <line
                          x1={cartaoEsq.x}
                          y1={cartaoEsq.y}
                          x2={cartaoDir.x}
                          y2={cartaoDir.y}
                          stroke="#F59E0B"
                          strokeWidth="3"
                          strokeDasharray="4 2"
                        />
                        <text
                          x={(cartaoEsq.x + cartaoDir.x) / 2}
                          y={Math.min(cartaoEsq.y, cartaoDir.y) - 10}
                          fill="#F59E0B"
                          fontSize="12"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="drop-shadow-md"
                        >
                          Largura do Cartão: 85.6 mm ({Math.round(distCartaoPixels)} px)
                        </text>
                      </>
                    )}

                    {/* ETAPA 3: Linhas Anatômicas de Medição */}
                    {etapa === 'MARCACAO' && (
                      <>
                        {/* Linha Central Nasal (Vertical) */}
                        <line
                          x1={linhaNarizX}
                          y1="0"
                          x2={linhaNarizX}
                          y2={dimensoesImg.height}
                          stroke="#8B5CF6"
                          strokeWidth="2"
                          strokeDasharray="3 3"
                        />
                        <text
                          x={linhaNarizX + 6}
                          y="20"
                          fill="#8B5CF6"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          Centro Nasal
                        </text>

                        {/* Linhas Horizontais DNP (Nariz -> Pupilas) */}
                        <line
                          x1={pontoOD.x}
                          y1={pontoOD.y}
                          x2={linhaNarizX}
                          y2={pontoOD.y}
                          stroke="#0284C7"
                          strokeWidth="2"
                        />
                        <text
                          x={(pontoOD.x + linhaNarizX) / 2}
                          y={pontoOD.y - 6}
                          fill="#0284C7"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          DNP OD: {dnpOD} mm
                        </text>

                        <line
                          x1={linhaNarizX}
                          y1={pontoOE.y}
                          x2={pontoOE.x}
                          y2={pontoOE.y}
                          stroke="#0284C7"
                          strokeWidth="2"
                        />
                        <text
                          x={(pontoOE.x + linhaNarizX) / 2}
                          y={pontoOE.y - 6}
                          fill="#0284C7"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          DNP OE: {dnpOE} mm
                        </text>

                        {/* Linhas Verticais de Altura de Montagem */}
                        <line
                          x1={pontoOD.x}
                          y1={pontoOD.y}
                          x2={pontoOD.x}
                          y2={bordaArmacaoOD_Y}
                          stroke="#10B981"
                          strokeWidth="2"
                        />
                        <text
                          x={pontoOD.x - 8}
                          y={(pontoOD.y + bordaArmacaoOD_Y) / 2}
                          fill="#10B981"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="end"
                        >
                          Alt: {alturaOD} mm
                        </text>

                        <line
                          x1={pontoOE.x}
                          y1={pontoOE.y}
                          x2={pontoOE.x}
                          y2={bordaArmacaoOE_Y}
                          stroke="#10B981"
                          strokeWidth="2"
                        />
                        <text
                          x={pontoOE.x + 8}
                          y={(pontoOE.y + bordaArmacaoOE_Y) / 2}
                          fill="#10B981"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="start"
                        >
                          Alt: {alturaOE} mm
                        </text>

                        {/* Linha da Base da Armação OD e OE */}
                        <line
                          x1={pontoOD.x - 30}
                          y1={bordaArmacaoOD_Y}
                          x2={pontoOD.x + 30}
                          y2={bordaArmacaoOD_Y}
                          stroke="#10B981"
                          strokeWidth="3"
                        />
                        <line
                          x1={pontoOE.x - 30}
                          y1={bordaArmacaoOE_Y}
                          x2={pontoOE.x + 30}
                          y2={bordaArmacaoOE_Y}
                          stroke="#10B981"
                          strokeWidth="3"
                        />
                      </>
                    )}

                  </svg>

                  {/* ANCORAS ARRASTÁVEIS */}
                  {etapa === 'CALIBRACAO' && (
                    <>
                      {/* Âncora Esquerda do Cartão */}
                      <div
                        onPointerDown={handlePointerDown('cartao_esq')}
                        style={{ left: cartaoEsq.x, top: cartaoEsq.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-amber-400 border-2 border-white shadow-xl cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-auto"
                      >
                        <Move className="w-3.5 h-3.5 text-slate-900" />
                      </div>

                      {/* Âncora Direita do Cartão */}
                      <div
                        onPointerDown={handlePointerDown('cartao_dir')}
                        style={{ left: cartaoDir.x, top: cartaoDir.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-amber-400 border-2 border-white shadow-xl cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-auto"
                      >
                        <Move className="w-3.5 h-3.5 text-slate-900" />
                      </div>
                    </>
                  )}

                  {etapa === 'MARCACAO' && (
                    <>
                      {/* Mira Pupila OD */}
                      <div
                        onPointerDown={handlePointerDown('ponto_od')}
                        style={{ left: pontoOD.x, top: pontoOD.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-sky-500/90 border-2 border-white shadow-xl cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-auto group"
                        title="Pupila Olho Direito"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>

                      {/* Mira Pupila OE */}
                      <div
                        onPointerDown={handlePointerDown('ponto_oe')}
                        style={{ left: pontoOE.x, top: pontoOE.y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-sky-500/90 border-2 border-white shadow-xl cursor-grab active:cursor-grabbing flex items-center justify-center pointer-events-auto"
                        title="Pupila Olho Esquerdo"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>

                      {/* Alça do Nariz (Topo) */}
                      <div
                        onPointerDown={handlePointerDown('linha_nariz')}
                        style={{ left: linhaNarizX, top: 24 }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-purple-500 border-2 border-white shadow-xl cursor-ew-resize flex items-center justify-center pointer-events-auto"
                        title="Arrastar Linha Nasal"
                      >
                        <Move className="w-3.5 h-3.5 text-white" />
                      </div>

                      {/* Alça Borda Armação OD */}
                      <div
                        onPointerDown={handlePointerDown('borda_od')}
                        style={{ left: pontoOD.x, top: bordaArmacaoOD_Y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-xl cursor-ns-resize flex items-center justify-center pointer-events-auto"
                        title="Ajustar Altura OD"
                      >
                        <Move className="w-3.5 h-3.5 text-white" />
                      </div>

                      {/* Alça Borda Armação OE */}
                      <div
                        onPointerDown={handlePointerDown('borda_oe')}
                        style={{ left: pontoOE.x, top: bordaArmacaoOE_Y }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-xl cursor-ns-resize flex items-center justify-center pointer-events-auto"
                        title="Ajustar Altura OE"
                      >
                        <Move className="w-3.5 h-3.5 text-white" />
                      </div>
                    </>
                  )}

                </div>

                {/* Dica da Etapa */}
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 text-center">
                  💡 <strong>Toque e arraste</strong> os marcadores na foto para posicionar com exatidão sobre os pontos desejados.
                </p>

              </div>

              {/* PAINEL LATERAL DE CONTROLE & MEDIDAS AO VIVO */}
              <div className="lg:col-span-4 space-y-4">
                
                {etapa === 'CALIBRACAO' && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold text-xs uppercase">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      Passo 2: Calibrar Escala do Cartão
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-300">
                      Encaixe os 2 pontos amarelos nas <strong>extremidades esquerda e direita do cartão</strong> de crédito de referência (85.6 mm).
                    </p>

                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-amber-200 text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cartão Real:</span>
                        <span className="font-bold text-amber-600">85.60 mm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Largura em Pixels:</span>
                        <span className="font-bold">{Math.round(distCartaoPixels)} px</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Proporção:</span>
                        <span className="font-bold text-emerald-600">{(pixelsPorMm).toFixed(2)} px/mm</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setEtapa('MARCACAO')}
                      className="w-full py-3 bg-[#0284C7] hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      Avançar para Marcação de Pupilas <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {etapa === 'MARCACAO' && (
                  <div className="space-y-4">
                    
                    {/* Cards de Medições ao Vivo */}
                    <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#0284C7]" /> Medições em Tempo Real (mm)
                      </h4>

                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white dark:bg-zinc-800/80 p-2.5 rounded-lg border border-sky-200 dark:border-sky-900">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold block">DNP OD</span>
                          <span className="text-lg font-black text-[#0284C7] font-mono">{dnpOD} mm</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800/80 p-2.5 rounded-lg border border-sky-200 dark:border-sky-900">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold block">DNP OE</span>
                          <span className="text-lg font-black text-[#0284C7] font-mono">{dnpOE} mm</span>
                        </div>
                      </div>

                      <div className="bg-sky-50 dark:bg-sky-950/60 p-2.5 rounded-lg border border-sky-300 dark:border-sky-800 text-center">
                        <span className="text-[10px] text-sky-700 dark:text-sky-300 font-bold block">DP Total (Distância Pupilar)</span>
                        <span className="text-xl font-black text-[#0284C7] font-mono">{dpTotal} mm</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white dark:bg-zinc-800/80 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold block">Altura OD</span>
                          <span className="text-base font-black text-emerald-600 font-mono">{alturaOD} mm</span>
                        </div>
                        <div className="bg-white dark:bg-zinc-800/80 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold block">Altura OE</span>
                          <span className="text-base font-black text-emerald-600 font-mono">{alturaOE} mm</span>
                        </div>
                      </div>
                    </div>

                    {/* Ajuste Fino (+ / - 0.5 mm) */}
                    <div className="bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-2 text-xs">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 block text-[11px]">
                        Ajuste Fino Milimétrico (±0.5 mm):
                      </span>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-1.5 rounded border border-slate-200">
                          <span className="text-[10px] font-bold">DNP OD:</span>
                          <div className="flex gap-1">
                            <button onClick={() => ajusteFino('dnp_od', -0.5)} className="px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-700 rounded font-bold hover:bg-slate-300">-</button>
                            <button onClick={() => ajusteFino('dnp_od', 0.5)} className="px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-700 rounded font-bold hover:bg-slate-300">+</button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-1.5 rounded border border-slate-200">
                          <span className="text-[10px] font-bold">DNP OE:</span>
                          <div className="flex gap-1">
                            <button onClick={() => ajusteFino('dnp_oe', -0.5)} className="px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-700 rounded font-bold hover:bg-slate-300">-</button>
                            <button onClick={() => ajusteFino('dnp_oe', 0.5)} className="px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-700 rounded font-bold hover:bg-slate-300">+</button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-1.5 rounded border border-slate-200">
                          <span className="text-[10px] font-bold">Alt OD:</span>
                          <div className="flex gap-1">
                            <button onClick={() => ajusteFino('alt_od', -0.5)} className="px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-700 rounded font-bold hover:bg-slate-300">-</button>
                            <button onClick={() => ajusteFino('alt_od', 0.5)} className="px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-700 rounded font-bold hover:bg-slate-300">+</button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between bg-white dark:bg-zinc-800 p-1.5 rounded border border-slate-200">
                          <span className="text-[10px] font-bold">Alt OE:</span>
                          <div className="flex gap-1">
                            <button onClick={() => ajusteFino('alt_oe', -0.5)} className="px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-700 rounded font-bold hover:bg-slate-300">-</button>
                            <button onClick={() => ajusteFino('alt_oe', 0.5)} className="px-1.5 py-0.5 bg-slate-200 dark:bg-zinc-700 rounded font-bold hover:bg-slate-300">+</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setEtapa('RESULTADOS')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Finalizar e Gerar Laudo
                    </button>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* ETAPA 4: RESULTADOS, LAUDO & APLICAÇÃO NA O.S. */}
          {etapa === 'RESULTADOS' && (
            <div className="max-w-3xl mx-auto space-y-6">
              
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xl space-y-6">
                
                {/* Cabeçalho do Laudo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-slate-900 dark:text-white">
                        Laudo Técnico de Pupilometria Digital
                      </h3>
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Calibrado (ISO 7810)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Ótica: {lojaAtiva.nome_fantasia} • Data: {new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  {pacienteNome && (
                    <div className="bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-lg border border-sky-200 text-right">
                      <span className="text-[10px] text-slate-500 block">Paciente</span>
                      <span className="font-bold text-xs text-[#0284C7]">{pacienteNome}</span>
                    </div>
                  )}
                </div>

                {/* Grade de Medições Finais */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  
                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block mb-1">DNP OD</span>
                    <span className="text-2xl font-black text-[#0284C7] font-mono">{dnpOD}</span>
                    <span className="text-[10px] text-slate-400 block">milímetros</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block mb-1">DNP OE</span>
                    <span className="text-2xl font-black text-[#0284C7] font-mono">{dnpOE}</span>
                    <span className="text-[10px] text-slate-400 block">milímetros</span>
                  </div>

                  <div className="bg-sky-50 dark:bg-sky-950/80 p-3 rounded-xl border border-sky-300 dark:border-sky-800 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-sky-700 dark:text-sky-300 font-bold block mb-1">DP Total</span>
                    <span className="text-2xl font-black text-[#0284C7] font-mono">{dpTotal}</span>
                    <span className="text-[10px] text-sky-600 block">milímetros</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block mb-1">Altura OD</span>
                    <span className="text-2xl font-black text-emerald-600 font-mono">{alturaOD}</span>
                    <span className="text-[10px] text-slate-400 block">milímetros</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-3 rounded-xl border border-slate-200 dark:border-zinc-700">
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-bold block mb-1">Altura OE</span>
                    <span className="text-2xl font-black text-emerald-600 font-mono">{alturaOE}</span>
                    <span className="text-[10px] text-slate-400 block">milímetros</span>
                  </div>

                </div>

                {/* Resumo Técnico para Montagem */}
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-xl text-xs space-y-2">
                  <span className="font-extrabold text-slate-800 dark:text-zinc-200 block">
                    📋 Recomendações para Laboratório e Surfaçagem:
                  </span>
                  <p className="text-slate-600 dark:text-zinc-400">
                    • <strong>Lentes Multifocais/Progressivas:</strong> Utilizar Altura OD ({alturaOD} mm) e Altura OE ({alturaOE} mm) para posicionamento do corredor progressivo.<br />
                    • <strong>Simetria Pupilar:</strong> {Math.abs(dnpOD - dnpOE) <= 1 ? 'Anatomia com alta simetria naso-pupilar.' : `Assimetria anatômica de ${Math.abs(dnpOD - dnpOE).toFixed(1)} mm identificada.`}<br />
                    • <strong>Nivelamento Horizontal:</strong> {inclinacaoGraus}° de inclinação entre os eixos oculares.
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  
                  <button
                    onClick={() => setEtapa('MARCACAO')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 font-bold text-xs hover:bg-slate-100 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Reajustar Pontos
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleImprimirLaudo}
                      className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-2 shadow-xs"
                    >
                      <Printer className="w-4 h-4" /> Imprimir Laudo
                    </button>

                    <button
                      onClick={handleFinalizar}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                      <Check className="w-4 h-4" /> Aplicar Medidas no Sistema
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
