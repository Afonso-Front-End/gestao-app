import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'sem_movimentacao_sc_main_selected_rows'

/**
 * Hook para gerenciar seleção de linhas na página principal
 * Salva as seleções no localStorage para carregar quando a página recarregar
 */
export const useRowSelectionMain = (remessasUnicas) => {
  const [selectedRows, setSelectedRows] = useState(new Set())

  // Carregar remessas selecionadas salvas do localStorage
  const loadSelectedRows = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const savedArray = JSON.parse(saved)
        return new Set(savedArray)
      }
    } catch (error) {
      console.error('Erro ao carregar remessas selecionadas:', error)
    }
    return new Set()
  }, [])

  // Salvar remessas selecionadas no localStorage
  const saveSelectedRows = useCallback((selectedRemessas) => {
    try {
      const selectedArray = Array.from(selectedRemessas)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedArray))
    } catch (error) {
      console.error('Erro ao salvar remessas selecionadas:', error)
    }
  }, [])

  // Carregar seleções salvas quando os dados mudarem
  useEffect(() => {
    if (remessasUnicas.length > 0) {
      const savedSelected = loadSelectedRows()
      
      // Filtrar apenas as remessas que existem nos dados atuais
      const allRemessas = new Set(remessasUnicas.map(item => item.remessa).filter(Boolean))
      const validSelected = new Set(
        Array.from(savedSelected).filter(remessa => allRemessas.has(remessa))
      )
      
      setSelectedRows(validSelected)
      
      // Atualizar localStorage removendo remessas que não existem mais
      if (validSelected.size !== savedSelected.size) {
        saveSelectedRows(validSelected)
      }
    } else {
      setSelectedRows(new Set())
    }
  }, [remessasUnicas.length, loadSelectedRows, saveSelectedRows])

  // Função para marcar/desmarcar uma remessa
  const handleRowSelect = useCallback((remessa) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      
      if (newSet.has(remessa)) {
        newSet.delete(remessa)
      } else {
        newSet.add(remessa)
      }
      
      // Salvar no localStorage
      saveSelectedRows(newSet)
      
      return newSet
    })
  }, [saveSelectedRows])

  // Função para marcar/desmarcar todas
  const handleSelectAll = useCallback(() => {
    const allRemessas = new Set(remessasUnicas.map(item => item.remessa).filter(Boolean))
    
    setSelectedRows(prev => {
      // Se todas estão marcadas, desmarcar todas
      if (prev.size === allRemessas.size && allRemessas.size > 0) {
        const newSet = new Set()
        saveSelectedRows(newSet)
        return newSet
      } else {
        // Marcar todas
        saveSelectedRows(allRemessas)
        return allRemessas
      }
    })
  }, [remessasUnicas, saveSelectedRows])

  const isAllSelected = remessasUnicas.length > 0 && selectedRows.size === remessasUnicas.length
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < remessasUnicas.length

  return {
    selectedRows,
    isAllSelected,
    isIndeterminate,
    handleRowSelect,
    handleSelectAll,
    setSelectedRows
  }
}



