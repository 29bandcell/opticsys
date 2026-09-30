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
                href="#planos"
                className="bg-[#0B3B60] hover:bg-[#082b47] text-white font-bold text-xs px-6 py-3 rounded-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                Ver Planos & Preços
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

      {/* 6. ATENDIMENTO INSTITUCIONAL & CONTATO */}
      <section className="bg-[#0B3B60] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0099FF] text-white flex items-center justify-center font-bold">
              <Glasses className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">Optic<span className="text-[#0099FF]">Sys</span> Cloud ERP</span>
              <p className="text-[11px] text-slate-300">Sistema completo de gestão, vendas e automação para sua ótica.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono font-bold text-white">(88) 98882-2847</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded">
              <Mail className="w-3.5 h-3.5 text-[#0099FF]" />
              <a href="mailto:opticcsys@gmail.com" className="hover:text-white transition-colors">opticcsys@gmail.com</a>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded">
              <Building className="w-3.5 h-3.5 text-[#0099FF]" />
              <span>WIPELIS</span>
            </div>
          </div>
        </div>
      </section>

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
