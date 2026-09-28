import React, { useState } from 'react';
import { 
  Glasses, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Play, 
  Phone, 
  Mail, 
  Building, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Monitor,
  Eye,
  ShoppingCart,
  Receipt,
  Layers,
  MessageCircle,
  Clock,
  Laptop
} from 'lucide-react';
import { TenantPlan } from '../types';

interface LandingPageProps {
  onStartTrial: (plano: TenantPlan) => void;
  onEnterApp: () => void;
  onOpenTermos: () => void;
  onOpenMaster?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartTrial,
  onEnterApp,
  onOpenTermos,
  onOpenMaster
}) => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  // Form de Apresentação
  const [leadForm, setLeadForm] = useState({
    nome: '',
    telefone: '',
    email: ''
  });
  const [showVideoModal, setShowVideoModal] = useState(false);

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowVideoModal(true);
  };

  const faqItems = [
    {
      q: 'Sou obrigado a ficar por algum período?',
      a: 'Não exigimos nenhum período contratual. Você pode cancelar sua assinatura a qualquer momento sem nenhuma multa.'
    },
    {
      q: 'Possui taxa de adesão? Como faço pra iniciar?',
      a: 'Não cobramos nenhuma taxa de adesão ou implantação. Basta clicar no botão de Teste Grátis e iniciar seus 7 dias imediatamente.'
    },
    {
      q: 'Meus dados estarão seguros?',
      a: 'Sim! Utilizamos infraestrutura em nuvem de alta segurança com banco de dados PostgreSQL/Supabase, criptografia de ponta e backups automáticos diários.'
    },
    {
      q: 'Quais as formas de pagamento?',
      a: 'Aceitamos PIX (com liberação instantânea e automática) e Cartão de Crédito com renovação simples.'
    },
    {
      q: 'Vou ter suporte no meu período de teste?',
      a: 'Com certeza! Durante todos os 7 dias de teste você tem acesso ao nosso suporte via WhatsApp e pelo assistente integrado para configurar sua ótica.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#0099FF] selection:text-white">
      
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-6 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo OpticSys */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={onEnterApp}>
            <div className="w-8 h-8 rounded-lg bg-[#0099FF] text-white flex items-center justify-center font-bold shadow-xs">
              <Glasses className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-[#0099FF]">
              Optic<span className="text-[#0B3B60]">Sys</span>
            </span>
          </div>

          {/* Links de Navegação */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-700">
            <a href="#planos" className="hover:text-[#0099FF] transition-colors">Planos e Preços</a>
            <a href="#apresentacao" className="hover:text-[#0099FF] transition-colors">Apresentação</a>
            <button
              onClick={onOpenTermos}
              className="hover:text-[#0099FF] transition-colors font-medium text-slate-700"
            >
              Termo de Uso
            </button>
            <button 
              onClick={onEnterApp}
              className="hover:text-[#0099FF] transition-colors font-bold text-slate-800"
            >
              Entrar
            </button>
          </nav>

          {/* CTA Teste Grátis */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onStartTrial('pro')}
              className="bg-[#0099FF] hover:bg-[#0088EE] text-white font-bold text-xs px-5 py-2 rounded-sm shadow-sm transition-all active:scale-95"
            >
              Teste Grátis
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION COM ONDA AZUL */}
      <section className="relative bg-gradient-to-r from-[#0088EA] via-[#0099FF] to-[#00A8FF] text-white py-14 px-6 overflow-hidden">
        
        {/* Padrões sutis de fundo */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Coluna Texto & CTAs */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight text-white drop-shadow-xs">
              Sistema de Gestão Exclusivo Para Sua{' '}
              <span className="inline-block relative">
                <span className="border-2 border-[#10B981] rounded-full px-3 py-0.5 text-white">
                  Ótica
                </span>
              </span>
            </h1>

            <p className="text-sm sm:text-base text-white/95 font-medium leading-relaxed max-w-lg">
              A OpticSys é o sistema de gestão exclusivo que descomplica a sua Ótica!
            </p>

            {/* Botões do Hero */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onStartTrial('pro')}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-black text-xs uppercase tracking-wide px-6 py-3 rounded-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                Teste Grátis
              </button>

              <a
                href="#apresentacao"
                className="bg-[#0B3B60] hover:bg-[#082b47] text-white font-bold text-xs px-6 py-3 rounded-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                Assistir Apresentação
              </a>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-white/85 font-semibold pt-1">
              <span className="flex items-center gap-1">✓ 7 Dias de Teste</span>
              <span className="flex items-center gap-1">✓ Sem Cartão</span>
              <span className="flex items-center gap-1">✓ Acesso Imediato</span>
            </div>

          </div>

          {/* Coluna Mockup do Laptop */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-lg relative">
              
              {/* Moldura do Laptop com Interface do ERP */}
              <div className="bg-slate-800 rounded-t-xl p-2.5 shadow-2xl border-2 border-slate-700 relative">
                {/* Câmera do laptop */}
                <div className="w-2 h-2 rounded-full bg-slate-900 mx-auto mb-1.5 border border-slate-700" />
                
                {/* Tela do ERP */}
                <div className="bg-[#0F172A] rounded-md overflow-hidden border border-slate-700 text-left p-3 text-xs text-white">
                  {/* Topo do ERP interno */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-sky-400 ml-2">OpticSys Cloud</span>
                    </div>
                    <span className="text-[10px] bg-[#0099FF]/20 text-[#0099FF] px-2 py-0.5 rounded font-mono font-bold">
                      Teste: 7 Dias
                    </span>
                  </div>

                  {/* Cards do Mockup */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-[#1E293B] p-2.5 rounded border border-slate-700">
                      <span className="text-[10px] text-slate-400 font-semibold block">Vendas Hoje</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">R$ 4.890,00</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">8 Óculos Completos</span>
                    </div>
                    <div className="bg-[#1E293B] p-2.5 rounded border border-slate-700">
                      <span className="text-[10px] text-slate-400 font-semibold block">O.S. em Montagem</span>
                      <span className="text-base font-extrabold text-[#0099FF] font-mono">14 Pedidos</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Zeiss & Essilor Lab</span>
                    </div>
                  </div>

                  {/* Gráfico Estilizado / Grade */}
                  <div className="bg-[#1E293B] p-2.5 rounded border border-slate-700">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-slate-300">Receitas Oftálmicas & Retornos</span>
                      <span className="text-[9px] text-amber-400 font-mono">24 Pacientes</span>
                    </div>
                    <div className="h-12 bg-[#0F172A] rounded flex items-end gap-1 px-2 py-1">
                      <div className="w-1/6 bg-[#0099FF] h-[40%] rounded-xs" />
                      <div className="w-1/6 bg-[#0099FF] h-[65%] rounded-xs" />
                      <div className="w-1/6 bg-[#0099FF] h-[50%] rounded-xs" />
                      <div className="w-1/6 bg-[#0099FF] h-[85%] rounded-xs" />
                      <div className="w-1/6 bg-emerald-500 h-[100%] rounded-xs" />
                      <div className="w-1/6 bg-[#0099FF] h-[75%] rounded-xs" />
                    </div>
                  </div>

                </div>
              </div>

              {/* Base do Laptop */}
              <div className="bg-slate-700 h-3 rounded-b-lg shadow-xl mx-4 relative flex justify-center">
                <div className="w-16 h-1 bg-slate-500 rounded-full mt-1" />
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* 3. SEÇÃO PILARES & ABAS DE RECURSOS */}
      <section className="py-14 px-6 max-w-6xl mx-auto text-center space-y-8">
        
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0B3B60]">
            Somos um software criado para ajudar à sua ótica <span className="font-extrabold text-[#0099FF]">crescer</span> ainda mais!
          </h2>
        </div>

        {/* Abas 1 a 5 */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-6 border-b border-slate-200 pb-3 text-xs sm:text-sm font-bold">
          {[
            { id: 1, label: '1 Controle Total' },
            { id: 2, label: '2 Pupilômetro Digital' },
            { id: 3, label: '3 Frente de Caixa' },
            { id: 4, label: '4 Nota Fiscal' },
            { id: 5, label: '5 Outros Recursos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-2 transition-colors relative font-bold ${
                activeTab === tab.id 
                  ? 'text-[#0099FF] border-b-2 border-[#0099FF]' 
                  : 'text-slate-600 hover:text-[#0099FF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da Aba Selecionada */}
        <div className="bg-slate-50 rounded-lg p-6 sm:p-8 text-left border border-slate-200 max-w-4xl mx-auto shadow-xs">
          
          {activeTab === 1 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#0B3B60]">
                Saiba de qualquer lugar, tudo que acontece na sua loja!
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Cadastre clientes, produtos, estoque, tenha tudo em mãos a qualquer hora.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Cadastre quantos usuários que quiser, defina as permissões para cada usuário.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Imprima O.S e Vendas com layout totalmente atualizado.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Faça o pós venda para seu cliente. Emitido um relatório de pós venda após 7 dias da data da venda.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#0B3B60]">
                Pupilômetro Digital Integrado: Medição Óptica de Alta Precisão
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Medição digital milimétrica de DNP (Distância Naso-Pupilar) e Altura de Montagem.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Elimine retrabalhos e queixas de adaptação em lentes multifocais e surfaçadas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Foto e medições salvas automaticamente na ficha do cliente e enviadas na O.S. de montagem.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#0B3B60]">
                Frente de Caixa (PDV) Rápido e Seguro
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Atendimento ágil no balcão com leitor de código de barras ou busca instantânea.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Fechamento de caixa cego, controle de sangrias, suprimentos e comissões dos vendedores.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Múltiplos meios de pagamento: PIX com QR Code dinâmico, cartões, carnês e convênios.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 4 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#0B3B60]">
                Emissão de Notas Fiscais e Importação de XML
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Emissão simplificada de NFC-e (Consumidor) e NF-e (Produtos) em conformidade fiscal.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Importação de XML de notas de entrada: cadastre lotes inteiros de armações e lentes em 1 clique.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span>Envio automático de XML e DANFE para contabilidade e e-mail do cliente.</span>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 5 && (
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#0B3B60]">
                Outros Recursos Exclusivos OpticSys
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span><strong>OpticZap:</strong> Avisos automáticos via WhatsApp de "Óculos Pronto para Retirada" e "Aniversário".</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span><strong>Gestão de Laboratórios:</strong> Controle de surfaçagem, montagem, prazos e fornecedores terceiros.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0099FF] font-bold">•</span>
                  <span><strong>DRE & Relatórios:</strong> Demonstração de Resultado do Exercício e lucratividade líquida real da loja.</span>
                </li>
              </ul>
            </div>
          )}

        </div>

      </section>

      {/* 4. PLANOS E PREÇOS */}
      <section id="planos" className="scroll-mt-16">
        
        {/* Faixa Azul de Destaque */}
        <div className="bg-[#0099FF] text-white py-4 text-center">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
            Planos e Preços
          </h2>
        </div>

        <div className="py-12 px-6 max-w-5xl mx-auto text-center space-y-4">
          
          <h3 className="text-xl sm:text-2xl font-bold text-[#0099FF]">
            Teste grátis sem precisar cadastrar cartão
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Acesso imediato ao sistema
          </p>

          {/* Grid de Cards de Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto pt-6 text-left">
            
            {/* CARD 1: PLANO PRO */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden flex flex-col justify-between relative hover:shadow-lg transition-all">
              
              {/* Badge POPULAR no canto superior direito */}
              <div className="absolute top-0 right-0 bg-[#0099FF] text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-lg shadow-xs">
                Popular
              </div>

              <div>
                {/* Cabeçalho do Card */}
                <div className="bg-sky-50/70 p-5 text-center border-b border-slate-200">
                  <h4 className="text-lg font-bold text-slate-900">Plano Pro</h4>
                  <div className="mt-2 font-black text-3xl font-mono text-slate-900">
                    <span className="text-sm font-sans font-bold">R$</span> 99<span className="text-lg">,90</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Mensal</span>
                </div>

                {/* Itens do Plano Pro */}
                <ul className="p-6 space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Clientes e Receitas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Produtos e Estoque</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Vendas e Caixas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Ordem de Serviços</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Pupilômetro Digital</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Emissão de Relatórios</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Pós Vendas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Suporte WhatsApp</span>
                  </li>
                </ul>
              </div>

              {/* Botão de Ação */}
              <div className="p-6 pt-0 text-center space-y-1.5">
                <button
                  onClick={() => onStartTrial('pro')}
                  className="w-full bg-[#0099FF] hover:bg-[#0088EE] text-white font-bold text-xs py-2.5 rounded-sm shadow-sm transition-all active:scale-95"
                >
                  Testar esse Plano
                </button>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Teste Grátis por 7 dias
                </span>
              </div>

            </div>

            {/* CARD 2: PRO + NOTA FISCAL */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all">
              
              <div>
                {/* Cabeçalho do Card */}
                <div className="bg-slate-100/80 p-5 text-center border-b border-slate-200">
                  <h4 className="text-lg font-bold text-slate-900">Pro + Nota Fiscal</h4>
                  <div className="mt-2 font-black text-3xl font-mono text-slate-900">
                    <span className="text-sm font-sans font-bold">R$</span> 149<span className="text-lg">,90</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Mensal</span>
                </div>

                {/* Itens do Plano Pro + Nota Fiscal */}
                <ul className="p-6 space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2.5 font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Tudo do Plano Pro +</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Notas Fiscais de Consumidor (NFC-e)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Notas Fiscais Eletrônicas (NF-e)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0099FF] shrink-0" />
                    <span>Importação Produto XML</span>
                  </li>
                </ul>
              </div>

              {/* Botão de Ação */}
              <div className="p-6 pt-0 text-center space-y-1.5">
                <button
                  onClick={() => onStartTrial('enterprise')}
                  className="w-full bg-[#0099FF] hover:bg-[#0088EE] text-white font-bold text-xs py-2.5 rounded-sm shadow-sm transition-all active:scale-95"
                >
                  Testar esse Plano
                </button>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Teste Grátis por 7 dias
                </span>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* 5. SEÇÃO FAQ (PERGUNTAS FREQUENTES) */}
      <section className="py-14 px-6 max-w-4xl mx-auto space-y-6">
        
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold text-[#0099FF]">
            Ainda em dúvida se a OpticSys é para você?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Confira nossas perguntas mais frequentes:
          </p>
        </div>

        {/* Accordions */}
        <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200 shadow-xs">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-[#0099FF] hover:bg-slate-50 transition-colors"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 bg-slate-50/50">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botão Centralizado Testar Grátis */}
        <div className="text-center pt-2">
          <button
            onClick={() => onStartTrial('pro')}
            className="bg-[#0B3B60] hover:bg-[#082b47] text-white font-bold text-xs px-8 py-2.5 rounded-sm shadow-sm transition-all active:scale-95"
          >
            Testar Grátis
          </button>
        </div>

      </section>

      {/* 6. APRESENTAÇÃO & FORMULÁRIO DE CONTATO (FUNDO AZUL ESCURO) */}
      <section id="apresentacao" className="bg-[#0B3B60] text-white py-14 px-6 scroll-mt-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Lado Esquerdo: Texto & Contatos */}
          <div className="md:col-span-6 space-y-4 text-left">
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Veja Agora <br />
              <span className="text-[#0099FF]">Nossa Apresentação!</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-md font-normal">
              Convidamos você a assistir à nossa apresentação detalhada e descobrir como o OpticSys pode transformar a gestão da sua ótica. A inovação da sua ótica está a apenas um clique de distância!
            </p>

            <div className="space-y-2 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white font-mono">(88) 98882-2847</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0099FF]" />
                <a href="mailto:opticcsys@gmail.com" className="hover:text-white transition-colors">opticcsys@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0099FF]" />
                <span>WIPELISCREATIVESOLUTION (WIPELIS)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-sky-300">
                <button
                  type="button"
                  onClick={onOpenTermos}
                  className="underline hover:text-white transition-colors cursor-pointer"
                >
                  Termo de Uso (Comarca de Morada Nova - CE)
                </button>
              </div>
            </div>

            {/* Ícones Sociais */}
            <div className="flex items-center gap-2 pt-2">
              <a href="#" className="w-7 h-7 rounded bg-white/10 hover:bg-[#0099FF] flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-7 h-7 rounded bg-white/10 hover:bg-[#0099FF] flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

          </div>

          {/* Lado Direito: Formulário Branco */}
          <div className="md:col-span-6">
            <div className="bg-white text-slate-900 rounded-lg p-6 shadow-xl space-y-4 max-w-md mx-auto">
              
              <form onSubmit={handleLeadSubmit} className="space-y-3.5 text-xs">
                
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome:</label>
                  <input
                    type="text"
                    required
                    placeholder="João da Silva"
                    value={leadForm.nome}
                    onChange={e => setLeadForm({ ...leadForm, nome: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs outline-none focus:border-[#0099FF]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">DDD + Celular:</label>
                  <input
                    type="text"
                    required
                    placeholder="(99) 9 9999-9999"
                    value={leadForm.telefone}
                    onChange={e => setLeadForm({ ...leadForm, telefone: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs outline-none focus:border-[#0099FF]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail:</label>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@gmail.com"
                    value={leadForm.email}
                    onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs outline-none focus:border-[#0099FF]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0B3B60] hover:bg-[#082b47] text-white font-bold text-xs py-2.5 rounded-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Assistir Apresentação
                </button>

              </form>

            </div>
          </div>

        </div>
      </section>

      {/* Modal da Apresentação em Vídeo / Tour */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden text-slate-900">
            <div className="bg-[#0B3B60] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 fill-current text-[#0099FF]" />
                <span className="font-bold text-xs">Apresentação OpticSys ERP</span>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-white/80 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-[#0099FF]/20 flex items-center justify-center mb-2 border border-[#0099FF]">
                  <Play className="w-8 h-8 text-[#0099FF] fill-current ml-1" />
                </div>
                <p className="font-bold text-sm">Demonstração Interativa do OpticSys ERP</p>
                <p className="text-xs text-slate-400 mt-1">Conheça os módulos de Receitas, O.S., PDV, Pupilômetro e WhatsApp em 5 minutos.</p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    onStartTrial('pro');
                  }}
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs px-5 py-2.5 rounded shadow-sm"
                >
                  Iniciar Teste Grátis de 7 Dias
                </button>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    onEnterApp();
                  }}
                  className="bg-[#0099FF] hover:bg-[#0088EE] text-white font-bold text-xs px-5 py-2.5 rounded shadow-sm"
                >
                  Navegar no Sistema Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé Institucional */}
      <footer className="bg-slate-950 text-slate-400 py-6 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#0099FF] text-white flex items-center justify-center font-bold text-[10px]">
              <Glasses className="w-3 h-3" />
            </div>
            <span className="font-bold text-white">OpticSys Cloud ERP</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[11px]">Sistema Especializado para Gestão de Óticas</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <button
              onClick={onOpenTermos}
              className="text-slate-400 hover:text-white underline transition-colors"
            >
              Termos de Uso (Morada Nova - CE)
            </button>
            {onOpenMaster && (
              <button
                onClick={onOpenMaster}
                className="text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1 font-mono text-[10px]"
                title="Acesso exclusivo da administradora Wipelis"
              >
                🔒 Acesso Master Wipelis
              </button>
            )}
            <span>© 2026 WIPELIS. Todos os direitos reservados.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
