import React, { useState, useEffect, useCallback, useRef } from 'react'
import { IoClose, IoDocumentText } from 'react-icons/io5'
import './MovePedidosModal.css'

const MovePedidosModal = ({
  isOpen,
  onClose,
  onConfirm,
  totalPedidos = 0,
  loading = false
}) => {
  const [observacao, setObservacao] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const textareaRef = useRef(null)

  // Resetar estado quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setObservacao('')
      setIsClosing(false)
      // Focar no textarea após um pequeno delay
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 100)
    }
  }, [isOpen])

  // Função para fechar com animação
  const handleClose = useCallback(() => {
    if (loading) return
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      setObservacao('')
      onClose()
    }, 250)
  }, [onClose, loading])

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleClose()
    }
  }

  const handleConfirm = () => {
    if (!loading) {
      onConfirm(observacao.trim())
    }
  }

  if (!isOpen && !isClosing) return null

  return (
    <div 
      className={`move-pedidos-modal-overlay ${isClosing ? 'closing' : ''}`} 
      onClick={handleOverlayClick}
    >
      <div className="move-pedidos-modal-content">
        {/* Botão fechar */}
        <button
          className="move-pedidos-modal-close"
          onClick={handleClose}
          disabled={loading}
          aria-label="Fechar modal"
        >
          <IoClose />
        </button>

        {/* Ícone */}
        <div className="move-pedidos-modal-icon">
          <IoDocumentText />
        </div>

        {/* Título */}
        <h2 className="move-pedidos-modal-title">Mover Pedidos</h2>

        {/* Mensagem */}
        <p className="move-pedidos-modal-message">
          Você está prestes a mover <strong>{totalPedidos} pedido(s)</strong> para a coleção de movidos.
        </p>

        {/* Campo de observação */}
        <div className="move-pedidos-modal-form">
          <label htmlFor="observacao" className="move-pedidos-modal-label">
            Observação (opcional)
          </label>
          <textarea
            id="observacao"
            ref={textareaRef}
            className="move-pedidos-modal-textarea"
            placeholder="Digite uma observação sobre esta movimentação..."
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            disabled={loading}
            rows={4}
          />
        </div>

        {/* Botões de ação */}
        <div className="move-pedidos-modal-actions">
          <button
            className="move-pedidos-modal-btn move-pedidos-modal-btn--cancel"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="move-pedidos-modal-btn move-pedidos-modal-btn--confirm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="move-pedidos-modal-spinner"></span>
                Movendo...
              </>
            ) : (
              `Mover ${totalPedidos} Pedido(s)`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MovePedidosModal



