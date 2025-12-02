import React, { useState, useEffect, useContext } from 'react'
import { IoList, IoHourglass, IoCheckmarkCircle } from 'react-icons/io5'
import { MdError, MdClear, MdDelete } from 'react-icons/md'
import useSLAProcessing from '../../hooks/useSLAProcessing'
import { RefreshContext } from '../../contexts/RefreshContext'
import api from '../../../../services/api'
import './BaseSelector.css'

const BaseSelector = ({ selectedBases, onBasesChange, disabled = false, onClearDataClick, refreshTrigger: externalRefreshTrigger, triggerRefresh: externalTriggerRefresh }) => {
  // TODOS os hooks devem ser chamados ANTES de qualquer return condicional
  const { processing, processSelectedBases } = useSLAProcessing(externalTriggerRefresh)
  
  // Tentar usar o contexto de forma segura
  const refreshContext = useContext(RefreshContext)
  const refreshTrigger = externalRefreshTrigger !== undefined 
    ? externalRefreshTrigger 
    : (refreshContext?.refreshTrigger ?? 0)
  
  const [bases, setBases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetchBases()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger])

  const fetchBases = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get('/sla/bases')
      const availableBases = response.data.data.bases || []
      setBases(availableBases)
      
      // Sincronizar bases selecionadas: manter apenas as que existem no servidor
      if (selectedBases.length > 0) {
        const validSelectedBases = selectedBases.filter(base => availableBases.includes(base))
        if (validSelectedBases.length !== selectedBases.length) {
          // Se houver diferença, atualizar as bases selecionadas
          onBasesChange(validSelectedBases)
        }
      }
      
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleBaseToggle = (base) => {
    if (disabled) return
    
    const newSelectedBases = selectedBases.includes(base)
      ? selectedBases.filter(b => b !== base)
      : [...selectedBases, base]
    
    onBasesChange(newSelectedBases)
  }

  const handleSelectAll = () => {
    if (disabled) return
    onBasesChange([...bases])
  }

  const handleSelectNone = () => {
    if (disabled) return
    onBasesChange([])
  }

  const toggleDropdown = () => {
    if (disabled) return
    setShowDropdown(!showDropdown)
  }

  const handleProcessBases = async () => {
    if (disabled || selectedBases.length === 0) return
    
    try {
      await processSelectedBases(selectedBases)
    } catch (err) {
      // Erro tratado silenciosamente
    }
  }

  if (loading) {
    return (
      <div className="sla-base-selector">
        <button className="sla-bases-toggle-btn" disabled title="Carregando bases...">
          <IoHourglass size={20} className="sla-spinning" />
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="sla-base-selector">
        <button className="sla-bases-toggle-btn" disabled title={`Erro ao carregar bases: ${error}`}>
          <MdError size={20} />
        </button>
      </div>
    )
  }

  const getDisplayText = () => {
    if (selectedBases.length === 0) {
      return 'Selecionar Bases'
    } else if (selectedBases.length === 1) {
      return selectedBases[0]
    } else if (selectedBases.length === bases.length) {
      return `Todas (${selectedBases.length})`
    } else {
      return `${selectedBases.length} selecionadas`
    }
  }

  return (
    <div className="sla-base-selector">
      <button 
        className="sla-bases-toggle-btn"
        onClick={toggleDropdown}
        disabled={disabled}
        title={selectedBases.length > 0 
          ? `${selectedBases.length} bases selecionadas` 
          : 'Selecionar Bases'
        }
      >
        <IoList size={24} />
        <span className="sla-bases-text">{getDisplayText()}</span>
        <span className={`sla-dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
      </button>
      
      {showDropdown && (
        <div className="sla-bases-grid">
          {bases.map((base) => (
            <div
              key={base}
              className={`sla-base-item ${selectedBases.includes(base) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => handleBaseToggle(base)}
            >
              <input
                type="checkbox"
                checked={selectedBases.includes(base)}
                onChange={() => handleBaseToggle(base)}
                disabled={disabled}
                className="sla-base-checkbox"
              />
              <span className="sla-base-name">{base}</span>
            </div>
          ))}
          
          <div className="sla-base-selector-actions">
            <div className="sla-base-selector-actions-row">
              <button 
                className="sla-clear-btn-actions"
                onClick={handleSelectNone}
                disabled={disabled || selectedBases.length === 0}
                title="Limpar Seleção"
              >
                <MdClear size={20} />
              </button>
              
              <button 
                className="sla-process-btn-actions"
                onClick={handleProcessBases}
                disabled={disabled || selectedBases.length === 0 || processing}
                title={processing ? 'Processando...' : 'Processar Bases'}
              >
                {processing ? (
                  <IoHourglass size={20} className="sla-spinning" />
                ) : (
                  <IoCheckmarkCircle size={20} />
                )}
              </button>
            </div>
            
            <button 
              className="sla-delete-btn-actions"
              onClick={onClearDataClick}
              disabled={disabled}
              title="Limpar todos os dados SLA"
            >
              <MdDelete size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BaseSelector
