import { useState, useEffect } from 'react'
import api from '../../../services/api'

/**
 * Hook para gerenciar cidades disponíveis baseadas nas bases selecionadas
 */
export const useD1Cidades = (selectedBasesBipagens) => {
  const [cidadesData, setCidadesData] = useState([])
  const [loadingCidades, setLoadingCidades] = useState(false)

  // Buscar cidades disponíveis baseadas nas bases selecionadas
  useEffect(() => {
    if (selectedBasesBipagens.length === 0) {
      setCidadesData([])
      setLoadingCidades(false)
      return
    }

    const carregarCidades = async () => {
      setLoadingCidades(true)
      try {
        const basesParam = selectedBasesBipagens.join(',')
        
        // Tentar primeiro o endpoint específico do D1
        let url = `/d1/bipagens/cidades?base=${encodeURIComponent(basesParam)}`
        let response
        let result
        
        try {
          response = await api.get(url)
          result = response.data
        } catch (error) {
          // Se não existir endpoint específico do D1, usar o endpoint de retidos
          url = `/retidos/cidades?bases=${encodeURIComponent(basesParam)}`
          response = await api.get(url)
          result = response.data
        }

        if (result.success && Array.isArray(result.data)) {
          const cidadesOrdenadas = result.data
            .filter(cidade => cidade && cidade.trim() !== '')
            .sort((a, b) => a.localeCompare(b, 'pt-BR'))
          setCidadesData(cidadesOrdenadas)
        } else {
          setCidadesData([])
        }
      } catch (error) {
        setCidadesData([])
      } finally {
        setLoadingCidades(false)
      }
    }

    const timeoutId = setTimeout(() => {
      carregarCidades()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [selectedBasesBipagens])

  return {
    cidadesData,
    loadingCidades
  }
}

