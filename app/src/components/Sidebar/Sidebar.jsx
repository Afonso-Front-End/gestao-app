import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  IoMenu,
  IoClose,
  IoEllipsisHorizontal
} from 'react-icons/io5'
import { MAIN_MENU_ITEMS } from '../../config/routes'
import { useAuth } from '../../contexts/AuthContext'
import './Sidebar.css'

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const { user } = useAuth()

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  // Obter primeira letra do nome do usuário
  const getUserInitial = () => {
    if (user && user.nome) {
      return user.nome.charAt(0).toUpperCase()
    }
    return 'U'
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-button"
        onClick={toggleMobile}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <IoClose /> : <IoMenu />}
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-user-avatar">
              {getUserInitial()}
            </div>
            <div className="sidebar-brand-text">
              <h2>Torre de Controle</h2>
              {user && user.base && (
                <span className="sidebar-brand-subtitle">{user.base}</span>
              )}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">
            <span>MENU PRINCIPAL</span>
          </div>
          <div className="sidebar-main-nav">
            {MAIN_MENU_ITEMS.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setIsMobileOpen(false)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="sidebar-link-content">
                  <div 
                    className="sidebar-icon-wrapper"
                    style={{ background: item.gradient || 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)' }}
                  >
                    <item.icon className="sidebar-icon" />
                  </div>
                  <span className="sidebar-label">{item.label}</span>
                </div>
                <div className="sidebar-link-indicator"></div>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <div className="sidebar-version">
              <span className="version-label">Versão</span>
              <span className="version-number">1.0.0</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar