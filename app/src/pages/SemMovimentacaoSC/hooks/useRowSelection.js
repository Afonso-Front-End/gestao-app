import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'sem_movimentacao_sc_unselected_rows'

export const useRowSelection = (dadosFiltradosColunas) => {
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [showUnselectConfirmModal, setShowUnselectConfirmModal] = useState(false)
  const [remessaToUnselect, setRemessaToUnselect] = useState(null)

  // Carregar remessas desmarcadas salvas do localStorage
  const loadUnselectedRows = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const savedArray = JSON.parse(saved)
        return new Set(savedArray)
      }
    } catch (error) {
      console.error('Erro ao carregar remessas desmarcadas:', error)
    }
    return new Set()
  }, [])

  // Salvar apenas as remessas DESMARCADAS no localStorage
  const saveUnselectedRows = useCallback((allRemessas, selectedRemessas) => {
    try {
      // Calcular quais remessas estão desmarcadas
      const unselected = Array.from(allRemessas).filter(remessa => !selectedRemessas.has(remessa))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unselected))
    } catch (error) {
      console.error('Erro ao salvar remessas desmarcadas:', error)
    }
  }, [])

  // Carregar seleções quando o modal abrir - SEMPRE marcar todas por padrão, exceto as desmarcadas salvas
  useEffect(() => {
    if (dadosFiltradosColunas.length > 0) {
      // Todas as remessas começam marcadas por padrão
      const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
      
      // Carregar remessas desmarcadas salvas
      const unselectedSaved = loadUnselectedRows()
      
      // Aplicar desmarcações salvas
      const selected = new Set(Array.from(allRemessas).filter(remessa => !unselectedSaved.has(remessa)))
      
      setSelectedRows(selected)
    }
  }, [dadosFiltradosColunas.length, loadUnselectedRows])

  // Funções para gerenciar seleção de linhas
  const handleRowSelect = useCallback((remessa) => {
    const isCurrentlySelected = selectedRows.has(remessa)
    
    if (isCurrentlySelected) {
      // Se está marcado, mostrar modal de confirmação para desmarcar
      setRemessaToUnselect(remessa)
      setShowUnselectConfirmModal(true)
    } else {
      // Se não está marcado, marcar e atualizar localStorage (remover dos desmarcados)
      setSelectedRows(prev => {
        const newSet = new Set(prev)
        newSet.add(remessa)
        
        // Obter todas as remessas disponíveis
        const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
        saveUnselectedRows(allRemessas, newSet)
        
        return newSet
      })
    }
  }, [selectedRows, dadosFiltradosColunas, saveUnselectedRows])

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === dadosFiltradosColunas.length) {
      // Desmarcar todas - mostrar modal de confirmação
      setRemessaToUnselect(null) // null indica "todas"
      setShowUnselectConfirmModal(true)
    } else {
      // Marcar todas
      const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
      setSelectedRows(allRemessas)
      
      // Limpar desmarcados (todas estão marcadas)
      saveUnselectedRows(allRemessas, allRemessas)
    }
  }, [selectedRows.size, dadosFiltradosColunas, saveUnselectedRows])

  // Confirmar desmarcação
  const handleConfirmUnselect = useCallback(() => {
    if (remessaToUnselect) {
      setSelectedRows(prev => {
        const newSet = new Set(prev)
        newSet.delete(remessaToUnselect)
        
        const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
        saveUnselectedRows(allRemessas, newSet)
        
        return newSet
      })
      setShowUnselectConfirmModal(false)
      setRemessaToUnselect(null)
      return true // Indica que precisa mostrar modal de mover
    }
    return false
  }, [remessaToUnselect, dadosFiltradosColunas, saveUnselectedRows])

  // Confirmar desmarcação de todas
  const handleConfirmUnselectAll = useCallback(() => {
    const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
    setSelectedRows(new Set())
    
    // Salvar todas como desmarcadas
    saveUnselectedRows(allRemessas, new Set())
    
    setShowUnselectConfirmModal(false)
    setRemessaToUnselect(null)
  }, [dadosFiltradosColunas, saveUnselectedRows])

  const isAllSelected = dadosFiltradosColunas.length > 0 && selectedRows.size === dadosFiltradosColunas.length
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < dadosFiltradosColunas.length

  return {
    selectedRows,
    showUnselectConfirmModal,
    remessaToUnselect,
    isAllSelected,
    isIndeterminate,
    handleRowSelect,
    handleSelectAll,
    handleConfirmUnselect,
    handleConfirmUnselectAll,
    setShowUnselectConfirmModal,
    setRemessaToUnselect,
    setSelectedRows,
    saveUnselectedRows,
    loadUnselectedRows
  }
}

