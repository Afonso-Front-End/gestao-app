import React from 'react'
import { MdDelete } from "react-icons/md";
import './ClearDataButton.css'

const ClearDataButton = ({ onClearClick }) => {
  const handleClick = () => {
    if (onClearClick) {
      onClearClick()
    }
  }

  return (
    <div className="clear-data-button">
      <button
        onClick={handleClick}
        className="clear-btn"
        title="Limpar todos os dados SLA"
      >
        <MdDelete size={20} />
      </button>
    </div>
  )
}

export default ClearDataButton
