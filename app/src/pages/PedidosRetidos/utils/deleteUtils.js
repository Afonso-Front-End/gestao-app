/**
 * Utilitários para operações de deleção
 */
import api from '../../../services/api'

/**
 * Deleta dados da coleção pedidos_retidos_tabela_chunks
 * @param {Function} showSuccess - Função para mostrar sucesso
 * @param {Function} showError - Função para mostrar erro
 * @param {Function} showInfo - Função para mostrar informação
 * @returns {Promise<boolean>} true se deletou com sucesso
 */
export const deletarTabelaChunks = async (showSuccess, showError, showInfo) => {
  try {
    // Confirmar antes de deletar
    const confirmar = window.confirm(
      '⚠️ ATENÇÃO: Esta ação irá deletar TODOS os dados da coleção pedidos_retidos_tabela_chunks.\n\n' +
      'Esta ação não pode ser desfeita. Deseja continuar?'
    )

    if (!confirmar) {
      return false
    }

    showInfo('Deletando dados da coleção pedidos_retidos_tabela_chunks...')

    const response = await api.delete('/retidos/tabela-chunks')
    const data = response.data

    showSuccess(
      `✅ Dados deletados com sucesso!\n\n` +
      `Registros removidos: ${data.deleted_count || 0}\n` +
      `Registros anteriores: ${data.previous_count || 0}`
    )

    // Recarregar os dados após deletar
    setTimeout(() => {
      window.location.reload()
    }, 2000)

    return true
  } catch (error) {
    // Erro ao deletar dados
    showError(`Erro ao deletar dados: ${error.message}`)
    return false
  }
}

/**
 * Deleta dados das coleções principais (pedidos_retidos, pedidos_retidos_chunks, pedidos_retidos_tabela)
 * @param {Function} showSuccess - Função para mostrar sucesso
 * @param {Function} showError - Função para mostrar erro
 * @param {Function} showInfo - Função para mostrar informação
 * @returns {Promise<boolean>} true se deletou com sucesso
 */
export const deletarColecoesPrincipais = async (showSuccess, showError, showInfo) => {
  try {
    // Confirmar antes de deletar
    const confirmar = window.confirm(
      '⚠️ ATENÇÃO: Esta ação irá deletar TODOS os dados das seguintes coleções:\n\n' +
      '• pedidos_retidos\n' +
      '• pedidos_retidos_chunks\n' +
      '• pedidos_retidos_tabela\n\n' +
      'Esta ação não pode ser desfeita. Deseja continuar?'
    )

    if (!confirmar) {
      return false
    }

    showInfo('Deletando dados das coleções principais de Pedidos Retidos...')

    const response = await api.delete('/retidos/collections')
    const data = response.data

    let message = `✅ Dados deletados com sucesso!\n\n`
    if (data.deleted_counts) {
      message += `Registros deletados:\n`
      message += `• pedidos_retidos: ${data.deleted_counts.pedidos_retidos || 0}\n`
      message += `• pedidos_retidos_chunks: ${data.deleted_counts.pedidos_retidos_chunks || 0}\n`
      message += `• pedidos_retidos_tabela: ${data.deleted_counts.pedidos_retidos_tabela || 0}\n`
      message += `\nTotal: ${data.deleted_counts.total || 0} registros\n\n`
    }
    if (data.warning) {
      message += `${data.warning}`
    }

    showSuccess(message)

    // Recarregar os dados após deletar
    setTimeout(() => {
      window.location.reload()
    }, 2000)

    return true
  } catch (error) {
    // Erro ao deletar dados
    showError(`Erro ao deletar dados: ${error.message}`)
    return false
  }
}

