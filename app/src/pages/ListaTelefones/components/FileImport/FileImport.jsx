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

      const response = await fetch(endpoint, {
        method: 'POST',
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
        throw new Error(`Erro no upload: ${response.status} - ${errorText}`)
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
