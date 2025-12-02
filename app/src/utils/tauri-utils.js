/**
 * Utilitários para integração com Tauri
 */

/**
 * Verifica se a aplicação está rodando no Tauri
 */
export const isTauri = () => {
  return window.__TAURI__ !== undefined
}

/**
 * Obtém a URL base da API de acordo com o ambiente
 * - Em Tauri: usa localhost:PORT diretamente (ou configuração do localStorage)
 * - Em navegador: usa proxy do Vite
 */
export const getApiBaseUrl = () => {
  if (isTauri()) {
    // No Tauri, verificar se há URL configurada no localStorage
    const customApiUrl = localStorage.getItem('api_base_url')
    if (customApiUrl && customApiUrl.trim() !== '') {
      // Garantir que termina com /api
      const cleanUrl = customApiUrl.trim().replace(/\/+$/, '')
      return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`
    }
    // Verificar se há porta configurada no localStorage
    const customPort = localStorage.getItem('api_port')
    const port = customPort && customPort.trim() !== '' ? customPort.trim() : '8001'
    // Padrão: localhost:8001 (ou porta configurada)
    return `http://localhost:${port}/api`
  }
  // No navegador com Vite, usa o proxy
  return '/api'
}

/**
 * Constrói uma URL completa da API
 * @param {string} endpoint - Endpoint da API (ex: 'sla/calculator/metrics/BNU' ou '/sla/calculator/metrics/BNU')
 * @returns {string} URL completa da API
 */
export const buildApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
  
  // Se baseUrl já termina com /api, não adicionar novamente
  if (baseUrl.endsWith('/api')) {
    return `${baseUrl}/${cleanEndpoint}`
  }
  
  // Caso contrário, adicionar /api
  return `${baseUrl}/api/${cleanEndpoint}`
}

/**
 * Configurações específicas do Tauri
 */
export const tauriConfig = {
  // Porta do backend local (configurável via localStorage)
  get backendPort() {
    const customPort = localStorage.getItem('api_port')
    return customPort && customPort.trim() !== '' ? parseInt(customPort.trim(), 10) : 8001
  },
  backendHost: 'localhost',
  
  // URL completa do backend
  get backendUrl() {
    return `http://${this.backendHost}:${this.backendPort}`
  }
}

/**
 * Verifica se o backend está disponível
 */
export const checkBackendHealth = async () => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    }
    
    // Adicionar API Key e Secret se configurados
    // Prioridade: 1. Variável de ambiente, 2. localStorage
    const apiKey = import.meta.env.VITE_API_KEY || localStorage.getItem('api_key')
    const apiSecret = import.meta.env.VITE_API_SECRET || localStorage.getItem('api_secret')
    if (apiKey && apiSecret) {
      headers['X-API-Key'] = apiKey
      headers['X-API-Secret'] = apiSecret
    }
    
    const response = await fetch(`${tauriConfig.backendUrl}/health`, {
      method: 'GET',
      headers
    })
    return response.ok
  } catch (error) {
    return false
  }
}

