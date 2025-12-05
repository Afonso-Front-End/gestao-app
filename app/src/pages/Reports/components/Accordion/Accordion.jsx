import React, { useState } from 'react'
import { IoChevronDown } from 'react-icons/io5'
import './Accordion.css'

const Accordion = ({ title, children, defaultOpen = true, icon, count }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="reports-accordion">
      <button
        className={`reports-accordion-header ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="reports-accordion-title-section">
          {icon && React.isValidElement(icon) ? (
            <span className="reports-accordion-icon">{icon}</span>
          ) : icon && typeof icon === 'function' ? (
            React.createElement(icon, { className: 'reports-accordion-icon' })
          ) : icon ? (
            <span className="reports-accordion-icon">{icon}</span>
          ) : null}
          <span className="reports-accordion-title">{title}</span>
          {count !== undefined && (
            <span className="reports-accordion-count">{count}</span>
          )}
        </div>
        <IoChevronDown className={`reports-accordion-arrow ${isOpen ? 'open' : ''}`} />
      </button>
      <div className={`reports-accordion-content ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default Accordion

