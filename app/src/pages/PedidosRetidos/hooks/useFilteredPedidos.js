import { useState, useCallback } from 'react'
import api from '../../../services/api'
import { useNotification } from '../../../contexts/NotificationContext'

const useFilteredPedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showError } = useNotification()

  const fetchFilteredPedidos = useCallback(async (filters) => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (filters.bases && filters.bases.length > 0) {
        params.append('bases', filters.bases.join(','))
      }
      if (filters.tipos && filters.tipos.length > 0) {
        params.append('tipos', filters.tipos.join(','))
      }
      if (filters.aging && filters.aging.length > 0) {
        params.append('aging', filters.aging.join(','))
      }
      
      // Limite padrão de 1000 pedidos
      params.append('limit', filters.limit || 1000)
      
      const response = await api.get(`/retidos/filtered-pedidos?${params.toString()}`)
      const data = response.data
      
      
      setPedidos(data.data || [])
      
      return data
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar pedidos filtrados'
      setError(errorMessage)
      
      // Mostrar notificação de erro
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showError('Servidor não está respondendo. Verifique se está rodando.', 'Erro de Conexão')
      } else {
        showError(`Erro ao buscar pedidos: ${errorMessage}`, 'Erro de Busca')
      }
      
      console.error('Erro ao buscar pedidos filtrados:', err)
      setPedidos([])
      return { data: [], total_found: 0, total_processed: 0 }
    } finally {
      setLoading(false)
    }
  }, [showError])

  const clearPedidos = useCallback(() => {
    setPedidos([])
    setError(null)
  }, [])

  return {
    pedidos,
    loading,
    error,
    fetchFilteredPedidos,
    clearPedidos
  }
}

export default useFilteredPedidos
