import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const LoadingContext = createContext()

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({})
  const location = useLocation()

  // Limpar todos os loadings quando a rota mudar
  useEffect(() => {
    setLoadingStates({})
  }, [location.pathname])

  const startLoading = (key, message = 'Carregando...') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { isLoading: true, message }
    }))
  }

  const stopLoading = (key) => {
    setLoadingStates(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }

  const clearAllLoading = () => {
    setLoadingStates({})
  }

  const isLoading = (key) => {
    return loadingStates[key]?.isLoading || false
  }

  const getLoadingMessage = (key) => {
    return loadingStates[key]?.message || ''
  }

  const hasAnyLoading = Object.keys(loadingStates).length > 0

  return (
    <LoadingContext.Provider value={{
      startLoading,
      stopLoading,
      clearAllLoading,
      isLoading,
      getLoadingMessage,
      hasAnyLoading,
      loadingStates
    }}>
      {children}
    </LoadingContext.Provider>
  )
}
