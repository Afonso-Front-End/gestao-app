import React, { memo } from 'react'
import { FaCog } from 'react-icons/fa'
import './TableConfigButton.css'

const TableConfigButton = memo(({ onClick, className = '' }) => {
  return (
    <button
      className={`sla-table-config-button ${className}`}
      onClick={onClick}
      title="Configurar tabela"
    >
      <FaCog />
    </button>
  )
})

TableConfigButton.displayName = 'TableConfigButton'

export default TableConfigButton


