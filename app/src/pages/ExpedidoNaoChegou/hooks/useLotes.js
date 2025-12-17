import { useMemo } from 'react'

/**
 * Hook para gerar lotes de remessas
 */
export const useLotes = (remessasUnicas, tamanhoLote) => {
  return useMemo(() => {
    if (!remessasUnicas || remessasUnicas.length === 0) {
      return []
    }

    const lotes = []
    // Se remessasUnicas é um array de strings, usar diretamente
    // Se é um array de objetos, extrair a propriedade número de pedido JMS
    const remessas = remessasUnicas.map(item => {
      if (typeof item === 'string') {
        return item
      }
      return item.número_de_pedido_jms || 
             item.numero_de_pedido_jms || 
             item['número de pedido jms'] ||
             item['numero de pedido jms'] ||
             item.remessa || 
             item.codigo_remessa || 
             item.numero_remessa ||
             item
    }).filter(Boolean)
    
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


