import React, { useState, useEffect, useCallback } from 'react'
import './MoveRemessaModal.css'

const MoveRemessaModal = ({ isOpen, onClose, remessaData, onMoveToDevolucao, onMoveToCobrarBase, loading }) => {
  const [isClosing, setIsClosing] = useState(false)

  // Função para fechar com animação
  const handleClose = useCallback(() => {
    if (loading) return
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 250) // Tempo da animação
  }, [onClose, loading])

  // Resetar estado de fechamento quando abrir
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  if (!isOpen && !isClosing) return null

  return (
    <div className={`sem-movimentacao-sc-move-remessa-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="sem-movimentacao-sc-move-remessa-modal">
        <div className="sem-movimentacao-sc-move-remessa-modal-header">
          <h2>Mover Remessa</h2>
          <button
            className="sem-movimentacao-sc-move-remessa-modal-close"
            onClick={handleClose}
            title="Fechar"
            disabled={loading}
          >
            ✕
          </button>
        </div>
        <div className="sem-movimentacao-sc-move-remessa-modal-content">
          <p className="sem-movimentacao-sc-move-remessa-info">
            Remessa: <strong>{remessaData?.remessa || 'N/A'}</strong>
          </p>
          <p className="sem-movimentacao-sc-move-remessa-question">
            Para onde deseja mover esta remessa?
          </p>
          <div className="sem-movimentacao-sc-move-remessa-options">
            <button
              className="sem-movimentacao-sc-move-remessa-btn devolucao"
              onClick={onMoveToDevolucao}
              disabled={loading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Mover para Devolução
            </button>
            <button
              className="sem-movimentacao-sc-move-remessa-btn cobrar-base"
              onClick={onMoveToCobrarBase}
              disabled={loading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Mover para Cobrar Base
            </button>
          </div>
          {loading && (
            <div className="sem-movimentacao-sc-move-remessa-loading">
              <div className="sem-movimentacao-sc-move-remessa-spinner"></div>
              <span>Salvando...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MoveRemessaModal

