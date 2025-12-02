import React, { useState, useRef, useEffect } from 'react'
import { IoFilter, IoChevronDown } from "react-icons/io5"
import './FilterDropdown.css'

const FilterDropdown = ({ children, label = "Filtros", badgeCount = 0, closeOnOutsideClick = true }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    if (isOpen && containerRef.current && contentRef.current) {
      const container = containerRef.current
      const content = contentRef.current
      const rect = container.getBoundingClientRect()
      const contentWidth = content.offsetWidth || 400
      const viewportWidth = window.innerWidth
      const sidebarWidth = 300 // Largura do sidebar
      
      // Verificar se há espaço à direita
      const spaceRight = viewportWidth - rect.right
      const spaceLeft = rect.left - sidebarWidth
      
      // Se não há espaço suficiente à direita e há mais espaço à esquerda (após o sidebar)
      if (spaceRight < contentWidth && spaceLeft > spaceRight) {
        content.style.left = 'auto'
        content.style.right = '0'
        // Se ainda assim não couber, centralizar
        if (spaceLeft < contentWidth) {
          content.style.left = '50%'
          content.style.right = 'auto'
          content.style.transform = 'translateX(-50%)'
        } else {
          content.style.transform = 'none'
        }
      } else {
        // Abrir normalmente à direita do botão
        content.style.left = 'auto'
        content.style.right = '0'
        content.style.transform = 'none'
      }
    }
  }, [isOpen])

  // Fechar dropdown ao clicar fora (apenas se closeOnOutsideClick for true)
  useEffect(() => {
    if (!closeOnOutsideClick) return
    
    const handleClickOutside = (event) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, closeOnOutsideClick])

  return (
    <div 
      ref={containerRef}
      className={`filter-dropdown-container ${isOpen ? 'open' : ''}`}
    >
      <button
        className={`filter-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <IoFilter className="filter-icon" />
        <span className="filter-label">{label}</span>
        {badgeCount > 0 && (
          <span className="filter-badge">{badgeCount}</span>
        )}
        <IoChevronDown className={`filter-arrow ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div 
          ref={contentRef}
          className="filter-dropdown-content"
        >
          <div className="filter-dropdown-header">
            <h3>Filtros de Busca</h3>
            <p>Selecione os filtros desejados</p>
          </div>
          <div className="filter-dropdown-body">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterDropdown

