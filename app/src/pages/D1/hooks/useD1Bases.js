import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { useNotification } from '../../../contexts/NotificationContext'

const useD1Bases = () => {
  const [bases, setBases] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showError } = useNotification()

  const fetchBases = async (signal = null) => {
    setLoading(true)
    setError(null)
    
    try {
      const startTime = Date.now()
      
      // Não usar signal para não cancelar requisições desnecessariamente
      // Permitir requisição mesmo com uploads ativos de outras páginas
      const response = await api.get('/d1/bases', {
        // Timeout muito grande para aguardar mesmo durante uploads
        timeout: 600000, // 10 minutos - aguardar até o servidor responder
      })
      
      const duration = Date.now() - startTime
      
      const result = response.data
      
      if (result.success && Array.isArray(result.data)) {
        setBases(result.data)
        return result.data
      } else {
        throw new Error('Formato de resposta inválido')
      }
    } catch (err) {
      // Ignorar erros de abort apenas se realmente foi cancelado
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
        return []
      }
      
      // Se for Network Error, pode ser que o servidor esteja ocupado
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        // Tentar novamente após 1 segundo
        setTimeout(() => {
          fetchBases(null)
        }, 1000)
        return []
      }
      const errorMessage = err.message || 'Erro ao buscar bases D-1'
      setError(errorMessage)
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showError('Servidor não está respondendo. Verifique se está rodando.', 'Erro de Conexão')
      } else {
        showError(`Erro ao buscar bases: ${errorMessage}`, 'Erro de Busca')
      }
      
      setBases([])
      return []
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    
    // Não usar AbortController para não cancelar requisições desnecessariamente
    // A requisição deve completar mesmo se o componente for remontado
    fetchBases(null).then(() => {
      // Bases carregadas com sucesso
    }).catch((err) => {
      // Erro silencioso se foi cancelado
    })
    
    // Cleanup: apenas marcar como desmontado, não cancelar requisição
    return () => {
      isMounted = false
    }
  }, [])

  return {
    bases,
    loading,
    error,
    refetch: fetchBases
  }
}

export default useD1Bases


