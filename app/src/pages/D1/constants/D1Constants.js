/**
 * Constantes da página D1
 */

// URLs da API
export const API_ENDPOINTS = {
  D1_UPLOAD: '/d1/upload', // Relativo ao baseURL
  BIPAGENS_UPLOAD: '/d1/bipagens/upload', // Relativo ao baseURL
  ATUALIZAR_STATUS: '/d1/bipagens/atualizar-marca-assinatura', // Relativo ao baseURL
  DELETE_BIPAGENS: '/d1/bipagens/clear-all',
  DELETE_D1: '/d1/clear-all', // Deletar dados de Gestão de 1 Mês (d1_main e d1_chunks)
  STATUS_MOTORISTA: '/d1/bipagens/motorista' // Relativo ao baseURL
}

// Configurações
export const CONFIG = {
  LOTES_SIZE: 1000,
  DEBOUNCE_DELAY: 500,
  REFETCH_DELAY: 2000,
  CACHE_RELOAD_DELAY: 1000
}

// Chaves do localStorage
export const STORAGE_KEYS = {
  BIPAGENS_SAVED_BASES: 'd1_bipagens_saved_bases',
  BIPAGENS_SAVE_ENABLED: 'd1_bipagens_save_bases_enabled',
  BIPAGENS_SAVED_TEMPOS: 'd1_bipagens_saved_tempos',
  BIPAGENS_SAVE_TEMPOS_ENABLED: 'd1_bipagens_save_tempos_enabled',
  BIPAGENS_STATUS: 'd1-bipagens-status'
}

// Status de motoristas
export const MOTORISTA_STATUS = {
  OK: 'OK',
  NAO_RETORNOU: 'NAO RETORNOU POSSIVEL EXTRAVIO',
  PENDENTE: 'PENDENTE',
  NUMERO_ERRADO: 'NUMERO ERRADO OU SEM DDD OU INCORRETO',
  NAO_CONTATEI: 'NAO CONTATEI'
}

// Colunas da tabela de pedidos do motorista
export const PEDIDOS_MOTORISTA_COLUMNS = [
  'Número de pedido JMS',
  'Base de entrega',
  'Horário de saída para entrega',
  'Marca de assinatura',
  'CEP destino',
  'Motivos dos pacotes problemáticos',
  'Destinatário',
  'Complemento',
  'Distrito destinatário',
  'Cidade Destino',
  '3 Segmentos',
  'Tempo de Pedido parado'
]

// Colunas da tabela de motoristas
export const MOTORISTAS_COLUMNS = [
  'Responsável',
  'Base',
  'Total',
  'Entregues',
  'Não Entregues',
  'Status'
]

