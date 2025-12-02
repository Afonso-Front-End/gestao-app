import React, { createContext, useContext, useState } from 'react'

const PedidosRetidosLoadingContext = createContext()

export const usePedidosRetidosLoading = () => {
  const context = useContext(PedidosRetidosLoadingContext)
  if (!context) {
    throw new Error('usePedidosRetidosLoading must be used within PedidosRetidosLoadingProvider')
  }
  return context
}

export const PedidosRetidosLoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({})

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
    <PedidosRetidosLoadingContext.Provider value={{
      startLoading,
      stopLoading,
      clearAllLoading,
      isLoading,
      getLoadingMessage,
      hasAnyLoading,
      loadingStates
    }}>
      {children}
    </PedidosRetidosLoadingContext.Provider>
  )
}

