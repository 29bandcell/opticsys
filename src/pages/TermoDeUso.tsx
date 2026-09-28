import React from 'react';
import { 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  Building, 
  MapPin, 
  Scale, 
  Clock, 
  Lock, 
  AlertCircle,
  Glasses,
  Printer
} from 'lucide-react';

interface TermoDeUsoProps {
  onBack: () => void;
  onAccept?: () => void;
}

export const TermoDeUso: React.FC<TermoDeUsoProps> = ({ onBack, onAccept }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Topo / Header com navegação */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0099FF] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#0099FF] text-white flex items-center justify-center font-bold">
                <Glasses className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-sm text-slate-900">
                Optic<span className="text-[#0099FF]">Sys</span> <span className="font-mono text-xs font-normal text-slate-500">Legal</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 border border-slate-200 px-3 py-1.5 rounded bg-white hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir Termo
            </button>
            {onAccept && (
              <button
                onClick={onAccept}
                className="bg-[#0099FF] hover:bg-[#0088EE] text-white text-xs font-bold px-4 py-1.5 rounded shadow-sm transition-all"
              >
                Li e Concordo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal do Termo */}
      <main className="max-w-4xl mx-auto py-10 px-6">
        
        {/* Card de Apresentação */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 sm:p-10 space-y-8 text-xs leading-relaxed text-slate-700">
          
          {/* Cabeçalho do Documento */}
          <div className="border-b border-slate-200 pb-6 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 text-[#0099FF] text-[11px] font-bold">
              <FileText className="w-3.5 h-3.5" /> Instrumento Jurídico de Licenciamento SaaS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Termos de Uso e Condições Gerais
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Última atualização: Setembro de 2026 • Versão 2.4 (Válido para todo o território nacional)
            </p>
          </div>

          {/* Dados da Empresa / Licenciante */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sistema Licenciado</span>
              <p className="font-bold text-slate-800">OpticSys Cloud SaaS</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Empresa Licenciante</span>
              <p className="font-bold text-slate-800">WIPELISCREATIVESOLUTION (WIPELIS)</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contato Oficial / Suporte</span>
              <p className="font-bold text-emerald-600 font-mono text-[11px]">(88) 98882-2847</p>
              <p className="text-[10px] text-slate-600 font-mono">opticcsys@gmail.com</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Comarca / Foro Eleito</span>
              <p className="font-bold text-[#0099FF]">Comarca de Morada Nova – CE</p>
            </div>
          </div>

          {/* Cláusulas Numéricas */}
          <div className="space-y-6">
            
            {/* 1. Objeto */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">1</span>
                Objeto do Contrato
              </h2>
              <p>
                O <strong>OpticSys</strong> é um software disponibilizado no modelo SaaS (<em>Software as a Service</em>) especialmente desenvolvido para a gestão integrada de óticas e laboratórios ópticos, englobando módulos de cadastro de clientes, receitas médicas (OD/OE), controle de estoque, ordens de serviço (O.S.), pupilômetro digital, frente de caixa (PDV), emissão fiscal e relatórios gerenciais/DRE.
              </p>
              <p>
                A contratação confere ao Cliente exclusivamente uma <strong>licença de uso temporária, não exclusiva, onerosa e intransferível</strong> do sistema, não implicando na cessão de código-fonte, transferência de propriedade intelectual ou venda definitiva do software.
              </p>
            </section>

            {/* 2. Aceite */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">2</span>
                Aceite Eletrônico
              </h2>
              <p>
                Ao clicar em <em>“Li e Aceito os Termos de Uso”</em> no ato do cadastro ou utilizar o sistema durante o período de testes, o Cliente declara expressa ciência e total concordância com todas as cláusulas aqui estipuladas. Este aceite possui plena eficácia e validade jurídica, sendo registrado eletronicamente mediante log contendo data, horário UTC, endereço IP e credenciais do usuário responsável.
              </p>
            </section>

            {/* 3. Planos e Pagamento */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">3</span>
                Planos, Pagamentos e Reajustes
              </h2>
              <p>
                A assinatura é regida sob a modalidade <strong>pré-paga</strong>, com cobrança recorrente conforme a periodicidade contratada (mensal ou anual), processada via boleto bancário, PIX ou cartão de crédito.
              </p>
              <p>
                Mesmo em períodos de eventual não utilização do software pelo Cliente, as mensalidades do ciclo contratado permanecem devidas, uma vez que a <strong>OpticSys</strong> mantém continuamente a infraestrutura em nuvem, a segurança e a guarda dos dados cadastrados em seus servidores.
              </p>
              <p>
                Os planos e valores vigentes são os descritos na tabela pública da plataforma, podendo ser reajustados anualmente pelo IPCA/IGP-M ou mediante comunicação prévia mínima de 30 (trinta) dias.
              </p>
            </section>

            {/* 4. Acesso e Suspensão */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">4</span>
                Tolerância, Inadimplência e Suspensão de Acesso
              </h2>
              <p>
                O Cliente disporá de uma tolerância de <strong>2 (dois) dias corridos</strong> após o vencimento da fatura para regularização do pagamento sem bloqueio de suas operações. Transcorrido esse prazo sem quitação, o acesso aos módulos operacionais do OpticSys será temporariamente suspenso até a efetiva compensação financeira.
              </p>
              <p>
                O sistema continuará gerando cobranças automáticas por até 6 (seis) meses em decorrência da manutenção do banco de dados do Cliente. Findo esse prazo sem manifestação ou quitação, a OpticSys reserva-se o direito de rescindir definitivamente a prestação de serviços e proceder à exclusão definitiva dos dados armazenados sem prévio aviso.
              </p>
            </section>

            {/* 5. Cancelamento e Teste Gratuito */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">5</span>
                Cancelamento, Ausência de Multa e Período de Teste
              </h2>
              <p>
                O Cliente poderá solicitar o cancelamento da sua assinatura a qualquer momento, sem exigência de fidelidade mínima ou incidência de multas rescisórias, mediante solicitação formal via canal de suporte (e-mail ou WhatsApp oficial).
              </p>
              <p>
                Não haverá reembolso de mensalidades ou anuidades proporcionais já faturadas. Novos clientes contam com <strong>7 (sete) dias corridos de teste gratuito</strong> com todas as funcionalidades liberadas antes do primeiro faturamento.
              </p>
            </section>

            {/* 6. Suporte Técnico */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">6</span>
                Atendimento e Suporte Técnico
              </h2>
              <p>
                O suporte técnico é prestado em dias úteis, de <strong>segunda a sexta-feira, das 09h00 às 18h00</strong> (horário de Brasília), através dos canais eletrônicos oficiais (WhatsApp de suporte e e-mail). O tempo estimado para primeira resposta é de 30 a 60 minutos em horário comercial.
              </p>
              <p>
                Customizações sob medida, migrações complexas de bancos legados de terceiros ou treinamentos presenciais extensivos poderão ser orçados separadamente.
              </p>
            </section>

            {/* 7. Restrições de Uso */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">7</span>
                Restrições e Uso Indevido
              </h2>
              <p>
                É estritamente vedado ao Cliente, sob pena de rescisão imediata e responsabilização civil/penal:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Sublicenciar, revender, alugar ou ceder seus acessos a terceiros não autorizados;</li>
                <li>Realizar ou permitir engenharia reversa, descompilação ou cópia de qualquer trecho de código da plataforma;</li>
                <li>Utilizar rotinas automatizadas não autorizadas, bots abusivos ou tentativas de sobrecarga dos servidores;</li>
                <li>Utilizar os recursos de comunicação (como disparos de WhatsApp) para prática de spam ou difusão de conteúdo ilícito.</li>
              </ul>
            </section>

            {/* 8. Propriedade Intelectual */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">8</span>
                Propriedade Intelectual e Uso de Marca
              </h2>
              <p>
                Todos os direitos autorais, marcas, patentes, código-fonte e segredos comerciais relativos ao software pertencem com exclusividade à <strong>OpticSys Soluções em Tecnologia LTDA</strong>.
              </p>
              <p>
                O Cliente autoriza a inclusão de seu nome e logotipo institucional no rol de clientes e materiais de portfólio da OpticSys, salvo solicitação contrária manifestada por escrito.
              </p>
            </section>

            {/* 9. Confidencialidade */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">9</span>
                Confidencialidade e Sigilo
              </h2>
              <p>
                As partes obrigam-se a manter em sigilo todas as informações comerciais, estratégicas e dados cadastrais aos quais tenham acesso em razão da execução deste contrato, não podendo divulgá-las sem prévio consentimento, exceto mediante ordem de autoridade judicial competente.
              </p>
            </section>

            {/* 10. Proteção de Dados (LGPD) */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">10</span>
                Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)
              </h2>
              <p>
                O Cliente é o <strong>Controlador</strong> dos dados pessoais (pacientes, clientes e funcionários) que insere na plataforma, sendo o único responsável pela coleta legal de consentimento. A <strong>OpticSys</strong> figura como <strong>Operadora</strong>, aplicando medidas técnicas e administrativas compatíveis com o estado da arte para salvaguardar a integridade, confidencialidade e isolamento dos dados (via Row Level Security no PostgreSQL).
              </p>
            </section>

            {/* 11. Disponibilidade e Limitação de Responsabilidade */}
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-sky-100 text-[#0099FF] flex items-center justify-center text-xs font-mono font-bold">11</span>
                Disponibilidade do Serviço e Limitação de Responsabilidade
              </h2>
              <p>
                A OpticSys empenha seus melhores esforços para assegurar disponibilidade ininterrupta do serviço (SLA alvo de 99,5%). Todavia, paradas programadas para manutenção corretiva, falhas de conectividade da internet do Cliente ou indisponibilidades de operadoras terceiras (como Meta/WhatsApp ou SEFAZ) caracterizam força maior e não ensejam dever de indenização.
              </p>
              <p>
                Em nenhuma hipótese a OpticSys responderá por lucros cessantes, prejuízos indiretos ou perdas de negócios decorrentes de falhas de digitação do operador ou indisponibilidades fortuitas.
              </p>
            </section>

            {/* 12. Foro de Eleição */}
            <section className="bg-sky-50/70 border border-sky-200 rounded-lg p-4 space-y-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#0099FF]" />
                12. Foro de Eleição
              </h2>
              <p className="font-medium text-slate-800">
                Para dirimir quaisquer controvérsias, dúvidas ou litígios decorrentes do presente Termo de Uso, fica expressamente eleito o foro da <strong>Comarca de Morada Nova – Estado do Ceará</strong>, com expressa e mútua renúncia a qualquer outro foro, por mais privilegiado que seja ou venha a ser.
              </p>
            </section>

          </div>

          {/* Rodapé Interno do Documento */}
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <span>© 2026 OpticSys Cloud ERP • Todos os direitos reservados.</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" /> Em conformidade com LGPD
              </span>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
};
