import { useMemo } from 'react'

/**
 * Hook para agrupar dados por remessa (uma linha por remessa)
 */
export const useRemessasUnicas = (data) => {
  return useMemo(() => {
    const remessasMap = new Map()
    
    data.forEach(item => {
      const remessa = item.remessa
      if (!remessasMap.has(remessa)) {
        remessasMap.set(remessa, item)
      }
    })
    
    return Array.from(remessasMap.values())
  }, [data])
}

