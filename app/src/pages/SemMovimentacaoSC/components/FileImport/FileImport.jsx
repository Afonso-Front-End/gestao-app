import React, { useState, useId, memo } from 'react'
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import { VscSend } from "react-icons/vsc";
import { useUpload } from '../../../../contexts/UploadContext'
import api from '../../../../services/api'
import './FileImport.css'

const FileImport = memo(({
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

    // Iniciar upload no contexto global
    const uploadId = upload.startUpload({
      fileName: selectedFile.name,
      type: 'sem-movimentacao-sc'
    })

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Simular progresso
      const progressInterval = setInterval(() => {
        upload.updateUploadProgress(uploadId, Math.random() * 30 + 20) // 20-50%
      }, 500)

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutos para uploads grandes
      })

      clearInterval(progressInterval)

      if (response.data) {
        // Marcar upload como concluído
        upload.completeUpload(uploadId, response.data)
        
        onSuccess?.(response.data)
        setSelectedFile(null)
        
        // Reset input
        try {
          const inputElement = document.getElementById(fileInputId)
          if (inputElement) {
            inputElement.value = ''
          }
        } catch (error) {
        }
      } else {
        throw new Error('Resposta vazia do servidor')
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Erro desconhecido no upload'
      
      // Marcar upload como erro
      upload.failUpload(uploadId, new Error(errorMessage))
      
      onError?.(new Error(errorMessage))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`sem-movimentacao-sc-file-import ${disabled ? 'disabled' : ''}`}>
      <div className="sem-movimentacao-sc-import-container">
        <div className="sem-movimentacao-sc-import-buttons">
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
            className={`sem-movimentacao-sc-import-button ${disabled ? 'disabled' : ''} ${selectedFile ? 'has-file' : ''}`}
          >
            <RiFileExcel2Fill size={22} />
            <span>
              {disabled
                ? 'Aguarde...'
                : selectedFile ? selectedFile.name.slice(0, 15) + '...' : title
              }
            </span>
          </label>

          {selectedFile && !disabled && (
            <button
              className="sem-movimentacao-sc-upload-button"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <FaSpinner size={22} className="sem-movimentacao-sc-spinning" />
              ) : (
                <VscSend size={22} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
})

FileImport.displayName = 'FileImport'

export default FileImport

