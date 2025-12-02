import React, { useState, useEffect, useRef } from 'react'
import './ConfirmModalWithPassword.css'
import { IoWarningOutline, IoClose, IoLockClosed } from 'react-icons/io5'

/**
 * Modal de confirmação com validação de senha
 * @param {boolean} isOpen - Estado do modal
 * @param {function} onClose - Função para fechar o modal
 * @param {function} onConfirm - Função executada ao confirmar (recebe a senha como parâmetro)
 * @param {function} onVerifyPassword - Função para verificar a senha (retorna Promise<boolean>)
 * @param {string} title - Título do modal
 * @param {string} message - Mensagem principal
 * @param {string} warningMessage - Mensagem de aviso adicional
 * @param {string} confirmText - Texto do botão confirmar
 * @param {string} cancelText - Texto do botão cancelar
 * @param {string} type - Tipo do modal: 'danger' | 'warning' | 'info'
 * @param {boolean} loading - Estado de loading
 */
const ConfirmModalWithPassword = ({
  isOpen,
  onClose,
  onConfirm,
  onVerifyPassword,
  title = 'Confirmar Ação',
  message = 'Tem certeza que deseja continuar?',
  warningMessage = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger',
  loading = false
}) => {
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const passwordInputRef = useRef(null)

  // Limpar senha quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setPasswordError('')
      // Focar no input após um pequeno delay
      setTimeout(() => {
        if (passwordInputRef.current) {
          passwordInputRef.current.focus()
        }
      }, 100)
    } else {
      setPassword('')
      setPasswordError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading && !verifying) {
      onClose()
    }
  }

  const handleConfirm = async () => {
    if (loading || verifying) return

    // Validar senha
    if (!password.trim()) {
      setPasswordError('Por favor, digite sua senha')
      if (passwordInputRef.current) {
        passwordInputRef.current.focus()
      }
      return
    }

    // Verificar senha
    if (onVerifyPassword) {
      setVerifying(true)
      setPasswordError('')
      
      try {
        const isValid = await onVerifyPassword(password)
        
        if (!isValid) {
          setPasswordError('Senha incorreta')
          setPassword('')
          if (passwordInputRef.current) {
            passwordInputRef.current.focus()
          }
          setVerifying(false)
          return
        }
      } catch (error) {
        setPasswordError('Erro ao verificar senha. Tente novamente.')
        setVerifying(false)
        return
      }
    }

    // Se chegou aqui, senha está correta ou não há verificação
    setVerifying(false)
    onConfirm(password)
    setPassword('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading && !verifying) {
      handleConfirm()
    }
    if (e.key === 'Escape' && !loading && !verifying) {
      onClose()
    }
  }

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal-container">
        {/* Botão fechar */}
        <button
          className="confirm-modal-close"
          onClick={onClose}
          disabled={loading || verifying}
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

        {/* Campo de senha */}
        <div className="confirm-modal-password-field">
          <label htmlFor="confirm-password" className="confirm-modal-password-label">
            <IoLockClosed className="confirm-modal-password-icon" />
            Digite sua senha para confirmar
          </label>
          <input
            ref={passwordInputRef}
            id="confirm-password"
            type="password"
            className={`confirm-modal-password-input ${passwordError ? 'error' : ''}`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setPasswordError('')
            }}
            onKeyDown={handleKeyDown}
            placeholder="Sua senha"
            disabled={loading || verifying}
            autoComplete="current-password"
          />
          {passwordError && (
            <p className="confirm-modal-password-error">{passwordError}</p>
          )}
        </div>

        {/* Botões de ação */}
        <div className="confirm-modal-actions">
          <button
            className="confirm-modal-btn confirm-modal-btn--cancel"
            onClick={onClose}
            disabled={loading || verifying}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-modal-btn confirm-modal-btn--confirm confirm-modal-btn--${type}`}
            onClick={handleConfirm}
            disabled={loading || verifying || !password.trim()}
          >
            {loading || verifying ? (
              <>
                <span className="confirm-modal-spinner"></span>
                {verifying ? 'Verificando...' : 'Processando...'}
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

export default ConfirmModalWithPassword

