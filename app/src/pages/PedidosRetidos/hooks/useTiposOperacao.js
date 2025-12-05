import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'
import { useNotification } from '../../../contexts/NotificationContext'

const useTiposOperacao = () => {
  const [tipos, setTipos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showError } = useNotification()

  const fetchTipos = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/retidos/tipos-operacao')
      const tiposData = response.data.data || []
      setTipos(tiposData)
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar tipos de operação'
      setError(errorMessage)
      
      // Mostrar notificação de erro
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showError('Servidor não está respondendo. Verifique se está rodando.', 'Erro de Conexão')
      } else {
        showError(`Erro ao carregar tipos de operação: ${errorMessage}`, 'Erro de Carregamento')
      }
      
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchTipos()
  }, [fetchTipos])

  return {
    tipos,
    loading,
    error,
    refetch: fetchTipos
  }
}

export default useTiposOperacao