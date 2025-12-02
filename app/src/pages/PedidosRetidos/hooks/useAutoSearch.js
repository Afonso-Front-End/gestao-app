import { useState, useEffect } from 'react'

/**
 * Hook para gerenciar busca automática de pedidos
 * @param {Array} availableBases - Bases disponíveis
 * @param {Array} availableTipos - Tipos disponíveis
 * @param {Array} availableAging - Aging disponíveis
 * @param {boolean} basesLoading - Se está carregando bases
 * @param {boolean} tiposLoading - Se está carregando tipos
 * @param {boolean} agingLoading - Se está carregando aging
 * @param {Array} selectedBases - Bases selecionadas
 * @param {Array} selectedTipos - Tipos selecionados
 * @param {Array} selectedAging - Aging selecionados
 * @param {Function} handleSearchPedidos - Função para buscar pedidos
 * @returns {Object} Estado e funções relacionadas à busca automática
 */
const useAutoSearch = (
  availableBases,
  availableTipos,
  availableAging,
  basesLoading,
  tiposLoading,
  agingLoading,
  selectedBases,
  selectedTipos,
  selectedAging,
  handleSearchPedidos
) => {
  const [autoSearchDone, setAutoSearchDone] = useState(false)

  // Buscar pedidos automaticamente quando os dados do servidor estiverem carregados
  useEffect(() => {
    // Só buscar se os dados estiverem carregados, não estiver carregando e ainda não foi feita a busca automática
    if (!autoSearchDone && !basesLoading && !tiposLoading && !agingLoading &&
      availableBases.length > 0 && availableTipos.length > 0 && availableAging.length > 0) {

      // Verificar se os valores padrão existem nos dados do servidor
      const basesExistem = selectedBases.every(base => availableBases.includes(base))
      const tiposExistem = selectedTipos.every(tipo => availableTipos.includes(tipo))
      const agingExistem = selectedAging.every(aging => availableAging.includes(aging))

      if (basesExistem && tiposExistem && agingExistem) {
        setAutoSearchDone(true) // Marcar que já foi feita a busca automática
        handleSearchPedidos()
      }
    }
  }, [
    autoSearchDone,
    basesLoading,
    tiposLoading,
    agingLoading,
    availableBases,
    availableTipos,
    availableAging,
    selectedBases,
    selectedTipos,
    selectedAging,
    handleSearchPedidos
  ])

  return {
    autoSearchDone,
    setAutoSearchDone
  }
}

export default useAutoSearch

