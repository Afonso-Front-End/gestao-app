import { useState, useEffect, useCallback } from 'react'
import api from '../../../services/api'

/**
 * Hook para verificar se existem dados de pedidos retidos no banco
 * Verifica a coleção pedidos_retidos_chunks para habilitar/desabilitar o upload de tabela
 */
const useHasPedidosData = () => {
  const [hasData, setHasData] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkData = useCallback(async () => {
    try {
      setLoading(true)
      // Verifica se existem dados na coleção de pedidos retidos
      const response = await api.get('/retidos/check-data')
      
      if (response.data.success) {
        setHasData(response.data.hasData)
      }
    } catch (error) {
      setHasData(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Verifica ao montar o componente
  useEffect(() => {
    checkData()
  }, [checkData])

  // Função para forçar revalidação (útil após uploads)
  const revalidate = useCallback(() => {
    checkData()
  }, [checkData])

  return {
    hasData,
    loading,
    revalidate
  }
}

export default useHasPedidosData

