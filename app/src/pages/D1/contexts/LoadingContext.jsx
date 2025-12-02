import React, { createContext, useContext, useState } from 'react'

const D1LoadingContext = createContext()

export const useD1Loading = () => {
  const context = useContext(D1LoadingContext)
  if (!context) {
    throw new Error('useD1Loading must be used within D1LoadingProvider')
  }
  return context
}

export const D1LoadingProvider = ({ children }) => {
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
    <D1LoadingContext.Provider value={{
      startLoading,
      stopLoading,
      clearAllLoading,
      isLoading,
      getLoadingMessage,
      hasAnyLoading,
      loadingStates
    }}>
      {children}
    </D1LoadingContext.Provider>
  )
}

