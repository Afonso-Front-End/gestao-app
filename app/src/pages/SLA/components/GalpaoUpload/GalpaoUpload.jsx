import React, { useState } from 'react'
import { buildApiUrl } from '../../../utils/api-utils'
import './GalpaoUpload.css'

const GalpaoUpload = ({ baseName, onUploadSuccess, compact = false }) => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile) {
      // Validar tipo de arquivo
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        alert('Por favor, selecione um arquivo Excel (.xlsx ou .xls)')
        return
      }
      setFile(selectedFile)
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('Por favor, selecione um arquivo')
      return
    }

    if (!baseName) {
      alert('Por favor, selecione uma base primeiro')
      return
    }

    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const { getApiHeaders } = await import('../../../../utils/api-headers')
      const headers = getApiHeaders()
      // Remover Content-Type para FormData (browser define automaticamente)
      delete headers['Content-Type']
      
      const response = await fetch(buildApiUrl(`sla/galpao/upload/${encodeURIComponent(baseName)}`), {
        method: 'POST',
        headers,
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadResult({
          success: true,
          message: result.message,
          totalEntradas: result.data?.total_entradas || 0,
          entradasDuplicadas: result.data?.entradas_duplicadas || 0
        })
        
        if (onUploadSuccess) {
          onUploadSuccess()
        }
      } else {
        setUploadResult({
          success: false,
          message: result.detail || 'Erro no upload'
        })
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'Erro de conexão: ' + error.message
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setUploadResult(null)
    // Limpar o input de arquivo
    const fileInput = document.getElementById('galpao-file-input')
    if (fileInput) {
      fileInput.value = ''
    }
  }

  if (compact) {
    return (
      <div className="galpao-upload-compact">
        <div className="compact-upload-section">
          <div className="file-input-container">
            <input
              id="galpao-file-input-compact"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <label htmlFor="galpao-file-input-compact" className="file-input-label">
              {file ? file.name : '📦 Galpão Excel'}
            </label>
          </div>

          <div className="upload-actions">
            <button
              onClick={handleUpload}
              disabled={!file || uploading || !baseName}
              className="upload-btn"
            >
              {uploading ? 'Enviando...' : 'Enviar'}
            </button>
            
            <button
              onClick={handleClear}
              disabled={uploading}
              className="clear-btn"
            >
              Limpar
            </button>
          </div>
        </div>

        {uploadResult && (
          <div className={`upload-result ${uploadResult.success ? 'success' : 'error'}`}>
            <div className="result-message">
              {uploadResult.message}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="galpao-upload-container">
      <h4>📦 Upload de Entradas no Galpão</h4>
      
      <div className="upload-section">
        <div className="file-input-container">
          <input
            id="galpao-file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="galpao-file-input" className="file-input-label">
            {file ? file.name : 'Selecionar arquivo Excel'}
          </label>
        </div>

        <div className="upload-actions">
          <button
            onClick={handleUpload}
            disabled={!file || uploading || !baseName}
            className="upload-btn"
          >
            {uploading ? 'Enviando...' : 'Enviar Arquivo'}
          </button>
          
          <button
            onClick={handleClear}
            disabled={uploading}
            className="clear-btn"
          >
            Limpar
          </button>
        </div>
      </div>

      {uploadResult && (
        <div className={`upload-result ${uploadResult.success ? 'success' : 'error'}`}>
          <div className="result-header">
            <span className="result-icon">
              {uploadResult.success ? '✅' : '❌'}
            </span>
            <span className="result-title">
              {uploadResult.success ? 'Upload Concluído' : 'Erro no Upload'}
            </span>
          </div>
          <div className="result-message">
            {uploadResult.message}
          </div>
          {uploadResult.success && uploadResult.totalEntradas !== undefined && (
            <div className="result-details">
              <p>📊 <strong>{uploadResult.totalEntradas}</strong> entradas processadas</p>
              {uploadResult.entradasDuplicadas > 0 && (
                <p>⚠️ <strong>{uploadResult.entradasDuplicadas}</strong> entradas duplicadas ignoradas</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="upload-info">
        <p><strong>Formato:</strong> Arquivo Excel (.xlsx ou .xls)</p>
        <p><strong>Base:</strong> {baseName || 'Nenhuma base selecionada'}</p>
      </div>
    </div>
  )
}

export default GalpaoUpload