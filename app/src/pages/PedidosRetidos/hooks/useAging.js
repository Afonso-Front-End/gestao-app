import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'
import { useNotification } from '../../../contexts/NotificationContext'

const useAging = () => {
  const [aging, setAging] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showError } = useNotification()

  const fetchAging = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/retidos/aging')
      const agingData = response.data.data || []
      setAging(agingData)
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar aging'
      setError(errorMessage)
      
      // Mostrar notificação de erro
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showError('Servidor não está respondendo. Verifique se está rodando.', 'Erro de Conexão')
      } else {
        showError(`Erro ao carregar aging: ${errorMessage}`, 'Erro de Carregamento')
      }
      
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchAging()
  }, [fetchAging])

  return {
    aging,
    loading,
    error,
    refetch: fetchAging
  }
}

export default useAging