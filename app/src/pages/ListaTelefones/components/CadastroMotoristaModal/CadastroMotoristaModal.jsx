import React, { useState } from 'react'
import { useNotification } from '../../../../contexts/NotificationContext'
import api from '../../../../services/api'
import './CadastroMotoristaModal.css'

const CadastroMotoristaModal = ({ isOpen, onClose, onSuccess }) => {
  const { showSuccess, showError, showLoading, hideLoading } = useNotification()
  
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
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = async (e) => {
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
        onClose()
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
  }
  
  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div className="cadastro-motorista-modal-overlay">
      <div className="cadastro-motorista-modal-content">
        <div className="cadastro-motorista-modal-header">
          <h2>📝 Cadastrar Novo Motorista</h2>
          <button 
            className="cadastro-motorista-modal-close" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>
        
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
          
          <div className="cadastro-motorista-form-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="cadastro-motorista-btn-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cadastro-motorista-btn-submit"
            >
              {isSubmitting ? '⏳ Cadastrando...' : '✅ Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CadastroMotoristaModal

