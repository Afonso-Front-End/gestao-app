import { useCallback } from 'react'
import { CONFIG, STORAGE_KEYS } from '../constants/D1Constants'
import { extractNumerosPedidos } from '../utils/dataTransformers'

/**
 * Hook para gerenciar handlers da página D1
 */
export const useD1Handlers = ({
  showSuccess,
  showError,
  showInfo,
  limparCache,
  carregarBasesETempos,
  carregarMotoristas,
  selectedBasesBipagens,
  resetTelefone,
  carregarPedidosMotoristaHook,
  setTelefoneMotorista,
  setShowWhatsApp,
  buscarPedidosBipagensHook,
  pedidosMotorista,
  handleTelefoneAdicionadoHook
}) => {
  const handleUploadSuccess = useCallback((result) => {
    if (result.success) {
      showSuccess(
        `✅ Upload concluído com sucesso!\n\n` +
        `Arquivo: ${result.filename}\n` +
        `Total de registros: ${result.total_items?.toLocaleString('pt-BR') || 0}\n` +
        `Chunks processados: ${result.total_chunks || 0}`
      )
    }
  }, [showSuccess])

  const handleUploadError = useCallback((error) => {
    showError(`Erro ao fazer upload: ${error.message || 'Erro desconhecido'}`)
  }, [showError])

  const handleBipagensUploadSuccess = useCallback((result) => {
    if (result.success) {
      showSuccess(
        `✅ Upload de bipagens concluído!\n\n` +
        `Arquivo: ${result.filename}\n` +
        `Linhas lidas: ${result.total_linhas_lidas?.toLocaleString('pt-BR') || 0}\n` +
        `Deduplicados: ${result.total_deduplicados?.toLocaleString('pt-BR') || 0}\n` +
        `Processados: ${result.total_processados?.toLocaleString('pt-BR') || 0}\n` +
        `Salvos: ${result.total_salvos?.toLocaleString('pt-BR') || 0}\n` +
        `Atualizados: ${result.total_atualizados?.toLocaleString('pt-BR') || 0}`
      )
      limparCache()
      carregarBasesETempos()
      setTimeout(() => {
        if (selectedBasesBipagens.length > 0) {
          carregarMotoristas()
        }
      }, CONFIG.REFETCH_DELAY)
    }
  }, [showSuccess, limparCache, carregarBasesETempos, carregarMotoristas, selectedBasesBipagens])

  const handleBipagensUploadError = useCallback((error) => {
    showError(`Erro ao fazer upload de bipagens: ${error.message || 'Erro desconhecido'}`)
  }, [showError])

  const carregarPedidosMotorista = useCallback(async (motorista, statusFiltro = null) => {
    resetTelefone()
    const resultado = await carregarPedidosMotoristaHook(motorista, statusFiltro)
    
    if (resultado.telefone) {
      setTelefoneMotorista(resultado.telefone)
      setShowWhatsApp(true)
    }
  }, [resetTelefone, carregarPedidosMotoristaHook, setTelefoneMotorista, setShowWhatsApp])

  const handleTelefoneAdicionado = useCallback((telefone) => {
    handleTelefoneAdicionadoHook(telefone)
    showSuccess('✅ Telefone adicionado com sucesso!')
  }, [handleTelefoneAdicionadoHook, showSuccess])

  const buscarPedidosBipagens = useCallback(async () => {
    const resultado = await buscarPedidosBipagensHook()
    
    if (resultado.success) {
      if (resultado.message.includes('✅')) {
        showSuccess(resultado.message)
      } else {
        showInfo(resultado.message)
      }
    } else {
      if (resultado.message.includes('Erro')) {
        showError(resultado.message)
      } else {
        showInfo(resultado.message)
      }
    }
  }, [buscarPedidosBipagensHook, showSuccess, showError, showInfo])

  const handleCopyPedido = useCallback((row, showSuccess) => {
    const numeroPedido = row['Número de pedido JMS'] || ''
    if (numeroPedido) {
      navigator.clipboard.writeText(numeroPedido)
      showSuccess(`✅ Número de pedido ${numeroPedido} copiado!`)
    }
  }, [])

  const handleCopyAllPedidos = useCallback(() => {
    const numeros = extractNumerosPedidos(pedidosMotorista)
    if (numeros.length > 0) {
      navigator.clipboard.writeText(numeros.join('\n'))
      showSuccess(`✅ ${numeros.length} números de pedidos copiados!`)
    }
  }, [pedidosMotorista, showSuccess])

  return {
    handleUploadSuccess,
    handleUploadError,
    handleBipagensUploadSuccess,
    handleBipagensUploadError,
    carregarPedidosMotorista,
    handleTelefoneAdicionado,
    buscarPedidosBipagens,
    handleCopyPedido,
    handleCopyAllPedidos
  }
}

