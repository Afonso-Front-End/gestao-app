import { useState, useEffect } from 'react'

/**
 * Hook para debounce de valores
 * Útil para evitar re-renders excessivos em inputs de busca
 * 
 * @param {any} value - Valor a ser "debouncado"
 * @param {number} delay - Delay em milissegundos (padrão: 300ms)
 * @returns {any} Valor com debounce aplicado
 * 
 * @example
 * const [searchText, setSearchText] = useState('')
 * const debouncedSearch = useDebouncedValue(searchText, 300)
 * 
 * // debouncedSearch só atualiza 300ms após a última mudança em searchText
 */
const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Criar timeout para atualizar o valor
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: cancelar timeout se value mudar antes do delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebouncedValue
