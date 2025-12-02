import React from 'react'
import MultiSelect from '../../../PedidosRetidos/components/MultiSelect'
import FilterDropdown from '../../../PedidosRetidos/components/FilterDropdown/FilterDropdown'
import { STORAGE_KEYS } from '../../constants/D1Constants'

const D1Filters = ({
  saveBasesEnabled,
  setSaveBasesEnabled,
  selectedBasesBipagens,
  setSelectedBasesBipagens,
  basesBipagens,
  loadingBasesBipagens,
  selectedTemposParados,
  setSelectedTemposParados,
  temposParados,
  saveTemposEnabled,
  setSaveTemposEnabled,
  selectedCidades,
  setSelectedCidades,
  cidadesData,
  loadingCidades
}) => {
  const handleSaveBasesChange = (e) => {
    setSaveBasesEnabled(e.target.checked)
    if (!e.target.checked) {
      localStorage.removeItem(STORAGE_KEYS.BIPAGENS_SAVED_BASES)
    }
  }

  const handleSaveTemposChange = (e) => {
    setSaveTemposEnabled(e.target.checked)
    if (!e.target.checked) {
      localStorage.removeItem(STORAGE_KEYS.BIPAGENS_SAVED_TEMPOS)
    }
  }

  const totalFiltros = selectedBasesBipagens.length + selectedTemposParados.length + selectedCidades.length

  return (
    <div className="d1-bipagens-filters">
      <FilterDropdown
        label="Filtros de Busca"
        badgeCount={totalFiltros}
      >
        <div className="d1-filter-group">
          <div className="d1-filter-label-wrapper">
            <input
              type="checkbox"
              className="d1-save-bases-checkbox"
              checked={saveBasesEnabled}
              onChange={handleSaveBasesChange}
            />
            <span className="d1-filter-label-text">Base:</span>
          </div>
          <MultiSelect
            selectedValues={selectedBasesBipagens}
            setSelectedValues={setSelectedBasesBipagens}
            options={basesBipagens}
            placeholder="Selecione as bases"
            selectAllText="Selecionar Todas"
            clearAllText="Limpar Todas"
            allSelectedText="Todas as bases selecionadas"
            showCount={true}
            disabled={loadingBasesBipagens}
            className="theme-green"
          />
        </div>
        <div className="d1-filter-group">
          <div className="d1-filter-label-wrapper">
            <input
              type="checkbox"
              className="d1-save-tempos-checkbox"
              checked={saveTemposEnabled}
              onChange={handleSaveTemposChange}
            />
            <span className="d1-filter-label-text">Tempo de Pedido Parado:</span>
          </div>
          <MultiSelect
            selectedValues={selectedTemposParados}
            setSelectedValues={setSelectedTemposParados}
            options={temposParados}
            placeholder="Selecione os tempos"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos os tempos selecionados"
            showCount={true}
            disabled={loadingBasesBipagens}
            className="theme-blue"
          />
        </div>
        {selectedBasesBipagens.length > 0 && (
          <div className="d1-filter-group">
            <label>Cidade Destino:</label>
            <MultiSelect
              selectedValues={selectedCidades}
              setSelectedValues={setSelectedCidades}
              options={cidadesData}
              placeholder="Selecione as cidades"
              selectAllText="Selecionar Todas"
              clearAllText="Limpar Todas"
              allSelectedText="Todas as cidades selecionadas"
              showCount={true}
              disabled={loadingCidades || cidadesData.length === 0}
              className="theme-purple"
            />
          </div>
        )}
      </FilterDropdown>
    </div>
  )
}

export default D1Filters

