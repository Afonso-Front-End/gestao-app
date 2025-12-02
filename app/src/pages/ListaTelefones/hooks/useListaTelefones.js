import { useState, useRef } from 'react'
import { useNotification } from '../../../contexts/NotificationContext'
import { apiMethods } from '../../../services/api'

export const useListaTelefones = () => {
  const { showSuccess, showError, showLoading, hideLoading } = useNotification()
  const [listas, setListas] = useState([])
  const [loading, setLoading] = useState(false)
  const hasLoaded = useRef(false)

  // Função para limpar dados mantendo apenas as colunas necessárias
  const limparDados = (dados) => {
    // Colunas que devem ser mantidas (com variações de nome possíveis)
    const colunasPermitidas = [
      'Data',
      'DATA',
      'data',
      'Motorista',
      'MOTORISTA',
      'motorista',
      'Status',
      'STATUS',
      'status',
      'Cidade',
      'CIDADE',
      'cidade',
      'HUB',
      'hub',
      'Hub',
      'Contato',
      'CONTATO',
      'contato',
      'Telefone',
      'TELEFONE',
      'telefone'
    ]
    
    return dados.map(item => {
      const itemLimpo = {}
      
      // Manter apenas as colunas permitidas
      Object.keys(item).forEach(key => {
        // Verificar se a chave está na lista de permitidas (case-insensitive)
        const keyLower = key.toLowerCase()
        const isPermitida = colunasPermitidas.some(col => {
          const colLower = col.toLowerCase()
          // Verificar correspondência exata ou parcial
          return keyLower === colLower || 
                 keyLower.includes(colLower) || 
                 colLower.includes(keyLower)
        })
        
        if (isPermitida) {
          // Normalizar o nome da coluna para o padrão desejado
          let nomeNormalizado = key
          
          // Normalizar para nomes padrão
          if (keyLower.includes('data')) {
            nomeNormalizado = 'Data'
          } else if (keyLower.includes('motorista')) {
            nomeNormalizado = 'Motorista'
          } else if (keyLower.includes('status')) {
            nomeNormalizado = 'Status'
          } else if (keyLower.includes('cidade')) {
            nomeNormalizado = 'Cidade'
          } else if (keyLower.includes('hub')) {
            nomeNormalizado = 'HUB'
          } else if (keyLower.includes('contato') || keyLower.includes('telefone')) {
            nomeNormalizado = 'Contato'
          }
          
          itemLimpo[nomeNormalizado] = item[key]
        }
      })
      
      return itemLimpo
    })
  }

  const carregarListas = async (page = 1, showNotification = true, pagination) => {
    setLoading(true)
    // Sempre mostrar loading, mas controlar se mostra sucesso
    const loadingId = showLoading('Carregando lista de telefones...', 'Carregando')
    
    try {
      const skip = (page - 1) * pagination.limit
      const url = `/lista-telefones/listas?limite=${pagination.limit}&pular=${skip}`
      const { data } = await apiMethods.get(url)

      // Aceitar tanto 'registros' (novo) quanto 'dados_processados' (legado)
      let registros = []
      if (Array.isArray(data?.registros)) {
        registros = data.registros
      } else if (Array.isArray(data?.dados_processados)) {
        registros = data.dados_processados
      }

      // Flatten defensivo caso venha array de arrays
      if (Array.isArray(registros) && Array.isArray(registros[0])) {
        registros = registros.flat()
      }

      const dadosLimpos = limparDados(registros || [])

      
      setListas(dadosLimpos)
      
      // Mostrar sucesso apenas se showNotification for true
      if (showNotification) {
        showSuccess(`Lista carregada com sucesso! ${dadosLimpos.length} registros encontrados.`)
      }
      
      return {
        dados: dadosLimpos,
        totalRegistros: data.total_registros || 0
      }
    } catch (error) {
      showError('Erro ao carregar lista de telefones')
      throw error
    } finally {
      setLoading(false)
      hideLoading(loadingId)
    }
  }

  const handleUploadSuccess = async (result, onDataUpdate) => {
    const loadingId = showLoading('Processando arquivo e recarregando dados...', 'Processando')
    
    try {
      showSuccess(result.message || 'Arquivo processado e salvo na coleção lista_telefonica!')
      
      // Recarregar a tabela após upload bem-sucedido
      if (onDataUpdate) {
        await onDataUpdate()
      }

    } catch (error) {
      showError(`Erro ao processar arquivo: ${error.message}`)
    } finally {
      hideLoading(loadingId)
    }
  }

  const handleUploadError = (error) => {
    showError(`Erro no upload: ${error.message}`)
  }

  return {
    listas,
    loading,
    hasLoaded,
    carregarListas,
    handleUploadSuccess,
    handleUploadError
  }
}
