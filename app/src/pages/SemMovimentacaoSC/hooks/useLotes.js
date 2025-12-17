import { useMemo } from 'react'

/**
 * Hook para gerar lotes de remessas
 */
export const useLotes = (remessasUnicas, tamanhoLote) => {
  return useMemo(() => {
    if (remessasUnicas.length === 0) {
      return []
    }

    const lotes = []
    const remessas = remessasUnicas.map(item => item.remessa).filter(Boolean)
    
    for (let i = 0; i < remessas.length; i += tamanhoLote) {
      const loteRemessas = remessas.slice(i, i + tamanhoLote)
      lotes.push({
        numero_lote: Math.floor(i / tamanhoLote) + 1,
        total_remessas: loteRemessas.length,
        remessas: loteRemessas
      })
    }
    
    return lotes
  }, [remessasUnicas, tamanhoLote])
}

