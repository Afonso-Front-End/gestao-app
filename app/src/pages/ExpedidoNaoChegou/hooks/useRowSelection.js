import { useState, useCallback } from 'react'

export const useRowSelection = (data) => {
  const [selectedRows, setSelectedRows] = useState(new Set())

  // Função auxiliar para obter a chave do pedido
  const getPedidoKey = useCallback((item) => {
    return item.número_de_pedido_jms || 
           item.numero_de_pedido_jms || 
           item['número de pedido jms'] ||
           item['numero de pedido jms'] ||
           item.remessa || 
           item.codigo_remessa || 
           item.numero_remessa
  }, [])

  // Selecionar/deselecionar uma linha
  const toggleRow = useCallback((pedido) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pedido)) {
        newSet.delete(pedido)
      } else {
        newSet.add(pedido)
      }
      return newSet
    })
  }, [])

  // Selecionar todas as linhas
  const selectAll = useCallback(() => {
    const allPedidos = data.map(item => getPedidoKey(item)).filter(Boolean)
    setSelectedRows(new Set(allPedidos))
  }, [data, getPedidoKey])

  // Deselecionar todas as linhas
  const deselectAll = useCallback(() => {
    setSelectedRows(new Set())
  }, [])

  // Verificar se uma linha está selecionada
  const isSelected = useCallback((pedido) => {
    return selectedRows.has(pedido)
  }, [selectedRows])

  // Verificar se todas estão selecionadas
  const isAllSelected = useCallback(() => {
    if (data.length === 0) return false
    const allPedidos = data.map(item => getPedidoKey(item)).filter(Boolean)
    return allPedidos.length > 0 && allPedidos.every(pedido => selectedRows.has(pedido))
  }, [data, selectedRows, getPedidoKey])

  return {
    selectedRows,
    toggleRow,
    selectAll,
    deselectAll,
    isSelected,
    isAllSelected
  }
}


