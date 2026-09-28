// Configuração do Mercado Pago para Assinaturas SaaS do OpticSys Cloud
// Empresa Mantenedora: WIPELISCREATIVESOLUTION (WIPELIS)
// Contato Oficial: (88) 98882-2847

export const MERCADO_PAGO_CONFIG = {
  // Access Token oficial do Mercado Pago Developers (Wipelis OpticSys)
  ACCESS_TOKEN: 'APP_USR-3047985805054134-092714-27bccb9d1eb79fac4b3ae5c1f1379dd3-3206135',
  
  // Public Key (Chave Pública para Checkout Transparente e Pix)
  PUBLIC_KEY: 'APP_USR-4645a02c-5bb6-4b59-8fa5-ebf47f47ca5b',

  // Preços dos Planos Oficiais (em BRL)
  PLANOS: {
    PRO: {
      id: 'pro',
      nome: 'Plano Pro ⚡',
      valorMensal: 99.90,
      valorAnualMensal: 79.90,
      descricao: 'O.S., Receitas, PDV, Pupilômetro Digital & OpticZap WhatsApp'
    },
    PRO_NF: {
      id: 'pro_nf',
      nome: 'Plano Pro + NF 🧾',
      valorMensal: 149.90,
      valorAnualMensal: 119.90,
      descricao: 'Tudo do Pro + Franquia de 50 Notas Fiscais/mês por CNPJ e Importador de XML'
    }
  },

  // Webhook Endpoint registrado no painel do Mercado Pago
  WEBHOOK_URL: 'https://bandcell-evolution-api.38nhhr.easypanel.host/api/webhook/mercadopago'
};
