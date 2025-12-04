/**
 * Utilitários para configuração da API
 */

/**
 * Obtém a URL base da API
 * - Em navegador: usa proxy do Vite (/api)
 * - Pode ser configurado via localStorage (api_base_url)
 */
export const getApiBaseUrl = () => {
  // Verificar se há URL configurada no localStorage
  const customApiUrl = localStorage.getItem('api_base_url')
  if (customApiUrl && customApiUrl.trim() !== '') {
    // Garantir que termina com /api
    const cleanUrl = customApiUrl.trim().replace(/\/+$/, '')
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`
  }
  
  // No navegador com Vite, usa o proxy
  // Retorna apenas '/api' - o proxy do Vite redireciona para o backend
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
    
    const baseUrl = getApiBaseUrl()
    const healthUrl = baseUrl.endsWith('/api') 
      ? `${baseUrl.replace('/api', '')}/health` 
      : `${baseUrl}/health`
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers
    })
    return response.ok
  } catch (error) {
    return false
  }
}


