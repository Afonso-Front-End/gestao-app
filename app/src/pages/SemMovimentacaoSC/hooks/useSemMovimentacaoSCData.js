import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'

export const useSemMovimentacaoSCData = (selectedTiposOperacao, selectedAgings) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async () => {
    if (selectedTiposOperacao.length === 0 && selectedAgings.length === 0) {
      setData([])
      setTotal(0)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      
      if (selectedTiposOperacao.length > 0) {
        params.append('tipo_operacao', selectedTiposOperacao.join(','))
        console.log('🔍 Filtrando por tipos de operação:', selectedTiposOperacao)
      }
      
      if (selectedAgings.length > 0) {
        params.append('aging', selectedAgings.join(','))
        console.log('🔍 Filtrando por agings:', selectedAgings)
      }

      params.append('limit', '50000') // Limite alto para pegar todos os dados filtrados

      const url = `/sem-movimentacao-sc/list?${params.toString()}`
      console.log('📡 Buscando dados com URL:', url)

      const response = await api.get(url)
      
      if (response.data?.success) {
        console.log('✅ Dados recebidos:', response.data.data?.length || 0, 'registros')
        console.log('✅ Total de remessas:', response.data.total || 0)
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
  }, [selectedTiposOperacao, selectedAgings])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, total, refetch: fetchData }
}

