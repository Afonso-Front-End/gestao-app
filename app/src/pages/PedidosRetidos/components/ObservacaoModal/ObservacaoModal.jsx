import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { FaTimes, FaCheck } from 'react-icons/fa'
import './ObservacaoModal.css'

const ObservacaoModal = memo(({ 
  isOpen, 
  onClose, 
  onSave, 
  initialValue = '',
  motorista = '',
  status = ''
}) => {
  const [observacao, setObservacao] = useState(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimeoutRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsClosing(false)
      setIsSaving(false) // Resetar estado de salvamento quando modal abrir
      setObservacao(initialValue)
      
      // Focar no textarea após um pequeno delay
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(0, 0)
        }
      }, 100)
    }
  }, [isOpen, initialValue])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [])

  // Resetar estado quando modal fechar completamente
  useEffect(() => {
    if (!isOpen && !isClosing) {
      setIsSaving(false)
      setIsClosing(false)
    }
  }, [isOpen, isClosing])

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

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave(observacao.trim())
      handleClose()
    } catch (error) {
      // Erro ao salvar observação
      setIsSaving(false)
    }
  }, [observacao, onSave, handleClose])

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
      className={`observacao-modal-overlay ${isClosing ? 'fade-out' : 'fade-in'}`}
    >
      <div 
        className={`observacao-modal ${isClosing ? 'slide-down' : 'slide-up'}`}
      >
        <div className="observacao-modal-header">
          <div>
            <h2>Adicionar Observação</h2>
            {motorista && (
              <p className="observacao-modal-subtitle">
                {motorista} {status && `- ${status}`}
              </p>
            )}
          </div>
          <button 
            className="observacao-modal-close" 
            onClick={handleClose}
            disabled={isClosing}
            title="Fechar (Esc)"
          >
            <FaTimes />
          </button>
        </div>

        <div className="observacao-modal-content">
          <div className="observacao-modal-textarea-wrapper">
            <textarea
              ref={textareaRef}
              className="observacao-modal-textarea"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua observação aqui..."
              maxLength={500}
            />
            <div className="observacao-modal-char-count">
              {observacao.length}/500 caracteres
            </div>
          </div>

          <div className="observacao-modal-actions">
            <button 
              className="observacao-modal-btn observacao-modal-btn-save"
              onClick={handleSave}
              disabled={isSaving}
              title="Salvar observação (Ctrl+Enter)"
            >
              <FaCheck />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>

        <div className="observacao-modal-footer">
          <button 
            className="observacao-modal-cancel-btn" 
            onClick={handleClose}
            disabled={isSaving || isClosing}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
})

ObservacaoModal.displayName = 'ObservacaoModal'

export default ObservacaoModal
