// Configuração da Software House Focus NFe para o OpticSys Cloud
// Empresa Mantenedora / SaaS Owner: WIPELISCREATIVESOLUTION (WIPELIS)
// Suporte Oficial: (88) 98882-2847 | E-mail: opticcsys@gmail.com

export interface FocusNFeConfig {
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO';
  tokenSoftwareHouse: string; // Token Master da conta Software House da Wipelis
  baseUrlHomologacao: string;
  baseUrlProducao: string;
  webhookUrl: string;
}

export const FOCUS_NFE_CONFIG: FocusNFeConfig = {
  ambiente: 'HOMOLOGACAO', // Mude para 'PRODUCAO' quando for emitir notas oficiais
  tokenSoftwareHouse: 'fc_live_wipelis_sh_token_89a74b21e89b', // Inserir Token Master da Wipelis gerado no painel da Focus
  baseUrlHomologacao: 'https://homologacao.focusnfe.com.br/v2',
  baseUrlProducao: 'https://api.focusnfe.com.br/v2',
  webhookUrl: 'https://api.opticsys.com.br/webhooks/focus-nfe'
};
