import React, { useState, useRef, useEffect } from 'react'
import { FaTimes, FaEye, FaEyeSlash, FaGripVertical, FaPalette, FaBold, FaItalic, FaLock, FaLockOpen } from 'react-icons/fa'
import './TableConfigModal.css'

const TableConfigModal = ({ 
  isOpen, 
  onClose, 
  columns, 
  onUpdateOrder, 
  onToggleVisibility, 
  onUpdateStyles,
  onUpdateFixedColumns,
  onReset,
  onResetColumns,
  onResetStyles
}) => {
  const [activeTab, setActiveTab] = useState('columns') // columns, styles
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [editingColumn, setEditingColumn] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimeoutRef = useRef(null)
  const dragItemRef = useRef(null)
  
  // Ordenar colunas por order para garantir ordem correta
  // Coluna de copiar sempre primeiro (order: -1)
  const sortedColumns = [...columns].sort((a, b) => {
    const aIsCopy = a.name.toLowerCase().trim() === 'copiar' || a.name.toLowerCase().trim() === 'copy'
    const bIsCopy = b.name.toLowerCase().trim() === 'copiar' || b.name.toLowerCase().trim() === 'copy'
    
    // Se uma é copiar e outra não, copiar sempre primeiro
    if (aIsCopy && !bIsCopy) return -1
    if (!aIsCopy && bIsCopy) return 1
    
    // Caso contrário, ordenar por order
    return a.order - b.order
  })

  // Resetar estado quando modal abrir novamente
  useEffect(() => {
    if (isOpen) {
      // Limpar timeout se houver algum pendente
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      // Resetar estado de fechamento se modal foi reaberto
      setIsClosing(false)
    }
  }, [isOpen])

  // Resetar estado quando modal fechar completamente
  useEffect(() => {
    if (!isOpen && !isClosing) {
      setIsClosing(false)
    }
  }, [isOpen, isClosing])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [])

  const handleClose = () => {
    if (isClosing) return // Previne múltiplas execuções

    // Limpar timeout anterior se houver
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    setIsClosing(true)
    
    // Aguardar a animação terminar antes de chamar onClose (300ms da animação slideDown)
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null
      setIsClosing(false)
      onClose()
    }, 300)
  }

  if (!isOpen && !isClosing) return null

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    dragItemRef.current = index
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    // Usar sortedColumns para garantir ordem correta
    const newOrder = [...sortedColumns]
    const draggedItem = newOrder[draggedIndex]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(dropIndex, 0, draggedItem)

    // Passar as orders antigas na nova ordem
    // Isso permite que o hook reorganize corretamente
    const oldOrdersInNewOrder = newOrder.map(col => col.order)
    onUpdateOrder(oldOrdersInNewOrder)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleStyleChange = (columnId, styleKey, value) => {
    onUpdateStyles(columnId, { [styleKey]: value })
  }

  const getStylePreview = (styles) => {
    return {
      backgroundColor: styles.backgroundColor || 'transparent',
      color: styles.textColor || 'inherit',
      fontWeight: styles.fontWeight || 'normal',
      fontStyle: styles.fontStyle || 'normal'
    }
  }

  // Paleta de cores predefinidas baseadas nas cores do sistema
  const predefinedColors = {
    background: [
      { name: 'Transparente', value: 'transparent', color: '#ffffff' },
      { name: 'Branco', value: '#ffffff', color: '#ffffff' },
      { name: 'Vermelho Claro', value: '#fca1a1', color: '#fca1a1' },
      { name: 'Verde Claro', value: '#f0fff4', color: '#f0fff4' },
      { name: 'Cinza Claro', value: '#f8fafc', color: '#f8fafc' },
      { name: 'Cinza Médio', value: '#cccccc', color: '#cccccc' },
      { name: 'Azul Claro', value: '#82aad1', color: '#82aad1' },
      { name: 'Verde', value: '#10b981', color: '#10b981' },
      { name: 'Azul', value: '#667eea', color: '#667eea' },
      { name: 'Amarelo', value: '#f59e0b', color: '#f59e0b' },
      { name: 'Vermelho', value: '#ef4444', color: '#ef4444' },
    ],
    text: [
      { name: 'Herdar', value: 'inherit', color: '#000000' },
      { name: 'Preto', value: '#000000', color: '#000000' },
      { name: 'Cinza Escuro', value: '#2d3748', color: '#2d3748' },
      { name: 'Cinza Médio', value: '#4a5568', color: '#4a5568' },
      { name: 'Vermelho Escuro', value: '#a72424', color: '#a72424' },
      { name: 'Verde Escuro', value: '#22543d', color: '#22543d' },
      { name: 'Azul Escuro', value: '#1a365d', color: '#1a365d' },
      { name: 'Roxo Escuro', value: '#553c9a', color: '#553c9a' },
      { name: 'Marrom', value: '#744210', color: '#744210' },
      { name: 'Azul Médio', value: '#1e40af', color: '#1e40af' },
      { name: 'Branco', value: '#ffffff', color: '#ffffff' },
      { name: 'Verde', value: '#10b981', color: '#10b981' },
    ]
  }

  return (
    <div className={`d1-table-config-modal-overlay ${isClosing ? 'fade-out' : 'fade-in'}`} onClick={handleClose}>
      <div className={`d1-table-config-modal ${isClosing ? 'slide-down' : 'slide-up'}`} onClick={(e) => e.stopPropagation()}>
        <div className="d1-table-config-modal-header">
          <h2>Configurações da Tabela</h2>
          <button className="d1-table-config-modal-close" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="d1-table-config-modal-tabs">
          <button
            className={`d1-table-config-tab ${activeTab === 'columns' ? 'active' : ''}`}
            onClick={() => setActiveTab('columns')}
          >
            <FaGripVertical /> Colunas
          </button>
          <button
            className={`d1-table-config-tab ${activeTab === 'styles' ? 'active' : ''}`}
            onClick={() => setActiveTab('styles')}
          >
            <FaPalette /> Estilos
          </button>
        </div>

        <div className="d1-table-config-modal-content">
          {activeTab === 'columns' && (
            <div className="d1-table-config-columns">
              <div className="d1-table-config-section-header">
                <h3>Reordenar e Ocultar Colunas</h3>
                <p>Arraste para reordenar • Clique no ícone de olho para ocultar/mostrar • Clique no cadeado para fixar colunas (sequencial do início)</p>
              </div>
              
              {onResetColumns && (
                <div className="d1-table-config-section-reset">
                  <button 
                    className="d1-table-config-reset-section-btn" 
                    onClick={onResetColumns}
                    title="Resetar ordem e visibilidade das colunas"
                  >
                    🔄 Resetar Colunas
                  </button>
                </div>
              )}
              
              <div className="d1-table-config-columns-list">
                {sortedColumns.map((column, index) => {
                  const isCopyColumn = column.name.toLowerCase() === 'copiar' || column.name.toLowerCase() === 'copy'
                  // Verificar se pode fixar: primeira coluna sempre pode, ou se a anterior está fixada
                  const prevColumn = sortedColumns[index - 1]
                  const canFix = index === 0 || (prevColumn && prevColumn.isFixed) || column.isFixed
                  
                  return (
                  <div
                    key={column.id}
                    className={`d1-table-config-column-item ${
                      draggedIndex === index ? 'dragging' : ''
                    } ${dragOverIndex === index ? 'drag-over' : ''} ${
                      !column.visible ? 'hidden' : ''
                    } ${isCopyColumn ? 'no-drag' : ''}`}
                    draggable={!isCopyColumn}
                    onDragStart={!isCopyColumn ? (e) => handleDragStart(e, index) : undefined}
                    onDragOver={!isCopyColumn ? (e) => handleDragOver(e, index) : undefined}
                    onDragLeave={!isCopyColumn ? handleDragLeave : undefined}
                    onDrop={!isCopyColumn ? (e) => handleDrop(e, index) : undefined}
                    onDragEnd={!isCopyColumn ? () => {
                      setDraggedIndex(null)
                      setDragOverIndex(null)
                    } : undefined}
                  >
                    <div className="d1-table-config-column-drag-handle">
                      <FaGripVertical />
                    </div>
                    <div className="d1-table-config-column-name">
                      {column.name}
                    </div>
                    {onUpdateFixedColumns && (
                      <button
                        className={`d1-table-config-column-fixed ${
                          column.isFixed ? 'fixed' : ''
                        }`}
                        onClick={() => onUpdateFixedColumns(column.id, !column.isFixed)}
                        title={column.isFixed ? 'Desfixar coluna' : 'Fixar coluna (sequencial do início)'}
                        disabled={!canFix}
                      >
                        {column.isFixed ? <FaLock /> : <FaLockOpen />}
                      </button>
                    )}
                    <button
                      className={`d1-table-config-column-visibility ${
                        column.visible ? 'visible' : 'hidden'
                      }`}
                      onClick={() => onToggleVisibility(column.id)}
                      title={column.visible ? 'Ocultar coluna' : 'Mostrar coluna'}
                      disabled={column.name.toLowerCase() === 'copiar' || column.name.toLowerCase() === 'copy'}
                    >
                      {column.visible ? <FaEye /> : <FaEyeSlash />}
                    </button>
                  </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'styles' && (
            <div className="d1-table-config-styles">
              <div className="d1-table-config-section-header">
                <h3>Personalizar Estilos das Colunas</h3>
                <p>Escolha uma coluna para personalizar cores e fontes</p>
              </div>

              {onResetStyles && (
                <div className="d1-table-config-section-reset">
                  <button 
                    className="d1-table-config-reset-section-btn" 
                    onClick={onResetStyles}
                    title="Resetar todos os estilos das colunas"
                  >
                    🎨 Resetar Estilos
                  </button>
                </div>
              )}

              <div className="d1-table-config-styles-list">
                {sortedColumns.map((column) => (
                  <div key={column.id} className="d1-table-config-style-item">
                    <div className="d1-table-config-style-header">
                      <h4>{column.name}</h4>
                      <div 
                        className="d1-table-config-style-preview"
                        style={getStylePreview(column.styles)}
                      >
                        Preview
                      </div>
                    </div>

                    <div className="d1-table-config-style-controls">
                      <div className="d1-table-config-style-group">
                        <label>Cor de Fundo:</label>
                        <div className="d1-table-config-color-palette">
                          {predefinedColors.background.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`d1-table-config-color-swatch ${
                                column.styles.backgroundColor === color.value ? 'active' : ''
                              }`}
                              onClick={() => handleStyleChange(column.id, 'backgroundColor', color.value)}
                              title={color.name}
                              style={{
                                backgroundColor: color.color === 'transparent' ? 'transparent' : color.color,
                                border: color.color === '#ffffff' ? '2px solid #e2e8f0' : '2px solid transparent'
                              }}
                            />
                          ))}
                        </div>
                        <div className="d1-table-config-color-inputs">
                          <input
                            type="color"
                            value={column.styles.backgroundColor && column.styles.backgroundColor !== 'transparent' 
                              ? (column.styles.backgroundColor.startsWith('#') ? column.styles.backgroundColor : '#ffffff')
                              : '#ffffff'}
                            onChange={(e) => handleStyleChange(column.id, 'backgroundColor', e.target.value)}
                            title="Seletor de cor personalizada"
                          />
                          <input
                            type="text"
                            value={column.styles.backgroundColor || ''}
                            onChange={(e) => handleStyleChange(column.id, 'backgroundColor', e.target.value)}
                            placeholder="#ffffff ou transparent"
                            title="Digite uma cor hex ou 'transparent'"
                          />
                        </div>
                      </div>

                      <div className="d1-table-config-style-group">
                        <label>Cor do Texto:</label>
                        <div className="d1-table-config-color-palette">
                          {predefinedColors.text.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`d1-table-config-color-swatch ${
                                column.styles.textColor === color.value ? 'active' : ''
                              }`}
                              onClick={() => handleStyleChange(column.id, 'textColor', color.value)}
                              title={color.name}
                              style={{
                                backgroundColor: color.color === 'inherit' ? '#f0f0f0' : color.color,
                                border: color.color === '#ffffff' ? '2px solid #e2e8f0' : '2px solid transparent',
                                color: color.value === 'inherit' ? '#000' : (color.value === '#ffffff' ? '#000' : '#fff')
                              }}
                            >
                              {color.value === 'inherit' ? 'A' : ''}
                            </button>
                          ))}
                        </div>
                        <div className="d1-table-config-color-inputs">
                          <input
                            type="color"
                            value={column.styles.textColor && column.styles.textColor !== 'inherit' 
                              ? (column.styles.textColor.startsWith('#') ? column.styles.textColor : '#000000')
                              : '#000000'}
                            onChange={(e) => handleStyleChange(column.id, 'textColor', e.target.value)}
                            title="Seletor de cor personalizada"
                          />
                          <input
                            type="text"
                            value={column.styles.textColor || ''}
                            onChange={(e) => handleStyleChange(column.id, 'textColor', e.target.value)}
                            placeholder="#000000 ou inherit"
                            title="Digite uma cor hex ou 'inherit'"
                          />
                        </div>
                      </div>

                      <div className="d1-table-config-style-group">
                        <label>Peso da Fonte:</label>
                        <div className="d1-table-config-font-weight-buttons">
                          <button
                            className={`d1-table-config-font-btn ${
                              column.styles.fontWeight === 'normal' ? 'active' : ''
                            }`}
                            onClick={() => handleStyleChange(column.id, 'fontWeight', 'normal')}
                          >
                            Normal
                          </button>
                          <button
                            className={`d1-table-config-font-btn ${
                              column.styles.fontWeight === 'bold' ? 'active' : ''
                            }`}
                            onClick={() => handleStyleChange(column.id, 'fontWeight', 'bold')}
                          >
                            <FaBold /> Negrito
                          </button>
                          <button
                            className={`d1-table-config-font-btn ${
                              column.styles.fontWeight === 'bolder' ? 'active' : ''
                            }`}
                            onClick={() => handleStyleChange(column.id, 'fontWeight', 'bolder')}
                          >
                            <FaBold /> Bolder
                          </button>
                        </div>
                      </div>

                      <div className="d1-table-config-style-group">
                        <label>Estilo da Fonte:</label>
                        <div className="d1-table-config-font-style-buttons">
                          <button
                            className={`d1-table-config-font-btn ${
                              column.styles.fontStyle === 'normal' ? 'active' : ''
                            }`}
                            onClick={() => handleStyleChange(column.id, 'fontStyle', 'normal')}
                          >
                            Normal
                          </button>
                          <button
                            className={`d1-table-config-font-btn ${
                              column.styles.fontStyle === 'italic' ? 'active' : ''
                            }`}
                            onClick={() => handleStyleChange(column.id, 'fontStyle', 'italic')}
                          >
                            <FaItalic /> Itálico
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="d1-table-config-modal-footer">
          <button 
            className="d1-table-config-reset-btn" 
            onClick={() => {
              if (window.confirm('Tem certeza que deseja resetar TODAS as configurações?\n\nIsso irá:\n• Restaurar a ordem original das colunas\n• Mostrar todas as colunas\n• Remover todos os estilos personalizados\n\nEsta ação não pode ser desfeita.')) {
                onReset()
              }
            }}
          >
            Resetar Configurações
          </button>
          <button className="d1-table-config-close-btn" onClick={handleClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default TableConfigModal

