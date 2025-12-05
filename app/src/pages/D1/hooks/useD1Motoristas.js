import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { useNotification } from '../../../contexts/NotificationContext'

/**
 * Hook para gerenciar motoristas e seus status
 * 
 * NOTA: Esta página usa a coleção 'motoristas_status_d1' no backend
 * Endpoints: /d1/bipagens/motorista/{motorista}/status
 */
export const useD1Motoristas = (selectedBasesBipagens, selectedTemposParados, selectedCidades = []) => {
  const { showError } = useNotification()
  const [motoristasData, setMotoristasData] = useState([])
  const [loadingMotoristas, setLoadingMotoristas] = useState(false)
  const [motoristasStatus, setMotoristasStatus] = useState(() => {
    // Carregar status salvos do localStorage
    const saved = localStorage.getItem('d1-bipagens-status')
    return saved ? JSON.parse(saved) : {}
  })

  const carregarMotoristas = async () => {
    if (selectedBasesBipagens.length === 0) {
      setMotoristasData([])
      return
    }

    setLoadingMotoristas(true)
    try {
      const basesParam = selectedBasesBipagens.join(',')
      const temposParam = selectedTemposParados.length > 0 ? selectedTemposParados.join(',') : null
      const cidadesParam = selectedCidades.length > 0 ? selectedCidades.join(',') : null

      let url = `/d1/bipagens/motoristas?base=${encodeURIComponent(basesParam)}`
      if (temposParam) {
        url += `&tempo_parado=${encodeURIComponent(temposParam)}`
      }
      if (cidadesParam) {
        url += `&cidade=${encodeURIComponent(cidadesParam)}`
      }

      const startTime = Date.now()
      
      const response = await api.get(url, {
        // Timeout muito grande para aguardar mesmo durante uploads
        timeout: 600000, // 10 minutos - aguardar até o servidor responder
      })
      
      const duration = Date.now() - startTime
      
      const result = response.data

      if (result.success && Array.isArray(result.data)) {
        setMotoristasData(result.data)
      } else {
        setMotoristasData([])
      }
    } catch (error) {
      // Se for Network Error, tentar novamente após 1 segundo
      if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        setTimeout(() => {
          carregarMotoristas()
        }, 1000)
        return
      }
      
      // Não mostrar erro se foi cancelado propositalmente
      if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
        showError(`Erro ao carregar motoristas: ${error.message || 'Erro desconhecido'}`)
      }
      setMotoristasData([])
    } finally {
      setLoadingMotoristas(false)
    }
  }

  // Carregar motoristas quando bases, tempos ou cidades mudarem
  useEffect(() => {
    if (selectedBasesBipagens.length === 0) {
      setMotoristasData([])
      return
    }

    const timeoutId = setTimeout(() => {
      carregarMotoristas()
    }, 500)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBasesBipagens, selectedTemposParados, selectedCidades])

  // Carregar status do servidor quando os motoristas forem carregados
  useEffect(() => {
    const carregarStatusServidor = async () => {
      if (motoristasData.length === 0) return

      try {
        // Buscar status de todos os motoristas únicos com suas bases
        const motoristasUnicos = new Map()
        motoristasData.forEach(item => {
          const motorista = item.motorista
          const base = item.base_entrega || ''
          if (motorista) {
            const key = base ? `${motorista}||${base}` : motorista
            if (!motoristasUnicos.has(key)) {
              motoristasUnicos.set(key, { motorista, base })
            }
          }
        })

        const statusPromises = Array.from(motoristasUnicos.entries()).map(async ([statusKey, { motorista, base }]) => {
          try {
            const url = base
              ? `/d1/bipagens/motorista/${encodeURIComponent(motorista)}/status?base=${encodeURIComponent(base)}`
              : `/d1/bipagens/motorista/${encodeURIComponent(motorista)}/status`

            const response = await api.get(url)
            if (response.data) {
              return { statusKey, status: response.data.status }
            }
            return { statusKey, status: null }
          } catch (error) {
            return { statusKey, status: null }
          }
        })

        const statusResults = await Promise.all(statusPromises)
        const statusMap = {}
        const STATUS_NAO_CONTATEI = 'NAO CONTATEI'
        
        statusResults.forEach(({ statusKey, status }) => {
          if (statusKey) {
            // Se não tiver status, definir como NAO_CONTATEI por padrão
            statusMap[statusKey] = status || STATUS_NAO_CONTATEI
          }
        })

        // Também adicionar NAO_CONTATEI para motoristas que não foram encontrados no servidor
        Array.from(motoristasUnicos.keys()).forEach(statusKey => {
          if (!statusMap[statusKey]) {
            statusMap[statusKey] = STATUS_NAO_CONTATEI
          }
        })

        if (Object.keys(statusMap).length > 0) {
          setMotoristasStatus(prev => {
            const updated = { ...prev, ...statusMap }
            localStorage.setItem('d1-bipagens-status', JSON.stringify(updated))
            return updated
          })
          
          // Salvar status padrão NAO_CONTATEI no servidor para motoristas que não têm status
          statusResults.forEach(({ statusKey, status }, index) => {
            if (!status) {
              const { motorista, base } = Array.from(motoristasUnicos.values())[index]
              // Salvar no backend de forma assíncrona (não bloquear)
              api.post(`/d1/bipagens/motorista/${encodeURIComponent(motorista)}/status`, {
                status: STATUS_NAO_CONTATEI,
                motorista: motorista,
                base: base
              }).catch(error => {
              })
            }
          })
        }
      } catch (error) {
      }
    }

    carregarStatusServidor()
  }, [motoristasData])

  return {
    motoristasData,
    loadingMotoristas,
    motoristasStatus,
    setMotoristasStatus,
    carregarMotoristas
  }
}

