import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../../../services/api'

/**
 * Hook para gerenciar configurações da tabela
 * Salva no servidor primeiro, depois sincroniza com localStorage
 */
export const useTableConfig = (tableId, defaultColumns = []) => {
  const storageKey = `d1-table-config-${tableId}`
  
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

  // Carregar configuração do servidor
  const loadConfigFromServer = useCallback(async () => {
    try {
      const response = await api.get(`/d1/bipagens/table-config/${tableId}`)
      if (response.data.success && response.data.config) {
        return response.data.config
      }
    } catch (error) {
    }
    return null
  }, [tableId])

  // Carregar configuração do localStorage (fallback)
  const loadConfigFromLocal = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed
      }
    } catch (error) {
    }
    return null
  }, [storageKey])

  // Salvar configuração no servidor
  const saveConfigToServer = useCallback(async (config) => {
    try {
      await api.post(`/d1/bipagens/table-config/${tableId}`, { config })
    } catch (error) {
      throw error
    }
  }, [tableId])

  // Salvar configuração no localStorage (sincronização)
  const saveConfigToLocal = useCallback((config) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config))
    } catch (error) {
    }
  }, [storageKey])

  // Estado inicial - carregar do localStorage primeiro (para renderização rápida)
  const getInitialColumns = () => {
    if (defaultColumns.length === 0) {
      return []
    }
    const saved = loadConfigFromLocal()
    if (saved && saved.columns && saved.columns.length > 0) {
      // Mesclar colunas salvas com defaultColumns
      const savedMap = new Map(saved.columns.map(c => [c.id, c]))
      const merged = defaultColumns
        .map((col, index) => {
          const columnName = typeof col === 'string' ? col : (col.header || col.key || `col-${index}`)
          const id = createColumnId(columnName)
          const savedCol = savedMap.get(id)
          
          if (savedCol) {
            // Garantir que coluna de copiar sempre tenha order: -1
            const normalizedName = columnName.toLowerCase().trim()
            const isCopyColumn = normalizedName === 'copiar' || normalizedName === 'copy'
            return { 
              ...savedCol, 
              name: columnName,
              order: isCopyColumn ? -1 : savedCol.order
            }
          }
          
          const normalizedName = columnName.toLowerCase().trim()
          const isCopyColumn = normalizedName === 'copiar' || normalizedName === 'copy'
          
          return {
            id,
            name: columnName,
            originalIndex: index,
            visible: true,
            order: isCopyColumn ? -1 : (saved.columns.length + index),
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
    }
    return initializeColumns(defaultColumns)
  }

  const initialColumns = getInitialColumns()
  const [columns, setColumns] = useState(initialColumns)

  // Flag para evitar salvar durante o carregamento inicial
  const [isLoading, setIsLoading] = useState(true)
  const hasLoadedRef = useRef(false)
  const lastTableIdRef = useRef(tableId)
  const initialColumnsRef = useRef(initialColumns)
  
  // Resetar ref quando tableId mudar
  useEffect(() => {
    if (lastTableIdRef.current !== tableId) {
      hasLoadedRef.current = false
      lastTableIdRef.current = tableId
      // Recarregar colunas iniciais para o novo tableId
      const localConfig = loadConfigFromLocal()
      let newInitialColumns = []
      if (localConfig && localConfig.columns && localConfig.columns.length > 0 && defaultColumns.length > 0) {
        const savedMap = new Map(localConfig.columns.map(c => [c.id, c]))
        newInitialColumns = defaultColumns
          .map((col, index) => {
            const columnName = typeof col === 'string' ? col : (col.header || col.key || `col-${index}`)
            const id = createColumnId(columnName)
            const savedCol = savedMap.get(id)
            
            if (savedCol) {
              return { ...savedCol, name: columnName }
            }
            
            return {
              id,
              name: columnName,
              originalIndex: index,
              visible: true,
              order: localConfig.columns.length + index,
              styles: {
                backgroundColor: '',
                textColor: '',
                fontWeight: 'normal',
                fontStyle: 'normal'
              }
            }
          })
          .sort((a, b) => a.order - b.order)
      } else if (defaultColumns.length > 0) {
        newInitialColumns = initializeColumns(defaultColumns)
      }
      initialColumnsRef.current = newInitialColumns
      setColumns(newInitialColumns)
      setIsLoading(true)
    }
  }, [tableId, defaultColumns, loadConfigFromLocal, createColumnId, initializeColumns])

  // Função auxiliar para mesclar colunas salvas com defaultColumns
  const mergeColumns = useCallback((savedColumns, defaults) => {
    if (!savedColumns || savedColumns.length === 0) {
      return initializeColumns(defaults)
    }
    
    const savedIds = new Set(savedColumns.map(c => c.id))
    const savedMap = new Map(savedColumns.map(c => [c.id, c]))
    
    // Criar mapa de defaultColumns por ID
    const defaultMap = new Map()
    defaults.forEach((col, index) => {
      const columnName = typeof col === 'string' ? col : (col.header || col.key || `col-${index}`)
      const id = createColumnId(columnName)
      defaultMap.set(id, { columnName, index })
    })
    
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

  // Carregar configuração do servidor quando componente montar
  useEffect(() => {
    // Evitar carregar múltiplas vezes
    if (hasLoadedRef.current || defaultColumns.length === 0) {
      if (defaultColumns.length === 0) {
        setIsLoading(false)
      }
      return
    }
    
    const loadConfig = async () => {
      hasLoadedRef.current = true
      
      // Capturar colunas iniciais (do localStorage carregado no estado inicial)
      const initialColumns = initialColumnsRef.current
      const hasInitialColumns = initialColumns && initialColumns.length > 0
      
      try {
        // Tentar carregar do servidor primeiro
        const serverConfig = await loadConfigFromServer()
        
        if (serverConfig && serverConfig.columns && serverConfig.columns.length > 0) {
          // Se tiver no servidor, usar e sincronizar com localStorage
          const mergedColumns = mergeColumns(serverConfig.columns, defaultColumns)
          setColumns(mergedColumns)
          // Sincronizar com localStorage
          saveConfigToLocal({ columns: mergedColumns })
        } else {
          // Se não tiver no servidor, verificar se já temos colunas iniciais (do localStorage)
          if (hasInitialColumns) {
            // Já temos colunas carregadas do localStorage no estado inicial, manter elas
            // Apenas sincronizar com servidor (sem alterar o estado)
            saveConfigToServer({ columns: initialColumns }).catch(err => {
            })
            // Não alterar o estado, já está correto
          } else {
            // Se não tiver colunas iniciais, tentar localStorage
            const localConfig = loadConfigFromLocal()
            if (localConfig && localConfig.columns && localConfig.columns.length > 0) {
              const mergedColumns = mergeColumns(localConfig.columns, defaultColumns)
              setColumns(mergedColumns)
              // Salvar no servidor
              saveConfigToServer({ columns: mergedColumns }).catch(err => {
              })
            } else {
              // Se não tiver em nenhum lugar, verificar se já temos no estado
              setColumns(prev => {
                if (prev.length > 0) {
                  return prev // Manter o que já temos
                }
                return initializeColumns(defaultColumns)
              })
            }
          }
        }
      } catch (error) {
        // Em caso de erro, manter o que já temos no estado ou usar localStorage
        if (!hasInitialColumns) {
          const localConfig = loadConfigFromLocal()
          if (localConfig && localConfig.columns && localConfig.columns.length > 0) {
            const mergedColumns = mergeColumns(localConfig.columns, defaultColumns)
            setColumns(mergedColumns)
          } else {
            setColumns(prev => {
              if (prev.length > 0) {
                return prev // Manter o que já temos
              }
              return initializeColumns(defaultColumns)
            })
          }
        }
        // Se já temos colunas iniciais, manter elas (não alterar estado)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadConfig()
  }, [defaultColumns, initializeColumns, loadConfigFromServer, loadConfigFromLocal, saveConfigToLocal, saveConfigToServer, mergeColumns])

  // Salvar quando columns mudar - salvar no servidor primeiro, depois sincronizar com localStorage
  useEffect(() => {
    // Não salvar durante o carregamento inicial
    if (isLoading || columns.length === 0) return
    
    const config = { columns }
    
    // Salvar no servidor primeiro
    saveConfigToServer(config)
      .then(() => {
        // Se salvou no servidor com sucesso, sincronizar com localStorage
        saveConfigToLocal(config)
      })
      .catch((error) => {
        // Se falhar no servidor, salvar apenas no localStorage como fallback
        saveConfigToLocal(config)
      })
  }, [columns, isLoading, saveConfigToServer, saveConfigToLocal])

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

  const resetConfig = useCallback(async () => {
    const reset = initializeColumns(defaultColumns)
    setColumns(reset)
    
    // Remover do servidor e localStorage
    try {
      await api.delete(`/d1/bipagens/table-config/${tableId}`)
    } catch (error) {
    }
    localStorage.removeItem(storageKey)
  }, [defaultColumns, initializeColumns, storageKey, tableId])

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

