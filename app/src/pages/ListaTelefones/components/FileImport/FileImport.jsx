import React, { useState, useId } from 'react'
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaSpinner } from "react-icons/fa";
import { VscSend } from "react-icons/vsc";
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

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Obter headers de autenticação
      const { getApiHeaders } = await import('../../../../utils/api-headers')
      const headers = getApiHeaders()
      
      // Remover Content-Type para FormData (browser define automaticamente)
      delete headers['Content-Type']

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        onSuccess?.(result)
        setSelectedFile(null)
        // Reset input
        document.getElementById(fileInputId).value = ''
      } else {
        const errorText = await response.text()
        let errorMessage = `Erro no upload: ${response.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      onError?.(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`lista-telefones-file-import ${disabled ? 'disabled' : ''}`}>
      {/* <h2>{title}</h2> */}
      <div className="lista-telefones-import-container">
        <div className="lista-telefones-import-buttons">
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
            className={`lista-telefones-import-button ${disabled ? 'disabled' : ''}`}
          >
            <RiFileExcel2Fill size={20} />
            <span>
              {disabled
                ? 'Aguarde os lotes estarem disponíveis...'
                : selectedFile ? selectedFile.name.slice(0, 10) + '...' : 'Arquivo Excel'
              }
            </span>
          </label>

          {selectedFile && !disabled && (
            <button
              className="lista-telefones-upload-button"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <FaSpinner size={20} className="lista-telefones-spinning" />
                </>
              ) : (
                <VscSend size={20} />
              )}
            </button>
          )}
        </div>

        {/* <p className="lista-telefones-import-text">
          {disabled
            ? 'Este importador será habilitado após processar os lotes de pedidos'
            : `Formatos aceitos: ${acceptedFormats}`
          }
        </p> */}
      </div>
    </div>
  )
}

export default FileImport
