// Função para copiar número do pedido
export const handleCopyPedidoNumber = (row, onSuccess, onError) => {
  const numeroPedido = row['Nº DO PEDIDO'] || row['NUMERO_PEDIDO'] || 'N/A'
  
  navigator.clipboard.writeText(numeroPedido).then(() => {
    onSuccess(`Número do pedido ${numeroPedido} copiado!`)
  }).catch(() => {
    onError('Erro ao copiar número do pedido')
  })
}

// Função para lidar com screenshot
export const handleScreenshot = (success, message, onSuccess, onError) => {
  if (success) {
    onSuccess(message)
  } else {
    onError(message)
  }
}

// Função para obter pedidos do motorista (otimizada)
export const getPedidosDoMotorista = (data, motorista, base) => {
  if (!data || !data.length) return []
  
  // Otimização: usar for...of em vez de filter
  const pedidos = []
  for (const pedido of data) {
    if (pedido.ENTREGADOR === motorista && pedido.BASE === base) {
      pedidos.push(pedido)
    }
  }
  return pedidos
}

// Função para obter bases únicas (otimizada)
export const getBasesUnicas = (stats) => {
  if (!stats || !stats.length) return []
  
  // Otimização: usar for...of em vez de map
  const bases = new Set()
  for (const stat of stats) {
    if (stat.Base) {
      bases.add(stat.Base)
    }
  }
  return Array.from(bases)
}
