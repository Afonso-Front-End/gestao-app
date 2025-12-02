import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(new Map())
  const location = useLocation()

  // Limpar todas as notificações de loading quando a rota mudar
  useEffect(() => {
    // Remover todas as notificações de loading
    setLoadingNotifications(prev => {
      const idsToRemove = Array.from(prev.keys())
      setNotifications(current => current.filter(n => !idsToRemove.includes(n.id)))
      return new Map()
    })
  }, [location.pathname])

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: 'info', // info, success, warning, error, loading
      title: '',
      message: '',
      duration: 5000,
      ...notification
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto remove agora é controlado pelo componente Notification
    // para permitir animação suave

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const showSuccess = useCallback((message, title = 'Sucesso', duration = 5000) => {
    return addNotification({ type: 'success', title, message, duration })
  }, [addNotification])

  const showError = useCallback((message, title = 'Erro', duration = 7000) => {
    return addNotification({ type: 'error', title, message, duration })
  }, [addNotification])

  const showWarning = useCallback((message, title = 'Atenção', duration = 6000) => {
    return addNotification({ type: 'warning', title, message, duration })
  }, [addNotification])

  const showInfo = useCallback((message, title = 'Informação', duration = 5000) => {
    return addNotification({ type: 'info', title, message, duration })
  }, [addNotification])

  const showLoading = useCallback((message, title = 'Carregando') => {
    const id = addNotification({ type: 'loading', title, message, duration: 0 })
    setLoadingNotifications(prev => new Map(prev).set(id, true))
    return id
  }, [addNotification])

  const hideLoading = useCallback((id) => {
    setLoadingNotifications(prev => {
      const newMap = new Map(prev)
      newMap.delete(id)
      return newMap
    })
    removeNotification(id)
  }, [removeNotification])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    hideLoading
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
