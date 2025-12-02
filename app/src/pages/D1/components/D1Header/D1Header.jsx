import React from 'react'
import { IoList } from 'react-icons/io5'

const D1Header = ({
  showLotes,
  setShowLotes,
  hasPedidos
}) => {
  return (
    <div className="d1-header-container">
      <div className="d1-header">
        {/* Seção Principal - Apenas toggle de lotes */}
        <div className="d1-primary-section">
          <button
            className={`d1-toggle-lotes-btn ${showLotes ? 'open' : ''}`}
            onClick={() => setShowLotes(!showLotes)}
            title={showLotes ? 'Ocultar lotes' : 'Mostrar lotes'}
            disabled={!hasPedidos}
          >
            <IoList className="d1-toggle-icon" size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default D1Header

