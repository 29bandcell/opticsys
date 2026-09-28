// Configurações Globais do Servidor WhatsApp (Evolution API)
// O sistema conecta automaticamente usando este servidor central para envio de códigos OTP e notificações.

export const EVOLUTION_CONFIG = {
  // URL base do seu servidor Evolution API no Easypanel
  BASE_URL: (import.meta.env.VITE_EVOLUTION_API_URL || 'https://bandcell-evolution-api.38nhhr.easypanel.host').replace(/\/$/, ''),
  
  // Chave de API Global (AUTHENTICATION_API_KEY)
  GLOBAL_API_KEY: import.meta.env.VITE_EVOLUTION_API_KEY || '429683C4C977415CAAFCCE10F7D57E11',

  // Nome da Instância Master da Wipelis / OpticSys
  INSTANCE_NAME: import.meta.env.VITE_EVOLUTION_INSTANCE || 'opticsys-cloud-master',

  // Prefixo para identificar instâncias criadas pelo sistema OpticSys
  INSTANCE_PREFIX: 'opticsys_'
};
