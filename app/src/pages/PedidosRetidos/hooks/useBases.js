import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'
import { useNotification } from '../../../contexts/NotificationContext'

const useBases = () => {
  const [bases, setBases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { showError } = useNotification()

  const fetchBases = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/retidos/bases')
      const basesData = response.data.data || []
      setBases(basesData)
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar bases'
      setError(errorMessage)
      
      // Mostrar notificação de erro
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showError('Servidor não está respondendo. Verifique se está rodando.', 'Erro de Conexão')
      } else {
        showError(`Erro ao carregar bases: ${errorMessage}`, 'Erro de Carregamento')
      }
      
      console.error('Erro ao buscar bases:', err)
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchBases()
  }, [fetchBases])

  return {
    bases,
    loading,
    error,
    refetch: fetchBases
  }
}

export default useBases
