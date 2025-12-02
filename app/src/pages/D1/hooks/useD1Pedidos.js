import { useState, useEffect } from 'react'
import api from '../../../services/api'

/**
 * Hook para gerenciar números de pedidos
 */
export const useD1Pedidos = (
  selectedBases,
  selectedBasesBipagens,
  selectedTemposParados,
  cacheRef,
  gerarChaveCache,
  isCacheValido
) => {
  const [numerosPedidos, setNumerosPedidos] = useState([])
  const [loadingPedidos, setLoadingPedidos] = useState(false)
  const [numerosPedidosBipagens, setNumerosPedidosBipagens] = useState([])
  const [loadingPedidosBipagens, setLoadingPedidosBipagens] = useState(false)
  const [showLotesDropdown, setShowLotesDropdown] = useState(false)

  // Buscar números de pedidos quando as bases selecionadas mudarem (chunks)
  // Nota: Mensagens de sucesso/info são tratadas pelo componente pai
  useEffect(() => {
    const fetchPedidos = async () => {
      if (selectedBases.length === 0) {
        setNumerosPedidos([])
        return
      }

      setLoadingPedidos(true)
      try {
        const basesParam = selectedBases.join(',')
        const response = await api.get(`/d1/pedidos?bases=${encodeURIComponent(basesParam)}&source=chunks`)
        const result = response.data

        if (result.success && Array.isArray(result.data)) {
          setNumerosPedidos(result.data)
        } else {
          setNumerosPedidos([])
        }
      } catch (error) {
        setNumerosPedidos([])
      } finally {
        setLoadingPedidos(false)
      }
    }

    // Debounce de 500ms para evitar muitas requisições
    const timeoutId = setTimeout(() => {
      fetchPedidos()
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBases])

  const buscarPedidosBipagens = async () => {
    if (selectedBasesBipagens.length === 0) {
      return { success: false, message: 'Selecione pelo menos uma base para buscar os números de pedidos' }
    }

    // Gerar chave de cache
    const basesParam = selectedBasesBipagens.join(',')
    const temposParam = selectedTemposParados.length > 0 ? selectedTemposParados.join(',') : null
    const chaveCache = gerarChaveCache('pedidosBipagens', {
      bases: basesParam,
      tempos: temposParam
    })

    // Verificar cache
    const cacheEntry = cacheRef.current.pedidosBipagens[chaveCache]
    if (isCacheValido(cacheEntry)) {
      setNumerosPedidosBipagens(cacheEntry.data)
      setShowLotesDropdown(true)
      const filtrosInfo = selectedTemposParados.length > 0 
        ? ` (${selectedBasesBipagens.length} base(s), ${selectedTemposParados.length} tempo(s))`
        : ` (${selectedBasesBipagens.length} base(s))`
      return { 
        success: true, 
        data: cacheEntry.data, 
        message: `✅ ${cacheEntry.data.length.toLocaleString('pt-BR')} números de pedidos encontrados!${filtrosInfo}` 
      }
    }

    setLoadingPedidosBipagens(true)
    try {
      let url = `/d1/pedidos?bases=${encodeURIComponent(basesParam)}&source=bipagens`
      if (temposParam) {
        url += `&tempo_parado=${encodeURIComponent(temposParam)}`
      }
      
      const response = await api.get(url)
      const result = response.data

      if (result.success && Array.isArray(result.data)) {
        // Armazenar no cache
        cacheRef.current.pedidosBipagens[chaveCache] = {
          data: result.data,
          timestamp: Date.now()
        }
        
        setNumerosPedidosBipagens(result.data)
        setShowLotesDropdown(true)
        const filtrosInfo = selectedTemposParados.length > 0 
          ? ` (${selectedBasesBipagens.length} base(s), ${selectedTemposParados.length} tempo(s))`
          : ` (${selectedBasesBipagens.length} base(s))`
        return { 
          success: true, 
          data: result.data, 
          message: `✅ ${result.data.length.toLocaleString('pt-BR')} números de pedidos encontrados!${filtrosInfo}` 
        }
      } else {
        setNumerosPedidosBipagens([])
        return { success: false, message: 'Nenhum número de pedido encontrado para os filtros selecionados' }
      }
    } catch (error) {
      setNumerosPedidosBipagens([])
      return { success: false, message: `Erro ao buscar pedidos: ${error.message || 'Erro desconhecido'}` }
    } finally {
      setLoadingPedidosBipagens(false)
    }
  }

  return {
    numerosPedidos,
    loadingPedidos,
    numerosPedidosBipagens,
    loadingPedidosBipagens,
    showLotesDropdown,
    setShowLotesDropdown,
    buscarPedidosBipagens
  }
}

