import { useNotification } from '../../../contexts/NotificationContext'
import { API_ENDPOINTS, API_CONFIG } from '../constants/api'
import { buildApiUrl } from '../../../utils/api-utils'
import { getApiHeaders } from '../../../utils/api-headers'

const useEnviarDados = () => {
  const { showSuccess, showError } = useNotification()

  const enviarDadosBrutos = async (dadosBrutos) => {
    if (!dadosBrutos || dadosBrutos.length === 0) {
      showError('Nenhum dado para enviar')
      return
    }

    try {
      const payload = {
        telefones: dadosBrutos,
        origem: 'frontend',
        timestamp: new Date().toISOString()
      }

      const headers = {
        ...API_CONFIG.HEADERS,
        ...getApiHeaders()
      }
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.ENVIAR_DADOS), {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const result = await response.json()
      
      showSuccess(result.mensagem || 'Dados enviados para o servidor com sucesso!')

    } catch (error) {
      showError(`Erro ao enviar dados: ${error.message}`)
    }
  }

  return { enviarDadosBrutos }
}

export default useEnviarDados
