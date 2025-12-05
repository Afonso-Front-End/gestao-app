/**
 * Handlers para operações relacionadas ao overlay de pedidos do motorista
 */

import { buscarPedidosMotorista, buscarTelefoneMotorista } from '../utils/motoristaUtils'
import { calcularEstatisticasPedidos } from '../utils/pedidosUtils'

/**
 * Handler para buscar pedidos de um motorista específico
 * @param {Object} params - Parâmetros
 * @param {Object} params.motorista - Objeto do motorista
 * @param {Object} params.overlay - Estado e setters do overlay
 * @param {Function} params.showSuccess - Função para mostrar sucesso
 * @param {Function} params.showError - Função para mostrar erro
 */
export const handleMotoristaClick = async ({
  motorista,
  overlay,
  showSuccess,
  showError
}) => {
  // Prevenir múltiplas execuções
  if (overlay.isLoadingPedidos || overlay.isClosingOverlay) return

  // Resetar estados primeiro
  overlay.resetOverlay()

  // Configurar dados básicos
  overlay.setOverlayTitle(`Pedidos do Motorista: ${motorista.responsavel}`)
  overlay.setOverlaySubtitle(`Base: ${motorista.base_entrega} | Cidade: ${motorista.cidade_destino}`)
  overlay.setMotoristaNome(motorista.responsavel)
  overlay.setBaseMotorista(motorista.base_entrega)

  // Abrir overlay primeiro (animação)
  overlay.abrirOverlay()

  // Aguardar animação terminar antes de carregar dados
  // Animação do overlay: 0.4s + delay de 0.2s = 0.6s total
  await new Promise(resolve => setTimeout(resolve, 600))

  // Agora sim, começar a carregar os dados
  overlay.setIsLoadingPedidos(true)

  try {
    const data = await buscarPedidosMotorista(motorista.responsavel, motorista.base_entrega)

    if (data.success && data.data) {
      overlay.setOverlayData(data.data)

      // Calcular estatísticas dos pedidos
      const stats = calcularEstatisticasPedidos(data.data)
      overlay.setOverlayStats(stats)

      // Derivar Base e Cidade do primeiro item
      const firstItem = data.data[0] || {}
      const baseFromData = (firstItem['Base de entrega'] || firstItem['Unidade responsável'] || firstItem['BASE'] || motorista.base_entrega || '').toString().trim()
      const cidadeFromData = (firstItem['Cidade Destino'] || firstItem['Cidade'] || '').toString().trim()

      if (baseFromData && baseFromData !== overlay.baseMotorista) {
        overlay.setBaseMotorista(baseFromData)
      }

      const derivedSubtitle = `Base: ${baseFromData || 'N/A'}${cidadeFromData ? ' | Cidade: ' + cidadeFromData : ''}`
      overlay.setOverlaySubtitle(derivedSubtitle)

      showSuccess(`✅ ${data.data.length} pedidos encontrados para ${motorista.responsavel}`)

      // Buscar telefone do motorista
      const baseParaBusca = baseFromData || motorista.base_entrega || overlay.baseMotorista
      if (baseParaBusca) {
        const telefoneEncontrado = await buscarTelefoneMotorista(motorista.responsavel, baseParaBusca)
        if (telefoneEncontrado) {
          overlay.setTelefoneMotorista(telefoneEncontrado)
          overlay.setTelefoneCarregado(true)
        }
        // Ativar WhatsApp se telefone foi encontrado
        overlay.setShowWhatsApp(!!telefoneEncontrado)
      }
    } else {
      throw new Error(data.message || 'Erro ao buscar pedidos do motorista')
    }
  } catch (error) {
    showError(`Erro ao buscar pedidos: ${error.message}`)
    overlay.setOverlayData([])
  } finally {
    overlay.setIsLoadingPedidos(false)
  }
}

/**
 * Handler para buscar pedidos não entregues de um motorista específico
 * @param {Object} params - Parâmetros
 * @param {Object} params.motorista - Objeto do motorista
 * @param {Object} params.overlay - Estado e setters do overlay
 * @param {Function} params.showSuccess - Função para mostrar sucesso
 * @param {Function} params.showError - Função para mostrar erro
 */
export const handleNaoEntreguesClick = async ({
  motorista,
  overlay,
  showSuccess,
  showError
}) => {
  // Prevenir múltiplas execuções
  if (overlay.isLoadingPedidos || overlay.isClosingOverlay) return

  // Resetar estados primeiro
  overlay.resetOverlay()

  // Configurar dados básicos
  overlay.setOverlayTitle(`Pedidos NÃO ENTREGUES - ${motorista.responsavel}`)
  overlay.setOverlaySubtitle(`Base: ${motorista.base_entrega} | Cidade: ${motorista.cidade_destino}`)
  overlay.setMotoristaNome(motorista.responsavel)
  overlay.setBaseMotorista(motorista.base_entrega)

  // Abrir overlay primeiro (animação)
  overlay.abrirOverlay()

  // Aguardar animação terminar antes de carregar dados
  // Animação do overlay: 0.4s + delay de 0.2s = 0.6s total
  await new Promise(resolve => setTimeout(resolve, 600))

  // Agora sim, começar a carregar os dados
  overlay.setIsLoadingPedidos(true)

  try {
    const data = await buscarPedidosMotorista(motorista.responsavel, motorista.base_entrega, 'nao_entregues')

    if (data.success && data.data) {
      overlay.setOverlayData(data.data)

      // Calcular estatísticas dos pedidos
      const stats = calcularEstatisticasPedidos(data.data)
      overlay.setOverlayStats(stats)

      // Derivar Base e Cidade do primeiro item
      const first = data.data[0] || {}
      const baseFromData = (first['Base de entrega'] || first['Unidade responsável'] || first['BASE'] || motorista.base_entrega || '').toString().trim()
      const cidadeFromData = (first['Cidade Destino'] || first['Cidade'] || '').toString().trim()
      
      if (baseFromData) {
        overlay.setBaseMotorista(baseFromData)
      } else {
        overlay.setBaseMotorista(motorista.base_entrega || '')
      }
      
      const derivedSubtitle = `Base: ${baseFromData || 'N/A'}${cidadeFromData ? ' | Cidade: ' + cidadeFromData : ''}`
      overlay.setOverlaySubtitle(derivedSubtitle)

      showSuccess(`✅ ${data.data.length} pedidos NÃO ENTREGUES encontrados para ${motorista.responsavel}`)

      // Garantir que baseMotorista está definida antes de buscar telefone
      const baseParaBusca = baseFromData || motorista.base_entrega || overlay.baseMotorista

      // Buscar telefone do motorista passando a base explicitamente
      const telefoneEncontrado = await buscarTelefoneMotorista(motorista.responsavel, baseParaBusca)
      if (telefoneEncontrado) {
        overlay.setTelefoneMotorista(telefoneEncontrado)
        overlay.setTelefoneCarregado(true)
      }

      // Ativar WhatsApp se telefone foi encontrado
      overlay.setShowWhatsApp(!!telefoneEncontrado)
    } else {
      throw new Error(data.message || 'Erro ao buscar pedidos não entregues do motorista')
    }
  } catch (error) {
    showError(`Erro ao buscar pedidos não entregues: ${error.message}`)
    overlay.setOverlayData([])
  } finally {
    overlay.setIsLoadingPedidos(false)
  }
}

