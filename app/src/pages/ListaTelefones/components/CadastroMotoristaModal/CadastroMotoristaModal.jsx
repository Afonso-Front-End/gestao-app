import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { FaTimes, FaCheck } from 'react-icons/fa'
import { useNotification } from '../../../../contexts/NotificationContext'
import api from '../../../../services/api'
import './CadastroMotoristaModal.css'

const CadastroMotoristaModal = memo(({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError, showLoading, hideLoading } = useNotification()
  const [isClosing, setIsClosing] = useState(false)
  const closeTimeoutRef = useRef(null)
  
  // Obter data atual no formato DD/MM/YYYY
  const getDataAtual = () => {
    const hoje = new Date()
    const dia = String(hoje.getDate()).padStart(2, '0')
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const ano = hoje.getFullYear()
    return `${dia}/${mes}/${ano}`
  }
  
  const [formData, setFormData] = useState({
    Data: getDataAtual(),
    Motorista: '',
    Status: 'Aprovado',
    Cidade: '',
    HUB: '',
    Contato: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsClosing(false)
      setIsSubmitting(false)
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
  
  useEffect(() => {
    if (!isOpen && !isClosing) {
      setIsSubmitting(false)
      setIsClosing(false)
    }
  }, [isOpen, isClosing])
  
  const handleClose = useCallback(() => {
    if (isClosing || isSubmitting) return
    
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
  }, [isClosing, isSubmitting, onClose])
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }, [handleClose])
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    // Validações
    if (!formData.Motorista.trim()) {
      showError('O campo Motorista é obrigatório')
      return
    }
    
    if (!formData.Cidade.trim()) {
      showError('O campo Cidade é obrigatório')
      return
    }
    
    if (!formData.HUB.trim()) {
      showError('O campo HUB é obrigatório')
      return
    }
    
    if (!formData.Contato.trim()) {
      showError('O campo Contato é obrigatório')
      return
    }
    
    setIsSubmitting(true)
    const loadingId = showLoading('Cadastrando motorista...', 'Cadastro')
    
    try {
      const response = await api.post('/lista-telefones/cadastrar', formData)
      
      if (response.data.success) {
        showSuccess('✅ Motorista cadastrado com sucesso!')
        // Resetar formulário
        setFormData({
          Data: getDataAtual(),
          Motorista: '',
          Status: 'Aprovado',
          Cidade: '',
          HUB: '',
          Contato: ''
        })
        handleClose()
        if (onSuccess) {
          onSuccess()
        }
      } else {
        showError(response.data.message || 'Erro ao cadastrar motorista')
      }
    } catch (error) {
      showError(error.response?.data?.detail || error.message || 'Erro ao cadastrar motorista')
    } finally {
      setIsSubmitting(false)
      hideLoading(loadingId)
    }
  }, [formData, showError, showSuccess, showLoading, hideLoading, handleClose, onSuccess])
  
  if (!isOpen && !isClosing) return null
  
  return (
    <div 
      className={`cadastro-motorista-modal-overlay ${isClosing ? 'fade-out' : 'fade-in'}`}
      onKeyDown={handleKeyDown}
    >
      <div 
        className={`cadastro-motorista-modal ${isClosing ? 'slide-down' : 'slide-up'}`}
      >
        <div className="cadastro-motorista-modal-header">
          <div>
            <h2>Cadastrar Novo Motorista</h2>
          </div>
          <button 
            className="cadastro-motorista-modal-close" 
            onClick={handleClose}
            disabled={isSubmitting || isClosing}
            title="Fechar (Esc)"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="cadastro-motorista-modal-content">
          <form onSubmit={handleSubmit} className="cadastro-motorista-form">
            <div className="cadastro-motorista-form-group">
              <label htmlFor="Data">Data *</label>
              <input
                type="text"
                id="Data"
                name="Data"
                value={formData.Data}
                readOnly
                className="cadastro-motorista-input-readonly"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="cadastro-motorista-form-group">
              <label htmlFor="Motorista">Motorista *</label>
              <input
                type="text"
                id="Motorista"
                name="Motorista"
                value={formData.Motorista}
                onChange={handleChange}
                required
                placeholder="Ex: MARCIO ALTAIR ADRIANO"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="cadastro-motorista-form-group">
              <label htmlFor="Status">Status *</label>
              <select
                id="Status"
                name="Status"
                value={formData.Status}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="Aprovado">Aprovado</option>
                <option value="Pendente">Pendente</option>
                <option value="Rejeitado">Rejeitado</option>
              </select>
            </div>
            
            <div className="cadastro-motorista-form-group">
              <label htmlFor="Cidade">Cidade *</label>
              <input
                type="text"
                id="Cidade"
                name="Cidade"
                value={formData.Cidade}
                onChange={handleChange}
                required
                placeholder="Ex: Blumenau"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="cadastro-motorista-form-group">
              <label htmlFor="HUB">HUB *</label>
              <input
                type="text"
                id="HUB"
                name="HUB"
                value={formData.HUB}
                onChange={handleChange}
                required
                placeholder="Ex: BNU -SC"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="cadastro-motorista-form-group">
              <label htmlFor="Contato">Contato *</label>
              <input
                type="text"
                id="Contato"
                name="Contato"
                value={formData.Contato}
                onChange={handleChange}
                required
                placeholder="Ex: (47) 99781-1764"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="cadastro-motorista-modal-actions">
              <button
                type="submit"
                className="cadastro-motorista-modal-btn cadastro-motorista-modal-btn-save"
                disabled={isSubmitting}
                title="Salvar motorista"
              >
                <FaCheck />
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="cadastro-motorista-modal-footer">
          <button 
            className="cadastro-motorista-modal-cancel-btn" 
            onClick={handleClose}
            disabled={isSubmitting || isClosing}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
})

CadastroMotoristaModal.displayName = 'CadastroMotoristaModal'

export default CadastroMotoristaModal

