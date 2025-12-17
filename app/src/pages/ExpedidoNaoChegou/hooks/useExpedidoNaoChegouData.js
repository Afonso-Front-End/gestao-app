import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'

export const useExpedidoNaoChegouData = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.append('limit', '50000') // Limite alto para pegar todos os dados

      const url = `/expedido-nao-chegou/list?${params.toString()}`

      const response = await api.get(url)
      
      if (response.data?.success) {
        setData(response.data.data || [])
        setTotal(response.data.total || 0)
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (err) {
      console.error('❌ Erro ao buscar dados:', err)
      setError(err.message || 'Erro ao buscar dados')
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, total, refetch: fetchData }
}


