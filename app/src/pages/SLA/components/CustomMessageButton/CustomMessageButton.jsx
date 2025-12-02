import React from 'react'
import { FaCommentDots } from 'react-icons/fa'
import './CustomMessageButton.css'

const CustomMessageButton = ({ onClick, className = '', title = 'Mensagem Personalizada' }) => {
  return (
    <button
      className={`sla-custom-message-button ${className}`}
      onClick={onClick}
      title={title}
    >
      <FaCommentDots />
    </button>
  )
}

export default CustomMessageButton

