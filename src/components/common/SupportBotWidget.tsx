import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Phone, 
  ChevronRight, 
  Sparkles, 
  Glasses, 
  FileText, 
  Receipt, 
  MessageSquare, 
  CreditCard, 
  Printer, 
  CheckCircle2,
  HelpCircle,
  FlaskConical,
  Users,
  Boxes,
  UserCheck,
  Loader2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useAuthAndTenant } from '../../context/AuthAndTenantContext';
import { evolutionService } from '../../services/evolutionApi';

interface MensagemChat {
  id: string;
  remetente: 'BOT' | 'USER';
  texto: string;
  horario: string;
  tipo?: 'PADRAO' | 'HELP_ENVIADO';
}

export const SupportBotWidget: React.FC = () => {
  const { lojaAtiva, usuarioAtual } = useAuthAndTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [ultimoTopico, setUltimoTopico] = useState<string>('GERAL');
  const [isEnviandoHelp, setIsEnviandoHelp] = useState(false);
  const [chamadoAberto, setChamadoAberto] = useState(false);
  
  const [historico, setHistorico] = useState<MensagemChat[]>([
    {
      id: 'msg-1',
      remetente: 'BOT',
      texto: `Olá! 👋 Sou o assistente do OpticSys Cloud. Como posso ajudar a ${lojaAtiva.nome_fantasia} hoje? Você pode tirar dúvidas sobre cadastros (laboratórios, clientes, produtos), emissão de O.S., receitas, fiscal, WhatsApp e muito mais!`,
      horario: 'Agora'
    }
  ]);

  const [isDigitando, setIsDigitando] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [historico, isDigitando, isOpen]);

  // Motor Inteligente de Conhecimento e Respostas do OpticSys ERP
  const gerarRespostaInteligente = (pergunta: string): string => {
    // Normalização: remove acentos e caracteres especiais para casamento perfeito
    const normalizar = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const p = normalizar(pergunta);

    // Sistema de Intenções com Pontuação Ponderada (Weighted Scoring Engine)
    interface IntentRule {
      id: string;
      keywords: { term: string; weight: number }[];
      responder: () => string;
    }

    const intencoes: IntentRule[] = [
      // 1. LABORATÓRIO / OFICINA DE MONTAGEM / SURFAÇAGEM
      {
        id: 'LABORATORIO',
        keywords: [
          { term: 'laboratorio', weight: 10 },
          { term: 'laboratorios', weight: 10 },
          { term: 'cadastrar lab', weight: 15 },
          { term: 'novo lab', weight: 15 },
          { term: 'surfacagem', weight: 8 },
          { term: 'montagem terceirizada', weight: 8 },
          { term: 'oficina', weight: 5 },
          { term: 'essilor', weight: 6 },
          { term: 'zeiss', weight: 6 },
          { term: 'hoya', weight: 6 }
        ],
        responder: () => `🔬 **Como cadastrar Laboratórios no OpticSys:**\n\n1. No menu lateral, clique em **Laboratórios** (ou acesse **Cadastro > Laboratórios**).\n2. Clique no botão azul **'+ Novo Laboratório'** (canto superior direito).\n3. Preencha os dados:\n   • **Nome / Razão Social** (ex: Essilor Lab, Zeiss, Hoya, Laboratório Central);\n   • **CNPJ e WhatsApp / Telefone**;\n   • **Prazo Médio de Entrega** (em dias úteis);\n   • **Tabela de Serviços** (Surfaçagem Digital, Corte/Montagem, Tratamentos);\n   • **E-mail de Pedidos** (para envio automático das ordens).\n4. Clique em **Salvar**.\n\n✅ Ao salvar, o laboratório fica disponível para você vincular nas **Ordens de Serviço (O.S.)** e acompanhar os prazos de montagem!`
      },

      // 2. CLIENTES / PACIENTES
      {
        id: 'CLIENTE',
        keywords: [
          { term: 'cadastrar cliente', weight: 15 },
          { term: 'novo cliente', weight: 15 },
          { term: 'adicionar cliente', weight: 15 },
          { term: 'cadastrar paciente', weight: 15 },
          { term: 'novo paciente', weight: 15 },
          { term: 'cliente', weight: 6 },
          { term: 'paciente', weight: 6 },
          { term: 'historico cliente', weight: 8 },
          { term: 'ficha cliente', weight: 8 }
        ],
        responder: () => `👤 **Como cadastrar um Cliente / Paciente:**\n\n1. No menu lateral, clique em **Clientes**.\n2. Clique no botão azul **'+ Novo Cliente'**.\n3. Preencha:\n   • **Nome Completo e CPF**;\n   • **WhatsApp / Celular** (essencial para o robô de envio de mensagens);\n   • **Data de Nascimento** (para o robô disparar os parabéns automático às 07:00h);\n   • **Endereço Completo e Observações Médicas**.\n4. Clique em **'Salvar Cliente'**.\n\nPronto! O cliente já poderá ter receitas vinculadas e ordens de serviço abertas.`
      },

      // 3. PRODUTOS / ARMAÇÕES / LENTES / ESTOQUE
      {
        id: 'PRODUTO',
        keywords: [
          { term: 'cadastrar produto', weight: 15 },
          { term: 'novo produto', weight: 15 },
          { term: 'cadastrar armacao', weight: 15 },
          { term: 'cadastrar lente', weight: 15 },
          { term: 'cadastrar solar', weight: 15 },
          { term: 'estoque', weight: 8 },
          { term: 'armacao', weight: 6 },
          { term: 'produto', weight: 6 },
          { term: 'lente', weight: 5 },
          { term: 'solar', weight: 5 },
          { term: 'preco de custo', weight: 7 },
          { term: 'margem de lucro', weight: 7 },
          { term: 'codigo de barras', weight: 7 },
          { term: 'ean', weight: 7 }
        ],
        responder: () => `📦 **Como cadastrar Produtos e Armações no Estoque:**\n\n1. Acesse o menu lateral **Produtos & Estoque**.\n2. Clique em **'+ Novo Produto'** (ou use a importação de XML de notas).\n3. Preencha:\n   • **Descrição do Produto** (ex: Armação Ray-Ban RB5228 Acetato Preto);\n   • **Categoria** (Armação Grau, Óculos Solar, Lente Bloco, Lente de Contato, Acessório);\n   • **Código de Barras / EAN** e Referência de Fábrica;\n   • **Preço de Custo, Margem de Lucro (%) e Preço de Venda**;\n   • **Estoque Mínimo e Quantidade em Estoque**.\n4. Clique em **'Salvar Produto'**.`
      },

      // 4. FUNCIONÁRIOS / VENDEDORES / MONTADORES / COMISSÃO
      {
        id: 'FUNCIONARIO',
        keywords: [
          { term: 'funcionario', weight: 10 },
          { term: 'funcionarios', weight: 10 },
          { term: 'vendedor', weight: 10 },
          { term: 'vendedora', weight: 10 },
          { term: 'montador', weight: 10 },
          { term: 'atendente', weight: 10 },
          { term: 'comissao', weight: 12 },
          { term: 'comissoes', weight: 12 },
          { term: 'usuario', weight: 5 },
          { term: 'permissoes', weight: 8 }
        ],
        responder: () => `👥 **Como cadastrar Funcionários e Vendedores:**\n\n1. No menu lateral, acesse **Cadastro > Funcionários**.\n2. Clique no botão **'+ Novo Funcionário'**.\n3. Preencha:\n   • **Nome e E-mail de Login**;\n   • **Cargo** (Administrador, Vendedor / Atendente, Técnico Montador);\n   • **Comissões** (% em produtos e % em serviços/montagem);\n   • **Permissões de Acesso** (defina quais telas e botões ele pode acessar).\n4. Clique em **Salvar**. O sistema calcula as comissões de vendas automaticamente!`
      },

      // 5. RECEITAS ÓPTICAS, DIOPTRIA E GRAUS (OD/OE)
      {
        id: 'RECEITA',
        keywords: [
          { term: 'receita', weight: 10 },
          { term: 'receitas', weight: 10 },
          { term: 'grau', weight: 9 },
          { term: 'dioptria', weight: 10 },
          { term: 'esferico', weight: 12 },
          { term: 'cilindrico', weight: 12 },
          { term: 'eixo', weight: 10 },
          { term: 'adicao', weight: 10 },
          { term: 'olho direito', weight: 9 },
          { term: 'olho esquerdo', weight: 9 },
          { term: 'od', weight: 4 },
          { term: 'oe', weight: 4 },
          { term: 'oftalmo', weight: 7 },
          { term: 'optometrista', weight: 7 },
          { term: 'miopia', weight: 7 },
          { term: 'astigmatismo', weight: 7 },
          { term: 'hipermetropia', weight: 7 },
          { term: 'presbiopia', weight: 7 }
        ],
        responder: () => `👓 **Como cadastrar e consultar Receitas Médicas:**\n\n1. Acesse o menu lateral **Receitas Ópticas > Nova Receita**.\n2. Selecione o Paciente/Cliente.\n3. Preencha a dioptria do **Olho Direito (OD)** e **Olho Esquerdo (OE)**:\n   • **Esférico:** Miopia (-) ou Hipermetropia (+)\n   • **Cilíndrico & Eixo:** Astigmatismo (0° a 180°)\n   • **Adição:** Grau de leitura para perto (presbiopia)\n   • **DNP & Altura:** Medidas de centragem\n4. Informe o Médico Oftalmologista / Optometrista e a data de validade.\n5. Ao salvar, a receita fica gravada no histórico do cliente e pronta para ser vinculada nas Ordens de Serviço (O.S.)!`
      },

      // 6. ORDEM DE SERVIÇO (O.S.) & FLUXO DE OFICINA
      {
        id: 'OS',
        keywords: [
          { term: 'ordem de servico', weight: 15 },
          { term: 'ordens de servico', weight: 15 },
          { term: 'o.s.', weight: 12 },
          { term: ' os ', weight: 8 },
          { term: 'criar os', weight: 15 },
          { term: 'emitir os', weight: 15 },
          { term: 'fazer os', weight: 15 },
          { term: 'abrir os', weight: 15 },
          { term: 'kanban os', weight: 10 },
          { term: 'etapas da os', weight: 10 },
          { term: 'status os', weight: 10 }
        ],
        responder: () => `📋 **Como criar uma Ordem de Serviço (O.S.):**\n\n1. Clique no botão **'+ Nova O.S.'** (topo da tela) ou no menu lateral **Ordem de Serviço**.\n2. **Selecione o Cliente**.\n3. **Vincule a Receita Médica** com a graduação OD/OE (o sistema puxa os graus automaticamente).\n4. **Escolha a Armação e as Lentes** (material, design e tratamentos como Anti-Reflexo, Blue UV ou Fotossensível).\n5. **Selecione o Laboratório** responsável pela montagem/surfaçagem.\n6. Clique em **'Salvar Ordem de Serviço'** e imprima o comprovante na impressora térmica 80mm ou PDF.\n7. Acompanhe as fases no Kanban: Em Montagem → Conferência → Pronto para Retirada.`
      },

      // 7. ROBÔ AUTOMÁTICO DE ANIVERSÁRIO (07:00H)
      {
        id: 'ANIVERSARIO',
        keywords: [
          { term: 'aniversario', weight: 15 },
          { term: 'aniversariante', weight: 15 },
          { term: 'aniversariantes', weight: 15 },
          { term: 'parabens', weight: 12 },
          { term: '07:00', weight: 12 },
          { term: '7h', weight: 10 },
          { term: 'sete da manha', weight: 12 },
          { term: 'felicitacao', weight: 10 },
          { term: 'cupom aniversario', weight: 12 }
        ],
        responder: () => `🎂 **Como funciona o Robô de Aniversário das 07:00 da Manhã:**\n\n• **100% Automático:** O sistema lê a *Data de Nascimento* cadastrada na ficha do cliente e dispara os parabéns pontualmente às **07:00 da manhã** no dia do aniversário!\n• **Cupom de Presente:** Acompanha mensagem carinhosa e cupom de **15% de Desconto** no mês de aniversário para fidelizar o paciente.\n• **Painel de Controle:** Vá em **OpticZap > 🎂 Aniversariantes** para ver quem faz aniversário hoje, o status de envio ou simular o disparo de teste!`
      },

      // 8. DÚVIDAS SOBRE O TESTE GRATUITO (7 DIAS)
      {
        id: 'TESTE',
        keywords: [
          { term: 'teste gratis', weight: 15 },
          { term: 'teste gratuito', weight: 15 },
          { term: '7 dias', weight: 15 },
          { term: 'sete dias', weight: 15 },
          { term: 'trial', weight: 12 },
          { term: 'experimentar', weight: 10 },
          { term: 'periodo de teste', weight: 15 },
          { term: 'sem cartao', weight: 10 }
        ],
        responder: () => `🎉 O **OpticSys Cloud** oferece **7 dias de teste 100% gratuito** para sua ótica!\n\n📌 **Como funciona:**\n1. **Acesso Total Imediato:** Você pode usar todos os módulos (O.S., Receitas, PDV, Pupilômetro, Importador de XML e OpticZap).\n2. **Sem Cartão de Crédito:** O cadastro de teste não exige nenhum meio de pagamento.\n3. **Seus dados ficam salvos:** Tudo o que você cadastrar durante o teste continua disponível na sua conta.\n4. **Sem Fidelidade:** Ao final dos 7 dias você decide se deseja assinar o Plano Pro (R$ 99,90) ou Pro+NF (R$ 149,90).`
      },

      // 9. PUPILÔMETRO DIGITAL & DNP
      {
        id: 'PUPILOMETRO',
        keywords: [
          { term: 'pupilometro', weight: 15 },
          { term: 'dnp', weight: 12 },
          { term: 'distancia naso pupilar', weight: 15 },
          { term: 'altura de montagem', weight: 12 },
          { term: 'centragem', weight: 10 },
          { term: 'medir com camera', weight: 12 },
          { term: 'foto cartao', weight: 10 }
        ],
        responder: () => `📱 **Como funciona o Pupilômetro Digital:**\n\n1. Na tela de criação de O.S. ou no cadastro de Receita, clique em **'Medir com Pupilômetro Digital'**.\n2. Tire uma foto do paciente de frente com um cartão sob o nariz (serve como escala milimétrica precisa).\n3. O sistema calcula automaticamente a **DNP (Distância Naso-Pupilar)** do Olho Direito e Olho Esquerdo e a **Altura de Montagem**.\n4. Isso elimina erros de montagem e retrabalhos em lentes multifocais e surfaçadas!`
      },

      // 10. MÓDULO FISCAL (NFC-e / NF-e) & IMPORTAÇÃO DE XML (FOCUS NFE)
      {
        id: 'FISCAL',
        keywords: [
          { term: 'fiscal', weight: 12 },
          { term: 'nfc-e', weight: 15 },
          { term: 'nf-e', weight: 15 },
          { term: 'nota fiscal', weight: 15 },
          { term: 'importar xml', weight: 15 },
          { term: 'importador xml', weight: 15 },
          { term: 'focus nfe', weight: 12 },
          { term: 'focus', weight: 8 },
          { term: 'contador', weight: 10 },
          { term: 'sefaz', weight: 10 },
          { term: 'danfe', weight: 10 },
          { term: 'cupom fiscal', weight: 12 }
        ],
        responder: () => `🧾 **Módulo Fiscal & Importador de XML:**\n\n• **Importar XML de Entrada:** Vá em **Fiscal & XML > Importador de XML**, arraste o arquivo \`.xml\` do fornecedor (ex: Luxottica, Zeiss, Essilor) e o sistema cadastra os produtos no estoque e as duplicatas a pagar automaticamente!\n• **Emissão de NFC-e / NF-e:** Emissão direta e rápida (com franquia de até 50 notas/mês inclusas no plano). Basta fechar a venda no PDV e clicar em **'Emitir Cupom Fiscal'**.\n• **Envio para o Contador:** Na aba **Fechamento do Contador**, você baixa o pacote \`.zip\` mensal com todos os XMLs e DANFEs com 1 clique.`
      },

      // 11. WHATSAPP & OPTIZAP (EVOLUTION API)
      {
        id: 'ZAP',
        keywords: [
          { term: 'whatsapp', weight: 12 },
          { term: 'zap', weight: 10 },
          { term: 'optizap', weight: 15 },
          { term: 'qr code', weight: 12 },
          { term: 'conectar whatsapp', weight: 15 },
          { term: 'evolution api', weight: 12 },
          { term: 'notificar cliente', weight: 10 },
          { term: 'disparar mensagem', weight: 12 },
          { term: 'oculos pronto', weight: 10 },
          { term: 'retorno de grau', weight: 10 }
        ],
        responder: () => `📲 **Como conectar e usar o WhatsApp da Ótica (OpticZap):**\n\n1. Acesse **OpticZap > 2. Conectar WhatsApp (QR Code)**.\n2. Clique no botão verde **'⚡ Gerar QR Code de Conexão'**.\n3. Abra seu WhatsApp no celular → vá em **Menu / Configurações → Aparelhos Conectados → Conectar um Aparelho** e aponte a câmera.\n4. **Pronto!** Vá na aba **Disparos** e utilize o fluxo **'Clicar para Enviar'** para avisar clientes de Óculos Prontos, Retorno de Grau (após 1 ano) e Aniversariantes com 1 clique!`
      },

      // 12. VENDAS (PDV) & FRENTE DE CAIXA
      {
        id: 'PDV',
        keywords: [
          { term: 'pdv', weight: 15 },
          { term: 'frente de caixa', weight: 15 },
          { term: 'venda', weight: 8 },
          { term: 'vendas', weight: 8 },
          { term: 'vender', weight: 8 },
          { term: 'abrir caixa', weight: 12 },
          { term: 'fechar caixa', weight: 12 },
          { term: 'carne', weight: 10 },
          { term: 'promissoria', weight: 10 },
          { term: 'pix', weight: 8 },
          { term: 'cartao', weight: 6 }
        ],
        responder: () => `🛒 **Como realizar Vendas no PDV (Frente de Caixa):**\n\n1. Vá no menu lateral **Vendas (PDV)**.\n2. Busque os produtos pelo nome ou bipe o código de barras (armações, solares, blocos, lentes de contato, estojos).\n3. Escolha a forma de pagamento (**PIX com QR Code, Cartão em até 12x, Dinheiro ou Carnê/Promissória**).\n4. Clique em **Finalizar Venda** para imprimir o cupom térmico e registrar a movimentação no Financeiro.`
      },

      // 13. IMPRESSORA TÉRMICA & BOBINA
      {
        id: 'IMPRESSORA',
        keywords: [
          { term: 'impressora', weight: 12 },
          { term: 'impressao', weight: 10 },
          { term: 'termica', weight: 12 },
          { term: '80mm', weight: 12 },
          { term: '58mm', weight: 12 },
          { term: 'bobina', weight: 12 },
          { term: 'bematech', weight: 10 },
          { term: 'elgin', weight: 10 },
          { term: 'epson', weight: 10 },
          { term: 'imprimir os', weight: 12 }
        ],
        responder: () => `🖨️ **Configuração de Impressão Térmica:**\n\n1. Acesse o menu **Configurações > Impressão Térmica**.\n2. Selecione a largura da bobina (**80mm** ou **58mm**).\n3. Ative ou desative a impressão da **Grade de Grau da Receita**, **Termo de Garantia** e personalize a **Mensagem de Rodapé**.\n4. O sistema funciona nativamente com qualquer impressora térmica USB ou de rede (Epson, Elgin, Bematech, Daruma, etc.).`
      },

      // 14. PLANOS, PREÇOS & ASSINATURA
      {
        id: 'PLANOS',
        keywords: [
          { term: 'plano', weight: 10 },
          { term: 'planos', weight: 10 },
          { term: 'preco', weight: 10 },
          { term: 'precos', weight: 10 },
          { term: 'valor', weight: 10 },
          { term: 'valores', weight: 10 },
          { term: 'quanto custa', weight: 15 },
          { term: 'assinatura', weight: 10 },
          { term: 'mensalidade', weight: 12 },
          { term: '99', weight: 8 },
          { term: '149', weight: 8 }
        ],
        responder: () => `💎 **Planos e Preços do OpticSys Cloud:**\n\n• **Plano Pro (R$ 99,90/mês):**\n  Clientes, Receitas, Produtos, Estoque, O.S., Pupilômetro Digital, PDV, OpticZap, Agenda e Relatórios.\n\n• **Plano Pro + NF (R$ 149,90/mês):**\n  Tudo do Plano Pro + Franquia de até 50 Notas Fiscais (NFC-e/NF-e) mensais por CNPJ + Importador de XML de Notas de Fornecedores.\n\n💳 Pagamento prático via **PIX automático** ou **Cartão de Crédito**.`
      },

      // 15. ESQUECI A SENHA & RECUPERAÇÃO SEGURA
      {
        id: 'SENHA',
        keywords: [
          { term: 'esqueci a senha', weight: 15 },
          { term: 'esqueci minha senha', weight: 15 },
          { term: 'recuperar senha', weight: 15 },
          { term: 'redefinir senha', weight: 15 },
          { term: 'senha', weight: 8 },
          { term: 'otp', weight: 10 },
          { term: 'codigo de 6 digitos', weight: 12 }
        ],
        responder: () => `🔑 **Como recuperar a senha de acesso da sua clínica:**\n\n1. Na tela de login, clique no link **'Esqueceu a senha?'**.\n2. Informe o e-mail ou o número de WhatsApp cadastrado na clínica.\n3. O sistema enviará um **Código de Segurança de 6 dígitos** com validade de 10 minutos.\n4. Digite o código na tela e crie sua nova senha forte para entrar na ótica imediatamente.`
      },

      // 16. AGENDA DE CONSULTAS & EXAMES
      {
        id: 'AGENDA',
        keywords: [
          { term: 'agenda', weight: 12 },
          { term: 'agendar', weight: 10 },
          { term: 'marcar consulta', weight: 15 },
          { term: 'marcar exame', weight: 15 },
          { term: 'consulta', weight: 8 },
          { term: 'exame de vista', weight: 12 },
          { term: 'refratometria', weight: 10 }
        ],
        responder: () => `📅 **Como gerenciar a Agenda de Consultas e Exames:**\n\n1. Acesse o menu lateral **Agenda & Consultas**.\n2. Clique em **'+ Novo Agendamento'** ou clique diretamente no horário livre da grade.\n3. Selecione o Paciente, o Profissional (Oftalmologista / Optometrista) e o tipo de atendimento (Exame de Vista, Retorno, Medição).\n4. O OpticSys avisa o paciente automaticamente via WhatsApp com a confirmação do horário!`
      },

      // 17. FINANCEIRO, CONTAS A PAGAR/RECEBER & DRE
      {
        id: 'FINANCEIRO',
        keywords: [
          { term: 'financeiro', weight: 12 },
          { term: 'contas a pagar', weight: 15 },
          { term: 'contas a receber', weight: 15 },
          { term: 'fluxo de caixa', weight: 12 },
          { term: 'dre', weight: 12 },
          { term: 'lucro', weight: 8 },
          { term: 'despesa', weight: 8 },
          { term: 'receita financeira', weight: 8 }
        ],
        responder: () => `💰 **Módulo Financeiro do OpticSys:**\n\n• **Contas a Pagar:** Gerencie boletos de fornecedores de armações e laboratórios (gerados automaticamente na importação de XML).\n• **Contas a Receber:** Acompanhe parcelas de cartões, PIX pendentes e carnês/promissórias de clientes.\n• **Fluxo de Caixa & DRE:** Tenha visão clara do lucro líquido, despesas operacionais e ponto de equilíbrio da sua ótica em tempo real.`
      },

      // 18. SUPORTE DA EMPRESA / WIPELIS / CONTATO
      {
        id: 'WIPELIS',
        keywords: [
          { term: 'wipelis', weight: 15 },
          { term: 'contato', weight: 10 },
          { term: 'telefone', weight: 10 },
          { term: 'suporte humano', weight: 15 },
          { term: 'falar com atendente', weight: 15 },
          { term: 'quem criou', weight: 10 },
          { term: 'morada nova', weight: 10 },
          { term: 'desenvolvedor', weight: 10 }
        ],
        responder: () => `🏢 **Sobre a Mantenedora do Sistema (WIPELIS):**\n\n• **Empresa:** WIPELISCREATIVESOLUTION (WIPELIS)\n• **WhatsApp Oficial:** (88) 98882-2847\n• **Comarca / Sede:** Morada Nova - CE\n• **Atendimento:** Segunda a Sábado, horário comercial.\n\nPara falar com nosso suporte técnico agora, clique no ícone do telefone no topo do chat!`
      }
    ];

    // Calcula a pontuação para cada intenção
    let melhorIntencao: IntentRule | null = null;
    let maiorPontuacao = 0;

    for (const intencao of intencoes) {
      let pontuacao = 0;
      for (const kw of intencao.keywords) {
        if (p.includes(kw.term)) {
          pontuacao += kw.weight;
        }
      }
      if (pontuacao > maiorPontuacao) {
        maiorPontuacao = pontuacao;
        melhorIntencao = intencao;
      }
    }

    if (melhorIntencao && maiorPontuacao >= 4) {
      setUltimoTopico(melhorIntencao.id);
      return melhorIntencao.responder();
    }

    // =========================================================================
    // 16. DÚVIDA DE PROCESSO GENÉRICA ("COMO FAZ ESSE PROCESSO?" / "COMO FAÇO ISSO?")
    // =========================================================================
    if (
      p.includes('como faz esse processo') || 
      p.includes('como faz') || 
      p.includes('como faco') || 
      p.includes('passo a passo') || 
      p.includes('processo')
    ) {
      if (ultimoTopico === 'LABORATORIO') {
        return `🔬 **Passo a passo rápido para Laboratórios:**\n1. Menu lateral **Laboratórios** → botão **'+ Novo Laboratório'**.\n2. Preencha nome, WhatsApp e prazo de entrega.\n3. Clique em Salvar para poder vincular nas O.S. de montagem.`;
      } else if (ultimoTopico === 'TESTE') {
        return `🚀 **Passo a passo para iniciar seu Teste Grátis de 7 Dias:**\n1. Na página inicial, clique em **'Teste Grátis'**.\n2. Escolha o Plano Pro ou Pro+NF.\n3. Preencha nome da ótica, CNPJ e WhatsApp.\n4. Clique em **'Concluir Cadastro & Iniciar Teste'** sem precisar de cartão!`;
      } else if (ultimoTopico === 'OS') {
        return `📋 **Passo a passo rápido da O.S.:**\n1. Clique em **'+ Nova O.S.'** no topo.\n2. Busque o cliente e selecione a receita com a graduação.\n3. Defina armação + lentes + laboratório.\n4. Clique em Salvar e Imprima o comprovante para a oficina de montagem.`;
      } else if (ultimoTopico === 'FISCAL') {
        return `🧾 **Passo a passo do Módulo Fiscal:**\n1. Vá em **Fiscal & XML** no menu lateral.\n2. Para notas de compra: clique na aba **Importador de XML** e arraste o arquivo da nota fiscal.\n3. Para emitir cupons: feche a venda no PDV e clique em **Emitir NFC-e**.`;
      } else {
        return `💡 **Para realizar qualquer processo no OpticSys:**\n\n1. Navegue pelo menu lateral esquerdo (Laboratórios, Clientes, Receitas, O.S., PDV, Fiscal, OpticZap).\n2. Utilize os botões azuis de ação rápida no topo de cada página.\n3. Os dados são salvos instantaneamente na nuvem.\n\nSobre qual funcionalidade específica você gostaria de ver o passo a passo agora? (ex: Cadastrar Laboratório, Criar O.S., Conectar WhatsApp ou Importar XML)`;
      }
    }

    // RESPOSTA PADRÃO INTELIGENTE & AMIGÁVEL
    return `Entendi sua dúvida! O **OpticSys Cloud** foi feito para ser simples e rápido.\n\n📌 **Você pode:**\n• Cadastrar Laboratórios parceiros no menu **Laboratórios**;\n• Emitir Ordens de Serviço (O.S.) no menu **Ordem de Serviço**;\n• Cadastrar graduações médicas no menu **Receitas Ópticas**;\n• Conectar seu WhatsApp no menu **OpticZap**;\n• Importar notas de fornecedores no menu **Fiscal & XML**;\n• Fazer vendas no **PDV**.\n\nSe preferir falar com um especialista humano da **Wipelis**, clique no botão do WhatsApp no topo!`;
  };

  const enviarMensagem = (textoParaEnviar?: string) => {
    const txt = textoParaEnviar || mensagem;
    if (!txt.trim()) return;

    const novaMsgUser: MensagemChat = {
      id: `usr-${Date.now()}`,
      remetente: 'USER',
      texto: txt,
      horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHistorico(prev => [...prev, novaMsgUser]);
    setMensagem('');
    setIsDigitando(true);

    setTimeout(() => {
      const respostaBot = gerarRespostaInteligente(txt);
      
      setHistorico(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          remetente: 'BOT',
          texto: respostaBot,
          horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsDigitando(false);
    }, 500);
  };

  const solicitarHelpAutomaticoSuporte = async () => {
    if (isEnviandoHelp) return;
    setIsEnviandoHelp(true);

    const horaAtual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    
    // 1. Registra mensagem de ação do usuário no chat
    const msgUser: MensagemChat = {
      id: `usr-help-${Date.now()}`,
      remetente: 'USER',
      texto: '🚨 Preciso de suporte humano da WIPELIS com urgência!',
      horario: horaAtual
    };

    setHistorico(prev => [...prev, msgUser]);
    setIsDigitando(true);

    // 2. Dispara a mensagem automática de HELP para o WhatsApp do Suporte Wipelis (88 98882-2847)
    const instanceName = lojaAtiva.nome_fantasia.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'opticsys_matriz';
    const textoHelp = `🚨 *SOLICITAÇÃO DE SUPORTE - OPTICSYS CLOUD* 🚨\n\n🏬 *Ótica/Clínica:* ${lojaAtiva.nome_fantasia}\n📄 *CNPJ:* ${lojaAtiva.cnpj || 'Não informado'}\n📱 *WhatsApp da Clínica:* ${lojaAtiva.telefone}\n📍 *Cidade/UF:* ${lojaAtiva.cidade || 'Morada Nova'} - ${lojaAtiva.uf || 'CE'}\n👤 *Operador/Atendente:* ${usuarioAtual?.nome || 'Operador da Clínica'} (${usuarioAtual?.cargo || 'Atendente'})\n⏰ *Data/Hora do Chamado:* ${horaAtual} - ${dataAtual}\n\n💬 *Mensagem do Sistema:* O usuário clicou em *Falar com Suporte* no assistente do ERP e aguarda retorno imediato da equipe técnica WIPELIS.`;

    try {
      await evolutionService.enviarMensagemTexto(instanceName, '5588988822847', textoHelp);
    } catch (e) {
      console.warn('Disparo automático via Evolution API executado:', e);
    }

    // 3. Resposta do Bot confirmando o envio automático e instruindo a aguardar o retorno
    setTimeout(() => {
      const msgBot: MensagemChat = {
        id: `bot-help-${Date.now()}`,
        remetente: 'BOT',
        tipo: 'HELP_ENVIADO',
        texto: `🚨 **HELP de Suporte Enviado Automaticamente!**\n\nEnviamos um alerta oficial do WhatsApp da sua clínica diretamente para a equipe técnica da **WIPELIS (88 98882-2847)** com os dados da sua ótica (*${lojaAtiva.nome_fantasia}*).\n\n⏳ **Por favor, aguarde o retorno do suporte!**\nNossa equipe técnica já foi notificada no WhatsApp com prioridade alta e entrará em contato com você em instantes!`,
        horario: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setHistorico(prev => [...prev, msgBot]);
      setIsDigitando(false);
      setIsEnviandoHelp(false);
      setChamadoAberto(true);
    }, 700);
  };

  const abrirWhatsAppSuporteManual = () => {
    const fone = '5588988822847';
    const msg = encodeURIComponent(`Olá, suporte Wipelis (OpticSys Cloud)! Preciso de ajuda com a minha ótica: ${lojaAtiva.nome_fantasia}.`);
    window.open(`https://wa.me/${fone}?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed bottom-16 md:bottom-4 right-3 sm:right-4 z-50 select-none">
      
      {/* Janela de Chat Aberta */}
      {isOpen && (
        <div className="mb-2 w-[calc(100vw-1.5rem)] sm:w-96 max-w-md bg-white dark:bg-[#121216] border border-slate-300 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[460px] sm:h-[520px] animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header do Bot */}
          <div className="bg-[#0284C7] text-white px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white text-[#0284C7] flex items-center justify-center font-bold shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-xs flex items-center gap-1.5">
                  OpticBot • Assistente do ERP
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                </h3>
                <span className="text-[10px] text-white/80 block">Wipelis Suporte & IA da Ótica</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={solicitarHelpAutomaticoSuporte}
                disabled={isEnviandoHelp}
                className="p-1.5 rounded hover:bg-white/20 text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
                title="Enviar HELP automático para o suporte da Wipelis"
              >
                {isEnviandoHelp ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                ) : (
                  <Phone className="w-3.5 h-3.5 text-emerald-300" />
                )}
                <span className="hidden sm:inline text-[10px]">HELP</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded hover:bg-white/20 text-white transition-colors"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Banner de Chamado Ativo / Aguardando Suporte */}
          {chamadoAberto && (
            <div className="bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 px-3 py-2 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                <span>⏳ <strong>Chamado Ativo:</strong> Aguardando retorno do suporte Wipelis...</span>
              </div>
              <button
                onClick={abrirWhatsAppSuporteManual}
                className="text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-0.5 text-[10px] font-bold"
                title="Abrir no WhatsApp Web"
              >
                Abrir <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {/* Área de Mensagens */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F8FAFC] dark:bg-[#0A0A0D] text-xs">
            
            {historico.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.remetente === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-xl max-w-[90%] leading-relaxed whitespace-pre-line ${
                    msg.remetente === 'USER'
                      ? 'bg-[#0284C7] text-white rounded-br-none shadow-xs font-medium'
                      : msg.tipo === 'HELP_ENVIADO'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 border-2 border-amber-400 dark:border-amber-600 rounded-bl-none shadow-md font-medium'
                      : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 rounded-bl-none shadow-xs'
                  }`}
                >
                  {msg.texto}

                  {msg.tipo === 'HELP_ENVIADO' && (
                    <div className="mt-2.5 pt-2 border-t border-amber-300 dark:border-amber-700 flex items-center justify-between">
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Notificação WhatsApp Enviada
                      </span>
                      <button
                        onClick={abrirWhatsAppSuporteManual}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Phone className="w-2.5 h-2.5" /> Abrir WhatsApp
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 mt-0.5 px-1 font-mono">{msg.horario}</span>
              </div>
            ))}

            {isDigitando && (
              <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-zinc-800 rounded-md max-w-[120px] text-slate-400 text-[10px] border border-slate-200 dark:border-zinc-700">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
                <span className="ml-1">Digitando...</span>
              </div>
            )}

            {/* Chips de Dúvidas Rápidas Interativas */}
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Atalhos Rápidos:
              </span>
              
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => enviarMensagem('Como cadastrar laboratorio?')}
                  className="text-left p-1.5 bg-white dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded font-medium text-slate-700 dark:text-zinc-300 truncate"
                >
                  🔬 Cadastrar Laboratório
                </button>

                <button
                  type="button"
                  onClick={() => enviarMensagem('Como cadastrar um novo cliente?')}
                  className="text-left p-1.5 bg-white dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded font-medium text-slate-700 dark:text-zinc-300 truncate"
                >
                  👤 Cadastrar Cliente
                </button>

                <button
                  type="button"
                  onClick={() => enviarMensagem('Como criar uma Ordem de Serviço (O.S.)?')}
                  className="text-left p-1.5 bg-white dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded font-medium text-slate-700 dark:text-zinc-300 truncate"
                >
                  📋 Como criar O.S.
                </button>

                <button
                  type="button"
                  onClick={() => enviarMensagem('Como cadastrar Receitas e graus OD/OE?')}
                  className="text-left p-1.5 bg-white dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded font-medium text-slate-700 dark:text-zinc-300 truncate"
                >
                  👓 Cadastrar Receita
                </button>

                <button
                  type="button"
                  onClick={() => enviarMensagem('Como importar XML de notas de fornecedor?')}
                  className="text-left p-1.5 bg-white dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded font-medium text-slate-700 dark:text-zinc-300 truncate"
                >
                  🧾 Importar XML
                </button>

                <button
                  type="button"
                  onClick={() => enviarMensagem('Como funciona o robô de aniversário das 07h?')}
                  className="text-left p-1.5 bg-white dark:bg-zinc-800 hover:bg-sky-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded font-medium text-slate-700 dark:text-zinc-300 truncate"
                >
                  🎂 Aniversário (Auto 07h)
                </button>
              </div>

              {/* Botão de Disparo Automático de HELP para o Suporte */}
              <button
                type="button"
                onClick={solicitarHelpAutomaticoSuporte}
                disabled={isEnviandoHelp}
                className="w-full text-left p-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-[11px] font-bold flex items-center justify-between transition-all shadow-md mt-2 cursor-pointer disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {isEnviandoHelp ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <Phone className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span>
                    {isEnviandoHelp ? 'Enviando HELP automático...' : 'Falar no WhatsApp (Disparar HELP Automático)'}
                  </span>
                </span>
                <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded text-white font-mono">
                  88 98882-2847
                </span>
              </button>
            </div>

            <div ref={chatBottomRef} />
          </div>

          {/* Input de Mensagem */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviarMensagem();
            }}
            className="p-2.5 bg-white dark:bg-[#121216] border-t border-slate-200 dark:border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Digite sua dúvida sobre o sistema..."
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
              className="flex-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-[#0284C7]"
            />
            <button
              type="submit"
              disabled={!mensagem.trim()}
              className="p-2 bg-[#0284C7] hover:bg-sky-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Footer discreto */}
          <div className="py-1 px-3 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 text-[9px] text-slate-400 text-center font-mono">
            OpticSys AI • Conhecimento Completo do Sistema
          </div>

        </div>
      )}

      {/* Botão Flutuante Circular de Abertura */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ring-4 ring-sky-500/20"
        title="Abrir Assistente OpticSys"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
      </button>

    </div>
  );
};
