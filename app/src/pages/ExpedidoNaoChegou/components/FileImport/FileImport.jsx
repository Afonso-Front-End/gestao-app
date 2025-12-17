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
  acceptedFormats = ".xlsx,.xls",
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

    const uploadId = upload.startUpload({
      fileName: selectedFile.name,
      type: 'expedido-nao-chegou'
    })

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const progressInterval = setInterval(() => {
        upload.updateUploadProgress(uploadId, Math.random() * 30 + 20)
      }, 500)

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000,
      })

      clearInterval(progressInterval)

      if (response.data) {
        upload.completeUpload(uploadId, response.data)
        onSuccess?.(response.data)
        setSelectedFile(null)
        
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
      upload.failUpload(uploadId, new Error(errorMessage))
      onError?.(new Error(errorMessage))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="expedido-nao-chegou-file-import">
      <input
        type="file"
        id={fileInputId}
        accept={acceptedFormats}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        style={{ display: 'none' }}
      />
      <label htmlFor={fileInputId} className="expedido-nao-chegou-file-label">
        <RiFileExcel2Fill />
        {selectedFile ? selectedFile.name : title}
      </label>
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={disabled || isUploading}
          className="expedido-nao-chegou-upload-btn"
        >
          {isUploading ? (
            <>
              <FaSpinner className="spinner" />
              Enviando...
            </>
          ) : (
            <>
              <VscSend />
              Enviar
            </>
          )}
        </button>
      )}
    </div>
  )
})

FileImport.displayName = 'FileImport'

export default FileImport


