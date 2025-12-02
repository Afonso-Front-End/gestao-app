import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { FaFilter, FaTimes, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import './TableFilterBar.css'

const TableFilterBar = ({ columns, data, onFilterChange }) => {
  const [filters, setFilters] = useState({}) // { columnName: Set of selected values }
  const [searchTerms, setSearchTerms] = useState({}) // { columnName: search string }
  const [expandedColumns, setExpandedColumns] = useState({}) // { columnName: boolean }
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Colunas que devem ter filtro
  const filterableColumns = [
    'Número de pedido JMS',
    'Base de entrega',
    'Horário de saída para entrega',
    'Marca de assinatura',
    'CEP destino',
    'Destinatário',
    'Tempo de Pedido parado',
    'Complemento',
    'Cidade Destino',
    '3 Segmentos',
    'Distrito destinatário'
  ]

  // Função para extrair apenas a data de um valor de data/hora
  const extractDateOnly = useCallback((value) => {
    if (!value) return ''
    const str = String(value).trim()
    
    // Primeiro, remover qualquer hora que possa estar presente
    // Dividir por espaço e pegar apenas a primeira parte (data)
    const parts = str.split(/\s+/)
    const datePart = parts[0] || str
    
    // Tentar extrair data no formato DD/MM/YYYY ou DD-MM-YYYY
    // Padrão: DD/MM/YYYY ou DD-MM-YYYY
    let dateMatch = datePart.match(/^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/)
    if (dateMatch) {
      return dateMatch[1]
    }
    
    // Tentar formato com ano de 2 dígitos: DD/MM/YY
    dateMatch = datePart.match(/^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2})/)
    if (dateMatch) {
      return dateMatch[1]
    }
    
    // Tentar formato ISO: YYYY-MM-DD
    dateMatch = datePart.match(/^(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/)
    if (dateMatch) {
      // Converter para DD/MM/YYYY
      const isoParts = dateMatch[1].split(/[\/\-]/)
      if (isoParts.length === 3) {
        return `${isoParts[2]}/${isoParts[1]}/${isoParts[0]}`
      }
      return dateMatch[1]
    }
    
    // Se não encontrar padrão, retornar a primeira parte (pode ser que já seja só a data)
    return datePart
  }, [])

  // Extrair valores únicos de cada coluna
  const uniqueValues = useMemo(() => {
    if (!data || data.length === 0) return {}
    
    const values = {}
    filterableColumns.forEach(columnName => {
      const uniqueSet = new Set()
      const isDateColumn = columnName === 'Horário de saída para entrega'
      
      data.forEach(row => {
        let value = row[columnName] || 
                   row[columnName.toLowerCase()] || 
                   row[columnName.toUpperCase()] ||
                   ''
        value = String(value || '').trim()
        
        if (value && value !== 'N/A' && value !== '') {
          // Se for coluna de data, extrair apenas a data
          if (isDateColumn) {
            const dateOnly = extractDateOnly(value)
            // Garantir que extraímos apenas a data (sem hora)
            // Se ainda tiver hora, tentar novamente com split
            if (dateOnly && dateOnly.includes(' ')) {
              const datePart = dateOnly.split(' ')[0]
              if (datePart) {
                uniqueSet.add(datePart)
              }
            } else if (dateOnly) {
              uniqueSet.add(dateOnly)
            }
          } else {
            uniqueSet.add(value)
          }
        }
      })
      
      values[columnName] = Array.from(uniqueSet).sort((a, b) => {
        // Para datas, tentar ordenar cronologicamente
        if (isDateColumn) {
          // Converter DD/MM/YYYY para objeto Date para comparação
          const parseDate = (dateStr) => {
            const parts = dateStr.split(/[\/\-]/)
            if (parts.length === 3) {
              const day = parseInt(parts[0], 10)
              const month = parseInt(parts[1], 10) - 1
              const year = parseInt(parts[2], 10)
              if (parts[2].length === 2) {
                // Se ano tem 2 dígitos, assumir 20XX
                return new Date(2000 + year, month, day)
              }
              return new Date(year, month, day)
            }
            return null
          }
          
          const dateA = parseDate(a)
          const dateB = parseDate(b)
          
          if (dateA && dateB) {
            return dateA - dateB
          }
        }
        
        // Tentar ordenar numericamente se ambos forem números
        const aNum = parseFloat(a)
        const bNum = parseFloat(b)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        // Caso contrário, ordenar alfabeticamente
        return a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' })
      })
    })
    return values
  }, [data, extractDateOnly])

  // Contar filtros ativos
  useEffect(() => {
    const count = Object.values(filters).filter(selectedValues => 
      selectedValues && selectedValues.size > 0
    ).length
    setActiveFiltersCount(count)
  }, [filters])

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(selectedValues => 
      selectedValues && selectedValues.size > 0
    )
  }, [filters])

  // Aplicar filtros aos dados
  const applyFilters = useMemo(() => {
    if (!data || data.length === 0) return data || []

    // Se não há filtros ativos, retornar todos os dados
    if (!hasActiveFilters) {
      return data
    }

    return data.filter(row => {
      return filterableColumns.every(columnName => {
        const selectedValues = filters[columnName]
        
        // Se não há filtro para esta coluna, passar
        if (!selectedValues || selectedValues.size === 0) {
          return true
        }

        // Buscar valor na linha (com fallbacks)
        let cellValue = row[columnName] || 
                       row[columnName.toLowerCase()] || 
                       row[columnName.toUpperCase()] ||
                       ''

        // Converter para string
        cellValue = String(cellValue || '').trim()

        // Se for coluna de data, extrair apenas a data para comparação
        const isDateColumn = columnName === 'Horário de saída para entrega'
        if (isDateColumn) {
          const dateOnly = extractDateOnly(cellValue)
          return selectedValues.has(dateOnly)
        }

        // Verificar se o valor está na lista de valores selecionados
        return selectedValues.has(cellValue)
      })
    })
  }, [data, filters, filterableColumns, hasActiveFilters, extractDateOnly])

  // Notificar mudanças nos dados filtrados
  useEffect(() => {
    if (onFilterChange) {
      if (data && data.length > 0) {
        // Garantir que sempre retornamos um array válido
        const result = applyFilters && applyFilters.length >= 0 ? applyFilters : data
        onFilterChange(result)
      } else {
        // Se não há dados, retornar array vazio
        onFilterChange([])
      }
    }
  }, [applyFilters, onFilterChange, data])

  // Toggle seleção de um valor
  const toggleValue = (columnName, value) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      if (!newFilters[columnName]) {
        newFilters[columnName] = new Set()
      }
      const selectedValues = new Set(newFilters[columnName])
      
      if (selectedValues.has(value)) {
        selectedValues.delete(value)
      } else {
        selectedValues.add(value)
      }
      
      if (selectedValues.size === 0) {
        delete newFilters[columnName]
      } else {
        newFilters[columnName] = selectedValues
      }
      
      return newFilters
    })
  }

  // Selecionar todos os valores de uma coluna
  const selectAll = (columnName) => {
    const allValues = uniqueValues[columnName] || []
    setFilters(prev => {
      const newFilters = { ...prev }
      newFilters[columnName] = new Set(allValues)
      return newFilters
    })
  }

  // Desmarcar todos os valores de uma coluna
  const deselectAll = (columnName) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[columnName]
      return newFilters
    })
  }

  // Limpar filtro de uma coluna
  const clearFilter = (columnName) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      delete newFilters[columnName]
      return newFilters
    })
    setSearchTerms(prev => {
      const newSearchTerms = { ...prev }
      delete newSearchTerms[columnName]
      return newSearchTerms
    })
  }

  // Limpar todos os filtros
  const clearAllFilters = () => {
    setFilters({})
    setSearchTerms({})
  }

  // Toggle expandir/colapsar coluna
  const toggleColumn = (columnName) => {
    setExpandedColumns(prev => ({
      ...prev,
      [columnName]: !prev[columnName]
    }))
  }

  // Filtrar valores únicos baseado no termo de busca
  const getFilteredValues = (columnName) => {
    const searchTerm = searchTerms[columnName] || ''
    if (!searchTerm || searchTerm.trim() === '') {
      return uniqueValues[columnName] || []
    }
    
    const term = searchTerm.toLowerCase().trim()
    return (uniqueValues[columnName] || []).filter(value => 
      String(value).toLowerCase().includes(term)
    )
  }

  // Verificar se uma coluna está visível nas colunas da tabela
  const isColumnVisible = (columnName) => {
    if (!columns || columns.length === 0) return true
    
    return columns.some(col => {
      const colName = typeof col === 'string' ? col : (col.header || col.key || '')
      return colName === columnName || 
             colName.toLowerCase() === columnName.toLowerCase()
    })
  }

  // Filtrar apenas colunas visíveis
  const visibleFilterableColumns = filterableColumns.filter(isColumnVisible)

  if (visibleFilterableColumns.length === 0) {
    return null
  }

  return (
    <div className="sla-table-filter-bar">
      <div className="sla-table-filter-bar-header">
        <button
          className={`sla-table-filter-toggle ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'}
        >
          <FaFilter />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="sla-table-filter-badge">{activeFiltersCount}</span>
          )}
        </button>
        {activeFiltersCount > 0 && (
          <button
            className="sla-table-filter-clear-all"
            onClick={clearAllFilters}
            title="Limpar todos os filtros"
          >
            <FaTimes size={20} />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="sla-table-filter-content">
          <div className="sla-table-filter-grid">
            {visibleFilterableColumns.map(columnName => {
              const selectedValues = filters[columnName] || new Set()
              const hasFilter = selectedValues.size > 0
              const isColumnExpanded = expandedColumns[columnName] || false
              const values = uniqueValues[columnName] || []
              const filteredValues = getFilteredValues(columnName)
              const searchTerm = searchTerms[columnName] || ''
              const allSelected = values.length > 0 && selectedValues.size === values.length

              return (
                <div key={columnName} className="sla-table-filter-item">
                  <div className="sla-table-filter-header">
                    <label className="sla-table-filter-label">
                      {columnName}
                      {hasFilter && (
                        <span className="sla-table-filter-count">({selectedValues.size})</span>
                      )}
                    </label>
                    <div className="sla-table-filter-actions">
                      {hasFilter && (
                        <>
                          <button
                            className="sla-table-filter-action-btn"
                            onClick={() => allSelected ? deselectAll(columnName) : selectAll(columnName)}
                            title={allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
                          >
                            {allSelected ? 'Desmarcar' : 'Todos'}
                          </button>
                          <button
                            className="sla-table-filter-clear-btn"
                            onClick={() => clearFilter(columnName)}
                            title="Limpar filtro"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                      <button
                        className="sla-table-filter-expand-btn"
                        onClick={() => toggleColumn(columnName)}
                        title={isColumnExpanded ? 'Recolher' : 'Expandir'}
                      >
                        {isColumnExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Input de pesquisa */}
                  <div className="sla-table-filter-input-wrapper">
                    <FaSearch className="sla-table-filter-search-icon" />
                    <input
                      type="text"
                      className="sla-table-filter-input"
                      placeholder={`Buscar em ${columnName}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerms(prev => ({
                        ...prev,
                        [columnName]: e.target.value
                      }))}
                    />
                    {searchTerm && (
                      <button
                        className="sla-table-filter-clear-search"
                        onClick={() => setSearchTerms(prev => {
                          const newTerms = { ...prev }
                          delete newTerms[columnName]
                          return newTerms
                        })}
                        title="Limpar busca"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>

                  {/* Lista de valores únicos */}
                  {isColumnExpanded && (
                    <div className="sla-table-filter-values">
                      {filteredValues.length > 0 ? (
                        <>
                          <div className="sla-table-filter-values-list">
                            {filteredValues.map(value => {
                              const isSelected = selectedValues.has(value)
                              return (
                                <label
                                  key={value}
                                  className="sla-table-filter-value-item"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleValue(columnName, value)}
                                  />
                                  <span>{value}</span>
                                </label>
                              )
                            })}
                          </div>
                          {filteredValues.length < values.length && (
                            <div className="sla-table-filter-values-info">
                              Mostrando {filteredValues.length} de {values.length} valores
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="sla-table-filter-no-results">
                          Nenhum valor encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {activeFiltersCount > 0 && (
            <div className="sla-table-filter-info">
              Mostrando {applyFilters.length} de {data.length} registros
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TableFilterBar

