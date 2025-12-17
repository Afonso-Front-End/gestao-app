import { useMemo } from 'react'

/**
 * Hook para gerenciar filtros de colunas
 */
export const useFiltrosColunas = (remessasUnicas, selectedBaseEntregaFiltro) => {
  // Obter opções únicas de Base de Entrega dos dados filtrados
  const opcoesBaseEntrega = useMemo(() => {
    const bases = new Set()
    remessasUnicas.forEach(item => {
      if (item.base_entrega) {
        bases.add(item.base_entrega)
      }
    })
    return Array.from(bases).sort()
  }, [remessasUnicas])

  // Filtrar dados baseado nos filtros de colunas selecionados
  const dadosFiltradosColunas = useMemo(() => {
    let filtrados = remessasUnicas

    if (selectedBaseEntregaFiltro.length > 0) {
      filtrados = filtrados.filter(item => 
        selectedBaseEntregaFiltro.includes(item.base_entrega || '')
      )
    }

    return filtrados
  }, [remessasUnicas, selectedBaseEntregaFiltro])

  return {
    opcoesBaseEntrega,
    dadosFiltradosColunas
  }
}

