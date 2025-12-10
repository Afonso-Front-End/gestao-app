import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook para gerenciar configurações da tabela
 * Usa APENAS localStorage (sem requisições ao servidor)
 */
export const useTableConfig = (tableId, defaultColumns = []) => {
  const storageKey = `sla-table-config-${tableId}`
  
  // Criar IDs únicos para colunas baseado no nome
  const createColumnId = (columnName) => {
    return columnName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Inicializar colunas com IDs
  const initializeColumns = useCallback((cols) => {
    return cols.map((col, index) => {
      const columnName = typeof col === 'string' ? col : (col.header || col.key || `col-${index}`)
      const normalizedName = columnName.toLowerCase().trim()
      const isCopyColumn = normalizedName === 'copiar' || normalizedName === 'copy'
      
      return {
        id: createColumnId(columnName),
        name: columnName,
        originalIndex: index,
        visible: true,
        order: isCopyColumn ? -1 : index, // Coluna de copiar sempre primeiro (order: -1)
        isFixed: false, // Coluna fixa (sequencial do início)
        styles: {
          backgroundColor: '',
          textColor: '',
          fontWeight: 'normal', // normal, bold, bolder
          fontStyle: 'normal' // normal, italic
        }
      }
    })
  }, [])

  // Carregar configuração do localStorage
  const loadConfigFromLocal = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed
      }
    } catch (error) {
      // Erro silencioso ao carregar configuração
    }
    return null
  }, [storageKey])

  // Salvar configuração no localStorage
  const saveConfigToLocal = useCallback((config) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config))
    } catch (error) {
      // Erro silencioso ao salvar configuração
    }
  }, [storageKey])

  // Estado inicial - sempre inicializar com defaultColumns
  const [columns, setColumns] = useState(() => {
    if (defaultColumns.length === 0) return []
    return initializeColumns(defaultColumns)
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const hasLoadedRef = useRef(false)
  const lastTableIdRef = useRef(tableId)
  
  // Resetar quando tableId mudar
  useEffect(() => {
    if (lastTableIdRef.current !== tableId) {
      hasLoadedRef.current = false
      lastTableIdRef.current = tableId
      if (defaultColumns.length > 0) {
        setColumns(initializeColumns(defaultColumns))
        setIsLoading(true)
      }
    }
  }, [tableId, defaultColumns.length, initializeColumns])

  // Função auxiliar para mesclar colunas salvas com defaultColumns
  const mergeColumns = useCallback((savedColumns, defaults) => {
    if (!savedColumns || savedColumns.length === 0) {
      return initializeColumns(defaults)
    }
    
    const savedMap = new Map(savedColumns.map(c => [c.id, c]))
    
    // Mesclar: usar colunas salvas se existirem, senão criar novas
    const merged = defaults
      .map((col, index) => {
        const columnName = typeof col === 'string' ? col : (col.header || col.key || `col-${index}`)
        const id = createColumnId(columnName)
        const savedCol = savedMap.get(id)
        
        if (savedCol) {
          // Manter configuração salva, mas atualizar nome se mudou
          // Garantir que coluna de copiar sempre tenha order: -1
          const normalizedName = columnName.toLowerCase().trim()
          const isCopyColumn = normalizedName === 'copiar' || normalizedName === 'copy'
          return { 
            ...savedCol, 
            name: columnName,
            order: isCopyColumn ? -1 : savedCol.order
          }
        }
        
        // Nova coluna não salva
        const normalizedName = columnName.toLowerCase().trim()
        const isCopyColumn = normalizedName === 'copiar' || normalizedName === 'copy'
        
        return {
          id,
          name: columnName,
          originalIndex: index,
          visible: true,
          order: isCopyColumn ? -1 : (savedColumns.length + index),
          isFixed: false,
          styles: {
            backgroundColor: '',
            textColor: '',
            fontWeight: 'normal',
            fontStyle: 'normal'
          }
        }
      })
      .sort((a, b) => a.order - b.order)
    
    return merged
  }, [createColumnId, initializeColumns])

  // Carregar configuração do localStorage
  useEffect(() => {
    if (defaultColumns.length === 0 || hasLoadedRef.current) {
      setIsLoading(false)
      return
    }
    
    // Verificar se há colunas reais (não só "Copiar")
    const hasRealColumns = defaultColumns.some(col => {
      const name = typeof col === 'string' ? col : (col.header || col.key || '')
      const normalized = name.toLowerCase().trim()
      return normalized !== 'copiar' && normalized !== 'copy'
    })
    
    if (!hasRealColumns) {
      setIsLoading(false)
      return
    }
    
    hasLoadedRef.current = true
    const localConfig = loadConfigFromLocal()
    
    if (localConfig?.columns?.length > 0) {
      const merged = mergeColumns(localConfig.columns, defaultColumns)
      setColumns(merged)
    } else {
      // Se não tem config salva, inicializar com defaultColumns
      setColumns(initializeColumns(defaultColumns))
    }
    
    setIsLoading(false)
  }, [defaultColumns, loadConfigFromLocal, mergeColumns, initializeColumns])

  // Salvar quando columns mudar - apenas localStorage
  useEffect(() => {
    // Não salvar durante o carregamento inicial
    if (isLoading) return
    
    // Não salvar se só tiver coluna de copiar (sem dados reais)
    const hasRealColumns = columns.some(col => {
      const name = (col.name || '').toLowerCase().trim()
      return name !== 'copiar' && name !== 'copy'
    })
    
    if (!hasRealColumns || columns.length === 0) return
    
    const config = { columns }
    saveConfigToLocal(config)
  }, [columns, isLoading, saveConfigToLocal])

  // Funções de manipulação
  const updateColumnOrder = useCallback((oldOrdersInNewOrder) => {
    setColumns(prev => {
      // Criar um mapa de order -> coluna para buscar rapidamente
      const orderMap = new Map()
      prev.forEach(col => {
        orderMap.set(col.order, col)
      })
      
      // Reorganizar baseado na nova ordem das orders antigas
      const reordered = []
      oldOrdersInNewOrder.forEach((oldOrder, newIndex) => {
        const col = orderMap.get(oldOrder)
        if (col) {
          reordered.push({ ...col, order: newIndex })
        }
      })
      
      // Garantir que todas as colunas estão presentes
      // Se alguma coluna não foi encontrada, adicionar no final
      const reorderedIds = new Set(reordered.map(c => c.id))
      const remaining = prev.filter(col => !reorderedIds.has(col.id))
      
      const allColumns = [
        ...reordered,
        ...remaining.map((col, idx) => ({
          ...col,
          order: reordered.length + idx
        }))
      ]
      
      // Ordenar por order para garantir ordem correta
      return allColumns.sort((a, b) => a.order - b.order)
    })
  }, [])

  const toggleColumnVisibility = useCallback((columnId) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    ))
  }, [])

  const updateColumnStyles = useCallback((columnId, styles) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, styles: { ...col.styles, ...styles } } : col
    ))
  }, [])

  const resetConfig = useCallback(() => {
    const reset = initializeColumns(defaultColumns)
    setColumns(reset)
    // Remover do localStorage
    localStorage.removeItem(storageKey)
  }, [defaultColumns, initializeColumns, storageKey])

  // Resetar apenas colunas (ordem, visibilidade e fixação)
  const resetColumns = useCallback(() => {
    setColumns(prev => {
      // Ordenar por originalIndex para restaurar ordem original
      const sorted = [...prev].sort((a, b) => a.originalIndex - b.originalIndex)
      return sorted.map((col, index) => ({
        ...col,
        visible: true,
        order: index,
        isFixed: false
      }))
    })
  }, [])

  // Resetar apenas estilos
  const resetStyles = useCallback(() => {
    setColumns(prev => prev.map(col => ({
      ...col,
      styles: {
        backgroundColor: '',
        textColor: '',
        fontWeight: 'normal',
        fontStyle: 'normal'
      }
    })))
  }, [])

  // Atualizar colunas fixas - garante que apenas colunas sequenciais do início sejam fixas
  const updateFixedColumns = useCallback((columnId, isFixed) => {
    setColumns(prev => {
      // Ordenar colunas por order
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      
      // Encontrar o índice da coluna que está sendo alterada
      const targetIndex = sorted.findIndex(col => col.id === columnId)
      
      if (targetIndex === -1) return prev
      
      // Se está marcando como fixa, todas as colunas anteriores também devem ser fixas
      // Se está desmarcando como fixa, todas as colunas posteriores também devem ser desmarcadas
      return sorted.map((col, index) => {
        if (isFixed) {
          // Se marcando como fixa, todas até o índice atual devem ser fixas
          return {
            ...col,
            isFixed: index <= targetIndex
          }
        } else {
          // Se desmarcando, todas a partir do índice atual devem ser desmarcadas
          return {
            ...col,
            isFixed: index < targetIndex
          }
        }
      })
    })
  }, [])

  // Obter colunas visíveis ordenadas
  const visibleColumns = columns
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order)

  return {
    columns,
    visibleColumns,
    updateColumnOrder,
    toggleColumnVisibility,
    updateColumnStyles,
    updateFixedColumns,
    resetConfig,
    resetColumns,
    resetStyles
  }
}


