import { useState, useEffect } from 'react'
import { carregarStatusServidor, salvarStatusMotorista } from '../utils/motoristaUtils'

/**
 * Hook para gerenciar status dos motoristas
 * @param {Array} pedidosParadosData - Dados de pedidos parados
 * @returns {Object} Estado e funções relacionadas ao status dos motoristas
 */
const useMotoristaStatus = (pedidosParadosData) => {
  const [motoristasStatus, setMotoristasStatus] = useState(() => {
    // Carregar status salvos do localStorage
    const saved = localStorage.getItem('pedidos-retidos-status')
    return saved ? JSON.parse(saved) : {}
  })

  // Carregar status do servidor quando os dados forem carregados
  useEffect(() => {
    const carregarStatus = async () => {
      const statusMap = await carregarStatusServidor(pedidosParadosData)
      if (Object.keys(statusMap).length > 0) {
        setMotoristasStatus(prev => {
          const updated = { ...prev, ...statusMap }
          localStorage.setItem('pedidos-retidos-status', JSON.stringify(updated))
          return updated
        })
      }
    }

    carregarStatus()
  }, [pedidosParadosData])

  /**
   * Atualiza o status de um motorista
   * @param {string} motoristaKey - Chave do motorista (pode incluir base)
   * @param {string} motorista - Nome do motorista
   * @param {string} base - Nome da base
   * @param {string|null} newStatus - Novo status (ou null para remover)
   */
  const atualizarStatus = async (motoristaKey, motorista, base, newStatus) => {
    // Atualizar estado local
    setMotoristasStatus(prev => {
      const updated = {
        ...prev,
        [motoristaKey]: newStatus
      }
      // Salvar no localStorage
      localStorage.setItem('pedidos-retidos-status', JSON.stringify(updated))
      return updated
    })

    // Salvar no backend
    await salvarStatusMotorista(motorista, base, newStatus)
  }

  return {
    motoristasStatus,
    setMotoristasStatus,
    atualizarStatus
  }
}

export default useMotoristaStatus

