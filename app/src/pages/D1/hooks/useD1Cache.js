import { useRef } from 'react'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos em milissegundos

/**
 * Hook para gerenciar cache de dados
 */
export const useD1Cache = () => {
  const cacheRef = useRef({
    pedidosMotorista: {}, // { chave: { data, timestamp } }
    pedidosBipagens: {}, // { chave: { data, timestamp } }
    telefones: {} // { chave: telefone }
  })

  /**
   * Gera chave de cache baseada no tipo e parâmetros
   */
  const gerarChaveCache = (tipo, params) => {
    return `${tipo}_${JSON.stringify(params)}`
  }

  /**
   * Verifica se uma entrada de cache é válida
   */
  const isCacheValido = (cacheEntry) => {
    if (!cacheEntry || !cacheEntry.timestamp) return false
    return Date.now() - cacheEntry.timestamp < CACHE_DURATION
  }

  /**
   * Limpa todo o cache
   */
  const limparCache = () => {
    cacheRef.current.pedidosMotorista = {}
    cacheRef.current.pedidosBipagens = {}
    cacheRef.current.telefones = {}
  }

  return {
    cacheRef,
    gerarChaveCache,
    isCacheValido,
    limparCache
  }
}

