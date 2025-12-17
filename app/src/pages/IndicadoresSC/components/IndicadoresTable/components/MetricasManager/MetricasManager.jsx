import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { FaTimes, FaPlus, FaEdit, FaTrash, FaCheck } from 'react-icons/fa'
import MetricaModal from '../MetricaModal/MetricaModal'
import './MetricasManager.css'

const MetricasManager = memo(({ 
  isOpen, 
  onClose, 
  metricas = [],
  onSave,
  isLocked = false
}) => {
  const [isClosing, setIsClosing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMetrica, setEditingMetrica] = useState(null)
  const closeTimeoutRef = useRef(null)
  
  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsClosing(false)
      setModalOpen(false)
      setEditingMetrica(null)
    }
  }, [isOpen])
  
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [])
  
  const handleClose = useCallback(() => {
    if (isClosing) return
    
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    
    setIsClosing(true)
    
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null
      setIsClosing(false)
      onClose()
    }, 300)
  }, [isClosing, onClose])
  
  const handleAddMetrica = () => {
    if (isLocked) return
    setEditingMetrica(null)
    setModalOpen(true)
  }
  
  const handleEditMetrica = (metrica) => {
    if (isLocked) return
    setEditingMetrica(metrica)
    setModalOpen(true)
  }
  
  const handleDeleteMetrica = (metricaId) => {
    if (isLocked) return
    
    if (window.confirm('Tem certeza que deseja excluir esta métrica? Todos os valores preenchidos serão perdidos.')) {
      const newMetricas = metricas.filter(m => m.id !== metricaId)
      onSave(newMetricas)
    }
  }
  
  const handleSaveMetrica = (metricaData) => {
    const existingIndex = metricas.findIndex(m => m.id === metricaData.id)
    let newMetricas
    
    if (existingIndex >= 0) {
      // Editar métrica existente
      newMetricas = [...metricas]
      const existingMetrica = metricas[existingIndex]
      newMetricas[existingIndex] = {
        ...metricaData,
        valores: existingMetrica.valores // Manter valores existentes
      }
    } else {
      // Adicionar nova métrica
      const dates = []
      for (let i = 1; i <= 31; i++) {
        dates.push(i)
      }
      
      newMetricas = [
        ...metricas,
        {
          ...metricaData,
          valores: dates.reduce((acc, date) => {
            acc[date] = ''
            return acc
          }, {})
        }
      ]
    }
    
    onSave(newMetricas)
    setModalOpen(false)
    setEditingMetrica(null)
  }
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }, [handleClose])
  
  if (!isOpen && !isClosing) return null
  
  return (
    <>
      <div 
        className={`metricas-manager-overlay ${isClosing ? 'fade-out' : 'fade-in'}`}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div 
          className={`metricas-manager ${isClosing ? 'slide-down' : 'slide-up'}`}
        >
          <div className="metricas-manager-header">
            <h2>Gerenciar Métricas</h2>
            <button 
              className="metricas-manager-close" 
              onClick={handleClose}
              disabled={isClosing}
              title="Fechar (Esc)"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="metricas-manager-content">
            {!isLocked && (
              <div className="metricas-manager-actions">
                <button
                  className="metricas-manager-add-btn"
                  onClick={handleAddMetrica}
                >
                  <FaPlus /> Adicionar Nova Métrica
                </button>
              </div>
            )}
            
            {metricas.length === 0 ? (
              <div className="metricas-manager-empty">
                <p>Nenhuma métrica cadastrada.</p>
                {!isLocked && (
                  <p>Clique em "Adicionar Nova Métrica" para começar.</p>
                )}
              </div>
            ) : (
              <div className="metricas-manager-list">
                {metricas.map((metrica, index) => (
                  <div key={metrica.id} className="metrica-manager-item">
                    <div className="metrica-manager-item-content">
                      <div className="metrica-manager-item-header">
                        <span className="metrica-manager-item-number">{index + 1}</span>
                        <div className="metrica-manager-item-info">
                          <div className="metrica-manager-item-nome">{metrica.nome}</div>
                          {metrica.nomeChines && (
                            <div className="metrica-manager-item-chines">{metrica.nomeChines}</div>
                          )}
                        </div>
                      </div>
                      <div className="metrica-manager-item-meta">
                        <span className="metrica-manager-item-meta-label">Meta:</span>
                        <span className="metrica-manager-item-meta-value">
                          {metrica.tipo === 'percentual' 
                            ? metrica.meta.toFixed(2) + '%' 
                            : metrica.meta.toLocaleString('pt-BR')}
                        </span>
                        <span className="metrica-manager-item-tipo">
                          ({metrica.tipo === 'percentual' ? 'Percentual' : 'Número'})
                        </span>
                        <span className="metrica-manager-item-indicator">
                          {metrica.maiorMelhor ? '↑ Maior é melhor' : '↓ Menor é melhor'}
                        </span>
                      </div>
                    </div>
                    {!isLocked && (
                      <div className="metrica-manager-item-actions">
                        <button
                          className="metrica-manager-edit-btn"
                          onClick={() => handleEditMetrica(metrica)}
                          title="Editar métrica"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="metrica-manager-delete-btn"
                          onClick={() => handleDeleteMetrica(metrica.id)}
                          title="Excluir métrica"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <MetricaModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingMetrica(null)
        }}
        onSave={handleSaveMetrica}
        onDelete={handleDeleteMetrica}
        metrica={editingMetrica}
      />
    </>
  )
})

MetricasManager.displayName = 'MetricasManager'

export default MetricasManager

