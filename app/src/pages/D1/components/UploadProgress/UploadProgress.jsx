import React from 'react'
import { FaFileUpload, FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa'
import { useUpload } from '../../../../contexts/UploadContext'
import '../../../../components/UploadProgress/UploadProgress.css'

const D1UploadProgress = () => {
  const { uploads, removeUpload, cancelUpload } = useUpload()

  // Filtrar apenas uploads relevantes para D1
  const d1Uploads = uploads.filter(upload => 
    upload.type === 'd1-gestao' || upload.type === 'd1-bipagens'
  )

  if (d1Uploads.length === 0) return null

  const getUploadTypeLabel = (type) => {
    switch (type) {
      case 'd1-gestao':
        return '📋 Gestão'
      case 'd1-bipagens':
        return '📦 Bipagens'
      default:
        return '📄 Arquivo'
    }
  }

  return (
    <div className="upload-progress-container">
      {d1Uploads.map((upload) => (
        <div 
          key={upload.id} 
          className={`upload-progress-item upload-progress-${upload.status}`}
        >
          <div className="upload-progress-icon">
            {upload.status === 'uploading' && (
              <FaFileUpload className="upload-icon-spin" />
            )}
            {upload.status === 'success' && (
              <FaCheckCircle className="upload-icon-success" />
            )}
            {upload.status === 'error' && (
              <FaTimesCircle className="upload-icon-error" />
            )}
          </div>

          <div className="upload-progress-content">
            <div className="upload-progress-header">
              <span className="upload-progress-filename">
                {upload.fileName}
              </span>
              <span className="upload-progress-type">
                {getUploadTypeLabel(upload.type)}
              </span>
            </div>

            {upload.status === 'uploading' && (
              <div className="upload-progress-bar-container">
                <div 
                  className="upload-progress-bar"
                  style={{ width: `${upload.progress}%` }}
                >
                  <span className="upload-progress-percentage">
                    {upload.progress}%
                  </span>
                </div>
              </div>
            )}

            {upload.status === 'success' && (
              <div className="upload-progress-message upload-progress-success-msg">
                ✅ Upload concluído com sucesso!
              </div>
            )}

            {upload.status === 'error' && (
              <div className="upload-progress-message upload-progress-error-msg">
                ❌ {upload.error || 'Erro no upload'}
              </div>
            )}
          </div>

          <button
            className="upload-progress-close"
            onClick={() => {
              if (upload.status === 'uploading') {
                cancelUpload(upload.id)
              } else {
                removeUpload(upload.id)
              }
            }}
            title={upload.status === 'uploading' ? 'Cancelar upload' : 'Fechar'}
          >
            <FaTimes />
          </button>
        </div>
      ))}
    </div>
  )
}

export default D1UploadProgress

