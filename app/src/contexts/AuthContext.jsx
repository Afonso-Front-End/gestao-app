import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useNotification } from './NotificationContext'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()

  // Verificar autenticação ao carregar
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        setLoading(false)
        return
      }

      // Verificar token com o servidor
      const response = await api.get('/auth/me')
      if (response.data) {
        setUser(response.data)
        setIsAuthenticated(true)
      }
    } catch (error) {
      // Token inválido, limpar
      localStorage.removeItem('authToken')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (nome, senha, lembrar = false) => {
    try {
      const response = await api.post('/auth/login', {
        nome,
        senha,
        lembrar
      })

      const { access_token, user: userData } = response.data

      // Salvar token
      localStorage.setItem('authToken', access_token)
      
      // Se não lembrar, salvar apenas na sessão
      if (!lembrar) {
        sessionStorage.setItem('authToken', access_token)
      }

      setUser(userData)
      setIsAuthenticated(true)
      showSuccess(`Bem-vindo, ${userData.nome}!`)
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao fazer login'
      showError(message)
      return { success: false, error: message }
    }
  }, [showSuccess, showError])

  const register = useCallback(async (nome, base, senha) => {
    try {
      const response = await api.post('/auth/register', {
        nome,
        base,
        senha
      })

      showSuccess('Conta criada com sucesso! Faça login para continuar.')
      navigate('/login')
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao criar conta'
      showError(message)
      return { success: false, error: message }
    }
  }, [showSuccess, showError, navigate])

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    sessionStorage.removeItem('authToken')
    setUser(null)
    setIsAuthenticated(false)
    navigate('/login')
    showSuccess('Logout realizado com sucesso!')
  }, [navigate, showSuccess])

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

