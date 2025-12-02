import React, { useState } from 'react'
import { IoMap, IoHourglass, IoCheckmark, IoClose } from 'react-icons/io5'
import { MdError } from 'react-icons/md'
import { useRefresh } from '../../contexts/RefreshContext'
import './CitySelector.css'

const CitySelector = ({ baseName, selectedCities, onCitiesChange, availableCities = [], loading = false, error = null, disabled = false }) => {
  const { triggerRefresh } = useRefresh()
  const cities = availableCities || []
  const [showDropdown, setShowDropdown] = useState(false)

  const handleCityToggle = (city) => {
    if (disabled) return
    
    const newSelectedCities = selectedCities.includes(city)
      ? selectedCities.filter(c => c !== city)
      : [...selectedCities, city]
    
    onCitiesChange(newSelectedCities)
  }

  const toggleDropdown = () => {
    if (disabled) return
    setShowDropdown(!showDropdown)
  }

  const handleSelectAll = () => {
    if (disabled) return
    onCitiesChange([...cities])
  }

  const handleSelectNone = () => {
    if (disabled) return
    onCitiesChange([])
  }

  if (!baseName) {
    return (
      <div className="sla-city-selector">
        <button className="sla-cities-toggle-btn" disabled title="Selecione uma base primeiro">
          <IoMap size={20} />
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="sla-city-selector">
        <button className="sla-cities-toggle-btn" disabled title="Carregando cidades...">
          <IoHourglass size={20} className="sla-spinning" />
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sla-city-selector">
        <button 
          className="sla-cities-toggle-btn" 
          onClick={triggerRefresh}
          disabled={disabled}
          title={`Erro ao carregar cidades. Clique para tentar novamente. ${error}`}
        >
          <MdError size={20} />
          <span className="sla-cities-text">Erro - Clique para tentar</span>
        </button>
      </div>
    )
  }

  const getDisplayText = () => {
    if (selectedCities.length === 0) {
      return `Cidades (${cities.length})`
    } else if (selectedCities.length === 1) {
      return selectedCities[0]
    } else if (selectedCities.length === cities.length) {
      return `Todas (${selectedCities.length})`
    } else {
      return `${selectedCities.length} selecionadas`
    }
  }

  return (
    <div className="sla-city-selector">
      <button 
        className="sla-cities-toggle-btn"
        onClick={toggleDropdown}
        disabled={disabled}
        title={selectedCities.length > 0 
          ? `${selectedCities.length} cidades selecionadas` 
          : `Cidades de ${baseName} (${cities.length})`
        }
      >
        <IoMap size={20} />
        <span className="sla-cities-text">{getDisplayText()}</span>
        <span className={`sla-dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
      </button>
      
      {showDropdown && (
        <div className="sla-cities-grid">
          <div className="sla-selector-actions">
            <button 
              onClick={handleSelectAll}
              disabled={disabled}
              className="sla-action-btn sla-select-all"
              title="Selecionar Todas"
            >
              <IoCheckmark size={20} />
            </button>
            <button 
              onClick={handleSelectNone}
              disabled={disabled}
              className="sla-action-btn sla-select-none"
              title="Limpar Todas"
            >
              <IoClose size={20} />
            </button>
          </div>
          
          <div className="sla-selected-count">
            {selectedCities.length} de {cities.length} cidades selecionadas
          </div>
          
          {cities.map((city) => (
            <div
              key={city}
              className={`sla-city-item ${selectedCities.includes(city) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => handleCityToggle(city)}
            >
              <input
                type="checkbox"
                checked={selectedCities.includes(city)}
                onChange={() => handleCityToggle(city)}
                disabled={disabled}
                className="sla-city-checkbox"
              />
              <span className="sla-city-name">{city}</span>
            </div>
          ))}
          
          {cities.length === 0 && (
            <div className="sla-no-data">
              Nenhuma cidade encontrada para esta base.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CitySelector
