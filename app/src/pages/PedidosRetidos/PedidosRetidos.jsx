import React, { useState, useEffect, useRef, useMemo, useCallback, useReducer, lazy, Suspense } from 'react'
import FileImport from './components/FileImport/FileImport'
import Table from './components/Table/Table'
import ScreenshotButton from './components/ScreenshotButton/ScreenshotButton'
import SearchInput from './components/SearchInput/SearchInput'
import EmptyState from '../../components/EmptyState/EmptyState'
import LoadingState from '../../components/LoadingState/LoadingState'
import PedidosRetidosUploadProgress from './components/UploadProgress/UploadProgress'
import { useUpload } from '../../contexts/UploadContext'
import { MdFolderDelete } from "react-icons/md"
import { IoRefresh, IoSaveOutline } from "react-icons/io5"

// Lazy loading de componentes pesados (code splitting)
const TableOverlay = lazy(() => import('./components/TableOverlay/TableOverlay'))
const ConfirmModal = lazy(() => import('../../components/ConfirmModal/ConfirmModal'))
const ObservacaoModal = lazy(() => import('./components/ObservacaoModal/ObservacaoModal'))

import MultiSelect from './components/MultiSelect'
import FilterDropdown from './components/FilterDropdown/FilterDropdown'

// Hooks de dados
import useBases from './hooks/useBases'
import useTiposOperacao from './hooks/useTiposOperacao'
import useAging from './hooks/useAging'
import usePedidosParados from './hooks/usePedidosParados'
import useHasPedidosData from './hooks/useHasPedidosData'

// Hooks de lógica
import usePedidosRetidosFilters from './hooks/usePedidosRetidosFilters'
import usePedidosLotes from './hooks/usePedidosLotes'
import useMotoristaStatus from './hooks/useMotoristaStatus'
import useOverlay from './hooks/useOverlay'
import useMotoristaActions from './hooks/useMotoristaActions'
import useFiltrosTabela from './hooks/useFiltrosTabela'
import useBuscaPedidos from './hooks/useBuscaPedidos'
import useFilteredPedidos from './hooks/useFilteredPedidos'
import useAdminActions from './hooks/useAdminActions'
import useTableRender from './hooks/useTableRender'
import useRefreshAfterUpload from './hooks/useRefreshAfterUpload'

// Hooks de otimização
import useDebouncedValue from '../../hooks/useDebouncedValue'

// Reducer para modais
import { modalReducer, initialModalState, MODAL_ACTIONS } from './reducers/modalReducer'

import { useNotification } from '../../contexts/NotificationContext'
import { PedidosRetidosLoadingProvider } from './contexts/LoadingContext'
import { useConfig } from '../../contexts/ConfigContext'
import api from '../../services/api'
import { getApiBaseUrl } from '../../utils/api-utils'
import { limparCachePedidos } from './utils/motoristaUtils'
import { PEDIDOS_PARADOS_COLUMNS, OVERLAY_PEDIDOS_MOTORISTA_COLUMNS } from './constants/tableColumns'

import './PedidosRetidos.css'


