import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

const ConfigContext = createContext(null)

export const ConfigProvider = ({ children }) => {
  const [slaConfig, setSlaConfig] = useState(null)
  const [d1Config, setD1Config] = useState(null)
  const [pedidosRetidosConfig, setPedidosRetidosConfig] = useState(null)
  
  const slaConfigRef = useRef(null)
  const d1ConfigRef = useRef(null)
  const pedidosRetidosConfigRef = useRef(null)

  const registerSlaConfig = useCallback((config) => {
    slaConfigRef.current = config
    setSlaConfig(prev => {
      if (!prev || 
          prev.selectedBases !== config.selectedBases ||
          prev.selectedProcessedBase !== config.selectedProcessedBase ||
          prev.refreshTrigger !== config.refreshTrigger) {
        return config
      }
      return config
    })
  }, [])

  const unregisterSlaConfig = useCallback(() => {
    slaConfigRef.current = null
    setSlaConfig(null)
  }, [])

  const registerD1Config = useCallback((config) => {
    d1ConfigRef.current = config
    setD1Config(prev => {
      if (!prev || 
          prev.selectedBases !== config.selectedBases ||
          prev.refreshTrigger !== config.refreshTrigger) {
        return config
      }
      return config
    })
  }, [])

  const unregisterD1Config = useCallback(() => {
    d1ConfigRef.current = null
    setD1Config(null)
  }, [])

  const registerPedidosRetidosConfig = useCallback((config) => {
    pedidosRetidosConfigRef.current = config
    setPedidosRetidosConfig(prev => {
      if (!prev || 
          prev.selectedBases !== config.selectedBases ||
          prev.selectedTipos !== config.selectedTipos ||
          prev.selectedAging !== config.selectedAging ||
          prev.refreshTrigger !== config.refreshTrigger) {
        return config
      }
      return config
    })
  }, [])

  const unregisterPedidosRetidosConfig = useCallback(() => {
    pedidosRetidosConfigRef.current = null
    setPedidosRetidosConfig(null)
  }, [])

  return (
    <ConfigContext.Provider value={{ 
      slaConfig, 
      registerSlaConfig, 
      unregisterSlaConfig,
      d1Config,
      registerD1Config,
      unregisterD1Config,
      pedidosRetidosConfig,
      registerPedidosRetidosConfig,
      unregisterPedidosRetidosConfig
    }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => {
  const context = useContext(ConfigContext)
  if (!context) {
    console.warn('useConfig must be used within ConfigProvider')
    return {
      slaConfig: null,
      registerSlaConfig: () => {},
      unregisterSlaConfig: () => {},
      d1Config: null,
      registerD1Config: () => {},
      unregisterD1Config: () => {},
      pedidosRetidosConfig: null,
      registerPedidosRetidosConfig: () => {},
      unregisterPedidosRetidosConfig: () => {}
    }
  }
  return context
}

