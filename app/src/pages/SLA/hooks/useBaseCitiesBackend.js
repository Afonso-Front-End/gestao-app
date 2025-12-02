import { useState, useEffect } from 'react'
import { useRefresh } from '../contexts/RefreshContext'
import useApiCache from '../../../hooks/useApiCache'
import { buildApiUrl } from '../../../utils/tauri-utils'
import { getApiHeaders } from '../../../utils/api-headers'

/**
 * Hook otimizado para buscar cidades do backend
 * 
 * Melhorias implementadas:
 * - Cache em memória com TTL de 30 minutos (cidades mudam pouco)
 * - NÃO salva no localStorage (apenas bases são salvas)
 * - Invalidação inteligente apenas quando necessário
 */
const useBaseCitiesBackend = (baseName) => {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { refreshTrigger } = useRefresh()
  
  // Cache em memória com TTL de 30 minutos (cidades raramente mudam)
  const cache = useApiCache(30 * 60 * 1000)

  useEffect(() => {
    if (!baseName) {
      setCities([])
      setLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    const abortController = new AbortController()

    const fetchCities = async () => {
      const url = buildApiUrl(`sla/calculator/cities/${encodeURIComponent(baseName)}`)
      
      // 1. Verificar cache em memória apenas (não usar localStorage para cidades)
      const cached = cache.get(url, {})
      if (cached) {
        if (isMounted) {
          setCities(cached)
          setLoading(false)
          setError(null)
        }
        return
      }
      
      // Só setar loading para true se não houver cache
      if (isMounted) {
        setLoading(true)
        setError(null)
      }
      
      try {
        const response = await fetch(url, {
          headers: getApiHeaders(),
          signal: abortController.signal
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Erro ${response.status}: ${errorData.detail || 'Erro desconhecido'}`)
        }
        
        const result = await response.json()
        const citiesData = result.data?.cities || []
        
        if (isMounted) {
          // Armazenar apenas em cache em memória (não no localStorage)
          cache.set(url, {}, citiesData)
          
          setCities(citiesData)
        }
        
      } catch (err) {
        // Ignorar erros de abort
        if (err.name === 'AbortError') {
          return
        }
        
        if (isMounted) {
          setError(err.message)
          setCities([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchCities()
    
    // Cleanup: cancelar requisição se componente for desmontado ou dependências mudarem
    return () => {
      isMounted = false
      abortController.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseName, refreshTrigger]) // Re-executa quando baseName ou refreshTrigger muda

  return { cities, loading, error }
}

export default useBaseCitiesBackend
