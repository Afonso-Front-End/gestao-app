import React, { createContext, useContext, useState, useCallback } from 'react'
import { useNotification } from './NotificationContext'

const UploadContext = createContext()

export const useUpload = () => {
  const context = useContext(UploadContext)
  if (!context) {
    throw new Error('useUpload deve ser usado dentro de UploadProvider')
  }
  return context
}

export const UploadProvider = ({ children }) => {
  const [uploads, setUploads] = useState([])
  const { showSuccess, showError } = useNotification()

  // Adicionar novo upload
  const startUpload = useCallback((uploadData) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newUpload = {
      id: uploadId,
      fileName: uploadData.fileName,
      type: uploadData.type, // 'retidos' ou 'consultados'
      status: 'uploading', // uploading, success, error
      progress: 0,
      startTime: Date.now(),
      ...uploadData
    }

    setUploads(prev => [...prev, newUpload])
    return uploadId
  }, [])

  // Atualizar progresso do upload
  const updateUploadProgress = useCallback((uploadId, progress) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, progress: Math.min(progress, 99) }
          : upload
      )
    )
  }, [])

  // Remover upload da lista
  const removeUpload = useCallback((uploadId) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId))
  }, [])

  // Marcar upload como concluído
  const completeUpload = useCallback((uploadId, result) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === uploadId 
          ? { 
              ...upload, 
              status: 'success', 
              progress: 100,
              endTime: Date.now(),
              result 
            }
          : upload
      )
    )

    // Remover após 5 segundos
    setTimeout(() => {
      removeUpload(uploadId)
    }, 5000)

    showSuccess('Upload concluído com sucesso!')
  }, [showSuccess, removeUpload])

  // Marcar upload como com erro
  const failUpload = useCallback((uploadId, error) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === uploadId 
          ? { 
              ...upload, 
              status: 'error', 
              error: error.message || 'Erro desconhecido',
              endTime: Date.now()
            }
          : upload
      )
    )

    // Remover após 10 segundos
    setTimeout(() => {
      removeUpload(uploadId)
    }, 10000)

    showError(`Erro no upload: ${error.message}`)
  }, [showError, removeUpload])

  // Cancelar upload
  const cancelUpload = useCallback((uploadId) => {
    setUploads(prev => 
      prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, status: 'cancelled' }
          : upload
      )
    )
    
    setTimeout(() => {
      removeUpload(uploadId)
    }, 2000)
  }, [removeUpload])

  // Verificar se há uploads em andamento
  const hasActiveUploads = uploads.some(upload => upload.status === 'uploading')

  // Obter uploads ativos
  const activeUploads = uploads.filter(upload => upload.status === 'uploading')

  const value = {
    uploads,
    activeUploads,
    hasActiveUploads,
    startUpload,
    updateUploadProgress,
    completeUpload,
    failUpload,
    removeUpload,
    cancelUpload
  }

  return (
    <UploadContext.Provider value={value}>
      {children}
    </UploadContext.Provider>
  )
}

export default UploadContext

