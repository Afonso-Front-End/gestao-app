import React, { useState, useId } from 'react'
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import { VscSend } from "react-icons/vsc";
import { useUpload } from '../../../../contexts/UploadContext'
import api from '../../../../services/api'
import './FileImport.css'

const FileImport = ({
  endpoint,
  title = "Importar Arquivo",
  acceptedFormats = ".xlsx,.xls,.csv",
  disabled = false,
  onSuccess,
  onError
}) => {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputId = useId()
  const upload = useUpload()

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    // Determinar tipo de upload baseado no endpoint (mais confiável que o title)
    const uploadType = endpoint.includes('bipagens') 
      ? 'd1-bipagens' 
      : 'd1-gestao'

    // Iniciar upload no contexto global
    const uploadId = upload.startUpload({
      fileName: selectedFile.name,
      type: uploadType
    })

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Iniciando upload

      // Simular progresso
      const progressInterval = setInterval(() => {
        upload.updateUploadProgress(uploadId, Math.random() * 30 + 20)
      }, 500)

      // Se endpoint é URL completa, usar diretamente, senão usar api baseURL
      let uploadUrl = endpoint
      if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
        // Endpoint relativo, usar api baseURL
        uploadUrl = endpoint
      }

      const response = await api.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutos para uploads grandes
      })

      clearInterval(progressInterval)
      upload.updateUploadProgress(uploadId, 100)

      // Upload concluído

      if (response.data) {
        upload.completeUpload(uploadId, `Upload concluído: ${response.data.total_items || 0} registros`)
        onSuccess?.(response.data)
        setSelectedFile(null)
        // Reset input
        const input = document.getElementById(fileInputId)
        if (input) input.value = ''
      } else {
        throw new Error('Resposta vazia do servidor')
      }
    } catch (error) {
      // Erro no upload tratado abaixo
      
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Erro desconhecido no upload'
      upload.failUpload(uploadId, new Error(errorMessage))
      onError?.(new Error(errorMessage))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`d1-file-import ${disabled ? 'disabled' : ''}`}>
      <div className="d1-import-container">
        <div className="d1-import-buttons">
          <input
            type="file"
            id={fileInputId}
            accept={acceptedFormats}
            onChange={handleFileSelect}
            disabled={disabled}
            style={{ display: 'none' }}
          />
          <label
            htmlFor={fileInputId}
            className={`d1-import-button ${disabled ? 'disabled' : ''}`}
            title={disabled ? 'Aguarde os lotes estarem disponíveis...' : title || 'Importar Arquivo'}
          >
            <RiFileExcel2Fill size={24} />
          </label>

          {selectedFile && !disabled && (
            <button
              className="d1-upload-button"
              onClick={handleUpload}
              disabled={isUploading}
              title="Enviar arquivo"
            >
              {isUploading ? (
                <FaSpinner size={24} className="d1-spinning" />
              ) : (
                <VscSend size={24} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default FileImport

