import { useState, useCallback } from 'react'
import api from '../../../services/api'

export const useAllRemessas = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAllRemessas = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get('/expedido-nao-chegou/remessas')
      
      if (response.data?.success) {
        return {
          success: true,
          remessas: response.data.remessas || [],
          total: response.data.total || 0,
          colunaDetectada: response.data.coluna_detectada
        }
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (err) {
      console.error('❌ Erro ao buscar todas as remessas:', err)
      setError(err.message || 'Erro ao buscar remessas')
      return {
        success: false,
        remessas: [],
        total: 0,
        colunaDetectada: null
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchAllRemessas, loading, error }
}


