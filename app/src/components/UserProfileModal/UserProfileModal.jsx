import React, { useEffect, useRef, useState, useCallback } from 'react'
import { IoClose, IoPerson, IoBusiness, IoLogOut } from 'react-icons/io5'
import './UserProfileModal.css'

const UserProfileModal = ({ isOpen, onClose, user, onLogout, triggerRef }) => {
  const modalRef = useRef(null)
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)


  const handleClose = useCallback(() => {
    if (!isClosing) {
      onClose()
    }
  }, [isClosing, onClose])

  // Controlar renderização e animação de abertura
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsClosing(false)
      // Aplicar animação após renderizar
      requestAnimationFrame(() => {
        if (modalRef.current) {
          modalRef.current.classList.add('user-profile-modal--open')
        }
      })
    } else if (shouldRender) {
      // Iniciar animação de fechamento
      setIsClosing(true)
      if (modalRef.current) {
        modalRef.current.classList.remove('user-profile-modal--open')
        modalRef.current.classList.add('user-profile-modal--closing')
      }
      // Remover do DOM após a animação
      const timer = setTimeout(() => {
        setShouldRender(false)
        setIsClosing(false)
        if (modalRef.current) {
          modalRef.current.classList.remove('user-profile-modal--closing')
        }
      }, 200) // Duração da animação de fechamento
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, shouldRender])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        !isClosing &&
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        handleClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen && !isClosing) {
        handleClose()
      }
    }

    if (isOpen && !isClosing) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, isClosing, handleClose])

  if (!shouldRender || !user) return null

  const getUserInitial = () => {
    if (user && user.nome) {
      return user.nome.charAt(0).toUpperCase()
    }
    return '?'
  }

  return (
    <div ref={modalRef} className="user-profile-modal">
        <div className="user-profile-header">
          <div className="user-profile-avatar">
            {getUserInitial()}
          </div>
          <button
            className="user-profile-close"
            onClick={handleClose}
            aria-label="Fechar"
            disabled={isClosing}
          >
            <IoClose />
          </button>
        </div>

        <div className="user-profile-content">
          <div className="user-profile-info">
            <div className="user-profile-info-item">
              <IoPerson className="user-profile-info-icon" />
              <div className="user-profile-info-text">
                <span className="user-profile-info-label">Nome</span>
                <span className="user-profile-info-value">{user.nome}</span>
              </div>
            </div>

            {user.base && (
              <div className="user-profile-info-item">
                <IoBusiness className="user-profile-info-icon" />
                <div className="user-profile-info-text">
                  <span className="user-profile-info-label">Base</span>
                  <span className="user-profile-info-value">{user.base}</span>
                </div>
              </div>
            )}
          </div>

          <div className="user-profile-actions">
            <button
              className="user-profile-logout-btn"
              onClick={onLogout}
            >
              <IoLogOut />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
  )
}

export default UserProfileModal

