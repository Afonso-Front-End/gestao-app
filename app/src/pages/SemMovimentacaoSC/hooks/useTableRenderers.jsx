import { useCallback, useRef, useEffect } from 'react'

/**
 * Hook para renderizadores de tabela (células e headers)
 */
export const useTableRenderers = (rowSelection, onOpenDetailsModal) => {
  // Ref para o checkbox do header
  const headerCheckboxRef = useRef(null)

  // Atualizar estado indeterminate do checkbox do header
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = rowSelection.isIndeterminate
    }
  }, [rowSelection.isIndeterminate])

  // Função para renderizar células com tooltip
  const renderCellContent = useCallback((value, key, row) => {
    // Renderizar checkbox para coluna de seleção
    if (key === '_checkbox') {
      const remessa = row.remessa
      const isSelected = remessa && rowSelection.selectedRows.has(remessa)
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => rowSelection.handleRowSelect(remessa)}
            title={isSelected ? 'Desmarcar' : 'Marcar'}
            style={{ 
              cursor: 'pointer', 
              width: '18px', 
              height: '18px',
              margin: '0 auto'
            }}
          />
        </div>
      )
    }
    
    const text = value?.toString() || ''
    const maxLength = 50
    
    if (text.length > maxLength) {
      return (
        <span title={text} className="table-section-cell-text">
          {text.substring(0, maxLength)}...
        </span>
      )
    }
    return <span className="table-section-cell-text">{text}</span>
  }, [rowSelection])

  // Função para renderizar header com clique
  const renderHeader = useCallback((column, index) => {
    const columnKey = typeof column === 'string' ? column : column.key
    const headerText = typeof column === 'string' ? column : column.header || column.key
    const isCheckbox = typeof column === 'object' && column.isCheckbox
    
    // Header de checkbox para selecionar todas
    if (isCheckbox) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          <input
            type="checkbox"
            ref={headerCheckboxRef}
            checked={rowSelection.isAllSelected}
            onChange={rowSelection.handleSelectAll}
            title={rowSelection.isAllSelected ? 'Desmarcar todas' : rowSelection.isIndeterminate ? 'Desmarcar todas' : 'Marcar todas'}
            style={{ 
              cursor: 'pointer', 
              width: '18px', 
              height: '18px',
              margin: '0 auto'
            }}
          />
        </div>
      )
    }
    
    // Tornar "Horário da Última Operação" clicável
    if (columnKey === 'horario_ultima_operacao') {
      return (
        <span
          className="table-section-clickable-header"
          onClick={onOpenDetailsModal}
          title="Clique para ver detalhes e estatísticas"
        >
          {headerText} 📊
        </span>
      )
    }
    
    return headerText
  }, [rowSelection, onOpenDetailsModal])

  return {
    renderCellContent,
    renderHeader
  }
}

