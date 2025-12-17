import { useState, useCallback, useEffect } from 'react'
import api from '../../../services/api'

const STORAGE_KEY_BASE_DEVOLUCAO = 'sem_movimentacao_sc_selected_base_devolucao'

export const useDevolucao = (showSuccess, showError) => {
  const [remessasDevolucao, setRemessasDevolucao] = useState([])
  const [loadingDevolucao, setLoadingDevolucao] = useState(false)
  const [basesDevolucao, setBasesDevolucao] = useState([])
  const [selectedBaseDevolucao, setSelectedBaseDevolucao] = useState([])
  const [loadingBasesDevolucao, setLoadingBasesDevolucao] = useState(false)
  const [showDeleteDevolucaoModal, setShowDeleteDevolucaoModal] = useState(false)
  const [deleteDevolucaoType, setDeleteDevolucaoType] = useState(null)
  const [deletingDevolucao, setDeletingDevolucao] = useState(false)

  // NÃO persistir seleção de base - sempre começar sem seleção
  // O filtro de base é apenas para visualização, não precisa ser persistido

  // Carregar bases de devolução disponíveis
  const loadBasesDevolucao = useCallback(async () => {
    setLoadingBasesDevolucao(true)
    try {
      const response = await api.get('/sem-movimentacao-sc/devolucao/bases')
      if (response.data.success && response.data.data) {
        const bases = response.data.data.map(item => item.base_entrega).filter(Boolean)
        setBasesDevolucao(bases)
      }
    } catch (error) {
      console.error('Erro ao carregar bases de devolução:', error)
      showError?.('Erro ao carregar bases de devolução')
    } finally {
      setLoadingBasesDevolucao(false)
    }
  }, [showError])

  // Função para carregar remessas em devolução
  const loadRemessasDevolucao = useCallback(async (baseFilter = null) => {
    setLoadingDevolucao(true)
    try {
      const url = baseFilter 
        ? `/sem-movimentacao-sc/devolucao/list?base_entrega=${encodeURIComponent(baseFilter)}`
        : '/sem-movimentacao-sc/devolucao/list'
      
      console.log('🔍 Buscando remessas em devolução:', { url, baseFilter })
      
      const response = await api.get(url)
      console.log('📦 Resposta da API de devolução:', {
        success: response.data.success,
        total: response.data.total,
        dataLength: response.data.data?.length || 0,
        firstItem: response.data.data?.[0]
      })
      
      if (response.data.success && response.data.data) {
        const remessas = response.data.data.map(item => item.remessa).filter(Boolean)
        console.log('✅ Remessas extraídas:', remessas.length, 'remessa(s)')
        setRemessasDevolucao(remessas)
        return remessas
      }
      console.warn('⚠️ Nenhuma remessa encontrada na resposta')
      return []
    } catch (error) {
      console.error('❌ Erro ao carregar remessas em devolução:', error)
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      showError?.('Erro ao carregar remessas em devolução. Tente novamente.')
      return []
    } finally {
      setLoadingDevolucao(false)
    }
  }, [showError])

  // Função para carregar remessas e abrir modal de QR codes
  // SEMPRE carrega TODAS as remessas da coleção, ignorando qualquer filtro de base
  const handleLoadDevolucaoQRCodes = useCallback(async () => {
    console.log('🔍 Carregando TODAS as remessas em devolução (sem filtro)')
    
    // Limpar qualquer seleção de base anterior
    setSelectedBaseDevolucao([])
    
    // Sempre carregar todas as remessas, sem filtro de base
    const remessas = await loadRemessasDevolucao(null)
    
    console.log('📦 Remessas carregadas:', remessas.length)
    
    if (remessas.length > 0) {
      showSuccess?.(`${remessas.length} remessa(s) em devolução carregada(s)!`)
      return true
    } else {
      showError?.('Nenhuma remessa encontrada em devolução.')
      return false
    }
  }, [loadRemessasDevolucao, showSuccess, showError])

  // Função para recarregar remessas quando base mudar (simplificada para select simples)
  const handleBaseDevolucaoChange = useCallback(async (newBases, showQRCodeDevolucaoModal = false) => {
    // O select sempre passa um array
    const basesArray = Array.isArray(newBases) ? newBases : []
    
    // Evitar atualização desnecessária se a base não mudou
    const currentBasesStr = JSON.stringify(selectedBaseDevolucao)
    const newBasesStr = JSON.stringify(basesArray)
    if (currentBasesStr === newBasesStr) {
      return
    }
    
    setSelectedBaseDevolucao(basesArray)
    
    // Se o modal estiver aberto, recarregar remessas filtradas pela base
    if (showQRCodeDevolucaoModal) {
      const baseFilter = basesArray.length > 0 ? basesArray[0] : null
      const remessas = await loadRemessasDevolucao(baseFilter)
      
      if (remessas.length > 0) {
        showSuccess?.(`${remessas.length} remessa(s) carregada(s)!`)
      } else {
        showError?.('Nenhuma remessa encontrada para esta base.')
      }
    }
  }, [selectedBaseDevolucao, loadRemessasDevolucao, showSuccess, showError])

  // Função para deletar devoluções (sem senha)
  const handleDeleteDevolucao = useCallback(async () => {
    if (!deleteDevolucaoType) {
      showError?.('Erro: Tipo de deleção não especificado')
      return false
    }

    setDeletingDevolucao(true)
    try {
      // Construir dados - só incluir base_entrega se não for 'all'
      const data = {}
      
      // Só adicionar base_entrega se houver uma base específica selecionada
      if (deleteDevolucaoType && deleteDevolucaoType !== 'all') {
        data.base_entrega = deleteDevolucaoType
      }
      
      console.log('🗑️ Enviando requisição de deleção:', {
        base_entrega: data.base_entrega || 'não enviado (deletar todas)',
        deleteType: deleteDevolucaoType
      })
      
      // Construir URL completa
      const url = '/sem-movimentacao-sc/devolucao/delete'
      const fullURL = `${api.defaults.baseURL}${url}`
      
      console.log('🌐 URL completa da requisição:', fullURL)
      console.log('🌐 BaseURL do axios:', api.defaults.baseURL)
      console.log('🌐 URL relativa:', url)
      console.log('🌐 localStorage api_base_url:', localStorage.getItem('api_base_url'))
      console.log('🌐 Dados sendo enviados:', JSON.stringify(data, null, 2))
      
      // Testar chamada direta ao servidor (bypass proxy)
      const token = localStorage.getItem('authToken')
      const apiKey = import.meta.env.VITE_API_KEY || localStorage.getItem('api_key')
      const apiSecret = import.meta.env.VITE_API_SECRET || localStorage.getItem('api_secret')
      
      const directUrl = `http://localhost:8001/api/sem-movimentacao-sc/devolucao/delete`
      console.log('🔗 Tentando chamada direta:', directUrl)
      
      try {
        const directResponse = await fetch(directUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'X-API-Key': apiKey || '',
            'X-API-Secret': apiSecret || ''
          },
          body: JSON.stringify(data)
        })
        
        const directData = await directResponse.json()
        console.log('📥 Resposta direta do servidor:', directResponse.status, directData)
        
        if (directResponse.ok) {
          // Se funcionou diretamente, processar como se fosse resposta do axios
          const response = {
            data: directData,
            status: directResponse.status
          }
          
          if (response.data.success) {
            const deletedCount = response.data.deleted_count || 0
            const message = deleteDevolucaoType === 'all'
              ? `✅ Todas as devoluções foram deletadas! (${deletedCount} remessa(s))`
              : `✅ Devoluções da base "${deleteDevolucaoType}" foram deletadas! (${deletedCount} remessa(s))`
            
            showSuccess?.(message)
            
            // Fechar modal
            setShowDeleteDevolucaoModal(false)
            const deletedType = deleteDevolucaoType
            setDeleteDevolucaoType(null)
            
            // Recarregar bases e remessas
            try {
              await loadBasesDevolucao()
              
              // Se deletou todas, limpar seleção
              if (deletedType === 'all') {
                setSelectedBaseDevolucao([])
                setRemessasDevolucao([])
              } else {
                // Se deletou uma base específica, recarregar se essa base estava selecionada
                if (selectedBaseDevolucao.includes(deletedType)) {
                  await handleBaseDevolucaoChange([], false)
                }
              }
            } catch (reloadError) {
              console.error('Erro ao recarregar dados:', reloadError)
            }
            
            setDeletingDevolucao(false)
            return true
          }
          
          setDeletingDevolucao(false)
          return false
        } else {
          // Se não funcionou, lançar erro para ser capturado
          throw new Error(`Erro direto: ${directResponse.status} - ${JSON.stringify(directData)}`)
        }
      } catch (directError) {
        console.warn('⚠️ Chamada direta falhou, tentando pelo proxy:', directError)
        
        // Tentar pelo proxy normalmente
        const response = await api.post(url, data, {
          validateStatus: (status) => status < 500 // Não lançar erro para 401, apenas retornar
        })
        
        if (response.data && response.data.success) {
          const deletedCount = response.data.deleted_count || 0
          const message = deleteDevolucaoType === 'all'
            ? `✅ Todas as devoluções foram deletadas! (${deletedCount} remessa(s))`
            : `✅ Devoluções da base "${deleteDevolucaoType}" foram deletadas! (${deletedCount} remessa(s))`
          
          showSuccess?.(message)
          
          // Fechar modal
          setShowDeleteDevolucaoModal(false)
          const deletedType = deleteDevolucaoType
          setDeleteDevolucaoType(null)
          
          // Recarregar bases e remessas
          try {
            await loadBasesDevolucao()
            
            // Se deletou todas, limpar seleção
            if (deletedType === 'all') {
              setSelectedBaseDevolucao([])
              setRemessasDevolucao([])
            } else {
              // Se deletou uma base específica, recarregar se essa base estava selecionada
              if (selectedBaseDevolucao.includes(deletedType)) {
                await handleBaseDevolucaoChange([], false)
              }
            }
          } catch (reloadError) {
            console.error('Erro ao recarregar dados:', reloadError)
          }
          
          setDeletingDevolucao(false)
          return true
        }
        
        setDeletingDevolucao(false)
        return false
      }
    } catch (error) {
      console.error('Erro ao deletar devoluções:', error)
      console.error('Detalhes do erro:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      
      if (error.response?.status === 401) {
        // Erro de autenticação - não fechar o modal, deixar o usuário tentar novamente
        const errorDetail = error.response?.data?.detail || 'Erro de autenticação'
        showError?.(`❌ ${errorDetail}. Por favor, verifique e tente novamente.`)
        setDeletingDevolucao(false)
        return false
      } else {
        const errorMessage = error.response?.data?.detail || error.message || 'Erro desconhecido'
        showError?.(`Erro ao deletar devoluções: ${errorMessage}`)
        setShowDeleteDevolucaoModal(false)
        setDeleteDevolucaoType(null)
        setDeletingDevolucao(false)
        return false
      }
    }
  }, [deleteDevolucaoType, showSuccess, showError, loadBasesDevolucao, selectedBaseDevolucao, handleBaseDevolucaoChange])

  return {
    remessasDevolucao,
    loadingDevolucao,
    basesDevolucao,
    selectedBaseDevolucao,
    loadingBasesDevolucao,
    showDeleteDevolucaoModal,
    deleteDevolucaoType,
    deletingDevolucao,
    loadBasesDevolucao,
    loadRemessasDevolucao,
    handleLoadDevolucaoQRCodes,
    handleBaseDevolucaoChange,
    handleDeleteDevolucao,
    setShowDeleteDevolucaoModal,
    setDeleteDevolucaoType,
    setRemessasDevolucao
  }
}

