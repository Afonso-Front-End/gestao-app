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
      if (!prev) {
        return config
      }
      // Comparar arrays por conteúdo (JSON.stringify para arrays simples)
      const basesChanged = JSON.stringify(prev.selectedBases) !== JSON.stringify(config.selectedBases)
      const processedBaseChanged = prev.selectedProcessedBase !== config.selectedProcessedBase
      const refreshTriggerChanged = prev.refreshTrigger !== config.refreshTrigger
      
      if (basesChanged || processedBaseChanged || refreshTriggerChanged) {
        return config
      }
      // Retornar prev para evitar re-render desnecessário
      return prev
    })
  }, [])

  const unregisterSlaConfig = useCallback(() => {
    slaConfigRef.current = null
    setSlaConfig(null)
  }, [])

  const registerD1Config = useCallback((config) => {
    d1ConfigRef.current = config
    setD1Config(prev => {
      if (!prev) {
        return config
      }
      // Comparar arrays por conteúdo
      const basesChanged = JSON.stringify(prev.selectedBases) !== JSON.stringify(config.selectedBases)
      const refreshTriggerChanged = prev.refreshTrigger !== config.refreshTrigger
      
      if (basesChanged || refreshTriggerChanged) {
        return config
      }
      // Retornar prev para evitar re-render desnecessário
      return prev
    })
  }, [])

  const unregisterD1Config = useCallback(() => {
    d1ConfigRef.current = null
    setD1Config(null)
  }, [])

  const registerPedidosRetidosConfig = useCallback((config) => {
    pedidosRetidosConfigRef.current = config
    setPedidosRetidosConfig(prev => {
      if (!prev) {
        return config
      }
      // Comparar arrays por conteúdo
      const basesChanged = JSON.stringify(prev.selectedBases) !== JSON.stringify(config.selectedBases)
      const tiposChanged = JSON.stringify(prev.selectedTipos) !== JSON.stringify(config.selectedTipos)
      const agingChanged = JSON.stringify(prev.selectedAging) !== JSON.stringify(config.selectedAging)
      const refreshTriggerChanged = prev.refreshTrigger !== config.refreshTrigger
      
      if (basesChanged || tiposChanged || agingChanged || refreshTriggerChanged) {
        return config
      }
      // Retornar prev para evitar re-render desnecessário
      return prev
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

