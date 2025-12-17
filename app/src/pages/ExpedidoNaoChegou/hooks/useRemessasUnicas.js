import { useMemo } from 'react'

/**
 * Hook para agrupar dados por número de pedido JMS (uma linha por pedido)
 */
export const useRemessasUnicas = (data) => {
  return useMemo(() => {
    const pedidosMap = new Map()
    
    data.forEach(item => {
      // Tentar encontrar o número de pedido JMS em várias variações
      const pedido = item.número_de_pedido_jms || 
                     item.numero_de_pedido_jms || 
                     item['número de pedido jms'] ||
                     item['numero de pedido jms'] ||
                     item.remessa || 
                     item.codigo_remessa || 
                     item.numero_remessa ||
                     item.numero_de_pedido ||
                     item['numero de pedido']
      
      if (pedido && !pedidosMap.has(pedido)) {
        pedidosMap.set(pedido, item)
      }
    })
    
    return Array.from(pedidosMap.values())
  }, [data])
}


