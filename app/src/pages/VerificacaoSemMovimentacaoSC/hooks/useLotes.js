import { useMemo } from 'react'

/**
 * Hook para gerar lotes de pedidos JMS
 */
export const useLotes = (pedidosJMS, tamanhoLote) => {
  return useMemo(() => {
    if (pedidosJMS.length === 0) {
      return []
    }

    const lotes = []
    
    for (let i = 0; i < pedidosJMS.length; i += tamanhoLote) {
      const lotePedidos = pedidosJMS.slice(i, i + tamanhoLote)
      lotes.push({
        numero_lote: Math.floor(i / tamanhoLote) + 1,
        total_pedidos: lotePedidos.length,
        pedidos: lotePedidos
      })
    }
    
    return lotes
  }, [pedidosJMS, tamanhoLote])
}

