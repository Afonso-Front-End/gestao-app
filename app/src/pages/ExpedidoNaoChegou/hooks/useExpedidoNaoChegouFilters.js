import { useState, useEffect } from 'react'
import api from '../../../services/api'

export const useExpedidoNaoChegouFilters = () => {
  const [basesEntrega, setBasesEntrega] = useState([])
  const [status, setStatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFilters = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get('/expedido-nao-chegou/filters')
      
      if (response.data?.success) {
        setBasesEntrega(response.data.bases_entrega || [])
        setStatus(response.data.status || [])
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (err) {
      setError(err.message || 'Erro ao buscar filtros')
      setBasesEntrega([])
      setStatus([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilters()
  }, [])

  return {
    basesEntrega,
    status,
    loading,
    error,
    refetch: fetchFilters
  }
}


