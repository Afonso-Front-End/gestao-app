import React from 'react'
import MultiSelect from '../../../PedidosRetidos/components/MultiSelect'
import './FilterSection.css'

const FilterSection = ({
  selectedTiposOperacao,
  setSelectedTiposOperacao,
  tiposOperacao,
  selectedAgings,
  setSelectedAgings,
  agings,
  filtersLoading
}) => {
  return (
    <div className="sem-movimentacao-sc-filters-section">
      <div className="sem-movimentacao-sc-filters-header">
        <h3>Filtros de Busca</h3>
        <p>Selecione os filtros para visualizar os dados</p>
      </div>
      <div className="sem-movimentacao-sc-filters">
        <div className="filter-section-item">
          <label className="filter-section-label">
            Tipo da Última Operação
          </label>
          <MultiSelect
            selectedValues={selectedTiposOperacao}
            setSelectedValues={setSelectedTiposOperacao}
            options={tiposOperacao}
            placeholder="Selecione o tipo de operação"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos os tipos selecionados"
            showCount={true}
            disabled={filtersLoading}
            className="theme-green"
          />
        </div>
        <div className="filter-section-item">
          <label className="filter-section-label">
            Aging
          </label>
          <MultiSelect
            selectedValues={selectedAgings}
            setSelectedValues={setSelectedAgings}
            options={agings}
            placeholder="Selecione o aging"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos os agings selecionados"
            showCount={true}
            disabled={filtersLoading}
            className="theme-orange"
          />
        </div>
      </div>
    </div>
  )
}

export default FilterSection

