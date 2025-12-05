import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'

/**
 * Hook para gerenciar dados de reports e snapshots de todos os módulos
 */
export default function useReports() {
  const [snapshots, setSnapshots] = useState({
    pedidos_parados: null,
    d1: null,
    sla: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState({
    pedidos_parados: null,
    d1: null,
    sla: null
  })

  // Buscar todos os snapshots
  const fetchAllSnapshots = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrors({ pedidos_parados: null, d1: null, sla: null })
      
      const modules = ['pedidos_parados', 'd1', 'sla']
      const results = {}
      const errorResults = {}
      
      // Buscar todos os snapshots de todos os módulos em paralelo
      await Promise.all(
        modules.map(async (module) => {
          try {
            // Para SLA, Pedidos Retidos e D1, buscar todos os snapshots; para outros módulos, buscar apenas o mais recente
            const useAllSnapshots = module === 'sla' || module === 'pedidos_parados' || module === 'd1'
            const endpoint = useAllSnapshots
              ? `reports/snapshots/all?module=${module}`
              : `reports/snapshots/latest?module=${module}`
            
            const response = await api.get(endpoint)
            if (response.data.success) {
              // Para SLA, Pedidos Retidos e D1, retornar array de snapshots; para outros, retornar objeto único ou null
              if (useAllSnapshots) {
                results[module] = response.data.data || []
              } else {
                results[module] = response.data.data || null
              }
            } else {
              results[module] = useAllSnapshots ? [] : null
            }
          } catch (err) {
            errorResults[module] = err.response?.data?.detail || err.message || 'Erro ao carregar dados'
            const useAllSnapshots = module === 'sla' || module === 'pedidos_parados' || module === 'd1'
            results[module] = useAllSnapshots ? [] : null
          }
        })
      )
      
      setSnapshots(results)
      setErrors(errorResults)
    } catch (err) {
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Buscar dados na montagem
  useEffect(() => {
    fetchAllSnapshots()
  }, [fetchAllSnapshots])

  // Função para recarregar dados
  const refresh = useCallback(() => {
    fetchAllSnapshots()
  }, [fetchAllSnapshots])

  return {
    snapshots,
    isLoading,
    errors,
    refresh
  }
}

