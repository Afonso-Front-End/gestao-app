import { useState } from 'react'
import { useNotification } from '../../../contexts/NotificationContext'
import { limparCachePedidos } from '../utils/motoristaUtils'

/**
 * Hook para gerenciar lotes de pedidos
 * @returns {Object} Estado e funções relacionadas aos lotes
 */
const usePedidosLotes = () => {
  const [pedidosLotes, setPedidosLotes] = useState([])
  const { showSuccess, showError, showLoading, hideLoading } = useNotification()

  /**
   * Cria lotes a partir de um array de pedidos
   * @param {Array} pedidos - Array de pedidos
   * @returns {Array} Array de lotes
   */
  const criarLotes = (pedidos) => {
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      return { lotes: [], totalPedidos: 0 }
    }

    // Deduplicar por raiz numérica para garantir alinhamento com WPS/servidor
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

    const lotes = []
    const tamanho = 1000
    for (let i = 0; i < numeros.length; i += tamanho) {
      lotes.push({
        numero_lote: Math.floor(i / tamanho) + 1,
        total_pedidos: Math.min(tamanho, numeros.length - i),
        pedidos: numeros.slice(i, i + tamanho), // array de strings
      })
    }

    return { lotes, totalPedidos: numeros.length }
  }

  /**
   * Processa resultado de busca de pedidos e cria lotes
   * @param {Object} result - Resultado da busca de pedidos filtrados
   * @param {Function} setTotalPedidos - Função para atualizar total de pedidos
   */
  const processarPedidosFiltrados = (result, setTotalPedidos) => {
    if (result && Array.isArray(result.data)) {
      const { lotes, totalPedidos } = criarLotes(result.data)
      
      setPedidosLotes(lotes)
      if (setTotalPedidos) {
        setTotalPedidos(totalPedidos)
      }

      // Limpar cache quando novos dados são carregados
      limparCachePedidos()

      showSuccess(`✅ ${totalPedidos || 0} pedidos encontrados e divididos em ${lotes.length} lotes!`)
      
      return { lotes, totalPedidos }
    }
    
    return { lotes: [], totalPedidos: 0 }
  }

  /**
   * Copia um lote específico para a área de transferência
   * @param {Object} lote - Objeto do lote
   */
  const copiarLote = async (lote) => {
    const loadingId = showLoading(`Copiando lote ${lote.numero_lote}...`, '📋 Processando')

    try {
      const numeros = lote.pedidos || []

      if (numeros.length === 0) {
        showError('Nenhum número de pedido válido encontrado neste lote.')
        return
      }

      // Simular um pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 800))

      await navigator.clipboard.writeText(numeros.join('\n'))
      showSuccess(`📋 Lote ${lote.numero_lote} copiado! ${numeros.length} números de pedidos copiados para a área de transferência.`)
    } catch (error) {
      showError('Erro ao copiar lote. Tente novamente.')
      console.error('Erro ao copiar lote:', error)
    } finally {
      hideLoading(loadingId)
    }
  }

  /**
   * Limpa todos os lotes
   */
  const limparLotes = () => {
    setPedidosLotes([])
  }

  return {
    pedidosLotes,
    setPedidosLotes,
    criarLotes,
    processarPedidosFiltrados,
    copiarLote,
    limparLotes
  }
}

export default usePedidosLotes

