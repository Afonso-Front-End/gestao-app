/**
 * Utilitário para adicionar headers de API Key em requisições fetch
 */
export const getApiHeaders = () => {
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
  
  return headers
}

