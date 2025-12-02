import { useState, useEffect } from 'react'

/**
 * Hook customizado para gerenciar estado persistente com localStorage
 * @param {string} key - Chave para armazenar no localStorage
 * @param {any} defaultValue - Valor padrão se não existir no localStorage
 * @returns {[any, function]} - [valor, setter] similar ao useState
 */
const usePersistentState = (key, defaultValue) => {
  // Função para obter valor do localStorage
  const getStoredValue = () => {
    try {
      const item = localStorage.getItem(key)
      if (item === null || item === undefined || item === 'undefined') {
        return defaultValue
      }
      
      const parsed = JSON.parse(item)
      return parsed !== null && parsed !== undefined ? parsed : defaultValue
    } catch (error) {
      console.error(`Erro ao ler localStorage para chave "${key}":`, error)
      return defaultValue
    }
  }

  // Estado inicial
  const [value, setValue] = useState(getStoredValue)

  // Função para atualizar estado e localStorage
  const setStoredValue = (newValue) => {
    try {
      // Se newValue é uma função, executá-la com o valor atual
      let actualValue = newValue
      if (typeof newValue === 'function') {
        actualValue = newValue(value)
      }
      
      setValue(actualValue)
      localStorage.setItem(key, JSON.stringify(actualValue))
    } catch (error) {
      console.error(`Erro ao salvar no localStorage para chave "${key}":`, error)
      setValue(newValue) // Ainda atualiza o estado mesmo se localStorage falhar
    }
  }

  // Sincronizar com mudanças em outras abas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null && e.newValue !== 'undefined') {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed !== null && parsed !== undefined) {
            setValue(parsed)
          }
        } catch (error) {
          console.error(`Erro ao sincronizar localStorage para chave "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [value, setStoredValue]
}

export default usePersistentState
