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

    // Determinar tipo de upload baseado no endpoint
    const uploadType = endpoint.includes('galpao') ? 'sla-galpao' : 'sla'

    // Iniciar upload no contexto global
    const uploadId = upload.startUpload({
      fileName: selectedFile.name,
      type: uploadType
    })

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Simular progresso (já que não temos progresso real do servidor)
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
        const input = document.getElementById(fileInputId)
        if (input) input.value = ''
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
    <div className={`sla-file-import ${disabled ? 'disabled' : ''}`}>
      <div className="sla-import-container">
        <div className="sla-file-input-wrapper">
          <input
            type="file"
            id={fileInputId}
            accept={acceptedFormats}
            onChange={handleFileSelect}
            disabled={disabled}
            className="sla-file-input"
          />
          <div className="sla-file-input-display">
            <div className="sla-file-input-info">
              <RiFileExcel2Fill className="sla-file-icon" />
              <div className="sla-file-input-text">
                {selectedFile ? (
                  <>
                    <span className="sla-file-name">{selectedFile.name}</span>
                    <span className="sla-file-size">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </>
                ) : (
                  <span className="sla-file-placeholder">
                    {title}
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: '400', color: '#94a3b8', marginTop: '2px' }}>
                      Clique para selecionar ou arraste o arquivo aqui
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {selectedFile && !disabled && (
          <button
            className="sla-upload-button"
            onClick={handleUpload}
            disabled={isUploading}
            type="button"
          >
            {isUploading ? (
              <>
                <FaSpinner size={16} className="sla-spinning" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <VscSend size={16} />
                <span>Enviar</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default FileImport

