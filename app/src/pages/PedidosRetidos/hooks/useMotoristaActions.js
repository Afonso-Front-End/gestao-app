import { useCallback } from 'react'
import { useNotification } from '../../../contexts/NotificationContext'
import { calcularEstatisticasPedidos, extrairNumeroPedido } from '../utils/pedidosUtils'
import { getApiHeaders } from '../../../utils/api-headers'

/**
 * Hook para gerenciar ações relacionadas a motoristas (buscar pedidos, telefone, etc)
 * @param {Object} overlay - Objeto com estados e setters do overlay
 * @returns {Object} Funções para ações do motorista
 */
const useMotoristaActions = (overlay) => {
  const { showSuccess, showError } = useNotification()

  /**
   * Busca telefone do motorista
   * @param {string} motorista - Nome do motorista
   * @param {string} base - Nome da base
   * @returns {Promise<string|null>} Telefone encontrado ou null
   */
  const buscarTelefoneMotorista = useCallback(async (motorista, base = '') => {
    try {
      const url = `/api/lista-telefones/motorista/${encodeURIComponent(motorista)}?base_name=${encodeURIComponent(base)}`
      const response = await fetch(url, {
        headers: getApiHeaders()
      })
      const data = await response.json()

      if (data.success && data.tem_telefone && data.match_exato) {
        overlay.setTelefoneMotorista(data.telefone)
        overlay.setTelefoneCarregado(true)
        return data.telefone
      } else {
        overlay.setTelefoneMotorista('')
        overlay.setTelefoneCarregado(true)
        return null
      }
    } catch (error) {
      overlay.setTelefoneCarregado(true)
      return null
    }
  }, [overlay])

  /**
   * Busca pedidos de um motorista específico
   * @param {Object} motorista - Objeto com dados do motorista
   * @param {string} statusFiltro - Filtro de status (opcional, ex: 'nao_entregues')
   * @returns {Promise<Array>} Array de pedidos encontrados
   */
  const buscarPedidosMotorista = useCallback(async (motorista, statusFiltro = null) => {
    // Prevenir múltiplas execuções
    if (overlay.isLoadingPedidos || overlay.isClosingOverlay) return []

    // Resetar estados primeiro (exceto título/subtítulo que serão definidos depois)
    overlay.setOverlayData([])
    overlay.setOverlayStats({})
    overlay.setMotoristaNome('')
    overlay.setBaseMotorista('')
    overlay.setTelefoneMotorista('')
    overlay.setTelefoneCarregado(false)
    overlay.setShowWhatsApp(false)
    overlay.setIsLoadingPedidos(true)
    
    // Configurar dados básicos
    const titulo = statusFiltro === 'nao_entregues' 
      ? `Pedidos NÃO ENTREGUES - ${motorista.responsavel}`
      : `Pedidos do Motorista: ${motorista.responsavel}`
    
    // Definir título, subtítulo e dados do motorista
    overlay.setOverlayTitle(titulo)
    overlay.setOverlaySubtitle(`Base: ${motorista.base_entrega} | Cidade: ${motorista.cidade_destino}`)
    overlay.setMotoristaNome(motorista.responsavel)
    overlay.setBaseMotorista(motorista.base_entrega)

    // Abrir overlay sem resetar (já resetamos manualmente antes)
    overlay.abrirOverlay(false)

    try {
      const params = new URLSearchParams()
      if (motorista.base_entrega) params.append('base', motorista.base_entrega)
      if (statusFiltro) params.append('status', statusFiltro)
      
      const url = `/api/retidos/pedidos-motorista/${encodeURIComponent(motorista.responsavel)}${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        overlay.setOverlayData(data.data)

        // Calcular estatísticas dos pedidos
        const stats = calcularEstatisticasPedidos(data.data)
        overlay.setOverlayStats(stats)

        // Derivar Base e Cidade do primeiro item
        const firstItem = data.data[0] || {}
        const baseFromData = (
          firstItem['Base de entrega'] || 
          firstItem['Unidade responsável'] || 
          firstItem['BASE'] || 
          motorista.base_entrega || 
          ''
        ).toString().trim()
        
        const cidadeFromData = (
          firstItem['Cidade Destino'] || 
          firstItem['Cidade'] || 
          ''
        ).toString().trim()

        if (baseFromData && baseFromData !== overlay.baseMotorista) {
          overlay.setBaseMotorista(baseFromData)
        }

        const derivedSubtitle = `Base: ${baseFromData || 'N/A'}${cidadeFromData ? ' | Cidade: ' + cidadeFromData : ''}`
        overlay.setOverlaySubtitle(derivedSubtitle)

        const mensagemSucesso = statusFiltro === 'nao_entregues'
          ? `✅ ${data.data.length} pedidos NÃO ENTREGUES encontrados para ${motorista.responsavel}`
          : `✅ ${data.data.length} pedidos encontrados para ${motorista.responsavel}`
        
        showSuccess(mensagemSucesso)

        // Buscar telefone do motorista
        const baseParaBusca = baseFromData || motorista.base_entrega || ''
        if (baseParaBusca) {
          const telefoneEncontrado = await buscarTelefoneMotorista(motorista.responsavel, baseParaBusca)
          // Ativar WhatsApp se telefone foi encontrado
          overlay.setShowWhatsApp(!!telefoneEncontrado)
        }

        return data.data
      } else {
        throw new Error(data.message || 'Erro ao buscar pedidos do motorista')
      }
    } catch (error) {
      showError(`Erro ao buscar pedidos: ${error.message}`)
      overlay.setOverlayData([])
      return []
    } finally {
      overlay.setIsLoadingPedidos(false)
    }
  }, [overlay, buscarTelefoneMotorista, showSuccess, showError])

  /**
   * Handler para quando telefone for adicionado
   * @param {string} novoTelefone - Novo telefone adicionado
   */
  const handleTelefoneAdicionado = useCallback((novoTelefone) => {
    overlay.setTelefoneMotorista(novoTelefone)
    overlay.setTelefoneCarregado(true)
  }, [overlay])

  /**
   * Copia um pedido individual
   * @param {Object} pedido - Objeto do pedido
   */
  const copiarPedido = useCallback(async (pedido) => {
    try {
      const numeroPedido = extrairNumeroPedido(pedido)

      if (numeroPedido) {
        await navigator.clipboard.writeText(numeroPedido)
        showSuccess(`📋 Número do pedido ${numeroPedido} copiado!`)
      } else {
        showError('Número do pedido não encontrado')
      }
    } catch (error) {
      showError('Erro ao copiar número do pedido')
    }
  }, [showSuccess, showError])

  /**
   * Copia todos os números de pedidos do overlay
   */
  const copiarTodosPedidos = useCallback(async () => {
    try {
      if (!overlay.overlayData || overlay.overlayData.length === 0) {
        showError('Nenhum pedido para copiar')
        return
      }

      // Extrair todos os números de pedidos
      const numerosPedidos = overlay.overlayData
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
      showError('Erro ao copiar números dos pedidos')
    }
  }, [overlay, showSuccess, showError])

  /**
   * Copia dados formatados para WhatsApp
   */
  const copiarDadosFormatados = useCallback(async () => {
    try {
      if (!overlay.overlayData || overlay.overlayData.length === 0) {
        showError('Nenhum dado para copiar')
        return
      }

      // Determinar tipo de pedidos baseado no título
      let tipoPedidos = 'pedidos'
      if (overlay.overlayTitle.includes('NÃO ENTREGUES')) {
        tipoPedidos = 'pedidos em aberto'
      }

      // Criar mensagem formatada
      let mensagem = `Olá ${overlay.motoristaNome}! Segue ${tipoPedidos}:\n\n`

      overlay.overlayData.forEach((pedido, index) => {
        const numeroPedido = extrairNumeroPedido(pedido) || 'N/A'
        const base = pedido['Base de Entrega'] || pedido['BASE'] || pedido['Base'] || overlay.baseMotorista || 'N/A'
        
        mensagem += `Pedido ${index + 1}:\n`
        mensagem += `• Número: ${numeroPedido}\n`
        mensagem += `• Base: ${base}\n`
        mensagem += `• Cidade Destino: ${pedido['Cidade Destino'] || pedido['Destinatário'] || 'N/A'}\n`
        mensagem += `• Destinatário: ${pedido['Destinatário'] || pedido['DESTINATÁRIO'] || 'N/A'}\n`
        mensagem += `• CEP: ${pedido['CEP destino'] || pedido['CEP'] || 'N/A'}\n`
        mensagem += `• Status: ${pedido['Marca de assinatura'] || 'N/A'}\n\n`
      })

      // Copiar para clipboard
      await navigator.clipboard.writeText(mensagem)
      showSuccess(`Dados formatados copiados! ${overlay.overlayData.length} pedidos formatados.`)
    } catch (error) {
      showError('Erro ao copiar dados formatados: ' + error.message)
    }
  }, [overlay, showSuccess, showError])

  return {
    buscarTelefoneMotorista,
    buscarPedidosMotorista,
    handleTelefoneAdicionado,
    copiarPedido,
    copiarTodosPedidos,
    copiarDadosFormatados
  }
}

export default useMotoristaActions

