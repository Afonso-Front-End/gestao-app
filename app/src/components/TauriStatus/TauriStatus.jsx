import React, { useEffect, useState } from 'react'
import { checkBackendHealth } from '../../utils/api-utils'
import './TauriStatus.css'

const TauriStatus = () => {
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkBackend = async () => {
      setChecking(true)
      const online = await checkBackendHealth()
      setIsBackendOnline(online)
      setChecking(false)
    }

    checkBackend()
    // Verificar a cada 30 segundos
    const interval = setInterval(checkBackend, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="tauri-status">
      <div className="backend-status">
        {checking ? (
          <span className="status-checking">
            <span className="status-dot checking"></span>
            Verificando...
          </span>
        ) : isBackendOnline ? (
          <span className="status-online">
            <span className="status-dot online"></span>
            Backend Online
          </span>
        ) : (
          <span className="status-offline">
            <span className="status-dot offline"></span>
            Backend Offline
          </span>
        )}
      </div>
    </div>
  )
}

export default TauriStatus

