import React from 'react'
import BaseSelectorProcessed from '../BaseSelectorProcessed/BaseSelectorProcessed'
import CitySelector from '../CitySelector/CitySelector'
import ToggleStatusColumnButton from '../ToggleStatusColumnButton/ToggleStatusColumnButton'
import './SLAHeader.css'

const SLAHeader = ({
  selectedProcessedBase,
  onProcessedBaseChange,
  selectedCities,
  onCitiesChange,
  availableCities,
  citiesLoading,
  citiesError,
  showStatusColumn,
  onToggleStatusColumn
}) => {
  return (
    <div>
      {/* Área Secundária - Visualização e Filtros */}
      <div className="sla-secondary-section">
        <BaseSelectorProcessed
          selectedBase={selectedProcessedBase}
          onBaseChange={onProcessedBaseChange}
        />
        <CitySelector
          baseName={selectedProcessedBase}
          selectedCities={selectedCities}
          onCitiesChange={onCitiesChange}
          availableCities={availableCities}
          loading={citiesLoading}
          error={citiesError}
        />
        {selectedProcessedBase && (
          <ToggleStatusColumnButton
            isVisible={showStatusColumn}
            onClick={onToggleStatusColumn}
          />
        )}
      </div>
    </div>
  )
}

export default SLAHeader
