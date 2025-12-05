import { useState, useCallback } from 'react'
import api from '../../../services/api'

const usePedidosParados = () => {
  const [data, setData] = useState([])
  const [totalPedidos, setTotalPedidos] = useState(0)
  const [totalBases, setTotalBases] = useState(0)
  const [lotes, setLotes] = useState([])
  const [totalLotes, setTotalLotes] = useState(0)
  const [loading, setLoading] = useState(true) // Iniciar como true para mostrar loading inicial
  const [error, setError] = useState(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const fetchPedidosParados = useCallback(async (filtros = {}) => {
    setLoading(true)
    setError(null)
    
    try {
                  // Construir parâmetros de query
                  const params = new URLSearchParams()
                  if (filtros.bases && filtros.bases.length > 0) {
                    params.append('bases', filtros.bases.join(','))
                  }
                  if (filtros.cidades && filtros.cidades.length > 0) {
                    params.append('cidades', filtros.cidades.join(','))
                  }
                  if (filtros.tipos && filtros.tipos.length > 0) {
                    params.append('tipos', filtros.tipos.join(','))
                  }
                  if (filtros.aging && filtros.aging.length > 0) {
                    params.append('aging', filtros.aging.join(','))
                  }
      
      const url = `/retidos/pedidos-parados${params.toString() ? '?' + params.toString() : ''}`
      const response = await api.get(url)
      const result = response.data
      
                  if (result.success) {
                    setData(result.data || [])
                    setTotalPedidos(result.total_pedidos || 0)
                    setTotalBases(result.total_bases || 0)
                    setLotes(result.lotes || [])
                    setTotalLotes(result.total_lotes || 0)
                  } else {
                    throw new Error('Erro na resposta do servidor')
                  }
      
      return result
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar dados de pedidos parados'
      setError(errorMessage)
      
      setData([])
      setTotalPedidos(0)
      setTotalBases(0)
      setLotes([])
      setTotalLotes(0)
      return { success: false, data: [], total_bases: 0, total_pedidos: 0, lotes: [], total_lotes: 0 }
    } finally {
      setLoading(false)
      setInitialLoadDone(true) // Marcar que a primeira carga foi feita
    }
  }, [])

  const clearData = useCallback(() => {
    setData([])
    setTotalPedidos(0)
    setTotalBases(0)
    setLotes([])
    setTotalLotes(0)
    setError(null)
  }, [])

  return {
    data,
    setData,
    totalPedidos,
    setTotalPedidos,
    totalBases,
    setTotalBases,
    lotes,
    setLotes,
    totalLotes,
    setTotalLotes,
    loading,
    error,
    initialLoadDone,
    fetchPedidosParados,
    clearData
  }
}

export default usePedidosParados
