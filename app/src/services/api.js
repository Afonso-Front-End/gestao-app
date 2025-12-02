import axios from 'axios'
import { getApiBaseUrl, isTauri } from '../utils/tauri-utils'

// Configuração base do Axios
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 120000, // 2 minutos para uploads grandes
  headers: {
    'Content-Type': 'application/json',
  },
  // Permitir requisições simultâneas
  maxRedirects: 5,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
})

// Log para debug removido

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Adicionar API Key e Secret se configurados (exceto para rotas de auth)
    // Prioridade: 1. Variável de ambiente, 2. localStorage
    if (!config.url?.includes('/auth/')) {
      const apiKey = import.meta.env.VITE_API_KEY || localStorage.getItem('api_key')
      const apiSecret = import.meta.env.VITE_API_SECRET || localStorage.getItem('api_secret')
      if (apiKey && apiSecret) {
        config.headers['X-API-Key'] = apiKey
        config.headers['X-API-Secret'] = apiSecret
      }
    }
    
    // Log para debug removido
    
    return config
  },
  (requestError) => {
    return Promise.reject(requestError)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    // Log para debug removido
    return response
  },
  (responseError) => {
    // Log para debug removido
    
    // Tratar erros específicos
    if (responseError.response?.status === 401) {
      // Token expirado ou inválido (exceto para rotas de auth)
      if (!responseError.config?.url?.includes('/auth/')) {
        localStorage.removeItem('authToken')
        sessionStorage.removeItem('authToken')
        // Redirecionar para login se não estiver na página de login/register
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(responseError)
  }
)

// Métodos auxiliares
export const apiMethods = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
}

export default api