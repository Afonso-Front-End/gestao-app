import React from 'react'
import './FiltersApplied.css'

const FiltersApplied = ({ selectedTiposOperacao, selectedAgings }) => {
  return (
    <div className="sem-movimentacao-sc-details-section">
      <h3>Filtros Aplicados</h3>
      <div className="sem-movimentacao-sc-filters-applied">
        {selectedTiposOperacao.length > 0 && (
          <div className="sem-movimentacao-sc-filter-badge">
            <strong>Tipo de Operação:</strong> {selectedTiposOperacao.join(', ')}
          </div>
        )}
        {selectedAgings.length > 0 && (
          <div className="sem-movimentacao-sc-filter-badge">
            <strong>Aging:</strong> {selectedAgings.join(', ')}
          </div>
        )}
        {selectedTiposOperacao.length === 0 && selectedAgings.length === 0 && (
          <div className="sem-movimentacao-sc-filter-badge">
            Nenhum filtro aplicado
          </div>
        )}
      </div>
    </div>
  )
}

export default FiltersApplied

