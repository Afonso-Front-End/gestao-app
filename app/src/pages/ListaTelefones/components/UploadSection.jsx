import React from 'react'
import FileImport from '../../../components/FileImport/FileImport'
import { API_ENDPOINTS } from '../constants/api'
import { buildApiUrl } from '../../../utils/api-utils'

const UploadSection = ({ onSuccess, onError }) => {
  return (
    <div className="upload-section">
      <FileImport
        endpoint={buildApiUrl(API_ENDPOINTS.UPLOAD)}
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  )
}

export default UploadSection
