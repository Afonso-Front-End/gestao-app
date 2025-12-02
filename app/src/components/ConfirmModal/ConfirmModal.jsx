import React from 'react'
import './ConfirmModal.css'
import { IoWarningOutline, IoClose } from 'react-icons/io5'

/**
 * Modal de confirmação profissional
 * @param {boolean} isOpen - Estado do modal
 * @param {function} onClose - Função para fechar o modal
 * @param {function} onConfirm - Função executada ao confirmar
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem principal
 * @param {string} warningMessage - Mensagem de aviso adicional
 * @param {string} confirmText - Texto do botão confirmar
 * @param {string} cancelText - Texto do botão cancelar
 * @param {string} type - Tipo do modal: 'danger' | 'warning' | 'info'
 * @param {boolean} loading - Estado de loading
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Ação',
  message = 'Tem certeza que deseja continuar?',
  warningMessage = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  loading = false
}) => {
  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (!loading) {
      onConfirm()
    }
  }

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal-container">
        {/* Botão fechar */}
        <button
          className="confirm-modal-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Fechar modal"
        >
          <IoClose />
        </button>

        {/* Ícone de aviso */}
        <div className={`confirm-modal-icon confirm-modal-icon--${type}`}>
          <IoWarningOutline />
        </div>

        {/* Título */}
        <h2 className="confirm-modal-title">{title}</h2>

        {/* Mensagem principal */}
        <p className="confirm-modal-message">{message}</p>

        {/* Mensagem de aviso adicional */}
        {warningMessage && (
          <div className="confirm-modal-warning">
            <p>{warningMessage}</p>
          </div>
        )}

        {/* Botões de ação */}
        <div className="confirm-modal-actions">
          <button
            className="confirm-modal-btn confirm-modal-btn--cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-modal-btn confirm-modal-btn--confirm confirm-modal-btn--${type}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="confirm-modal-spinner"></span>
                Processando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal

