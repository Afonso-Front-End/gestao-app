import axios from 'axios'
import { getApiBaseUrl } from '../utils/api-utils'

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
    const fullURL = `${config.baseURL}${config.url}`
    console.log('📤 [API] Enviando requisição:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: fullURL,
      hasToken: !!localStorage.getItem('authToken'),
      headers: {
        'Authorization': config.headers.Authorization ? 'Bearer ***' : 'não enviado',
        'X-API-Key': config.headers['X-API-Key'] ? '***' : 'não enviado',
        'X-API-Secret': config.headers['X-API-Secret'] ? '***' : 'não enviado'
      }
    })
    
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 [API] Token de autenticação adicionado:', {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
        url: config.url
      })
    } else {
      console.warn('⚠️ [API] Token de autenticação não encontrado para:', config.url)
    }
    
    // Adicionar API Key e Secret se configurados (exceto para rotas de auth)
    // Prioridade: 1. Variável de ambiente, 2. localStorage
    if (!config.url?.includes('/auth/')) {
      const apiKey = import.meta.env.VITE_API_KEY || localStorage.getItem('api_key')
      const apiSecret = import.meta.env.VITE_API_SECRET || localStorage.getItem('api_secret')
      if (apiKey && apiSecret) {
        config.headers['X-API-Key'] = apiKey
        config.headers['X-API-Secret'] = apiSecret
        console.log('🔑 [API] API Key adicionada aos headers:', {
          url: config.url,
          hasKey: !!apiKey,
          hasSecret: !!apiSecret,
          keyLength: apiKey?.length,
          secretLength: apiSecret?.length
        })
      } else {
        console.warn('⚠️ [API] API Key ou Secret não encontrados para:', config.url)
      }
    }
    
    return config
  },
  (requestError) => {
    console.error('❌ [API] Erro no interceptor de request:', requestError)
    return Promise.reject(requestError)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ [API] Resposta recebida:', response.status, response.config.url)
    return response
  },
  (responseError) => {
    console.error('❌ [API] Erro na resposta:', {
      status: responseError.response?.status,
      statusText: responseError.response?.statusText,
      url: responseError.config?.url,
      data: responseError.response?.data,
      message: responseError.message
    })
    
    // Tratar erros específicos
    if (responseError.response?.status === 401) {
      // Token expirado ou inválido (exceto para rotas de auth e delete de devolução)
      const url = responseError.config?.url || ''
      const isAuthRoute = url.includes('/auth/')
      const isDevolucaoDelete = url.includes('/devolucao/delete')
      
      console.log('🔐 [API] Erro 401 detectado:', {
        url,
        isAuthRoute,
        isDevolucaoDelete,
        willRedirect: !isAuthRoute && !isDevolucaoDelete
      })
      
      if (!isAuthRoute && !isDevolucaoDelete) {
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