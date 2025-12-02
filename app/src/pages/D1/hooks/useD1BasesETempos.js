import { useState, useEffect } from 'react'
import api from '../../../services/api'

/**
 * Hook para gerenciar bases e tempos parados de bipagens
 */
export const useD1BasesETempos = () => {
  const [basesBipagens, setBasesBipagens] = useState([])
  const [temposParados, setTemposParados] = useState([])
  const [loadingBasesBipagens, setLoadingBasesBipagens] = useState(false)
  const [saveBasesEnabled, setSaveBasesEnabled] = useState(false)
  const [basesLoaded, setBasesLoaded] = useState(false)

  const carregarBasesETempos = async () => {
    setLoadingBasesBipagens(true)
    try {
      const startTime = Date.now()
      
      const response = await api.get('/d1/bipagens?limit=100000', {
        // Timeout muito grande para aguardar mesmo durante uploads
        timeout: 600000, // 10 minutos - aguardar até o servidor responder
      })
      
      const duration = Date.now() - startTime
      
      const result = response.data

      if (result.success && Array.isArray(result.data)) {
        // Extrair bases únicas
        const basesUnicas = [...new Set(result.data.map(item => item.base_entrega).filter(Boolean))].sort()
        setBasesBipagens(basesUnicas)

        // Extrair tempos parados únicos
        const temposUnicos = [...new Set(result.data.map(item => item.tempo_pedido_parado).filter(Boolean))].sort()
        setTemposParados(temposUnicos)
      }
    } catch (error) {
      // Se for Network Error, tentar novamente após 1 segundo
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setTimeout(() => {
          carregarBasesETempos()
        }, 1000)
        return
      }
    } finally {
      setLoadingBasesBipagens(false)
    }
  }

  // Carregar bases e tempos ao montar o componente
  useEffect(() => {
    carregarBasesETempos()
  }, [])

  // Salvar bases no localStorage quando o checkbox estiver marcado (apenas após carregar)
  useEffect(() => {
    if (basesLoaded) {
      if (saveBasesEnabled && basesBipagens.length > 0) {
        // Esta lógica será gerenciada pelo componente pai que tem selectedBasesBipagens
      } else if (!saveBasesEnabled) {
        localStorage.removeItem('d1_bipagens_saved_bases')
        localStorage.setItem('d1_bipagens_save_bases_enabled', 'false')
      }
    }
  }, [saveBasesEnabled, basesLoaded, basesBipagens])

  return {
    basesBipagens,
    temposParados,
    loadingBasesBipagens,
    saveBasesEnabled,
    setSaveBasesEnabled,
    basesLoaded,
    setBasesLoaded,
    carregarBasesETempos
  }
}

