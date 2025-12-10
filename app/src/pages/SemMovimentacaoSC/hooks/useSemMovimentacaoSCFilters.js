import { useState, useEffect } from 'react'
import api from '../../../services/api'

export const useSemMovimentacaoSCFilters = () => {
  const [tiposOperacao, setTiposOperacao] = useState([])
  const [agings, setAgings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFilters = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get('/sem-movimentacao-sc/filters')
      
      if (response.data?.success) {
        setTiposOperacao(response.data.tipos_operacao || [])
        setAgings(response.data.agings || [])
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (err) {
      setError(err.message || 'Erro ao buscar filtros')
      setTiposOperacao([])
      setAgings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilters()
  }, [])

  return {
    tiposOperacao,
    agings,
    loading,
    error,
    refetch: fetchFilters
  }
}

