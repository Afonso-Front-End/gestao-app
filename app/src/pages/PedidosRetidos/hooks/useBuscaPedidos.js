import { useCallback } from 'react'
import { useNotification } from '../../../contexts/NotificationContext'

/**
 * Hook para gerenciar busca de pedidos filtrados
 * @param {Object} filters - Objeto com filtros (selectedBases, selectedTipos, selectedAging)
 * @param {Function} fetchFilteredPedidos - Função para buscar pedidos filtrados
 * @param {Function} processarPedidosFiltrados - Função para processar resultado
 * @param {boolean} loading - Estado de loading
 * @returns {Object} Funções e estado relacionados à busca
 */
const useBuscaPedidos = (filters, fetchFilteredPedidos, processarPedidosFiltrados, loading = false) => {
  const { showError, showLoading, hideLoading } = useNotification()

  /**
   * Busca pedidos com base nos filtros selecionados
   */
  const buscarPedidos = useCallback(async () => {
    const { selectedBases, selectedTipos, selectedAging } = filters

    // Verificar se pelo menos um filtro foi selecionado
    if (selectedBases.length === 0 && selectedTipos.length === 0 && selectedAging.length === 0) {
      showError('Selecione pelo menos um filtro (bases, tipos de operação ou aging) antes de buscar.')
      return
    }

    const filterParams = {
      bases: selectedBases,
      tipos: selectedTipos,
      aging: selectedAging,
      limit: 10000 // Buscar mais pedidos para dividir em lotes
    }

    // Mostrar notificação de loading
    const loadingId = showLoading('Buscando pedidos filtrados...', '🔍 Processando')

    try {
      const result = await fetchFilteredPedidos(filterParams)

      if (result && Array.isArray(result.data)) {
        // Processar resultado (criar lotes, etc)
        if (processarPedidosFiltrados) {
          processarPedidosFiltrados(result)
        }
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error)
      showError('Erro ao buscar pedidos. Tente novamente.')
    } finally {
      // Esconder notificação de loading
      hideLoading(loadingId)
    }
  }, [filters, fetchFilteredPedidos, processarPedidosFiltrados, showError, showLoading, hideLoading])

  return {
    buscarPedidos,
    loading
  }
}

export default useBuscaPedidos

