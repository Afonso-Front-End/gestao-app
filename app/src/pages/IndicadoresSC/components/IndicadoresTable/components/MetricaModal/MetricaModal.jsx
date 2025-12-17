import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { FaTimes, FaCheck, FaTrash } from 'react-icons/fa'
import './MetricaModal.css'

const MetricaModal = memo(({ 
  isOpen, 
  onClose, 
  onSave,
  onDelete,
  metrica = null // Se null, é adicionar. Se não, é editar
}) => {
  const [isClosing, setIsClosing] = useState(false)
  const closeTimeoutRef = useRef(null)
  const nomeRef = useRef(null)
  
  const [formData, setFormData] = useState({
    nome: '',
    nomeChines: '',
    meta: '',
    tipo: 'percentual',
    maiorMelhor: true
  })
  
  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsClosing(false)
      
      // Se for editar, preencher com dados da métrica
      if (metrica) {
        setFormData({
          nome: metrica.nome || '',
          nomeChines: metrica.nomeChines || '',
          meta: metrica.meta || '',
          tipo: metrica.tipo || 'percentual',
          maiorMelhor: metrica.maiorMelhor !== undefined ? metrica.maiorMelhor : true
        })
      } else {
        // Se for adicionar, resetar formulário
        setFormData({
          nome: '',
          nomeChines: '',
          meta: '',
          tipo: 'percentual',
          maiorMelhor: true
        })
      }
      
      // Focar no primeiro input após um pequeno delay
      setTimeout(() => {
        if (nomeRef.current) {
          nomeRef.current.focus()
        }
      }, 100)
    }
  }, [isOpen, metrica])
  
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
  
  const handleSave = useCallback(() => {
    // Validação
    if (!formData.nome.trim()) {
      alert('Por favor, preencha o nome da métrica')
      return
    }
    
    if (!formData.meta || isNaN(parseFloat(formData.meta))) {
      alert('Por favor, preencha uma meta válida')
      return
    }
    
    const metricaData = {
      ...formData,
      meta: parseFloat(formData.meta),
      id: metrica?.id || `metrica_${Date.now()}` // Gerar ID único se for nova
    }
    
    onSave(metricaData)
    handleClose()
  }, [formData, metrica, onSave, handleClose])
  
  const handleDelete = useCallback(() => {
    if (window.confirm('Tem certeza que deseja excluir esta métrica?')) {
      onDelete(metrica.id)
      handleClose()
    }
  }, [metrica, onDelete, handleClose])
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    }
  }, [handleClose, handleSave])
  
  if (!isOpen && !isClosing) return null
  
  return (
    <div 
      className={`metrica-modal-overlay ${isClosing ? 'fade-out' : 'fade-in'}`}
      onClick={handleClose}
    >
      <div 
        className={`metrica-modal ${isClosing ? 'slide-down' : 'slide-up'}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="metrica-modal-header">
          <h2>{metrica ? 'Editar Métrica' : 'Adicionar Métrica'}</h2>
          <button 
            className="metrica-modal-close" 
            onClick={handleClose}
            disabled={isClosing}
            title="Fechar (Esc)"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="metrica-modal-content">
          <div className="metrica-form-group">
            <label htmlFor="metrica-nome">Nome (Português) *</label>
            <input
              ref={nomeRef}
              id="metrica-nome"
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Tx de expedição SC-SC"
              maxLength={100}
            />
          </div>
          
          <div className="metrica-form-group">
            <label htmlFor="metrica-nome-chines">Nome (Chinês)</label>
            <input
              id="metrica-nome-chines"
              type="text"
              value={formData.nomeChines}
              onChange={(e) => setFormData({ ...formData, nomeChines: e.target.value })}
              placeholder="Ex: 出港转运及时率"
              maxLength={100}
            />
          </div>
          
          <div className="metrica-form-group">
            <label htmlFor="metrica-meta">Meta *</label>
            <input
              id="metrica-meta"
              type="number"
              step="0.01"
              value={formData.meta}
              onChange={(e) => setFormData({ ...formData, meta: e.target.value })}
              placeholder="Ex: 95.00"
            />
          </div>
          
          <div className="metrica-form-group">
            <label htmlFor="metrica-tipo">Tipo</label>
            <select
              id="metrica-tipo"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            >
              <option value="percentual">Percentual (%)</option>
              <option value="numero">Número</option>
            </select>
          </div>
          
          <div className="metrica-form-group">
            <label className="metrica-checkbox-label">
              <input
                type="checkbox"
                checked={formData.maiorMelhor}
                onChange={(e) => setFormData({ ...formData, maiorMelhor: e.target.checked })}
              />
              <span>Maior valor é melhor (verde quando acima da meta)</span>
            </label>
          </div>
        </div>
        
        <div className="metrica-modal-actions">
          {metrica && (
            <button
              className="metrica-modal-delete-btn"
              onClick={handleDelete}
              title="Excluir métrica"
            >
              <FaTrash /> Excluir
            </button>
          )}
          <div className="metrica-modal-actions-right">
            <button
              className="metrica-modal-cancel-btn"
              onClick={handleClose}
            >
              Cancelar
            </button>
            <button
              className="metrica-modal-save-btn"
              onClick={handleSave}
            >
              <FaCheck /> {metrica ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

MetricaModal.displayName = 'MetricaModal'

export default MetricaModal

