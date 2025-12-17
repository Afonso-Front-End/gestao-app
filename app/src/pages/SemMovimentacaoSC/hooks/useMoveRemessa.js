import { useCallback } from 'react'
import api from '../../../services/api'

/**
 * Hook para gerenciar movimentação de remessas
 */
export const useMoveRemessa = (showSuccess, showError, rowSelection, dadosFiltradosColunas) => {
  const handleMoveToDevolucao = useCallback(async (remessaToMove, setRemessaToMove, setShowMoveRemessaModal) => {
    if (!remessaToMove) return

    try {
      const dataToSave = {
        remessa: remessaToMove.remessa,
        unidade_responsavel: remessaToMove.unidade_responsavel,
        base_entrega: remessaToMove.base_entrega,
        tipo_ultima_operacao: remessaToMove.tipo_ultima_operacao
      }

      await api.post('/sem-movimentacao-sc/move-to-devolucao', dataToSave)
      
      // Desmarcar a remessa após mover
      rowSelection.setSelectedRows(prev => {
        const newSet = new Set(prev)
        newSet.delete(remessaToMove.remessa)
        
        const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
        rowSelection.saveUnselectedRows(allRemessas, newSet)
        
        return newSet
      })

      showSuccess(`Remessa ${remessaToMove.remessa} movida para devolução com sucesso!`)
      setShowMoveRemessaModal(false)
      setRemessaToMove(null)
    } catch (error) {
      console.error('Erro ao mover remessa para devolução:', error)
      showError('Erro ao mover remessa para devolução. Tente novamente.')
      throw error
    }
  }, [dadosFiltradosColunas, rowSelection, showSuccess, showError])

  const handleMoveToCobrarBase = useCallback(async (remessaToMove, setRemessaToMove, setShowMoveRemessaModal) => {
    if (!remessaToMove) return

    try {
      const dataToSave = {
        remessa: remessaToMove.remessa,
        unidade_responsavel: remessaToMove.unidade_responsavel,
        base_entrega: remessaToMove.base_entrega,
        tipo_ultima_operacao: remessaToMove.tipo_ultima_operacao
      }

      await api.post('/sem-movimentacao-sc/move-to-cobrar-base', dataToSave)
      
      // Desmarcar a remessa após mover
      rowSelection.setSelectedRows(prev => {
        const newSet = new Set(prev)
        newSet.delete(remessaToMove.remessa)
        
        const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
        rowSelection.saveUnselectedRows(allRemessas, newSet)
        
        return newSet
      })

      showSuccess(`Remessa ${remessaToMove.remessa} movida para cobrar base com sucesso!`)
      setShowMoveRemessaModal(false)
      setRemessaToMove(null)
    } catch (error) {
      console.error('Erro ao mover remessa para cobrar base:', error)
      showError('Erro ao mover remessa para cobrar base. Tente novamente.')
      throw error
    }
  }, [dadosFiltradosColunas, rowSelection, showSuccess, showError])

  return {
    handleMoveToDevolucao,
    handleMoveToCobrarBase
  }
}

