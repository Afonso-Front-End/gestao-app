import React, { memo, useState, useRef, useEffect } from 'react'
import { IoChevronDown, IoCheckmark } from "react-icons/io5"
import './MultiSelect.css'

const MultiSelect = memo(({ 
  selectedValues, 
  setSelectedValues, 
  options = [],
  placeholder = "Selecionar opções",
  selectAllText = "Selecionar Todas",
  clearAllText = "Limpar Todas",
  emptyText = "Nenhuma opção selecionada",
  allSelectedText = "Todas selecionadas",
  showCount = true,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleToggle = (value) => {
    if (disabled) return
    
    setSelectedValues(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value)
      } else {
        return [...prev, value]
      }
    })
  }

  const clearAllFilters = () => {
    if (disabled) return
    setSelectedValues([])
  }

  const selectAllOptions = () => {
    if (disabled) return
    setSelectedValues([...options])
  }

  const getDisplayText = () => {
    if (disabled) return placeholder
    
    if (selectedValues.length === 0) {
      return showCount ? `${placeholder} (${options.length})` : placeholder
    } else if (selectedValues.length === 1) {
      return selectedValues[0]
    } else if (selectedValues.length === options.length) {
      return showCount ? `${allSelectedText} (${selectedValues.length})` : allSelectedText
    } else {
      return showCount ? `${selectedValues.length} selecionados (de ${options.length})` : `${selectedValues.length} selecionados`
    }
  }

  const isAllSelected = selectedValues.length === options.length
  const hasSelection = selectedValues.length > 0

  // Ordenar opções alfabeticamente
  const sortedOptions = [...options].sort((a, b) => {
    // Tentar ordenação numérica se ambos forem números
    const numA = parseFloat(a)
    const numB = parseFloat(b)
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB
    }
    // Caso contrário, ordenação alfabética
    return String(a).localeCompare(String(b), 'pt-BR', { numeric: true, sensitivity: 'base' })
  })

  return (
    <div className={`filter-controls ${className}`}>
      <div className={`multi-select-container ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
        <div 
          className={`multi-select-dropdown ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="multi-select-text">{getDisplayText()}</span>
          <IoChevronDown className={`multi-select-arrow ${isOpen ? 'rotated' : ''}`} />
        </div>

        {isOpen && !disabled && (
          <div className="multi-select-options">
            <div className="multi-select-actions">
              <button 
                className="select-all-btn"
                onClick={selectAllOptions}
                disabled={isAllSelected}
              >
                {selectAllText}
              </button>
              <button 
                className="clear-all-btn"
                onClick={clearAllFilters}
                disabled={!hasSelection}
              >
                {clearAllText}
              </button>
            </div>
            
            <div className="multi-select-list">
              {sortedOptions.length === 0 ? (
                <div className="multi-select-empty">
                  <span>Nenhuma opção disponível</span>
                </div>
              ) : (
                sortedOptions.map(option => (
                  <div 
                    key={option}
                    className={`multi-select-option ${selectedValues.includes(option) ? 'selected' : ''}`}
                    onClick={() => handleToggle(option)}
                  >
                    <div className="option-checkbox">
                      {selectedValues.includes(option) && <IoCheckmark />}
                    </div>
                    <span className="option-text">{option}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default MultiSelect
