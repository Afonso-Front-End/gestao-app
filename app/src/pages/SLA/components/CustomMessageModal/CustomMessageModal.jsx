import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FaTimes, FaCopy } from 'react-icons/fa'
import './CustomMessageModal.css'

const CustomMessageModal = ({
  isOpen,
  onClose,
  motorista,
  quantidade,
  baseName,
  phoneNumber,
  onSend
}) => {
  const [message, setMessage] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const closeTimeoutRef = useRef(null)
  const textareaRef = useRef(null)

  // Obter nome do usuário (com fallback para "Funcionário")
  const getUserName = () => {
    // Tentar obter do localStorage (se houver sistema de login no futuro)
    const userName = localStorage.getItem('userName') || 
                     localStorage.getItem('user_name') || 
                     localStorage.getItem('nome') ||
                     null
    
    return userName && userName.trim() !== '' ? userName.trim() : 'Funcionário'
  }

  // Gerar mensagem padrão
  const generateDefaultMessage = useCallback(() => {
    const userName = getUserName()
    
    let defaultMessage = `Olá "TAC MOTORISTA!" 👋

Meu nome é ${userName} e sou da *Torre de Controle J&T Express*.

Ainda constam em aberto ${quantidade} pedidos em aberto, conseguirá finalizar hoje? Ou aconteceu algum imprevisto?`

    return defaultMessage
  }, [quantidade])

  // Atualizar mensagem quando quantidade mudar
  useEffect(() => {
    if (isOpen) {
      const defaultMsg = generateDefaultMessage()
      setMessage(defaultMsg)
    }
  }, [quantidade, isOpen, generateDefaultMessage])

  // Resetar estado quando modal abrir
  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsClosing(false)
      // Gerar mensagem padrão quando abrir
      const defaultMsg = generateDefaultMessage()
      setMessage(defaultMsg)
      
      // Focar no textarea após um pequeno delay
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(0, 0) // Cursor no início
        }
      }, 100)
    }
  }, [isOpen, generateDefaultMessage])

  // Resetar estado quando modal fechar completamente
  useEffect(() => {
    if (!isOpen && !isClosing) {
      setIsClosing(false)
    }
  }, [isOpen, isClosing])

  // Cleanup ao desmontar
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

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message)
      // Mostrar feedback visual (pode usar notificação se necessário)
    } catch (err) {
      // Erro silencioso ao copiar
    }
  }, [message])


  const handleReset = useCallback(() => {
    const defaultMsg = generateDefaultMessage()
    setMessage(defaultMsg)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [generateDefaultMessage])

  const handleSave = useCallback(() => {
    if (!message.trim()) {
      return
    }

    // Salvar mensagem personalizada como template no localStorage
    // Criar template substituindo valores específicos por placeholders
    let template = message
    
    // Garantir que tenha "TAC MOTORISTA!" no template (substituir qualquer variação)
    template = template.replace(/TAC\s+[A-Z\s]+!/g, 'TAC MOTORISTA!')
    
    // Substituir quantidade atual por placeholder ${quantidade}
    if (quantidade) {
      template = template.replace(new RegExp(quantidade.toString(), 'g'), '${quantidade}')
    }
    
    localStorage.setItem('sla-custom-message-template', template)
    
    if (onSend) {
      onSend('Mensagem personalizada salva com sucesso!')
    }
  }, [message, quantidade, onSend])

  if (!isOpen && !isClosing) return null

  return (
    <div 
      className={`sla-custom-message-modal-overlay ${isClosing ? 'fade-out' : 'fade-in'}`}
    >
      <div 
        className={`sla-custom-message-modal ${isClosing ? 'slide-down' : 'slide-up'}`}
      >
        <div className="sla-custom-message-modal-header">
          <h2>Mensagem Personalizada</h2>
          <button className="sla-custom-message-modal-close" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="sla-custom-message-modal-content">
          <div className="sla-custom-message-textarea-wrapper">
            <textarea
              ref={textareaRef}
              className="sla-custom-message-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              rows={12}
            />
          </div>

          <div className="sla-custom-message-actions">
            <button 
              className="sla-custom-message-reset-btn"
              onClick={handleReset}
              title="Restaurar mensagem padrão"
            >
              🔄 Restaurar Padrão
            </button>
            <button 
              className="sla-custom-message-save-btn"
              onClick={handleSave}
              title="Salvar mensagem personalizada"
            >
              💾 Salvar
            </button>
            <button 
              className="sla-custom-message-copy-btn"
              onClick={handleCopy}
              title="Copiar mensagem"
            >
              <FaCopy /> Copiar
            </button>
          </div>
        </div>

        <div className="sla-custom-message-modal-footer">
          <button 
            className="sla-custom-message-cancel-btn" 
            onClick={handleClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomMessageModal

