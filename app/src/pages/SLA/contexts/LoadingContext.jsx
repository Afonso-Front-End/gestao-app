import React, { createContext, useContext, useState } from 'react'

const SLALoadingContext = createContext()

export const useSLALoading = () => {
  const context = useContext(SLALoadingContext)
  if (!context) {
    throw new Error('useSLALoading must be used within SLALoadingProvider')
  }
  return context
}

export const SLALoadingProvider = ({ children }) => {
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
    <SLALoadingContext.Provider value={{
      startLoading,
      stopLoading,
      clearAllLoading,
      isLoading,
      getLoadingMessage,
      hasAnyLoading,
      loadingStates
    }}>
      {children}
    </SLALoadingContext.Provider>
  )
}

