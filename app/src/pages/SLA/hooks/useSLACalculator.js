import { useState, useEffect, useMemo, useRef } from 'react'
import useApiCache from '../../../hooks/useApiCache'
import useDebounce from '../../../hooks/useDebounce'
import { useRefresh } from '../contexts/RefreshContext'
import { buildApiUrl } from '../../../utils/tauri-utils'
import { getApiHeaders } from '../../../utils/api-headers'

/**
 * Hook otimizado para calcular SLA no backend
 * 
 * Melhorias implementadas:
 * - Cache em memória com TTL de 5 minutos
 * - Debounce para seleção de cidades (500ms)
 * - Comparação inteligente de arrays de cidades
 * - Memoização de dados processados
 * - Invalidação de cache quando houver refresh
 */
const useSLACalculator = (baseName, cities) => {
  const { refreshTrigger } = useRefresh()
  const [slaData, setSlaData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const lastRefreshTrigger = useRef(0)
  
  // Cache com TTL de 5 minutos
  const cache = useApiCache(5 * 60 * 1000)
  
  // Normalizar e debounce cidades para evitar requisições desnecessárias
  const citiesKey = useMemo(() => {
    if (!cities || cities.length === 0) return ''
    return [...cities].sort().join(',')
  }, [cities])
  
  const debouncedCitiesKey = useDebounce(citiesKey, 500) // 500ms de debounce

  useEffect(() => {
    if (!baseName) {
      setSlaData(null)
      setLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    const abortController = new AbortController()

    const fetchSLAData = async () => {
      // Parâmetros para cache
      const citiesArray = debouncedCitiesKey ? debouncedCitiesKey.split(',').filter(Boolean) : []
      const cacheParams = { cities: citiesArray }
      const urlKey = buildApiUrl(`sla/calculator/metrics/${encodeURIComponent(baseName)}`)
      
      // Se houver refresh (refreshTrigger mudou), invalidar cache e forçar nova busca
      const hasRefresh = refreshTrigger !== lastRefreshTrigger.current
      if (hasRefresh) {
        cache.invalidate(urlKey, cacheParams)
        lastRefreshTrigger.current = refreshTrigger
      }
      
      // Verificar cache apenas se não houver refresh
      if (!hasRefresh) {
        const cached = cache.get(urlKey, cacheParams)
        if (cached) {
          if (isMounted) {
            setSlaData(cached)
            setLoading(false)
            setError(null)
          }
          return // Retornar cedo se houver cache - NÃO executa finally
        }
      }
      
      // Só setar loading para true se não houver cache
      if (isMounted) {
        setLoading(true)
        setError(null)
      }
      
      try {
        // Construir URL com parâmetros
        let url = buildApiUrl(`sla/calculator/metrics/${encodeURIComponent(baseName)}`)
        if (citiesArray.length > 0) {
          // Construir query string manualmente para evitar erro com URL relativa
          const queryParams = citiesArray.map(city => `cities=${encodeURIComponent(city)}`).join('&')
          url = `${url}?${queryParams}`
        }
        
        const response = await fetch(url, {
          headers: getApiHeaders(),
          signal: abortController.signal
        })
        
        if (!response.ok) {
          let errorMessage = `Erro ${response.status}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorData.error || errorMessage
          } catch (parseError) {
            // Se não conseguir parsear o JSON, usar a mensagem padrão
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }
        
        const result = await response.json()
        
        // Verificar se há erro no resultado
        if (result.success === false || result.error) {
          // Se não há dados mas a resposta foi bem-sucedida (200), usar dados vazios
          if (result.data && result.data.motoristas) {
            // Dados vazios mas estrutura válida
            if (isMounted) {
              cache.set(urlKey, cacheParams, result.data)
              setSlaData(result.data)
            }
            return
          }
          throw new Error(result.error || result.detail || result.message || 'Erro desconhecido')
        }
        
        // Armazenar no cache apenas se for sucesso
        if (result.data && isMounted) {
          cache.set(urlKey, cacheParams, result.data)
          setSlaData(result.data)
        } else if (!result.data) {
          // Se não há dados, criar estrutura vazia
          const emptyData = {
            motoristas: [],
            total_pedidos: 0,
            total_entregues: 0,
            total_nao_entregues: 0,
            sla_percentual: 0.0
          }
          if (isMounted) {
            cache.set(urlKey, cacheParams, emptyData)
            setSlaData(emptyData)
          }
        }
        
      } catch (err) {
        // Ignorar erros de abort
        if (err.name === 'AbortError') {
          return
        }
        
        if (isMounted) {
          // Mensagens de erro mais amigáveis
          let errorMsg = err.message
          if (err.message.includes('404')) {
            errorMsg = `Base "${baseName}" não encontrada. Verifique se a base foi processada corretamente.`
          } else if (err.message.includes('500')) {
            errorMsg = `Erro interno no servidor ao processar a base "${baseName}". Tente novamente.`
          }
          setError(errorMsg)
          setSlaData(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchSLAData()
    
    // Cleanup: cancelar requisição se componente for desmontado ou dependências mudarem
    return () => {
      isMounted = false
      abortController.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseName, debouncedCitiesKey, refreshTrigger])

  return { slaData, loading, error }
}

export default useSLACalculator
