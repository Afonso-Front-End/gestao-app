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

  // Atualiza o valor interno quando a prop value muda (apenas se for diferente)
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value]) // Removido inputValue das dependências para evitar loop

  // Função para formatar número de telefone
  const formatPhoneNumber = (phone) => {
    // Remove todos os caracteres não numéricos
    const numbers = phone.replace(/\D/g, '')
    
    // Limita o tamanho
    const limitedNumbers = numbers.slice(0, maxLength)
    
    // Formata com máscara brasileira
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

  // Função para extrair apenas números
  const extractNumbers = (formattedPhone) => {
    return formattedPhone.replace(/\D/g, '')
  }

  const handleInputChange = (e) => {
    const rawValue = e.target.value
    const numbersOnly = extractNumbers(rawValue)
    
    // Só aceita números
    if (numbersOnly.length <= maxLength) {
      const formattedValue = formatPhoneNumber(numbersOnly)
      setInputValue(formattedValue)
      
      // NÃO chama onChange em tempo real (será chamado apenas pelo botão Confirmar)
      // Comentado para melhor performance quando há botões de confirmar/cancelar
    }
  }

  const handleKeyDown = (e) => {
    // Permite: backspace, delete, tab, escape, enter, home, end, setas
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ]
    
    // Se for uma tecla permitida, deixa passar
    if (allowedKeys.includes(e.key)) {
      return
    }
    
    // Se for Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, deixa passar
    if (e.ctrlKey && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) {
      return
    }
    
    // Se não for número, bloqueia
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
      
      // NÃO chama onChange em tempo real (será chamado apenas pelo botão Confirmar)
      // Comentado para melhor performance quando há botões de confirmar/cancelar
    }
  }

  // Função para obter valor interno (sem formatação)
  const getNumericValue = () => {
    return extractNumbers(inputValue)
  }

  // Expor método via ref (opcional, caso pai precise acessar)
  React.useImperativeHandle(React.useRef(), () => ({
    getNumericValue
  }))

  return (
    <input
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      className={`pedidos-retidos-phone-input ${className}`}
      disabled={disabled}
      maxLength={maxLength + 6} // +6 para os caracteres de formatação
      data-numeric-value={extractNumbers(inputValue)} // Expor valor numérico via data attribute
    />
  )
}

export default PhoneInput