const PedidosRetidosContent = () => {
  // Hooks para buscar dados do servidor
  const { registerPedidosRetidosConfig, unregisterPedidosRetidosConfig } = useConfig()
  const { bases: availableBases, loading: basesLoading, refetch: refetchBases } = useBases()
  const { tipos: availableTipos, loading: tiposLoading, refetch: refetchTipos } = useTiposOperacao()
  const { aging: availableAging, loading: agingLoading, refetch: refetchAging } = useAging()

  const {
    data: pedidosParadosData,
    setData: setPedidosParadosData,
    totalPedidos,
    setTotalPedidos,
    totalBases,
    setTotalBases,
    lotes: lotesServidor,
    setLotes: setLotesServidor,
    totalLotes: totalLotesServidor,
    setTotalLotes: setTotalLotesServidor,
    loading: pedidosParadosLoading,
    initialLoadDone,
    fetchPedidosParados
  } = usePedidosParados()

  // Hook para verificar se existem dados de pedidos no banco
  const { hasData: hasPedidosData, revalidate: revalidatePedidosData } = useHasPedidosData()

  // Hook de filtros principais
  const {
    selectedBases,
    selectedTipos,
    selectedAging,
    setSelectedBases,
    setSelectedTipos,
    setSelectedAging,
    limparFiltros
  } = usePedidosRetidosFilters()

  // Hook de lotes
  const {
    pedidosLotes,
    setPedidosLotes,
    processarPedidosFiltrados,
    copiarLote
  } = usePedidosLotes()

  // Estado dos modais de confirmação (otimizado com useReducer)
  const [modals, dispatchModal] = useReducer(modalReducer, initialModalState)

  // Contexto global de uploads
  const upload = useUpload()
  const { activeUploads } = upload

  // Verificar se há uploads ativos APENAS desta página (não de outras páginas)
  // Filtrar apenas uploads relevantes para Pedidos Retidos
  const relevantUploads = activeUploads.filter(upload =>
    upload.type === 'retidos' || upload.type === 'consultados'
  )
  const uploadingRetidos = relevantUploads.some(upload => upload.type === 'retidos')
  const uploadingConsultados = relevantUploads.some(upload => upload.type === 'consultados')
  const isUploading = uploadingRetidos || uploadingConsultados

  // Estado para loading após upload de Consultados
  const [loadingAfterConsultados, setLoadingAfterConsultados] = useState(false)

  // Estado para upload de atualização da tabela
  const [isUploadingUpdate, setIsUploadingUpdate] = useState(false)
  const fileInputUpdateRef = useRef(null)

  // Estado para salvamento de snapshot
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false)

  // Hook de status de motoristas
  const {
    motoristasStatus,
    atualizarStatus
  } = useMotoristaStatus(pedidosParadosData)

  // Hook de overlay
  const overlay = useOverlay()

  // Hook de ações do motorista
  const motoristaActions = useMotoristaActions(overlay)

  // Hook de filtros da tabela
  const {
    filtroBases,
    setFiltroBases,
    filtroCidades,
    setFiltroCidades,
    basesDisponiveis,
    cidadesDisponiveis,
    refetchFiltrosTabela
  } = useFiltrosTabela(availableBases, selectedBases, setPedidosParadosData, setTotalPedidos)

  // Hook de busca de pedidos filtrados
  const { fetchFilteredPedidos, loading: pedidosLoading, clearPedidos } = useFilteredPedidos()

  // Hook de busca de pedidos
  const { buscarPedidos } = useBuscaPedidos(
    { selectedBases, selectedTipos, selectedAging },
    fetchFilteredPedidos,
    (result) => {
      const { totalPedidos: total } = processarPedidosFiltrados(result, setTotalPedidos)
      setTotalPedidos(total)
      // Revalidar se existem dados após buscar pedidos
      revalidatePedidosData()
    },
    pedidosLoading
  )

  // Hook de ações administrativas (com funções de limpeza)
  const adminActions = useAdminActions({
    clearPedidosParados: () => {
      // Limpar dados de pedidos parados
      setPedidosParadosData([])
      setTotalPedidos(0)
      setTotalBases(0)
      setLotesServidor([])
      setTotalLotesServidor(0)
      // Limpar filtros da tabela também
      setFiltroBases([])
      setFiltroCidades([])
    },
    clearPedidosLotes: () => {
      // Limpar lotes locais
      setPedidosLotes([])
    },
    clearFilteredPedidos: () => {
      // Limpar pedidos filtrados
      clearPedidos()
    },
    refetchBases,
    refetchTipos,
    refetchAging,
    refetchFiltrosTabela,
    closeOverlay: overlay.handleCloseOverlay,
    revalidatePedidosData // Adicionar revalidação de dados
  })

  // Hook para atualizar dados após upload
  const refreshAfterUpload = useRefreshAfterUpload({
    refetchBases,
    refetchTipos,
    refetchAging,
    fetchPedidosParados,
    selectedBases,
    filtroCidades,
    refetchFiltrosTabela // Adicionar função para atualizar filtros da tabela
  })

  // Estado para pesquisa na tabela de pedidos parados (com debounce)
  const [searchText, setSearchText] = useState('')
  const debouncedSearchText = useDebouncedValue(searchText, 300)

  // Verificação inicial de dados ao montar o componente
  // IMPORTANTE: Sempre fazer verificação inicial, mesmo com uploads de outras páginas
  // O isUploading só verifica uploads desta página (retidos/consultados)
  useEffect(() => {
    // Se há uploads ativos DESTA página, não fazer verificação inicial
    // (o loading será mostrado pelo estado de upload)
    // Mas se há uploads de OUTRAS páginas, ainda assim deve carregar os dados
    if (isUploading) {
      return
    }

    // Fazer verificação inicial silenciosa
    const checkInitialData = async () => {
      try {
        await fetchPedidosParados({ bases: filtroBases, cidades: filtroCidades })
      } catch (error) {
        // Erro silencioso na verificação inicial
      }
    }

    checkInitialData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Executar apenas uma vez ao montar

  // Desativar loading após Consultados quando dados forem carregados
  useEffect(() => {
    if (loadingAfterConsultados) {
      // Se os dados foram carregados OU o loading do hook terminou
      if (pedidosParadosData.length > 0 || !pedidosParadosLoading) {
        // Aguardar um pouco para garantir que a UI foi atualizada
        const timer = setTimeout(() => {
          setLoadingAfterConsultados(false)
        }, 500)
        return () => clearTimeout(timer)
      }

      // Timeout de segurança: desativar após 15 segundos mesmo sem dados
      const timeoutSafety = setTimeout(() => {
        setLoadingAfterConsultados(false)
      }, 15000)

      return () => clearTimeout(timeoutSafety)
    }
  }, [loadingAfterConsultados, pedidosParadosData.length, pedidosParadosLoading])

  // Referência para a tabela de pedidos parados (para screenshot)
  const tabelaPedidosParadosRef = useRef(null)

  // Notificações globais
  const { showSuccess, showError, showInfo } = useNotification()

  // Handlers otimizados com useCallback

  // Handler para abrir modal de confirmação - Lotes
  const handleDeleteLotes = useCallback(() => {
    dispatchModal({ type: MODAL_ACTIONS.OPEN_DELETE_LOTES })
  }, [])

  // Handler para confirmar exclusão de lotes
  const handleConfirmDeleteLotes = useCallback(async () => {
    try {
      dispatchModal({ type: MODAL_ACTIONS.SET_LOADING_LOTES, payload: true })
      showInfo('🗑️ Deletando dados do arquivo Retidos...')

      const response = await api.delete('/retidos/lotes')

      if (response.data.success) {
        // Limpar lotes locais
        setPedidosLotes([])

        // Revalidar dados
        revalidatePedidosData()

        // Atualizar selects
        refetchBases()
        refetchTipos()
        refetchAging()

        const counts = response.data.deleted_counts
        showSuccess(
          `✅ Dados deletados com sucesso!\n` +
          `📋 pedidos_retidos: ${counts.pedidos_retidos}\n` +
          `📦 pedidos_retidos_chunks: ${counts.pedidos_retidos_chunks}\n` +
          `🔢 Total: ${counts.total} registros`
        )

        dispatchModal({ type: MODAL_ACTIONS.CLOSE_DELETE_LOTES })
      }
    } catch (error) {
      // Erro ao deletar lotes
      showError(
        `Erro ao deletar lotes: ${error.response?.data?.detail || error.message}`
      )
      dispatchModal({ type: MODAL_ACTIONS.SET_LOADING_LOTES, payload: false })
    }
  }, [setPedidosLotes, revalidatePedidosData, refetchBases, refetchTipos, refetchAging, showInfo, showSuccess, showError])

  // Handler para abrir modal de confirmação - Coleções
  const handleDeleteCollections = useCallback(() => {
    dispatchModal({ type: MODAL_ACTIONS.OPEN_DELETE_COLLECTIONS })
  }, [])

  // Handler para confirmar exclusão de coleções
  const handleConfirmDeleteCollections = useCallback(async () => {
    try {
      dispatchModal({ type: MODAL_ACTIONS.SET_LOADING_COLLECTIONS, payload: true })
      await adminActions.deletarColecoesPrincipais()
      dispatchModal({ type: MODAL_ACTIONS.CLOSE_DELETE_COLLECTIONS })
    } catch (error) {
      // Erro ao deletar coleções
      dispatchModal({ type: MODAL_ACTIONS.SET_LOADING_COLLECTIONS, payload: false })
    }
  }, [adminActions])

  // Handler para abrir modal de confirmação de exclusão de chunks
  const handleDeleteChunks = useCallback(() => {
    dispatchModal({ type: MODAL_ACTIONS.OPEN_DELETE_CHUNKS })
  }, [])

  // Handler para confirmar exclusão de chunks
  const handleConfirmDeleteChunks = useCallback(async () => {
    try {
      dispatchModal({ type: MODAL_ACTIONS.SET_LOADING_CHUNKS, payload: true })
      await adminActions.deletarTabelaChunks()
      dispatchModal({ type: MODAL_ACTIONS.CLOSE_DELETE_CHUNKS })
    } catch (error) {
      // Erro ao deletar chunks
      dispatchModal({ type: MODAL_ACTIONS.SET_LOADING_CHUNKS, payload: false })
    }
  }, [adminActions])

  // Handler para abrir modal de confirmação de exclusão de tabela (Consultados)
  const handleDeleteTabela = useCallback(() => {
    dispatchModal({ type: MODAL_ACTIONS.OPEN_DELETE_TABELA })
  }, [])

  // Handler para confirmar exclusão de tabela
  const handleConfirmDeleteTabela = useCallback(async () => {
    try {
      dispatchModal({ type: MODAL_ACTIONS.SET_LOADING_TABELA, payload: true })
      await adminActions.deletarTabela()
      dispatchModal({ type: MODAL_ACTIONS.CLOSE_DELETE_TABELA })
    } catch (error) {
      // Erro ao deletar tabela
      dispatchModal({ type: MODAL_ACTIONS.SET_LOADING_TABELA, payload: false })
    }
  }, [adminActions])

  // Handlers simplificados usando hooks (otimizados com useCallback)
  const handleSearchPedidos = useCallback(() => {
    buscarPedidos()
  }, [buscarPedidos])

  const handleMotoristaClick = useCallback((motorista) => {
    motoristaActions.buscarPedidosMotorista(motorista)
  }, [motoristaActions])

  const handleNaoEntreguesClick = useCallback((motorista) => {
    motoristaActions.buscarPedidosMotorista(motorista, 'nao_entregues')
  }, [motoristaActions])

  // Handler para abrir seleção de arquivo para atualização
  const handleOpenFileUpdateDialog = useCallback(() => {
    if (fileInputUpdateRef.current) {
      fileInputUpdateRef.current.click()
    }
  }, [])

  // Handler para salvar snapshot
  const handleSaveSnapshot = useCallback(async () => {
    if (isSavingSnapshot) {
      return
    }

    setIsSavingSnapshot(true)

    try {
      showInfo('⏳ Criando snapshot dos dados...')

      const payload = {
        module: 'pedidos_parados',
        period_type: 'manual'
      }

      const response = await api.post('reports/snapshot', payload)

      if (response.data?.success) {
        const isDuplicate = response.data?.is_duplicate
        const metrics = response.data.data?.metrics || response.data.metrics

        if (isDuplicate) {
          showInfo(
            `ℹ️ Snapshot recente já existe! ${metrics?.total_pedidos || 0} pedidos, ` +
            `${metrics?.total_motoristas || 0} motoristas, ` +
            `Taxa de entrega: ${metrics?.taxa_entrega?.toFixed(1) || 0}%`
          )
        } else {
          showSuccess(
            `✅ Snapshot salvo! ${metrics?.total_pedidos || 0} pedidos, ` +
            `${metrics?.total_motoristas || 0} motoristas, ` +
            `Taxa de entrega: ${metrics?.taxa_entrega?.toFixed(1) || 0}%`
          )
        }
      }
    } catch (error) {
      // Erro ao salvar snapshot
      showError('Erro ao salvar snapshot. Tente novamente.')
    } finally {
      setIsSavingSnapshot(false)
    }
  }, [isSavingSnapshot, showInfo, showSuccess, showError])

  // Handler para fazer upload de múltiplos arquivos de atualização
  const handleFileUpdateChange = useCallback(async (event) => {
    const files = Array.from(event.target.files)
    if (!files || files.length === 0) return

    setIsUploadingUpdate(true)

    const totalFiles = files.length
    let successCount = 0
    let errorCount = 0
    const uploadType = 'consultados'

    showInfo(`📤 Iniciando upload de ${totalFiles} arquivo(s)...`)

    try {
      // Processar arquivos sequencialmente
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        let uploadId = null

        try {
          uploadId = upload.startUpload({
            fileName: file.name,
            type: uploadType
          })

          const formData = new FormData()
          formData.append('file', file)

          // Simular progresso
          const progressInterval = setInterval(() => {
            upload.updateUploadProgress(uploadId, Math.random() * 30 + 20)
          }, 500)

          const { getApiHeaders } = await import('../../utils/api-headers')
          const headers = getApiHeaders()
          // Remover Content-Type para FormData (browser define automaticamente)
          delete headers['Content-Type']

          const response = await fetch(`${getApiBaseUrl()}/retidos/upload-tabela-dados`, {
            method: 'POST',
            headers,
            body: formData
          })

          clearInterval(progressInterval)
          upload.updateUploadProgress(uploadId, 100)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.detail || 'Erro ao fazer upload')
          }

          const result = await response.json()

          upload.completeUpload(uploadId, `Upload ${i + 1}/${totalFiles} concluído!`)
          successCount++

          // Arquivo processado com sucesso

        } catch (fileError) {
          // Erro no arquivo tratado abaixo
          errorCount++

          if (uploadId) {
            upload.failUpload(uploadId, fileError.message)
          }
        }
      }

      // Limpar input
      if (fileInputUpdateRef.current) {
        try {
          fileInputUpdateRef.current.value = ''
        } catch (e) {
          // Erro silencioso ao limpar input
        }
      }

      // Mostrar resultado final
      if (successCount > 0 && errorCount === 0) {
        showSuccess(`✅ ${successCount} arquivo(s) processado(s) com sucesso!`)
      } else if (successCount > 0 && errorCount > 0) {
        showInfo(`⚠️ ${successCount} arquivo(s) processado(s), ${errorCount} com erro.`)
      } else {
        showError(`❌ Todos os ${totalFiles} arquivo(s) falharam no upload.`)
      }

      // Aguardar e atualizar a tabela se houver sucesso
      if (successCount > 0) {
        setLoadingAfterConsultados(true)
        setTimeout(async () => {
          try {
            await refreshAfterUpload('consultados')
          } catch (error) {
            // Erro silencioso ao atualizar
            setLoadingAfterConsultados(false)
          }
        }, 50)
      }

    } catch (error) {
      // Erro geral no upload tratado abaixo
      showError(`Erro ao processar uploads: ${error.message}`)
    } finally {
      setIsUploadingUpdate(false)
    }
  }, [upload, showInfo, showSuccess, showError, refreshAfterUpload, setLoadingAfterConsultados])

  // Estados do modal de observação
  const [observacaoModal, setObservacaoModal] = useState({
    isOpen: false,
    statusKey: '',
    motorista: '',
    base: '',
    status: '',
    observacao: ''
  })
  const [observacoes, setObservacoes] = useState({})
  const [isLoadingObservacoes, setIsLoadingObservacoes] = useState(false)

  // Handler para abrir modal de observação
  const handleOpenObservacao = useCallback((statusKey, motorista, base, status, currentObservacao = '') => {
    setObservacaoModal({
      isOpen: true,
      statusKey,
      motorista,
      base,
      status,
      observacao: currentObservacao || observacoes[statusKey] || ''
    })
  }, [observacoes])

  // Handler para fechar modal de observação
  const handleCloseObservacao = useCallback(() => {
    setObservacaoModal(prev => ({ ...prev, isOpen: false }))
  }, [])

  // Handler para salvar observação
  const handleSaveObservacao = useCallback(async (observacao) => {
    const { statusKey, motorista, base, status } = observacaoModal

    try {
      // Chamar API para salvar observação no servidor
      await api.post(`/retidos/motorista/${encodeURIComponent(motorista)}/status`, {
        responsavel: motorista,
        base: base,
        status: status,
        observacao: observacao
      })

      // Atualizar estado local para manter botão visível
      setObservacoes(prev => ({
        ...prev,
        [statusKey]: observacao
      }))

      // Feedback de sucesso
      showSuccess(`Observação ${observacao.trim() ? 'salva' : 'removida'} com sucesso!`)

    } catch (error) {
      // Erro ao salvar observação
      showError('Erro ao salvar observação. Tente novamente.')
      throw error // Re-lançar para o modal tratar
    }
  }, [observacaoModal, showSuccess, showError])

  // Carregar observações salvas (carregar sempre, não apenas quando há dados)
  useEffect(() => {
    const carregarObservacoes = async () => {
      setIsLoadingObservacoes(true)
      try {
        // Buscar todas as observações salvas
        const response = await api.get('/retidos/motorista/all-status')

        if (response.data?.success && response.data?.statuses) {
          const observacoesMap = {}

          response.data.statuses.forEach(statusItem => {
            // Garantir que temos responsavel
            const responsavel = statusItem.responsavel || statusItem.motorista || ''
            const base = statusItem.base || ''
            const observacao = statusItem.observacao || ''
            
            if (responsavel) {
              // Usar a mesma chave que é usada em outros lugares: motorista||base
              const statusKey = base 
                ? `${responsavel}||${base}` 
                : responsavel
              
              // Salvar observação se não estiver vazia
              if (observacao && typeof observacao === 'string' && observacao.trim() !== '') {
                observacoesMap[statusKey] = observacao.trim()
              }
            }
          })

          // Fazer merge com observações existentes para não perder dados locais
          setObservacoes(prev => ({ ...prev, ...observacoesMap }))
        }
      } catch (error) {
        // Erro silencioso ao carregar observações
      } finally {
        setIsLoadingObservacoes(false)
      }
    }

    carregarObservacoes()
  }, []) // Carregar apenas uma vez ao montar o componente

  // Hook de renderização da tabela (deve vir depois dos handlers)
  const renderCellContent = useTableRender(
    motoristasStatus,
    atualizarStatus,
    handleMotoristaClick,
    handleNaoEntreguesClick,
    handleOpenObservacao,
    observacoes,
    showSuccess,
    showError
  )

  // Filtrar dados por pesquisa de texto (otimizado com useMemo e debounce)
  const dadosFiltrados = useMemo(() => {
    if (!debouncedSearchText.trim()) {
      return pedidosParadosData
    }

    const searchLower = debouncedSearchText.toLowerCase()
    return pedidosParadosData.filter(item => {
      // Buscar em todos os valores do item
      return Object.values(item).some(value => {
        const valueStr = String(value || '').toLowerCase()
        return valueStr.includes(searchLower)
      })
    })
  }, [pedidosParadosData, debouncedSearchText])

  // Calcular estatísticas dos dados filtrados (otimizado com useMemo)
  const totalPedidosFiltrados = useMemo(() => {
    return dadosFiltrados.reduce((sum, item) => {
      return sum + (Number(item.total) || 0)
    }, 0)
  }, [dadosFiltrados])

  // Memoizar handlers do FileImport Retidos (otimizado com useCallback)
  const handleRetidosSuccess = useCallback((result) => {
    limparCachePedidos()
    // Atualizar selects automaticamente após upload
    refreshAfterUpload('retidos')
    // Revalidar se existem dados para habilitar o upload de consultados
    revalidatePedidosData()
  }, [refreshAfterUpload, revalidatePedidosData])

  const handleRetidosError = useCallback((error) => {
    showError(`Erro ao fazer upload: ${error.message}`)
  }, [showError])

  // Memoizar handlers do FileImport Consultados (otimizado com useCallback)
  const handleConsultadosSuccess = useCallback((result) => {
    limparCachePedidos()
    // Ativar loading imediatamente após upload
    setLoadingAfterConsultados(true)

    // Usar setTimeout para garantir que a UI renderize o loading ANTES do processamento
    setTimeout(async () => {
      try {
        await refreshAfterUpload('consultados')
      } catch (error) {
        // Erro silencioso ao atualizar
        setLoadingAfterConsultados(false)
      }
    }, 50) // 50ms é suficiente para a UI atualizar
  }, [refreshAfterUpload])

  const handleConsultadosError = useCallback((error) => {
    showError(`Erro ao fazer upload: ${error.message}`)
    setLoadingAfterConsultados(false)
  }, [showError])

  // Memoizar overlay subtitle (otimizado com useMemo)
  const overlaySubtitle = useMemo(() => (
    <div>
      {overlay.overlaySubtitle}
      <br />
      <span className="stats-highlight">Total: {overlay.overlayStats.totalPedidos || 0} pedidos</span>
      {' | '}
      <span className="cities-list">Cidades: {overlay.overlayStats.totalCidades || 0} ({overlay.overlayStats.cidades?.join(', ') || 'N/A'})</span>
    </div>
  ), [overlay.overlaySubtitle, overlay.overlayStats])

  // Nota: A atualização dos dados baseada em filtros de bases/cidades
  // é gerenciada pelo hook useFiltrosTabela para evitar duplicação

  // Registrar configurações de PedidosRetidos no contexto global
  useEffect(() => {
    registerPedidosRetidosConfig({
      selectedBases,
      onBasesChange: setSelectedBases,
      selectedTipos,
      onTiposChange: setSelectedTipos,
      selectedAging,
      onAgingChange: setSelectedAging,
      availableBases,
      basesLoading,
      availableTipos,
      tiposLoading,
      availableAging,
      agingLoading,
      // Usar apenas o caminho relativo - o axios já tem baseURL: '/api'
      retidosEndpoint: '/retidos/upload',
      consultadosEndpoint: '/retidos/upload-tabela-dados',
      onRetidosSuccess: handleRetidosSuccess,
      onRetidosError: handleRetidosError,
      onConsultadosSuccess: handleConsultadosSuccess,
      onConsultadosError: handleConsultadosError,
      onSearchPedidos: handleSearchPedidos,
      pedidosLoading,
      onDeleteLotes: handleDeleteLotes,
      deleteLotesLoading: modals.deleteLotes.loading,
      hasPedidosData,
      filtroBases,
      onFiltroBasesChange: setFiltroBases,
      filtroCidades,
      onFiltroCidadesChange: setFiltroCidades,
      basesDisponiveis,
      cidadesDisponiveis,
      onDeleteTabela: handleDeleteTabela,
      deleteTabelaLoading: modals.deleteTabela.loading,
      pedidosLotes,
      setPedidosLotes,
      copiarLote
    })

    return () => {
      unregisterPedidosRetidosConfig()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedBases,
    selectedTipos,
    selectedAging,
    availableBases,
    basesLoading,
    availableTipos,
    tiposLoading,
    availableAging,
    agingLoading,
    hasPedidosData,
    filtroBases,
    filtroCidades,
    basesDisponiveis,
    cidadesDisponiveis,
    pedidosLoading,
    modals.deleteLotes.loading,
    modals.deleteTabela.loading,
    pedidosLotes,
    registerPedidosRetidosConfig,
    unregisterPedidosRetidosConfig
  ])

  return (
    <div className="pedidos-retidos">
      <div className='pedidos-retidos-header-container'>
        <div className="pedidos-header-content">
          {filtroBases && (
            <FilterDropdown
              label="Filtros de Tabela"
              badgeCount={(filtroBases?.length || 0) + (filtroCidades?.length || 0)}
            >
              <MultiSelect
                selectedValues={filtroBases || []}
                setSelectedValues={setFiltroBases}
                options={basesDisponiveis || []}
                placeholder="Todas as bases"
                selectAllText="Selecionar Todas"
                clearAllText="Limpar Todas"
                allSelectedText="Todas as bases selecionadas"
                showCount={true}
                className="theme-blue"
              />
              {filtroCidades && (
                <MultiSelect
                  selectedValues={filtroCidades || []}
                  setSelectedValues={setFiltroCidades}
                  options={cidadesDisponiveis || []}
                  placeholder="Todas as cidades"
                  selectAllText="Selecionar Todas"
                  clearAllText="Limpar Todas"
                  allSelectedText="Todas as cidades selecionadas"
                  showCount={true}
                  className="theme-green"
                />
              )}
              {handleDeleteTabela && (
                <div className="filter-dropdown-actions">
                  <button
                    onClick={handleDeleteTabela}
                    className="filter-action-btn filter-action-btn--danger"
                    disabled={modals.deleteTabela.loading}
                    title="Deletar apenas os dados da tabela de consulta"
                  >
                    <MdFolderDelete size={20} />
                    {modals.deleteTabela.loading ? 'Deletando...' : 'Deletar Dados da Tabela'}
                  </button>
                </div>
              )}
            </FilterDropdown>
          )}
        </div>
      </div>

      <div className="pedidos-retidos-content">
        <div className="pedidos-parados-section">
          {(isUploading || loadingAfterConsultados || (pedidosParadosLoading && initialLoadDone)) ? (
            <LoadingState
              message={
                uploadingRetidos ? "Processando Arquivo Retidos..." :
                  uploadingConsultados ? "Processando Arquivo Consultados..." :
                    loadingAfterConsultados ? "Processando e Carregando Tabela..." :
                      (pedidosParadosLoading && initialLoadDone) ? "Carregando dados..." :
                        "Carregando..."
              }
              subtitle={
                uploadingRetidos
                  ? "Aguarde enquanto importamos e processamos os dados dos pedidos retidos."
                  : (uploadingConsultados || loadingAfterConsultados)
                    ? "Aguarde enquanto processamos os dados e atualizamos a tabela. Isso pode levar alguns segundos..."
                    : (pedidosParadosLoading && initialLoadDone)
                      ? "Aguarde enquanto buscamos os dados..."
                      : "Aguarde..."
              }
              size="medium"
            />
          ) : pedidosParadosData.length > 0 ? (
            <div ref={tabelaPedidosParadosRef} className='pedidos-parados-table'>
              <div className="table-header">
                <div className="table-title-section">
                  <div style={{ display: "flex", gap: "12px" , justifyContent: "space-between"}}>
                    <div>
                      <h3 className="table-title">
                        Atualização de Pedidos Parados {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </h3>
                      <p className="table-subtitle">
                        📊 Dados agrupados por Mootorista das bases selecionadas!
                      </p>
                    </div>

                    <div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                        {/* Botões de Ação */}
                        <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => adminActions.gerarRelatorioContato(filtroBases)}
                            className="btn-gerar-relatorio"
                            title="Gerar e baixar relatório Excel com dados de contato"
                          >
                            <span>📊</span>
                            <span>Gerar Relatório Excel</span>
                          </button>
                          <input
                            ref={fileInputUpdateRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            multiple
                            onChange={handleFileUpdateChange}
                            style={{ display: 'none' }}
                          />
                          <button
                            onClick={handleOpenFileUpdateDialog}
                            className="btn-upload-update"
                            disabled={isUploadingUpdate}
                            title="Fazer upload de arquivo(s) para atualizar a tabela (aceita múltiplos arquivos)"
                          >
                            <IoRefresh size={20} className={isUploadingUpdate ? 'spinning' : ''} />
                          </button>
                          <button
                            onClick={handleDeleteChunks}
                            className="btn-deletar-chunks"
                            disabled={modals.deleteChunks.loading}
                            title="Deletar todos os dados da coleção pedidos_retidos_tabela_chunks"
                          >
                            <MdFolderDelete size={20} />
                          </button>
                          <ScreenshotButton
                            targetRef={tabelaPedidosParadosRef}
                            filename="pedidos-parados"
                            onSuccess={(message) => showSuccess(message)}
                            onError={(error) => showError(error)}
                            title="Capturar screenshot da tabela"
                            excludeSelectors={[
                              '.pedidos-screenshot-button',
                              '.btn-save-snapshot',
                              '.btn-upload-update',
                              '.btn-deletar-chunks',
                              '.btn-gerar-relatorio',
                              'input[type="file"]'
                            ]}
                            size="medium"
                          />
                          <button
                            onClick={handleSaveSnapshot}
                            className="btn-save-snapshot"
                            disabled={isSavingSnapshot || !pedidosParadosData || pedidosParadosData.length === 0}
                            title="Salvar snapshot dos dados atuais para relatórios"
                          >
                            <IoSaveOutline size={20} className={isSavingSnapshot ? 'spinning' : ''} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Legenda dos Marcadores de Status */}
                  <div className="status-legend">
                    <span className="status-legend-title">Legenda:</span>
                    <div className="status-legend-items">
                      <div className="status-legend-item">
                        <button className="pr-status-btn pr-entregue active"></button>
                        <span>Retornou</span>
                      </div>
                      <div className="status-legend-item">
                        <button className="pr-status-btn pr-nao-entregue active"></button>
                        <span>Não retornou</span>
                      </div>
                      <div className="status-legend-item">
                        <button className="pr-status-btn pr-anulado active"></button>
                        <span>Esperando retorno</span>
                      </div>
                      <div className="status-legend-item">
                        <button className="pr-status-btn pr-resolvido active"></button>
                        <span>Número de contato errado</span>
                      </div>
                    </div>
                  </div>
                  <div className="table-info">
                    <div className="info-item">
                      <span className="info-label">Total de Pedidos:</span>
                      <span className="info-value">{totalPedidosFiltrados}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Motoristas:</span>
                      <span className="info-value">{dadosFiltrados?.length || 0}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Bases Filtradas:</span>
                      <span className="info-value">{filtroBases.length > 0 ? filtroBases.length : 'Todas'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Cidades Filtradas:</span>
                      <span className="info-value">{filtroCidades.length > 0 ? filtroCidades.length : 'Todas'}</span>
                    </div>
                  </div>
                </div>

                <SearchInput
                  value={searchText}
                  onChange={setSearchText}
                  placeholder="Pesquisar motorista, base, cidade..."
                />
              </div>

              <Table
                data={dadosFiltrados}
                columns={PEDIDOS_PARADOS_COLUMNS}
                title=""
                emptyMessage="Nenhum dado de pedidos parados encontrado"
                renderCellContent={renderCellContent}
              />
            </div>
          ) : (
            <EmptyState
              type="no-upload"
              title="Nenhum Pedido para Exibir"
              message="Faça o upload dos arquivos 'Retidos' e 'Consultados' para visualizar os pedidos parados por motorista."
            />
          )}
        </div>

        {/* Overlay para mostrar pedidos do motorista (lazy loaded) */}
        <Suspense fallback={<LoadingState message="Carregando overlay..." size="small" />}>
          <TableOverlay
            isOpen={overlay.isOverlayOpen && !overlay.isClosingOverlay}
            onClose={overlay.handleCloseOverlay}
            title={overlay.overlayTitle}
            subtitle={overlaySubtitle}
            data={overlay.overlayData}
            columns={OVERLAY_PEDIDOS_MOTORISTA_COLUMNS}
            emptyMessage="Nenhum pedido encontrado para este motorista"
            isLoading={overlay.isLoadingPedidos}
            filterColumns={false}
            overlayType="pedidos-motorista"
            showWhatsApp={overlay.showWhatsApp}
            showAddPhone={true}
            baseName={overlay.baseMotorista}
            motorista={overlay.motoristaNome}
            telefoneMotorista={overlay.telefoneMotorista}
            telefoneCarregado={overlay.telefoneCarregado}
            telefoneInicial={overlay.telefoneMotorista}
            onTelefoneAdicionado={motoristaActions.handleTelefoneAdicionado}
            onCopyPedido={motoristaActions.copiarPedido}
            onCopyAllPedidos={motoristaActions.copiarTodosPedidos}
            onCopyFormattedData={motoristaActions.copiarDadosFormatados}
          />
        </Suspense>
      </div>

      {/* Modais de confirmação (lazy loaded) */}
      <Suspense fallback={null}>
        {/* Modal de confirmação para deletar lotes */}
        <ConfirmModal
          isOpen={modals.deleteLotes.show}
          onClose={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_DELETE_LOTES })}
          onConfirm={handleConfirmDeleteLotes}
          title="Excluir Dados do Arquivo Retidos?"
          message="Tem certeza que deseja excluir todos os dados do primeiro upload (arquivo Retidos)?"
          warningMessage="⚠️ Esta ação não pode ser desfeita. As seguintes coleções serão deletadas: pedidos_retidos e pedidos_retidos_chunks."
          confirmText="Sim, Excluir Tudo"
          cancelText="Cancelar"
          type="danger"
          loading={modals.deleteLotes.loading}
        />

        {/* Modal de confirmação para deletar todas as coleções */}
        <ConfirmModal
          isOpen={modals.deleteCollections.show}
          onClose={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_DELETE_COLLECTIONS })}
          onConfirm={handleConfirmDeleteCollections}
          title="⚠️ Deletar TODAS as Coleções?"
          message="Esta ação irá deletar TODOS os dados das seguintes coleções:"
          warningMessage="🔴 ATENÇÃO: pedidos_retidos, pedidos_retidos_chunks e pedidos_retidos_tabela serão PERMANENTEMENTE deletadas. Esta ação não pode ser desfeita!"
          confirmText="Sim, Deletar TUDO"
          cancelText="Cancelar"
          type="danger"
          loading={modals.deleteCollections.loading}
        />

        {/* Modal de confirmação para deletar chunks da tabela */}
        <ConfirmModal
          isOpen={modals.deleteChunks.show}
          onClose={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_DELETE_CHUNKS })}
          onConfirm={handleConfirmDeleteChunks}
          title="Deletar Dados do Arquivo Consultados?"
          message="Esta ação irá deletar TODOS os dados da coleção pedidos_retidos_tabela_chunks (arquivo Consultados)."
          warningMessage="⚠️ Esta ação não pode ser desfeita. Você precisará fazer o upload do arquivo Consultados novamente."
          confirmText="Sim, Deletar Chunks"
          cancelText="Cancelar"
          type="warning"
          loading={modals.deleteChunks.loading}
        />

        {/* Modal de confirmação para deletar apenas a tabela (Consultados) */}
        <ConfirmModal
          isOpen={modals.deleteTabela.show}
          onClose={() => dispatchModal({ type: MODAL_ACTIONS.CLOSE_DELETE_TABELA })}
          onConfirm={handleConfirmDeleteTabela}
          title="Deletar Dados da Tabela de Consulta?"
          message="Esta ação irá deletar TODOS os dados da coleção pedidos_retidos_tabela (tabela de pedidos consultados)."
          warningMessage="⚠️ ATENÇÃO: Esta ação não pode ser desfeita. Os dados filtrados por base e cidade serão permanentemente deletados!"
          confirmText="Sim, Deletar Tabela"
          cancelText="Cancelar"
          type="warning"
          loading={modals.deleteTabela.loading}
        />

        {/* Modal de Observação - Renderizado FORA da tabela */}
        <ObservacaoModal
          isOpen={observacaoModal.isOpen}
          onClose={handleCloseObservacao}
          onSave={handleSaveObservacao}
          initialValue={observacaoModal.observacao}
          motorista={observacaoModal.motorista}
          status={observacaoModal.status}
        />
      </Suspense>

      {/* UploadProgress local para esta página */}
      <PedidosRetidosUploadProgress />
    </div>
  )
}

const PedidosRetidos = () => {
  return (
    <PedidosRetidosLoadingProvider>
      <PedidosRetidosContent />
    </PedidosRetidosLoadingProvider>
  )
}

export default PedidosRetidos;
