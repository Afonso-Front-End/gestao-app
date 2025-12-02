/**
 * Funções utilitárias para transformação de dados
 */

/**
 * Transforma dados de pedidos do motorista para o formato da tabela
 */
export const transformPedidosMotoristaData = (pedidos) => {
  return pedidos.map(item => ({
    'Número de pedido JMS': item.numero_pedido_jms || '',
    'Base de entrega': item.base_entrega || '',
    'Horário de saída para entrega': item.horario_saida_entrega || '',
    'Marca de assinatura': item.marca_assinatura || '',
    'CEP destino': item.cep_destino || '',
    'Motivos dos pacotes problemáticos': item.motivos_pacotes_problematicos || '',
    'Destinatário': item.destinatario || '',
    'Complemento': item.complemento || '',
    'Distrito destinatário': item.distrito_destinatario || '',
    'Cidade Destino': item.cidade_destino || '',
    '3 Segmentos': item.tres_segmentos || '',
    'Tempo de Pedido parado': item.tempo_pedido_parado || ''
  }))
}

/**
 * Transforma dados de motoristas para o formato da tabela
 */
export const transformMotoristasData = (motoristasData) => {
  const rows = motoristasData.map((item, index) => ({
    Responsável: item.motorista || 'N/A',
    Base: item.base_entrega || '',
    Total: item.total_pedidos || 0,
    Entregues: item.total_entregues || 0,
    'Não Entregues': item.total_nao_entregues || 0,
    Status: null, // Será preenchido pelo hook de renderização
    _isTotalRow: false,
    _rowIndex: index,
    _motorista: item.motorista || 'N/A',
    _base: item.base_entrega || ''
  }))

  // Adicionar linha de total
  const totalRow = {
    Responsável: 'TOTAL',
    Base: '',
    Total: motoristasData.reduce((sum, item) => sum + (item.total_pedidos || 0), 0),
    Entregues: motoristasData.reduce((sum, item) => sum + (item.total_entregues || 0), 0),
    'Não Entregues': motoristasData.reduce((sum, item) => sum + (item.total_nao_entregues || 0), 0),
    Status: null,
    _isTotalRow: true
  }

  return [...rows, totalRow]
}

/**
 * Calcula estatísticas dos motoristas
 */
export const calculateStats = (motoristasData) => {
  return {
    totalPedidos: motoristasData.reduce((sum, item) => sum + (item.total_pedidos || 0), 0),
    totalMotoristas: motoristasData.length,
    mediaPedidosPorMotorista: motoristasData.length > 0
      ? Math.round(
          motoristasData.reduce((sum, item) => sum + (item.total_pedidos || 0), 0) /
          motoristasData.length
        )
      : 0,
    totalEntregues: motoristasData.reduce((sum, item) => sum + (item.total_entregues || 0), 0),
    totalNaoEntregues: motoristasData.reduce((sum, item) => sum + (item.total_nao_entregues || 0), 0)
  }
}

/**
 * Extrai números de pedidos de uma lista de pedidos
 */
export const extractNumerosPedidos = (pedidos) => {
  return pedidos
    .map(item => item.numero_pedido_jms)
    .filter(Boolean)
}

