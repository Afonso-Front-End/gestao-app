import { useEffect, useState } from 'react'

/**
 * Hook para debounce de valores
 * Útil para evitar múltiplas requisições quando o usuário está digitando/selecionando
 * 
 * @param {any} value - Valor a ser "debounced"
 * @param {number} delay - Delay em milissegundos (padrão: 300ms)
 * @returns {any} - Valor após o debounce
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
