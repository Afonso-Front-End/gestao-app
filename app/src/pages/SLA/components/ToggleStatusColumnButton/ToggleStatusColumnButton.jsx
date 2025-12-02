import React from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import './ToggleStatusColumnButton.css'

const ToggleStatusColumnButton = ({ isVisible, onClick, className = '', title = '' }) => {
  const defaultTitle = isVisible ? 'Ocultar coluna de Status' : 'Mostrar coluna de Status'
  
  return (
    <button
      className={`sla-toggle-status-column-btn ${className}`}
      onClick={onClick}
      title={title || defaultTitle}
    >
      {isVisible ? <FaEye /> : <FaEyeSlash />}
    </button>
  )
}

export default ToggleStatusColumnButton

