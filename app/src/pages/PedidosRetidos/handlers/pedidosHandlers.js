/**
 * Handlers para operações relacionadas a pedidos
 */

import { deduplicarPedidos, criarLotes } from '../utils/pedidosUtils'

/**
 * Handler para buscar pedidos filtrados
 * @param {Object} params - Parâmetros da busca
 * @param {Array} params.selectedBases - Bases selecionadas
 * @param {Array} params.selectedTipos - Tipos selecionados
 * @param {Array} params.selectedAging - Aging selecionados
 * @param {Function} params.fetchFilteredPedidos - Função para buscar pedidos filtrados
 * @param {Function} params.setPedidosLotes - Função para atualizar lotes
 * @param {Function} params.setTotalPedidos - Função para atualizar total
 * @param {Function} params.showSuccess - Função para mostrar sucesso
 * @param {Function} params.showError - Função para mostrar erro
 * @param {Function} params.showLoading - Função para mostrar loading
 * @param {Function} params.hideLoading - Função para esconder loading
 */
export const handleSearchPedidos = async ({
  selectedBases,
  selectedTipos,
  selectedAging,
  fetchFilteredPedidos,
  setPedidosLotes,
  setTotalPedidos,
  showSuccess,
  showError,
  showLoading,
  hideLoading
}) => {
  // Verificar se pelo menos um filtro foi selecionado
  if (selectedBases.length === 0 && selectedTipos.length === 0 && selectedAging.length === 0) {
    showError('Selecione pelo menos um filtro (bases, tipos de operação ou aging) antes de buscar.')
    return
  }

  const filters = {
    bases: selectedBases,
    tipos: selectedTipos,
    aging: selectedAging,
    limit: 10000 // Buscar mais pedidos para dividir em lotes
  }

  // Mostrar notificação de loading
  const loadingId = showLoading('Buscando pedidos filtrados...', '🔍 Processando')

  try {
    const result = await fetchFilteredPedidos(filters)

    if (result && Array.isArray(result.data)) {
      // Construir lotes localmente a partir de filtered-pedidos
      // Deduplicar por raiz numérica para garantir alinhamento com WPS/servidor
      const numeros = deduplicarPedidos(result.data)

      const lotes = criarLotes(numeros, 1000)

      setPedidosLotes(lotes)
      setTotalPedidos(numeros.length || 0)

      showSuccess(`✅ ${numeros.length || 0} pedidos encontrados e divididos em ${lotes.length} lotes!`)
    }
  } catch (error) {
    showError('Erro ao buscar pedidos. Tente novamente.')
  } finally {
    // Esconder notificação de loading
    hideLoading(loadingId)
  }
}

/**
 * Handler para limpar filtros e resultados
 * @param {Object} params - Parâmetros
 * @param {Function} params.setSelectedBases - Função para limpar bases
 * @param {Function} params.setSelectedTipos - Função para limpar tipos
 * @param {Function} params.setSelectedAging - Função para limpar aging
 * @param {Function} params.clearPedidos - Função para limpar pedidos
 * @param {Function} params.setPedidosLotes - Função para limpar lotes
 * @param {Function} params.setAutoSearchDone - Função para resetar busca automática
 * @param {Function} params.showInfo - Função para mostrar informação
 */
export const handleClearFilters = ({
  setSelectedBases,
  setSelectedTipos,
  setSelectedAging,
  clearPedidos,
  setPedidosLotes,
  setAutoSearchDone,
  showInfo
}) => {
  setSelectedBases([])
  setSelectedTipos([])
  setSelectedAging([])
  clearPedidos()
  setPedidosLotes([])
  setAutoSearchDone(false) // Resetar para permitir nova busca automática
  showInfo('Filtros e resultados limpos com sucesso!')
}

