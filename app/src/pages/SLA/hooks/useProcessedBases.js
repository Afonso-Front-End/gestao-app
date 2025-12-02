import { useState, useEffect } from 'react'
import { useRefresh } from '../contexts/RefreshContext'
import api from '../../../services/api'

const useProcessedBases = () => {
  const [processedBases, setProcessedBases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { refreshTrigger } = useRefresh()

  const fetchProcessedBases = async (signal = null) => {
    setLoading(true)
    setError(null)
    
    try {
      const config = signal ? { signal } : {}
      const response = await api.get('/sla/bases/list', config)
      
      // Verificar se a resposta tem o formato esperado
      if (response.data) {
        // A API retorna: { message: "...", data: [...] }
        if (response.data.data && Array.isArray(response.data.data)) {
          setProcessedBases(response.data.data)
          // Limpar erro se a requisição foi bem-sucedida
          setError(null)
        } else if (Array.isArray(response.data)) {
          // Se a resposta for diretamente um array
          setProcessedBases(response.data)
          // Limpar erro se a requisição foi bem-sucedida
          setError(null)
        } else {
          // Se não houver dados, retornar array vazio (não é erro)
          setProcessedBases([])
          // Limpar erro se não houver dados mas a requisição foi bem-sucedida
          setError(null)
        }
      } else {
        setProcessedBases([])
        // Limpar erro se a requisição foi bem-sucedida mas sem dados
        setError(null)
      }
      
    } catch (err) {
      // Ignorar erros de abort
      if (err.name === 'AbortError') {
        return
      }
      
      // Log mais detalhado do erro para debug
      let errorMessage = 'Erro ao buscar bases processadas'
      
      if (err.response) {
        // Erro com resposta do servidor
        const status = err.response.status
        const data = err.response.data
        
        if (status === 401) {
          errorMessage = 'Erro de autenticação. Verifique se as chaves de API estão configuradas no arquivo .env'
        } else if (status === 404) {
          errorMessage = 'Rota não encontrada. Verifique se o servidor está rodando corretamente.'
        } else if (status >= 500) {
          errorMessage = `Erro no servidor (${status}). Tente novamente mais tarde.`
        } else {
          errorMessage = data?.detail || data?.message || `Erro ${status}: ${err.response.statusText}`
        }
      } else if (err.request) {
        // Requisição foi feita mas não houve resposta
        errorMessage = 'Servidor não está respondendo. Verifique se o servidor está rodando.'
      } else {
        // Erro ao configurar a requisição
        errorMessage = err.message || 'Erro desconhecido ao buscar bases processadas'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    fetchProcessedBases(abortController.signal)
    
    // Cleanup: cancelar requisição se componente for desmontado ou dependências mudarem
    return () => {
      abortController.abort()
    }
  }, [refreshTrigger]) // Re-executa quando refreshTrigger muda

  return {
    processedBases,
    loading,
    error,
    refetch: fetchProcessedBases
  }
}

export default useProcessedBases
