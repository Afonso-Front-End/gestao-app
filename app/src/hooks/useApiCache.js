import { useRef, useCallback, useMemo } from 'react'

/**
 * Hook para cache de requisições API com TTL (Time To Live)
 * 
 * @param {number} ttl - Tempo de vida do cache em milissegundos (padrão: 5 minutos)
 * @returns {Object} - Objeto com funções de cache (memoizado para evitar re-renders)
 */
const useApiCache = (ttl = 5 * 60 * 1000) => {
  const cacheRef = useRef(new Map())
  const timestampsRef = useRef(new Map())
  const ttlRef = useRef(ttl)

  // Atualizar TTL ref se mudar
  if (ttlRef.current !== ttl) {
    ttlRef.current = ttl
  }

  /**
   * Gera uma chave de cache baseada na URL e parâmetros
   */
  const getCacheKey = useCallback((url, params = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&')
    return `${url}?${sortedParams}`
  }, [])

  /**
   * Verifica se um item está em cache e ainda é válido
   */
  const get = useCallback((url, params = {}) => {
    const key = getCacheKey(url, params)
    const cached = cacheRef.current.get(key)
    const timestamp = timestampsRef.current.get(key)

    if (!cached || !timestamp) return null

    const now = Date.now()
    if (now - timestamp > ttlRef.current) {
      // Cache expirado, remover
      cacheRef.current.delete(key)
      timestampsRef.current.delete(key)
      return null
    }

    return cached
  }, [getCacheKey])

  /**
   * Armazena um item no cache
   */
  const set = useCallback((url, params = {}, data) => {
    const key = getCacheKey(url, params)
    cacheRef.current.set(key, data)
    timestampsRef.current.set(key, Date.now())
  }, [getCacheKey])

  /**
   * Remove um item específico do cache
   */
  const invalidate = useCallback((url, params = {}) => {
    const key = getCacheKey(url, params)
    cacheRef.current.delete(key)
    timestampsRef.current.delete(key)
  }, [getCacheKey])

  /**
   * Limpa todo o cache
   */
  const clear = useCallback(() => {
    cacheRef.current.clear()
    timestampsRef.current.clear()
  }, [])

  // Memoizar o objeto retornado para evitar re-criação a cada render
  return useMemo(() => ({
    get,
    set,
    invalidate,
    clear
  }), [get, set, invalidate, clear])
}

export default useApiCache

