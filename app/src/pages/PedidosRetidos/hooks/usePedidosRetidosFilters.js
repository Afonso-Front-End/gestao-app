import { useState } from 'react'

/**
 * Hook para gerenciar filtros principais (bases, tipos, aging)
 * @returns {Object} Estados e setters dos filtros
 */
const usePedidosRetidosFilters = () => {
  // Estados para filtros múltiplos com valores padrão
  const [selectedBases, setSelectedBases] = useState([
    'BNU -SC', 
    'ITJ -SC', 
    'ITP -SC', 
    'CCM -SC', 
    'JOI -SC', 
    'RDS -SC'
  ])
  
  const [selectedTipos, setSelectedTipos] = useState([
    '出仓扫描/Bipe de saída para entrega'
  ])
  
  const [selectedAging, setSelectedAging] = useState([
    'Exceed 5 days with no track',
    'Exceed 6 days with no track',
    'Exceed 7 days with no track',
    'Exceed 10 days with no track',
    'Exceed 14 days with no track',
    'Exceed 30 days with no track'
  ])

  /**
   * Limpa todos os filtros
   */
  const limparFiltros = () => {
    setSelectedBases([])
    setSelectedTipos([])
    setSelectedAging([])
  }

  return {
    // Estados
    selectedBases,
    selectedTipos,
    selectedAging,
    
    // Setters
    setSelectedBases,
    setSelectedTipos,
    setSelectedAging,
    
    // Funções
    limparFiltros
  }
}

export default usePedidosRetidosFilters

