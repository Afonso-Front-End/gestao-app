/**
 * Utilitários para operações de cópia
 */

import { extrairNumeroPedido } from './pedidosUtils'

/**
 * Copia um número de pedido individual para a área de transferência
 * @param {Object} pedido - Objeto de pedido
 * @param {Function} showSuccess - Função para mostrar sucesso
 * @param {Function} showError - Função para mostrar erro
 */
export const handleCopyPedido = async (pedido, showSuccess, showError) => {
  try {
    const numeroPedido = extrairNumeroPedido(pedido)

    if (numeroPedido) {
      await navigator.clipboard.writeText(numeroPedido)
      showSuccess(`📋 Número do pedido ${numeroPedido} copiado!`)
    } else {
      showError('Número do pedido não encontrado')
    }
  } catch (error) {
    console.error('Erro ao copiar pedido:', error)
    showError('Erro ao copiar número do pedido')
  }
}

/**
 * Copia todos os números de pedidos para a área de transferência
 * @param {Array} overlayData - Array de dados do overlay
 * @param {Function} showSuccess - Função para mostrar sucesso
 * @param {Function} showError - Função para mostrar erro
 * @param {Function} showInfo - Função para mostrar informação
 */
export const handleCopyAllPedidos = async (overlayData, showSuccess, showError, showInfo) => {
  try {
    if (!overlayData || overlayData.length === 0) {
      showInfo('Nenhum pedido para copiar')
      return
    }

    // Extrair todos os números de pedidos
    const numerosPedidos = overlayData
      .map(pedido => extrairNumeroPedido(pedido))
      .filter(numero => numero && numero.trim() !== '') // Filtrar valores vazios

    if (numerosPedidos.length === 0) {
      showError('Nenhum número de pedido válido encontrado')
      return
    }

    // Copiar todos os números separados por quebra de linha
    const textoParaCopiar = numerosPedidos.join('\n')
    await navigator.clipboard.writeText(textoParaCopiar)
    showSuccess(`📋 ${numerosPedidos.length} números de pedidos copiados!`)
  } catch (error) {
    console.error('Erro ao copiar todos os pedidos:', error)
    showError('Erro ao copiar números dos pedidos')
  }
}

/**
 * Copia um lote específico de pedidos
 * @param {Object} lote - Objeto de lote com array de pedidos
 * @param {Function} showSuccess - Função para mostrar sucesso
 * @param {Function} showError - Função para mostrar erro
 * @param {Function} showLoading - Função para mostrar loading
 * @param {Function} hideLoading - Função para esconder loading
 */
export const handleCopyLote = async (lote, showSuccess, showError, showLoading, hideLoading) => {
  // Mostrar notificação de loading
  const loadingId = showLoading(`Copiando lote ${lote.numero_lote}...`, '📋 Processando')

  try {
    // Os lotes do servidor já vêm com os números dos pedidos prontos
    const numeros = lote.pedidos || []

    if (numeros.length === 0) {
      showError('Nenhum número de pedido válido encontrado neste lote.')
      return
    }

    // Simular um pequeno delay para mostrar o loading
    await new Promise(resolve => setTimeout(resolve, 800))

    await navigator.clipboard.writeText(numeros.join('\n'))
    showSuccess(`📋 Lote ${lote.numero_lote} copiado! ${numeros.length} números de pedidos copiados para a área de transferência.`)
  } catch (error) {
    showError('Erro ao copiar lote. Tente novamente.')
    console.error('Erro ao copiar lote:', error)
  } finally {
    // Esconder notificação de loading
    hideLoading(loadingId)
  }
}

/**
 * Copia dados formatados para WhatsApp
 * @param {Array} overlayData - Array de dados do overlay
 * @param {string} motoristaNome - Nome do motorista
 * @param {string} baseMotorista - Base do motorista
 * @param {string} overlayTitle - Título do overlay
 * @param {Function} showSuccess - Função para mostrar sucesso
 * @param {Function} showError - Função para mostrar erro
 * @param {Function} showInfo - Função para mostrar informação
 */
export const handleCopyFormattedData = async (
  overlayData,
  motoristaNome,
  baseMotorista,
  overlayTitle,
  showSuccess,
  showError,
  showInfo
) => {
  try {
    if (!overlayData || overlayData.length === 0) {
      showInfo('Nenhum dado para copiar')
      return
    }

    // Determinar tipo de pedidos baseado no título
    let tipoPedidos = 'pedidos'
    if (overlayTitle.includes('NÃO ENTREGUES')) {
      tipoPedidos = 'pedidos em aberto'
    }

    // Criar mensagem formatada
    let mensagem = `Olá ${motoristaNome}! Segue ${tipoPedidos}:\n\n`

    overlayData.forEach((pedido, index) => {
      mensagem += `Pedido ${index + 1}:\n`
      mensagem += `• Número: ${pedido['Número de pedido JMS'] || pedido['Nº DO PEDIDO'] || pedido['NUMERO_PEDIDO'] || 'N/A'}\n`
      mensagem += `• Base: ${pedido['Base de Entrega'] || pedido['BASE'] || pedido['Base'] || baseMotorista}\n`
      mensagem += `• Cidade Destino: ${pedido['Cidade Destino'] || pedido['Destinatário'] || 'N/A'}\n`
      mensagem += `• Destinatário: ${pedido['Destinatário'] || pedido['DESTINATÁRIO'] || 'N/A'}\n`
      mensagem += `• CEP: ${pedido['CEP destino'] || pedido['CEP'] || 'N/A'}\n`
      mensagem += `• Status: ${pedido['Marca de assinatura'] || 'N/A'}\n\n`
    })

    // Copiar para clipboard
    await navigator.clipboard.writeText(mensagem)
    showSuccess(`Dados formatados copiados! ${overlayData.length} pedidos formatados.`)
  } catch (error) {
    console.error('Erro ao copiar dados formatados:', error)
    showError('Erro ao copiar dados formatados: ' + error.message)
  }
}

