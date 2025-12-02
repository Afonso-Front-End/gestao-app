import { useState } from 'react'
import api from '../../../services/api'
import { useNotification } from '../../../contexts/NotificationContext'

/**
 * Hook para gerenciar pedidos do motorista e overlay
 */
export const useD1PedidosMotorista = (
  selectedBasesBipagens,
  selectedTemposParados,
  cacheRef,
  gerarChaveCache,
  isCacheValido,
  buscarTelefoneMotorista
) => {
  const { showError } = useNotification()
  const [overlayMotorista, setOverlayMotorista] = useState(null)
  const [pedidosMotorista, setPedidosMotorista] = useState([])
  const [loadingPedidosMotorista, setLoadingPedidosMotorista] = useState(false)
  const [baseMotorista, setBaseMotorista] = useState('')

  const carregarPedidosMotorista = async (motorista, statusFiltro = null) => {
    setOverlayMotorista(motorista)
    
    // Gerar chave de cache
    const basesParam = selectedBasesBipagens.join(',')
    const temposParam = selectedTemposParados.length > 0 ? selectedTemposParados.join(',') : null
    const chaveCache = gerarChaveCache('pedidosMotorista', {
      motorista,
      bases: basesParam,
      tempos: temposParam,
      status: statusFiltro
    })

    // Verificar cache
    const cacheEntry = cacheRef.current.pedidosMotorista[chaveCache]
    if (isCacheValido(cacheEntry)) {
      setPedidosMotorista(cacheEntry.data)
      const primeiraBase = cacheEntry.data[0]?.base_entrega || selectedBasesBipagens[0] || ''
      setBaseMotorista(primeiraBase)
      
      if (primeiraBase) {
        const telefoneEncontrado = await buscarTelefoneMotorista(motorista, primeiraBase)
        return { 
          pedidos: cacheEntry.data, 
          base: primeiraBase, 
          telefone: telefoneEncontrado 
        }
      }
      return { pedidos: cacheEntry.data, base: primeiraBase, telefone: null }
    }

    setLoadingPedidosMotorista(true)
    try {
      let url = `/d1/bipagens/motorista/${encodeURIComponent(motorista)}?base=${encodeURIComponent(basesParam)}`
      if (temposParam) {
        url += `&tempo_parado=${encodeURIComponent(temposParam)}`
      }
      if (statusFiltro) {
        url += `&status=${encodeURIComponent(statusFiltro)}`
      }

      const response = await api.get(url)
      const result = response.data

      if (result.success && Array.isArray(result.data)) {
        // Armazenar no cache
        cacheRef.current.pedidosMotorista[chaveCache] = {
          data: result.data,
          timestamp: Date.now()
        }
        
        setPedidosMotorista(result.data)

        // Buscar base do primeiro pedido
        const primeiraBase = result.data[0]?.base_entrega || selectedBasesBipagens[0] || ''
        setBaseMotorista(primeiraBase)

        // Buscar telefone do motorista
        let telefoneEncontrado = null
        if (primeiraBase) {
          telefoneEncontrado = await buscarTelefoneMotorista(motorista, primeiraBase)
        }

        return { pedidos: result.data, base: primeiraBase, telefone: telefoneEncontrado }
      } else {
        setPedidosMotorista([])
        return { pedidos: [], base: '', telefone: null }
      }
    } catch (error) {
      showError(`Erro ao carregar pedidos: ${error.message || 'Erro desconhecido'}`)
      setPedidosMotorista([])
      return { pedidos: [], base: '', telefone: null }
    } finally {
      setLoadingPedidosMotorista(false)
    }
  }

  const fecharOverlay = () => {
    setOverlayMotorista(null)
    setBaseMotorista('')
  }

  return {
    overlayMotorista,
    pedidosMotorista,
    loadingPedidosMotorista,
    baseMotorista,
    setBaseMotorista,
    carregarPedidosMotorista,
    fecharOverlay
  }
}

