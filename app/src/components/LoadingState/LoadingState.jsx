import React, { memo } from 'react'
import { FaSpinner } from 'react-icons/fa'
import './LoadingState.css'

const LoadingState = memo(({ 
  message = 'Carregando...', 
  subtitle = null,
  size = 'medium' // small, medium, large
}) => {
  return (
    <div className={`loading-state-container loading-state-${size}`}>
      <div className="loading-state-circle-1"></div>
      <div className="loading-state-circle-2"></div>
      
      <div className="loading-state-content">
        <div className="loading-state-spinner">
          <FaSpinner className="loading-state-icon" />
        </div>
        
        <h3 className="loading-state-title">{message}</h3>
        
        {subtitle && (
          <p className="loading-state-subtitle">{subtitle}</p>
        )}
        
        <div className="loading-state-dots">
          <span className="loading-state-dot"></span>
          <span className="loading-state-dot"></span>
          <span className="loading-state-dot"></span>
        </div>
      </div>
    </div>
  )
})

LoadingState.displayName = 'LoadingState'

export default LoadingState

