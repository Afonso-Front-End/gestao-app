/**
 * Utilitários para manipulação de dados de motoristas
 */
import api from '../../../services/api'

// Cache para armazenar pedidos buscados recentemente
// Estrutura: { chave: { data: {...}, timestamp: number } }
// Chave: `${motorista}||${base}||${status || 'all'}`
const pedidosCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos em milissegundos

/**
 * Limpa entradas expiradas do cache
 */
const limparCacheExpirado = () => {
  const agora = Date.now()
  for (const [chave, valor] of pedidosCache.entries()) {
    if (agora - valor.timestamp > CACHE_DURATION) {
      pedidosCache.delete(chave)
    }
  }
}

/**
 * Gera chave única para o cache baseada em motorista, base e status
 * @param {string} motorista - Nome do motorista
 * @param {string} base - Nome da base
 * @param {string|null} status - Status dos pedidos
 * @returns {string} Chave do cache
 */
const gerarChaveCache = (motorista, base, status) => {
  return `${motorista}||${base}||${status || 'all'}`
}

/**
 * Busca telefone do motorista na API
 * @param {string} motorista - Nome do motorista
 * @param {string} base - Nome da base
 * @returns {Promise<string|null>} Telefone encontrado ou null
 */
export const buscarTelefoneMotorista = async (motorista, base = '') => {
  try {
    const url = `/lista-telefones/motorista/${encodeURIComponent(motorista)}?base_name=${encodeURIComponent(base)}`
    const response = await api.get(url)
    const data = response.data

    if (data.success && data.tem_telefone && data.match_exato) {
      return data.telefone
    }
    return null
  } catch (error) {
    // Erro ao buscar telefone
    return null
  }
}

/**
 * Busca pedidos de um motorista na API
 * Implementa cache para evitar requisições desnecessárias
 * @param {string} motorista - Nome do motorista
 * @param {string} base - Nome da base (opcional)
 * @param {string} status - Status dos pedidos (opcional, ex: 'nao_entregues')
 * @param {boolean} forceRefresh - Força atualização ignorando cache (padrão: false)
 * @returns {Promise<Object>} Resposta da API com dados dos pedidos
 */
export const buscarPedidosMotorista = async (motorista, base = '', status = null, forceRefresh = false) => {
  try {
    // Limpar cache expirado antes de verificar
    limparCacheExpirado()

    // Gerar chave do cache
    const chaveCache = gerarChaveCache(motorista, base, status)

    // Verificar se existe no cache e não está expirado
    if (!forceRefresh && pedidosCache.has(chaveCache)) {
      const cached = pedidosCache.get(chaveCache)
      const agora = Date.now()
      
      // Se ainda está válido, retornar do cache
      if (agora - cached.timestamp < CACHE_DURATION) {
        // Cache hit
        return cached.data
      } else {
        // Remover se expirado
        pedidosCache.delete(chaveCache)
      }
    }

    // Fazer requisição à API
    const params = new URLSearchParams()
    if (base) params.append('base', base)
    if (status) params.append('status', status)
    
    const url = `/retidos/pedidos-motorista/${encodeURIComponent(motorista)}${params.toString() ? '?' + params.toString() : ''}`
    const response = await api.get(url)
    const data = response.data
    
    // Salvar no cache
    pedidosCache.set(chaveCache, {
      data,
      timestamp: Date.now()
    })

    // Nova requisição
    return data
  } catch (error) {
    // Erro ao buscar pedidos
    throw error
  }
}

/**
 * Limpa o cache de pedidos manualmente
 * Útil quando os dados podem ter sido atualizados no servidor
 */
export const limparCachePedidos = () => {
  pedidosCache.clear()
  // Cache limpo
}

/**
 * Carrega status de motoristas do servidor
 * @param {Array} pedidosParadosData - Array de dados de pedidos parados
 * @returns {Promise<Object>} Mapa de status dos motoristas
 */
export const carregarStatusServidor = async (pedidosParadosData) => {
  if (pedidosParadosData.length === 0) return {}

  try {
    // Buscar status de todos os motoristas únicos com suas bases
    const motoristasUnicos = new Map()
    pedidosParadosData.forEach(item => {
      const motorista = item.responsavel || item.motorista
      const base = item.base || ''
      if (motorista) {
        const key = base ? `${motorista}||${base}` : motorista
        if (!motoristasUnicos.has(key)) {
          motoristasUnicos.set(key, { motorista, base })
        }
      }
    })

    const statusPromises = Array.from(motoristasUnicos.entries()).map(async ([statusKey, { motorista, base }]) => {
      try {
        const url = base
          ? `/retidos/motorista/${encodeURIComponent(motorista)}/status?base=${encodeURIComponent(base)}`
          : `/retidos/motorista/${encodeURIComponent(motorista)}/status`

        const response = await api.get(url)
        return { statusKey, status: response.data.status }
      } catch (error) {
        // Erro silencioso ao buscar status
        return { statusKey, status: null }
      }
    })

    const statusResults = await Promise.all(statusPromises)
    const statusMap = {}
    statusResults.forEach(({ statusKey, status }) => {
      if (statusKey && status) {
        statusMap[statusKey] = status
      }
    })

    return statusMap
  } catch (error) {
    // Erro silencioso ao carregar status
    return {}
  }
}

/**
 * Salva status do motorista no servidor
 * @param {string} motorista - Nome do motorista
 * @param {string} base - Nome da base
 * @param {string|null} status - Status a ser salvo (ou null para remover)
 * @returns {Promise<boolean>} true se salvou com sucesso
 */
export const salvarStatusMotorista = async (motorista, base, status) => {
  try {
    await api.post(`/retidos/motorista/${encodeURIComponent(motorista)}/status`, {
      status,
      responsavel: motorista,
      base
    })

    return true
  } catch (error) {
    // Erro ao salvar status
    return false
  }
}

