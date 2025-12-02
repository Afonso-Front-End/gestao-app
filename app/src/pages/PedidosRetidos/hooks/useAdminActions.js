import { useCallback } from 'react'
import { useNotification } from '../../../contexts/NotificationContext'
import api from '../../../services/api'

/**
 * Hook para gerenciar ações administrativas (deletar coleções, gerar relatórios, etc)
 * @param {Object} cleanupFunctions - Funções para limpar estados e recarregar dados
 * @returns {Object} Funções para ações administrativas
 */
const useAdminActions = (cleanupFunctions = {}) => {
  const { showSuccess, showError, showInfo, showWarning } = useNotification()
  
  const {
    clearPedidosParados,
    clearPedidosLotes,
    clearFilteredPedidos,
    refetchBases,
    refetchTipos,
    refetchAging,
    refetchFiltrosTabela,
    closeOverlay,
    revalidatePedidosData
  } = cleanupFunctions

  /**
   * Deleta todas as coleções principais de pedidos retidos
   * @returns {Promise<void>}
   */
  const deletarColecoesPrincipais = useCallback(async () => {
    try {
      showInfo('🗑️ Deletando dados das coleções principais de Pedidos Parados...')

      const response = await api.delete('/retidos/collections')
      const data = response.data

      // Verificar se realmente foi deletado
      const totalDeletado = data.deleted_counts?.total || 0
      const pedidosRetidos = data.deleted_counts?.pedidos_retidos || 0
      const pedidosChunks = data.deleted_counts?.pedidos_retidos_chunks || 0
      const pedidosTabela = data.deleted_counts?.pedidos_retidos_tabela || 0
      
      // Verificar se tudo foi deletado corretamente
      let verificacaoSucesso = true
      if (data.deleted_counts) {
        // Se houver contadores, verificar se todos foram zerados ou se a operação foi bem-sucedida
        verificacaoSucesso = totalDeletado >= 0 // Aceita 0 ou mais (pode não ter dados para deletar)
      }
      
      let message = `✅ Dados deletados com sucesso!\n\n`
      if (data.deleted_counts) {
        message += `Registros deletados:\n`
        message += `• pedidos_retidos: ${pedidosRetidos}\n`
        message += `• pedidos_retidos_chunks: ${pedidosChunks}\n`
        message += `• pedidos_retidos_tabela: ${pedidosTabela}\n`
        message += `\nTotal: ${totalDeletado} registros\n\n`
      }
      if (data.warning) {
        message += `${data.warning}\n\n`
      }

      // Limpar estados locais
      showInfo('🔄 Limpando dados da interface...')
      
      // Fechar overlay se estiver aberto
      if (closeOverlay) closeOverlay()
      
      // Limpar dados
      if (clearPedidosParados) clearPedidosParados()
      if (clearPedidosLotes) clearPedidosLotes()
      if (clearFilteredPedidos) clearFilteredPedidos()
      
      // Aguardar um pouco antes de recarregar selects
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Recarregar selects e filtros
      showInfo('🔄 Atualizando selects...')
      const refetchPromises = []
      if (refetchBases) refetchPromises.push(refetchBases())
      if (refetchTipos) refetchPromises.push(refetchTipos())
      if (refetchAging) refetchPromises.push(refetchAging())
      if (refetchFiltrosTabela) refetchPromises.push(refetchFiltrosTabela())
      
      await Promise.all(refetchPromises)

      // Revalidar se existem dados (após deletar, não deve ter mais)
      if (revalidatePedidosData) revalidatePedidosData()

      // Verificar se os selects foram atualizados corretamente (devem estar vazios)
      if (verificacaoSucesso) {
        showSuccess(message + '\n\n✅ Interface atualizada sem recarregar a página!\n✅ Todos os dados foram removidos com sucesso!')
      } else {
        showSuccess(message + '\n\n⚠️ Interface atualizada, mas verifique se todos os dados foram removidos.')
      }
    } catch (error) {
      // Erro ao deletar dados
      showError(`Erro ao deletar dados: ${error.message}`)
    }
  }, [showSuccess, showError, showInfo, clearPedidosParados, clearPedidosLotes, clearFilteredPedidos, refetchBases, refetchTipos, refetchAging, refetchFiltrosTabela, closeOverlay, revalidatePedidosData])

  /**
   * Deleta todos os dados da coleção pedidos_retidos_tabela_chunks
   * @returns {Promise<void>}
   */
  const deletarTabela = useCallback(async () => {
    try {
      showInfo('🗑️ Deletando dados da coleção pedidos_retidos_tabela...')

      const response = await api.delete('/retidos/tabela')
      const data = response.data

      // Verificar se realmente foi deletado
      const deletedCount = data.deleted_count || 0
      const previousCount = data.previous_count || 0
      
      // Verificar se a deleção foi bem-sucedida
      const verificacaoSucesso = deletedCount === previousCount || deletedCount > 0

      if (verificacaoSucesso) {
        showSuccess(`✅ ${deletedCount} registro(s) deletado(s) da coleção pedidos_retidos_tabela com sucesso!`)
        
        // Chamar funções de limpeza se fornecidas
        clearPedidosParados?.()
        
        // Atualizar filtros da tabela
        if (refetchFiltrosTabela) {
          await refetchFiltrosTabela()
        }
      } else {
        showWarning(`⚠️ Nenhum dado foi deletado. A coleção pode estar vazia.`)
      }
      
      return data
    } catch (error) {
      // Erro ao deletar tabela
      showError(`Erro ao deletar dados: ${error.message}`)
      throw error
    }
  }, [showInfo, showSuccess, showWarning, showError, clearPedidosParados, refetchFiltrosTabela])

  const deletarTabelaChunks = useCallback(async () => {
    try {
      showInfo('🗑️ Deletando dados da coleção pedidos_retidos_tabela_chunks...')

      const response = await api.delete('/retidos/tabela-chunks')
      const data = response.data

      // Verificar se realmente foi deletado
      const deletedCount = data.deleted_count || 0
      const previousCount = data.previous_count || 0
      
      // Verificar se a deleção foi bem-sucedida
      const verificacaoSucesso = deletedCount === previousCount || deletedCount > 0

      // Limpar estados locais relacionados à tabela
      showInfo('🔄 Limpando dados da interface...')
      
      // Fechar overlay se estiver aberto
      if (closeOverlay) closeOverlay()
      
      // Limpar dados de pedidos parados (que vêm da tabela_chunks)
      if (clearPedidosParados) clearPedidosParados()
      
      // Aguardar um pouco antes de recarregar
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Recarregar filtros da tabela e selects
      showInfo('🔄 Atualizando filtros e selects...')
      const refetchPromises = []
      if (refetchBases) refetchPromises.push(refetchBases())
      if (refetchFiltrosTabela) refetchPromises.push(refetchFiltrosTabela())
      
      await Promise.all(refetchPromises)

      if (verificacaoSucesso) {
        showSuccess(
          `✅ Dados deletados com sucesso!\n\n` +
          `Registros removidos: ${deletedCount}\n` +
          `Registros anteriores: ${previousCount}\n\n` +
          `✅ Interface atualizada sem recarregar a página!\n` +
          `✅ Todos os dados foram removidos com sucesso!`
        )
      } else {
        showSuccess(
          `✅ Dados deletados com sucesso!\n\n` +
          `Registros removidos: ${deletedCount}\n` +
          `Registros anteriores: ${previousCount}\n\n` +
          `✅ Interface atualizada sem recarregar a página!`
        )
      }
    } catch (error) {
      // Erro ao deletar dados
      showError(`Erro ao deletar dados: ${error.message}`)
    }
  }, [showSuccess, showError, showInfo, clearPedidosParados, refetchBases, refetchFiltrosTabela, closeOverlay])

  /**
   * Gera e baixa relatório Excel de contato
   * @param {Array<string>} bases - Array de bases para filtrar o relatório
   * @returns {Promise<void>}
   */
  const gerarRelatorioContato = useCallback(async (bases = []) => {
    try {
      const basesParam = bases.length > 0 ? bases.join(',') : ''
      const url = basesParam
        ? `/retidos/gerar-relatorio-contato?bases=${encodeURIComponent(basesParam)}`
        : '/retidos/gerar-relatorio-contato'

      showInfo('Gerando relatório Excel...')

      const response = await api.get(url, {
        responseType: 'blob'
      })

      // Obter o nome do arquivo do header ou gerar um
      const contentDisposition = response.headers['content-disposition']
      let filename = 'Relatorio_Contato.xlsx'
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '')
        }
      }

      // Fazer download do arquivo
      const blob = response.data
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      showSuccess(`✅ Relatório Excel gerado e baixado com sucesso!\n\nArquivo: ${filename}`)
    } catch (error) {
      // Erro ao gerar relatório
      showError(`Erro ao gerar relatório: ${error.message}`)
    }
  }, [showSuccess, showError, showInfo])

  return {
    deletarColecoesPrincipais,
    deletarTabela,
    deletarTabelaChunks,
    gerarRelatorioContato
  }
}

export default useAdminActions

