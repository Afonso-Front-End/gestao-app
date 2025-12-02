import { useState, useContext } from 'react'
import { RefreshContext } from '../contexts/RefreshContext'
import { useNotification } from '../../../contexts/NotificationContext'
import api from '../../../services/api'

const useSLAProcessing = (externalTriggerRefresh) => {
  const [processing, setProcessing] = useState(false)
  
  // Tentar usar o contexto de forma segura
  const refreshContext = useContext(RefreshContext)
  const triggerRefresh = externalTriggerRefresh || refreshContext?.triggerRefresh || (() => {})
  
  const { showSuccess, showError, showLoading, hideLoading } = useNotification()

  const processSelectedBases = async (selectedBases) => {
    if (selectedBases.length === 0) {
      showError('Selecione pelo menos uma base para processar')
      return
    }

    // Exibir notificação de loading
    const loadingId = showLoading(
      `Processando ${selectedBases.length} base(s)...\n` +
      `Bases: ${selectedBases.join(', ')}\n` +
      `Aguarde enquanto processamos os dados.`,
      'Processando Bases'
    )

    try {
      setProcessing(true)

      const response = await api.post('/sla/bases/process', {
        bases: selectedBases
      })

      const result = response.data

      // Ocultar notificação de loading
      hideLoading(loadingId)

      // Verificar se foi sucesso (pode vir como success: true ou apenas message de sucesso)
      if (result.success || (result.message && result.message.includes('sucesso'))) {
        const totalBases = result.data?.total_bases_processed || 0
        const totalRecords = result.data?.total_records_processed || 0
        
        showSuccess(
          `✅ Processamento concluído com sucesso!\n\n` +
          `📊 Bases processadas: ${totalBases}\n` +
          `📝 Registros processados: ${totalRecords.toLocaleString('pt-BR')}\n` +
          `Bases: ${selectedBases.join(', ')}`
        )
        
        // Disparar refresh para atualizar outros componentes
        triggerRefresh()
      } else {
        showError(`❌ Erro no processamento: ${result.detail || result.error || result.message || 'Erro desconhecido'}`)
      }
    } catch (error) {
      // Ocultar notificação de loading em caso de erro
      hideLoading(loadingId)
      
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Erro desconhecido'
      showError(`❌ Erro de conexão: ${errorMessage}`)
    } finally {
      setProcessing(false)
    }
  }

  return {
    processing,
    processSelectedBases
  }
}

export default useSLAProcessing
