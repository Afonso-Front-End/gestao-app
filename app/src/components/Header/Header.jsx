import React, { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faUpload } from '@fortawesome/free-solid-svg-icons'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ConfigModal from '../ConfigModal/ConfigModal'
import './Header.css'

const Header = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const configButtonRef = useRef(null)
  
  const isSlaPage = location.pathname === '/sla' || location.pathname.startsWith('/sla/')
  const isD1Page = location.pathname === '/d1' || location.pathname.startsWith('/d1/')
  const isPedidosRetidosPage = location.pathname === '/pedidos-retidos' || location.pathname.startsWith('/pedidos-retidos/')
  const isSemMovimentacaoSCPage = location.pathname === '/sem-movimentacao-sc' || location.pathname.startsWith('/sem-movimentacao-sc/')
  const hasConfigModal = isSlaPage || isD1Page || isPedidosRetidosPage || isSemMovimentacaoSCPage

  const handleConfigClick = () => {
    if (hasConfigModal) {
      setIsConfigModalOpen(true)
    } else {
      // Navegar para configurações em outras páginas
      window.location.href = '/configuracoes'
    }
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
              title="Importações"
            >
              <FontAwesomeIcon icon={faUpload} />
            </button>
            {hasConfigModal && (
              <ConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                triggerRef={configButtonRef}
              />
            )}
          </>
        )}
      </div>
    </header>
  )
}

export default Header
