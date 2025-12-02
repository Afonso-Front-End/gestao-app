import React, { useState, useEffect } from 'react'
import { IoLocation, IoHourglass } from 'react-icons/io5'
import { MdError } from 'react-icons/md'
import useProcessedBases from '../../hooks/useProcessedBases'
import './BaseSelectorProcessed.css'

const BaseSelectorProcessed = ({ selectedBase, onBaseChange, disabled = false }) => {
  const { processedBases, loading, error, refetch } = useProcessedBases()
  const [showDropdown, setShowDropdown] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Selecionar automaticamente a primeira base quando carregar
  useEffect(() => {
    if (processedBases.length > 0 && !selectedBase) {
      onBaseChange(processedBases[0].base_name)
    }
  }, [processedBases, selectedBase, onBaseChange])

  const handleBaseChange = (baseName) => {
    if (disabled) return
    onBaseChange(baseName)
    setShowDropdown(false)
  }

  const toggleDropdown = () => {
    if (disabled) return
    setShowDropdown(!showDropdown)
  }

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1)
    try {
      await refetch()
    } catch (err) {
      // Erro já será tratado pelo hook
    }
  }

  if (loading) {
    return (
      <div className="sla-base-selector-processed">
        <button className="sla-processed-toggle-btn" disabled title="Carregando bases...">
          <IoHourglass size={20} className="sla-spinning" />
        </button>
      </div>
    )
  }

  // Só mostrar erro se realmente houver um erro E não houver bases carregadas
  // Se houver bases mesmo com erro anterior, mostrar normalmente
  if (error && processedBases.length === 0) {
    return (
      <div className="sla-base-selector-processed">
        <button 
          className="sla-processed-toggle-btn" 
          onClick={handleRetry}
          disabled={disabled || loading}
          title={`Erro: ${error}. Clique para tentar novamente.`}
        >
          <MdError size={20} />
          <span className="sla-processed-text">
            {loading ? 'Carregando...' : 'Erro - Clique para tentar'}
          </span>
        </button>
      </div>
    )
  }

  // Determinar o texto a exibir no botão
  const getButtonText = () => {
    if (selectedBase) {
      return selectedBase
    } else if (processedBases.length > 0) {
      // Se houver bases mas nenhuma selecionada, mostrar "Selecionar Base"
      return 'Selecionar Base'
    } else {
      // Se não houver bases, mostrar mensagem apropriada
      return 'Nenhuma base processada'
    }
  }

  return (
    <div className="sla-base-selector-processed">
      <button 
        className="sla-processed-toggle-btn"
        onClick={toggleDropdown}
        disabled={disabled}
        title={selectedBase 
          ? `Base: ${selectedBase}` 
          : processedBases.length > 0
          ? 'Selecionar Base Processada'
          : 'Nenhuma base processada encontrada'
        }
      >
        <IoLocation size={20} />
        <span className="sla-processed-text">{getButtonText()}</span>
        <span className={`sla-dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
      </button>
      
      {showDropdown && (
        <div className="sla-bases-grid">
          {processedBases.map((base) => (
            <div
              key={base.base_name}
              className={`sla-base-item ${selectedBase === base.base_name ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => handleBaseChange(base.base_name)}
            >
              <div className="sla-base-info">
                <span className="sla-base-name">{base.base_name}</span>
                <span className="sla-base-stats">
                  {base.total_records} registros, {base.total_pedidos} pedidos
                </span>
              </div>
              <div className="sla-base-status">
                {base.last_processed && (
                  <span className="sla-last-processed">
                    Processado: {new Date(base.last_processed).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {processedBases.length === 0 && (
            <div className="sla-no-data">
              Nenhuma base processada encontrada. Processe algumas bases primeiro.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BaseSelectorProcessed
