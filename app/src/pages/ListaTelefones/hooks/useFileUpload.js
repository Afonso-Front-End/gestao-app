import { useNotification } from '../../../contexts/NotificationContext'
import useEnviarDados from './useEnviarDados'
import { API_CONFIG } from '../constants/api'

const useFileUpload = () => {
  const { showSuccess, showError } = useNotification()
  const { enviarDadosBrutos } = useEnviarDados()

  const handleUploadSuccess = async (result) => {
    showSuccess('Arquivo importado com sucesso!')
    
    // Aguardar um pouco para os dados serem atualizados
    setTimeout(() => {
      if (result && result.data) {
        enviarDadosBrutos(result.data)
      } else {
        showError('Dados do Excel não encontrados')
      }
    }, API_CONFIG.TIMEOUT)
  }

  const handleUploadError = (error) => {
    showError('Erro ao importar arquivo')
  }

  return {
    handleUploadSuccess,
    handleUploadError
  }
}

export default useFileUpload
