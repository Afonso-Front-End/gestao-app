import React from 'react'
import { FaCog } from 'react-icons/fa'
import './TableConfigButton.css'

const TableConfigButton = ({ onClick, className = '' }) => {
  return (
    <button
      className={`d1-table-config-button ${className}`}
      onClick={onClick}
      title="Configurar tabela"
    >
      <FaCog />
    </button>
  )
}

export default TableConfigButton


