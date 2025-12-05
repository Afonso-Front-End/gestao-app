import React, { useState, useId, memo } from 'react'
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import { VscSend } from "react-icons/vsc";
import { useUpload } from '../../../../contexts/UploadContext'
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

    // Determinar tipo de upload baseado no title
    const uploadType = title.toLowerCase().includes('consultados') ? 'consultados' : 'retidos'

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

      const { getApiHeaders } = await import('../../../../utils/api-headers')
      const headers = getApiHeaders()
      // Remover Content-Type para FormData (browser define automaticamente)
      delete headers['Content-Type']
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData
      })

      clearInterval(progressInterval)

      if (response.ok) {
        const result = await response.json()
        
        // Marcar upload como concluído
        upload.completeUpload(uploadId, result)
        
        onSuccess?.(result)
        setSelectedFile(null)
        
        // Reset input com verificação
        try {
          const inputElement = document.getElementById(fileInputId)
          if (inputElement) {
            inputElement.value = ''
          }
        } catch (error) {
        }
      } else {
        const errorText = await response.text()
        const error = new Error(`Erro no upload: ${response.status} - ${errorText}`)
        
        // Marcar upload como erro
        upload.failUpload(uploadId, error)
        
        throw error
      }
    } catch (error) {
      // Apenas chamar onError se o erro não foi tratado acima
      if (!error.message.includes('Erro no upload:')) {
        upload.failUpload(uploadId, error)
      }
      onError?.(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`pedidos-retidos-file-import ${disabled ? 'disabled' : ''}`}>
      {/* <h2>{title}</h2> */}
      <div className="pedidos-retidos-import-container">
        <div className="pedidos-retidos-import-buttons">
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
            className={`pedidos-retidos-import-button ${disabled ? 'disabled' : ''} ${selectedFile ? 'has-file' : ''}`}
          >
            <RiFileExcel2Fill size={22} />
            <span>
              {disabled
                ? 'Aguarde os lotes...'
                : selectedFile ? selectedFile.name.slice(0, 15) + '...' : title
              }
            </span>
          </label>

          {selectedFile && !disabled && (
            <button
              className="pedidos-retidos-upload-button"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <FaSpinner size={22} className="pedidos-retidos-spinning" />
              ) : (
                <VscSend size={22} />
              )}
            </button>
          )}
        </div>

        {/* <p className="pedidos-retidos-import-text">
          {disabled
            ? 'Este importador será habilitado após processar os lotes de pedidos'
            : `Formatos aceitos: ${acceptedFormats}`
          }
        </p> */}
      </div>
    </div>
  )
})

FileImport.displayName = 'FileImport'

export default FileImport
