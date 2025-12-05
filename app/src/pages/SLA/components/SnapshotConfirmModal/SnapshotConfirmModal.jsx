import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import './SnapshotConfirmModal.css'

const SnapshotConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedProcessedBase,
  selectedCities,
  loading = false
}) => {
  const [customDate, setCustomDate] = useState('')
  
  if (!isOpen) return null

  // Data padrão: hoje
  const today = new Date().toISOString().split('T')[0]
  const dateToUse = customDate || today

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (!loading) {
      onConfirm(dateToUse)
    }
  }

  const baseInfo = selectedProcessedBase ? selectedProcessedBase : 'Todas as bases'
  const citiesInfo = selectedCities && selectedCities.length > 0 
    ? `${selectedCities.length} cidade(s) selecionada(s)`
    : 'Todas as cidades'

  return (
    <div className="snapshot-confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="snapshot-confirm-modal-container">
        {/* Botão fechar */}
        <button
          className="snapshot-confirm-modal-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Fechar modal"
        >
          <IoClose />
        </button>

        {/* Título */}
        <h2 className="snapshot-confirm-modal-title">Confirmar Salvamento de Snapshot</h2>

        {/* Informações do snapshot */}
        <div className="snapshot-confirm-modal-info">
          <div className="snapshot-confirm-modal-info-item">
            <strong>Base:</strong> {baseInfo}
          </div>
          <div className="snapshot-confirm-modal-info-item">
            <strong>Cidades:</strong> {citiesInfo}
          </div>
          {selectedCities && selectedCities.length > 0 && (
            <div className="snapshot-confirm-modal-cities-list">
              {selectedCities.map((city, index) => (
                <span key={index} className="snapshot-confirm-modal-city-tag">
                  {city}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Input de data */}
        <div className="snapshot-confirm-modal-date-section">
          <label htmlFor="snapshot-date-input" className="snapshot-confirm-modal-date-label">
            Data do Snapshot (opcional):
          </label>
          <input
            id="snapshot-date-input"
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            max={today}
            className="snapshot-confirm-modal-date-input"
            disabled={loading}
          />
          <p className="snapshot-confirm-modal-date-hint">
            Deixe em branco para usar a data atual ({new Date().toLocaleDateString('pt-BR')})
          </p>
        </div>

        {/* Botões de ação */}
        <div className="snapshot-confirm-modal-actions">
          <button
            className="snapshot-confirm-modal-btn snapshot-confirm-modal-btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="snapshot-confirm-modal-btn snapshot-confirm-modal-btn--confirm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="snapshot-confirm-modal-spinner"></span>
                Salvando...
              </>
            ) : (
              'Salvar Snapshot'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SnapshotConfirmModal

