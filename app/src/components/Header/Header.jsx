import React, { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faCog } from '@fortawesome/free-solid-svg-icons'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import TauriStatus from '../TauriStatus/TauriStatus'
import UserProfileModal from '../UserProfileModal/UserProfileModal'
import ConfirmModal from '../ConfirmModal/ConfirmModal'
import ConfigModal from '../ConfigModal/ConfigModal'
import './Header.css'

const Header = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const userMenuRef = useRef(null)
  const configButtonRef = useRef(null)
  
  const isSlaPage = location.pathname === '/sla' || location.pathname.startsWith('/sla/')
  const isD1Page = location.pathname === '/d1' || location.pathname.startsWith('/d1/')
  const isPedidosRetidosPage = location.pathname === '/pedidos-retidos' || location.pathname.startsWith('/pedidos-retidos/')
  const hasConfigModal = isSlaPage || isD1Page || isPedidosRetidosPage

  const handleUserMenuClick = () => {
    setIsProfileModalOpen(true)
  }

  const handleLogoutClick = () => {
    setIsProfileModalOpen(false)
    setIsLogoutModalOpen(true)
  }

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false)
    logout()
  }

  const handleConfigClick = () => {
    if (hasConfigModal) {
      setIsConfigModalOpen(true)
    } else {
      // Navegar para configurações em outras páginas
      window.location.href = '/configuracoes'
    }
  }

  const getUserInitial = () => {
    if (user && user.nome) {
      return user.nome.charAt(0).toUpperCase()
    }
    return '?'
  }

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn">
          <FontAwesomeIcon icon={faBars} />
        </button>
      </div>
      <div className="header-right">
        {user && (
          <>
            <button
              ref={configButtonRef}
              className="header-config-button"
              onClick={handleConfigClick}
              title="Configurações"
            >
              <FontAwesomeIcon icon={faCog} />
            </button>
            {hasConfigModal && (
              <ConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                triggerRef={configButtonRef}
              />
            )}
            <div 
              ref={userMenuRef}
              className="user-menu" 
              onClick={handleUserMenuClick}
            >
              <div className="user-menu-avatar">
                {getUserInitial()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.nome}</span>
                <span className="user-role">{user.base}</span>
              </div>
            </div>
            <UserProfileModal
              isOpen={isProfileModalOpen}
              onClose={() => setIsProfileModalOpen(false)}
              user={user}
              onLogout={handleLogoutClick}
              triggerRef={userMenuRef}
            />
            <ConfirmModal
              isOpen={isLogoutModalOpen}
              onClose={() => setIsLogoutModalOpen(false)}
              onConfirm={handleConfirmLogout}
              title="Sair do Sistema"
              message="Tem certeza que deseja sair?"
              confirmText="Sair"
              cancelText="Cancelar"
              type="warning"
            />
          </>
        )}
        <TauriStatus />
      </div>
    </header>
  )
}

export default Header
