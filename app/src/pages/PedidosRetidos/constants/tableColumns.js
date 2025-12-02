/**
 * Configurações de colunas para as tabelas de Pedidos Retidos
 */

/**
 * Colunas da tabela principal de pedidos parados
 */
export const PEDIDOS_PARADOS_COLUMNS = [
  { key: 'responsavel', header: 'Responsável' },
  { key: 'total', header: 'Total' },
  { key: 'entregues', header: 'Entregues' },
  { key: 'nao_entregues', header: 'Não Entregues' },
  { key: 'status', header: 'Status' },
]

/**
 * Colunas do overlay de pedidos do motorista
 */
export const OVERLAY_PEDIDOS_MOTORISTA_COLUMNS = [
  { key: 'Remessa', header: 'Número do Pedido' },
  { key: 'Horário da última operação', header: 'Horário da Última Operação' },
  { key: 'Aging', header: 'Aging' },
  { key: 'Cidade Destino', header: 'Cidade Destino' },
  { key: 'Destinatário', header: 'Destinatário' },
  { key: 'CEP destino', header: 'CEP' },
  { key: 'Marca de assinatura', header: 'Status' },
  { key: 'Tipo da última operação', header: 'Tipo da Última Operação' },
]
