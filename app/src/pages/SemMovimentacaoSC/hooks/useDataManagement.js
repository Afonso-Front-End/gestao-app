import { useState, useCallback, useEffect, useRef } from 'react'
import api from '../../../services/api'

/**
 * Hook para gerenciar importação e limpeza de dados
 */
export const useDataManagement = (showSuccess, showError, refetchFilters, refetch, registerSemMovimentacaoSCConfig, unregisterSemMovimentacaoSCConfig) => {
  const [isUploading, setIsUploading] = useState(false)
  const [deletingData, setDeletingData] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Usar useRef para callbacks estáveis
  const handleImportSuccessRef = useRef(null)
  const handleImportErrorRef = useRef(null)

  const handleImportSuccess = useCallback((result) => {
    showSuccess('✅ Arquivo importado com sucesso!')
    setIsUploading(false)
    // Recarregar dados e filtros após upload
    refetchFilters()
    refetch()
  }, [showSuccess, refetch, refetchFilters])

  const handleImportError = useCallback((error) => {
    showError(`Erro ao importar arquivo: ${error.message}`)
    setIsUploading(false)
  }, [showError])

  // Atualizar refs quando callbacks mudarem
  useEffect(() => {
    handleImportSuccessRef.current = handleImportSuccess
    handleImportErrorRef.current = handleImportError
  }, [handleImportSuccess, handleImportError])

  // Handler para confirmar limpeza de dados
  const handleConfirmClearData = useCallback(async () => {
    setDeletingData(true)
    try {
      const response = await api.delete('/sem-movimentacao-sc/clear')
      if (response.data.success) {
        const deleted = response.data.deleted
        showSuccess(
          `✅ Dados limpos com sucesso!\n\n` +
          `Documentos principais removidos: ${deleted.main_documents?.toLocaleString('pt-BR') || 0}\n` +
          `Chunks removidos: ${deleted.chunks?.toLocaleString('pt-BR') || 0}\n` +
          `Total: ${deleted.total?.toLocaleString('pt-BR') || 0} documentos`
        )
        // Recarregar dados e filtros após limpeza
        refetchFilters()
        refetch()
        setShowDeleteModal(false)
      }
    } catch (error) {
      showError(`Erro ao limpar dados: ${error.response?.data?.detail || error.message || 'Erro desconhecido'}`)
    } finally {
      setDeletingData(false)
    }
  }, [showSuccess, showError, refetchFilters, refetch])

  // Registrar configuração no contexto global
  useEffect(() => {
    const config = {
      uploadEndpoint: '/sem-movimentacao-sc/upload',
      onImportSuccess: (...args) => handleImportSuccessRef.current?.(...args),
      onImportError: (...args) => handleImportErrorRef.current?.(...args),
      onClearDataClick: () => setShowDeleteModal(true),
      deletingData
    }
    
    registerSemMovimentacaoSCConfig(config)

    return () => {
      unregisterSemMovimentacaoSCConfig()
    }
  }, [registerSemMovimentacaoSCConfig, unregisterSemMovimentacaoSCConfig, deletingData])

  return {
    isUploading,
    deletingData,
    showDeleteModal,
    setShowDeleteModal,
    handleConfirmClearData
  }
}

