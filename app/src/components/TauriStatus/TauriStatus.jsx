import React, { useEffect, useState } from 'react'
import { isTauri, checkBackendHealth } from '../../utils/tauri-utils'
import './TauriStatus.css'

const TauriStatus = () => {
  const [isBackendOnline, setIsBackendOnline] = useState(false)
  const [checking, setChecking] = useState(true)
  const runningOnTauri = isTauri()

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

  // Não mostrar se não estiver no Tauri
  if (!runningOnTauri) {
    return null
  }

  return (
    <div className="tauri-status">
      <div className="tauri-status-badge">
        <span className="tauri-icon">🖥️</span>
        <span className="tauri-text">Desktop</span>
      </div>
      
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

