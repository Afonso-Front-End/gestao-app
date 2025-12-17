import { useMemo } from 'react'

/**
 * Hook para gerar colunas da tabela
 * Exibe: Número de pedido JMS, Base de escaneamento, Próxima parada
 */
export const useTableColumns = (data) => {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    // Pegar o primeiro item para identificar as colunas
    const firstItem = data[0]
    const columns = []

    // Colunas que queremos exibir (em ordem)
    const desiredColumns = [
      { 
        keys: [
          'número_de_pedido_jms', 'numero_de_pedido_jms', 'número de pedido jms', 'numero de pedido jms',
          'número do pedido jms', 'numero do pedido jms',
          'remessa', 'codigo_remessa', 'numero_remessa', 'numero_de_pedido', 'numero de pedido', 'numero pedido', 'pedido'
        ], 
        header: 'Número de pedido JMS' 
      },
      { 
        keys: [
          'base_de_escaneamento', 'base de escaneamento', 'base_escaneamento', 'base escaneamento',
          'base_entrega', 'base', 'base de entrega', 'base_entrega'
        ], 
        header: 'Base de escaneamento' 
      },
      { 
        keys: [
          'próxima_parada', 'proxima_parada', 'próxima parada', 'proxima parada',
          'proxima parada', 'next_stop', 'next stop'
        ], 
        header: 'Próxima parada' 
      }
    ]

    // Buscar e adicionar as colunas desejadas
    desiredColumns.forEach(({ keys, header }) => {
      let found = false
      
      // Primeiro, tentar encontrar exatamente como está nos dados
      for (const key of keys) {
        if (firstItem.hasOwnProperty(key)) {
          columns.push({
            key: key,
            header: header
          })
          found = true
          break
        }
      }
      
      // Se não encontrou, tentar variações case-insensitive
      if (!found) {
        const dataKeys = Object.keys(firstItem)
        for (const key of keys) {
          const keyLower = key.toLowerCase().replace(/[_\s]/g, '')
          for (const dataKey of dataKeys) {
            const dataKeyLower = dataKey.toLowerCase().replace(/[_\s]/g, '')
            if (keyLower === dataKeyLower || dataKeyLower.includes(keyLower) || keyLower.includes(dataKeyLower)) {
              columns.push({
                key: dataKey,
                header: header
              })
              found = true
              break
            }
          }
          if (found) break
        }
      }
    })

    return columns
  }, [data])
}

/**
 * Formata o nome do cabeçalho de uma coluna
 */
function formatHeader(key) {
  // Converter snake_case ou camelCase para título
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

