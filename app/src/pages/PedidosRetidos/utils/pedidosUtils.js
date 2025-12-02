/**
 * Utilitários para manipulação de pedidos
 */

/**
 * Extrai bases únicas de um array de dados
 * @param {Array} dados - Array de objetos com informações de pedidos
 * @returns {Array} Array de bases únicas ordenadas
 */
export const extrairBasesUnicas = (dados) => {
  const bases = new Set()
  dados.forEach(item => {
    const base = item.base_entrega || item.base || 'Não informado'
    if (base && base !== 'Não informado') {
      bases.add(base)
    }
  })
  return Array.from(bases).sort()
}

/**
 * Extrai cidades únicas de um array de dados
 * @param {Array} dados - Array de objetos com informações de pedidos
 * @returns {Array} Array de cidades únicas ordenadas
 */
export const extrairCidadesUnicas = (dados) => {
  const cidades = new Set()
  dados.forEach(item => {
    const cidade = item.cidade_destino || item.cidade || 'Não informado'
    if (cidade && cidade !== 'Não informado') {
      cidades.add(cidade)
    }
  })
  return Array.from(cidades).sort()
}

/**
 * Normaliza um número removendo caracteres não numéricos
 * @param {string} s - String a ser normalizada
 * @returns {string} String apenas com dígitos
 */
export const normalizeDigits = (s) => (s || '').toString().replace(/\D/g, '')

/**
 * Cria lotes de pedidos a partir de um array de números
 * @param {Array<string>} numeros - Array de números de pedidos
 * @param {number} tamanhoLote - Tamanho de cada lote (padrão: 1000)
 * @returns {Array} Array de objetos de lotes
 */
export const criarLotes = (numeros, tamanhoLote = 1000) => {
  const lotes = []
  for (let i = 0; i < numeros.length; i += tamanhoLote) {
    lotes.push({
      numero_lote: Math.floor(i / tamanhoLote) + 1,
      total_pedidos: Math.min(tamanhoLote, numeros.length - i),
      pedidos: numeros.slice(i, i + tamanhoLote),
    })
  }
  return lotes
}

/**
 * Deduplica números de pedidos por raiz numérica
 * @param {Array} pedidos - Array de objetos de pedidos
 * @returns {Array} Array de números de pedidos únicos
 */
export const deduplicarPedidos = (pedidos) => {
  const normalizeDigits = (s) => (s || '').toString().replace(/\D/g, '')
  const numerosRaw = pedidos
    .map(p => (p.Remessa || '').trim())
    .filter(Boolean)

  const seenRoots = new Set()
  const numeros = []
  for (const n of numerosRaw) {
    const root = normalizeDigits(n)
    if (!root) continue
    if (seenRoots.has(root)) continue
    seenRoots.add(root)
    numeros.push(n) // mantém formato original para cópia
  }
  return numeros
}

/**
 * Calcula estatísticas dos pedidos
 * @param {Array} pedidos - Array de objetos de pedidos
 * @returns {Object} Objeto com estatísticas calculadas
 */
export const calcularEstatisticasPedidos = (pedidos) => {
  const cidades = new Set()
  const statusCount = {
    entregues: 0,
    nao_entregues: 0,
    outros: 0
  }

  pedidos.forEach(pedido => {
    // Coletar cidades únicas
    const cidade = pedido['Cidade Destino']
    if (cidade && cidade.trim()) {
      cidades.add(cidade.trim())
    }

    // Contar status
    const status = pedido['Marca de assinatura']?.toLowerCase() || ''
    if (status.includes('recebimento com assinatura normal') || status.includes('assinatura de devolução')) {
      statusCount.entregues++
    } else if (status.includes('não entregue') || status.includes('nao entregue')) {
      statusCount.nao_entregues++
    } else {
      statusCount.outros++
    }
  })

  return {
    totalPedidos: pedidos.length,
    totalCidades: cidades.size,
    cidades: Array.from(cidades).sort(),
    statusCount
  }
}

/**
 * Extrai número do pedido de diferentes campos possíveis
 * @param {Object} pedido - Objeto de pedido
 * @returns {string|null} Número do pedido ou null
 */
export const extrairNumeroPedido = (pedido) => {
  return pedido['Remessa'] ||
    pedido['Número de pedido JMS'] ||
    pedido['Nº DO PEDIDO'] ||
    pedido['NUMERO_PEDIDO'] ||
    pedido['numero_pedido'] ||
    pedido['Número do Pedido'] ||
    null
}

