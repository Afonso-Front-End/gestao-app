import { useCallback } from 'react'
import { useNotification } from '../../../contexts/NotificationContext'

/**
 * Hook para gerenciar atualização automática após upload
 * @param {Object} refetchFunctions - Objeto com funções de refetch
 * @returns {Function} Função para executar refresh completo
 */
const useRefreshAfterUpload = (refetchFunctions) => {
  const { showInfo, showSuccess } = useNotification()
  const {
    refetchBases,
    refetchTipos,
    refetchAging,
    fetchPedidosParados,
    selectedBases,
    filtroCidades,
    refetchFiltrosTabela
  } = refetchFunctions

  /**
   * Atualiza todos os selects e dados após upload bem-sucedido
   * @param {string} uploadType - Tipo de upload ('retidos' ou 'consultados')
   */
  const refreshAfterUpload = useCallback(async (uploadType = 'retidos') => {
    try {
      // Mostrar notificação de atualização
      const updateMessage = uploadType === 'consultados' 
        ? '🔄 Atualizando selects e dados da tabela após upload...'
        : '🔄 Atualizando selects após upload...'
      
      showInfo(updateMessage)

      // Aguardar um delay maior para garantir que o servidor processou o upload
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Atualizar selects principais (bases, tipos, aging) sequencialmente para evitar sobrecarga
      const refetchFunctions = [
        { fn: refetchBases, name: 'bases' },
        { fn: refetchTipos, name: 'tipos' },
        { fn: refetchAging, name: 'aging' }
      ]

      for (const { fn, name } of refetchFunctions) {
        if (fn) {
          try {
            await fn()
          } catch (error) {
            // Continua mesmo se um falhar
          }
        }
      }

      // Se for upload de "Consultados", atualizar filtros da tabela (bases e cidades)
      if (uploadType === 'consultados') {
        // Aguardar mais tempo para garantir que os dados foram salvos no servidor
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Atualizar bases e cidades disponíveis da tabela
        if (refetchFiltrosTabela) {
          try {
            await refetchFiltrosTabela()
          } catch (error) {
          }
        }
        
        // Aguardar mais um pouco para garantir que os filtros foram atualizados
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (fetchPedidosParados) {
          try {
            await fetchPedidosParados({
              bases: selectedBases || [],
              cidades: filtroCidades || []
            })
          } catch (error) {
          }
        }
      }

      showSuccess('✅ Upload concluído! Os dados foram atualizados.')
    } catch (error) {
      // Não mostrar erro para não poluir a interface, apenas logar
    }
  }, [refetchBases, refetchTipos, refetchAging, fetchPedidosParados, selectedBases, filtroCidades, refetchFiltrosTabela, showInfo, showSuccess])

  return refreshAfterUpload
}

export default useRefreshAfterUpload

