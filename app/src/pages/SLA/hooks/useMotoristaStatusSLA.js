import { useState, useEffect } from 'react'
import api from '../../../services/api'

/**
 * Hook para gerenciar status dos motoristas na SLA
 * 
 * NOTA: Esta página usa a coleção 'motorista_status_sla' no backend
 * Endpoints: /sla/motorista/{motorista}/status
 * 
 * @param {Array} motoristasData - Dados de motoristas (opcional, para carregar status iniciais)
 * @param {string} baseName - Nome da base (opcional, para associar status à base)
 * @returns {Object} Estado e funções relacionadas ao status dos motoristas
 */
const useMotoristaStatusSLA = (motoristasData = [], baseName = '') => {
  const [motoristasStatus, setMotoristasStatus] = useState(() => {
    // Carregar status salvos do localStorage
    const saved = localStorage.getItem('sla-motoristas-status')
    return saved ? JSON.parse(saved) : {}
  })

  const [observacoes, setObservacoes] = useState({})
  const [isLoadingObservacoes, setIsLoadingObservacoes] = useState(false)

  // Carregar status do servidor quando os dados forem carregados
  useEffect(() => {
    const carregarStatus = async () => {
      if (motoristasData.length === 0) return

      try {
        // Buscar status de todos os motoristas únicos com suas bases
        const motoristasUnicos = new Map()
        motoristasData.forEach(item => {
          const motorista = item.motorista || item.responsavel || ''
          const base = item.base || baseName || ''
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
              ? `/sla/motorista/${encodeURIComponent(motorista)}/status?base=${encodeURIComponent(base)}`
              : `/sla/motorista/${encodeURIComponent(motorista)}/status`

            const response = await api.get(url)
            return { 
              statusKey, 
              status: response.data.status,
              observacao: response.data.observacao || ''
            }
          } catch (error) {
            // Se não encontrar, não é erro (pode não ter status ainda)
            return { statusKey, status: null, observacao: '' }
          }
        })

        const statusResults = await Promise.all(statusPromises)
        const statusMap = {}
        const observacoesMap = {}
        statusResults.forEach(({ statusKey, status, observacao }) => {
          if (statusKey && status) {
            statusMap[statusKey] = status
          }
          if (statusKey && observacao) {
            observacoesMap[statusKey] = observacao
          }
        })

        if (Object.keys(statusMap).length > 0) {
          setMotoristasStatus(prev => {
            const updated = { ...prev, ...statusMap }
            localStorage.setItem('sla-motoristas-status', JSON.stringify(updated))
            return updated
          })
        }
        
        if (Object.keys(observacoesMap).length > 0) {
          setObservacoes(prev => {
            const updated = { ...prev, ...observacoesMap }
            return updated
          })
        }
      } catch (error) {
        // Erro silencioso ao carregar status
      }
    }

    carregarStatus()
  }, [motoristasData, baseName])

  // Carregar observações salvas
  useEffect(() => {
    const carregarObservacoes = async () => {
      setIsLoadingObservacoes(true)
      try {
        const response = await api.get('/sla/motorista/all-status')
        
        if (response.data?.success && response.data?.statuses) {
          const observacoesMap = {}
          
          response.data.statuses.forEach(statusItem => {
            // Garantir que temos motorista
            const motorista = statusItem.motorista || statusItem.responsavel || ''
            const base = statusItem.base || ''
            const observacao = statusItem.observacao || ''
            
            if (motorista) {
              const statusKey = base
                ? `${motorista}||${base}`
                : motorista
              
              // Salvar observação se não estiver vazia
              if (observacao && typeof observacao === 'string' && observacao.trim() !== '') {
                observacoesMap[statusKey] = observacao.trim()
              }
            }
          })
          
          // Fazer merge com observações existentes para não perder dados locais
          setObservacoes(prev => ({ ...prev, ...observacoesMap }))
        }
      } catch (error) {
        // Erro silencioso se não for 404
      } finally {
        setIsLoadingObservacoes(false)
      }
    }
    
    carregarObservacoes()
  }, [])

  /**
   * Atualiza o status de um motorista
   * @param {string} statusKey - Chave do motorista (pode incluir base)
   * @param {string} motorista - Nome do motorista
   * @param {string} base - Nome da base
   * @param {string|null} newStatus - Novo status (ou null para remover)
   */
  const atualizarStatus = async (statusKey, motorista, base, newStatus) => {
    // Atualizar estado local
    setMotoristasStatus(prev => {
      const updated = {
        ...prev,
        [statusKey]: newStatus
      }
      // Salvar no localStorage
      localStorage.setItem('sla-motoristas-status', JSON.stringify(updated))
      return updated
    })

    // Salvar no backend
    try {
      await api.post(`/sla/motorista/${encodeURIComponent(motorista)}/status`, {
        status: newStatus,
        motorista: motorista,
        base: base || ''
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Salva observação de um motorista
   * @param {string} statusKey - Chave do status
   * @param {string} motorista - Nome do motorista
   * @param {string} base - Nome da base
   * @param {string} status - Status atual
   * @param {string} observacao - Observação a ser salva
   */
  const salvarObservacao = async (statusKey, motorista, base, status, observacao) => {
    try {
      await api.post(`/sla/motorista/${encodeURIComponent(motorista)}/status`, {
        motorista: motorista,
        base: base || '',
        status: status,
        observacao: observacao
      })
      
      // Atualizar estado local
      setObservacoes(prev => ({
        ...prev,
        [statusKey]: observacao
      }))
    } catch (error) {
      throw error
    }
  }

  return {
    motoristasStatus,
    setMotoristasStatus,
    atualizarStatus,
    observacoes,
    setObservacoes,
    salvarObservacao,
    isLoadingObservacoes
  }
}

export default useMotoristaStatusSLA

