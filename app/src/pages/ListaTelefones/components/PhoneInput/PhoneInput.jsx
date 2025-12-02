import React, { useState, useEffect } from 'react'
import './PhoneInput.css'

const PhoneInput = ({ 
  value = '', 
  onChange, 
  placeholder = 'Digite o telefone',
  className = '',
  disabled = false,
  maxLength = 15
}) => {
  const [inputValue, setInputValue] = useState(value)

  const formatPhoneNumber = (phone) => {
    const numbers = phone.replace(/\D/g, '')
    const limitedNumbers = numbers.slice(0, maxLength)
    
    if (limitedNumbers.length <= 2) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`
    } else if (limitedNumbers.length <= 11) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7, 11)}`
    }
  }

  const extractNumbers = (formattedPhone) => {
    return formattedPhone.replace(/\D/g, '')
  }

  useEffect(() => {
    const valueNumbers = (value || '').replace(/\D/g, '')
    const inputValueNumbers = (inputValue || '').replace(/\D/g, '')
    
    if (valueNumbers !== inputValueNumbers) {
      if (valueNumbers) {
        const formattedValue = formatPhoneNumber(valueNumbers)
        setInputValue(formattedValue)
      } else {
        setInputValue('')
      }
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e) => {
    const rawValue = e.target.value
    const numbersOnly = extractNumbers(rawValue)
    
    if (numbersOnly.length <= maxLength) {
      const formattedValue = formatPhoneNumber(numbersOnly)
      setInputValue(formattedValue)
      
      if (onChange) {
        onChange(numbersOnly)
      }
    }
  }

  const handleKeyDown = (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ]
    
    if (allowedKeys.includes(e.key)) {
      return
    }
    
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return
    }
    
    if (!/\d/.test(e.key)) {
      e.preventDefault()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const numbersOnly = extractNumbers(pastedText)
    
    if (numbersOnly.length <= maxLength) {
      const formattedValue = formatPhoneNumber(numbersOnly)
      setInputValue(formattedValue)
      
      if (onChange) {
        onChange(numbersOnly)
      }
    }
  }

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      className={`phone-input ${className}`}
      disabled={disabled}
      maxLength={maxLength + 6}
    />
  )
}

export default PhoneInput

