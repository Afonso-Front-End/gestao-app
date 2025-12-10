import React, { memo, useState, useRef, useEffect, useMemo } from 'react'
import { IoChevronDown, IoCheckmark, IoSearchOutline } from "react-icons/io5"
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
  className = "",
  enableSearch = false,
  searchPlaceholder = "Pesquisar..."
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('') // Limpar pesquisa ao fechar
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Focar no input de pesquisa quando o dropdown abrir e a pesquisa estiver habilitada
  useEffect(() => {
    if (isOpen && enableSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, enableSearch])

  // Ordenar opções alfabeticamente
  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => {
      // Tentar ordenação numérica se ambos forem números
      const numA = parseFloat(a)
      const numB = parseFloat(b)
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }
      // Caso contrário, ordenação alfabética
      return String(a).localeCompare(String(b), 'pt-BR', { numeric: true, sensitivity: 'base' })
    })
  }, [options])

  // Filtrar opções baseado no termo de pesquisa
  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchTerm.trim()) {
      return sortedOptions
    }
    
    const term = searchTerm.toLowerCase().trim()
    return sortedOptions.filter(option => 
      String(option).toLowerCase().includes(term)
    )
  }, [sortedOptions, searchTerm, enableSearch])

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
    // Se houver pesquisa, selecionar apenas as opções filtradas
    const optionsToSelect = enableSearch && searchTerm.trim() 
      ? filteredOptions 
      : options
    setSelectedValues([...optionsToSelect])
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

  const isAllSelected = useMemo(() => {
    if (enableSearch && searchTerm.trim()) {
      // Se houver pesquisa, verificar se todas as opções filtradas estão selecionadas
      return filteredOptions.length > 0 && filteredOptions.every(opt => selectedValues.includes(opt))
    }
    return selectedValues.length === options.length
  }, [selectedValues, options, filteredOptions, enableSearch, searchTerm])

  const hasSelection = selectedValues.length > 0

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
                disabled={isAllSelected || filteredOptions.length === 0}
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
            
            {enableSearch && (
              <div className="multi-select-search">
                <IoSearchOutline className="multi-select-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="multi-select-search-input"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchTerm('')
                    }
                  }}
                />
              </div>
            )}
            
            <div className="multi-select-list">
              {filteredOptions.length === 0 ? (
                <div className="multi-select-empty">
                  <span>
                    {enableSearch && searchTerm.trim() 
                      ? `Nenhuma opção encontrada para "${searchTerm}"` 
                      : "Nenhuma opção disponível"}
                  </span>
                </div>
              ) : (
                filteredOptions.map(option => (
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
