import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'

/**
 * Hook para gerenciar dados de reports e snapshots
 */
export default function useReports() {
  const [latestSnapshot, setLatestSnapshot] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Buscar último snapshot
  const fetchLatestSnapshot = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.get('reports/snapshots/latest')
      
      if (response.data.success && response.data.data) {
        setLatestSnapshot(response.data.data)
      } else {
        setLatestSnapshot(null)
      }
    } catch (err) {
      console.error('❌ Erro ao buscar snapshot:', err)
      setError(err.response?.data?.detail || err.message || 'Erro ao carregar dados')
      setLatestSnapshot(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Buscar dados na montagem
  useEffect(() => {
    fetchLatestSnapshot()
  }, [fetchLatestSnapshot])

  // Função para recarregar dados
  const refresh = useCallback(() => {
    fetchLatestSnapshot()
  }, [fetchLatestSnapshot])

  return {
    latestSnapshot,
    isLoading,
    error,
    refresh
  }
}

