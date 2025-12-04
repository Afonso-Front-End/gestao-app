import React, { useState, useEffect, useRef, lazy, Suspense, useMemo, useCallback } from 'react'
import useD1Bases from './hooks/useD1Bases'
import { useD1Cache } from './hooks/useD1Cache'
import { useD1BasesETempos } from './hooks/useD1BasesETempos'
import { useD1Telefone } from './hooks/useD1Telefone'
import { useD1Cidades } from './hooks/useD1Cidades'
import { useD1Motoristas } from './hooks/useD1Motoristas'
import { useD1PedidosMotorista } from './hooks/useD1PedidosMotorista'
import { useD1Pedidos } from './hooks/useD1Pedidos'
import { useD1Handlers } from './hooks/useD1Handlers'
import { useD1TableRender } from './hooks/useD1TableRender.jsx'
import { useNotification } from '../../contexts/NotificationContext'
import { D1LoadingProvider } from './contexts/LoadingContext'
import { useConfig } from '../../contexts/ConfigContext'
import api from '../../services/api'
import Table from './components/Table/Table'
import TableOverlay from './components/TableOverlay/TableOverlay'
import LoadingState from '../../components/LoadingState/LoadingState'
import EmptyState from '../../components/EmptyState/EmptyState'
import D1UploadProgress from './components/UploadProgress/UploadProgress'
import { useUpload } from '../../contexts/UploadContext'

const ConfirmModal = lazy(() => import('../../components/ConfirmModal/ConfirmModal'))
const ObservacaoModal = lazy(() => import('../../pages/PedidosRetidos/components/ObservacaoModal/ObservacaoModal'))
import D1Header from './components/D1Header/D1Header'
import D1PedidosSection from './components/D1PedidosSection/D1PedidosSection'
import D1BipagensHeader from './components/D1BipagensHeader/D1BipagensHeader'
import CustomMessageModal from './components/CustomMessageModal/CustomMessageModal'
import { STORAGE_KEYS, PEDIDOS_MOTORISTA_COLUMNS, MOTORISTAS_COLUMNS, API_ENDPOINTS, CONFIG } from './constants/D1Constants'
import { transformPedidosMotoristaData, transformMotoristasData } from './utils/dataTransformers'
import './D1.css'

const D1Content = () => {
  const { showSuccess, showError, showInfo } = useNotification()
  const { registerD1Config, unregisterD1Config } = useConfig()
  const { bases: availableBases, loading: basesLoading, refetch: refetchBases } = useD1Bases()
  const [selectedBases, setSelectedBases] = useState([])
  const d1PageRef = useRef(null)
  const d1ContentRef = useRef(null)
  
  // Contexto global de uploads
  const upload = useUpload()
  const { activeUploads } = upload
  
  // DEBUG: Log de uploads ativos
  useEffect(() => {
    if (activeUploads.length > 0) {
      // Uploads ativos detectados
    }
  }, [activeUploads])
  
  // Verificar se há uploads ativos APENAS desta página (não de outras páginas)
  // Filtrar apenas uploads relevantes para D1 - IGNORAR uploads de outras páginas (sla, sla-galpao, retidos, consultados)
  const relevantUploads = activeUploads.filter(upload => 
    upload.type === 'd1-gestao' || upload.type === 'd1-bipagens'
  )
  
  const uploadingGestao = relevantUploads.some(upload => upload.type === 'd1-gestao')
  const uploadingBipagens = relevantUploads.some(upload => upload.type === 'd1-bipagens')
  // isUploading só será true se houver uploads RELEVANTES desta página
  // Uploads de outras páginas NÃO devem bloquear o carregamento de dados desta página
  const isUploading = uploadingGestao || uploadingBipagens
  const [selectedBasesBipagens, setSelectedBasesBipagens] = useState([])
  const [selectedTemposParados, setSelectedTemposParados] = useState([])
  const [selectedCidades, setSelectedCidades] = useState([])
  const [saveTemposEnabled, setSaveTemposEnabled] = useState(false)
  const [showLotes, setShowLotes] = useState(true)
  const [d1PedidosLotes, setD1PedidosLotes] = useState([])

  // Limpar cidades selecionadas quando bases mudarem
  useEffect(() => {
    if (selectedBasesBipagens.length === 0) {
      setSelectedCidades([])
    }
  }, [selectedBasesBipagens])
  const [deletingBipagens, setDeletingBipagens] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingD1, setDeletingD1] = useState(false)
  const [showDeleteD1Modal, setShowDeleteD1Modal] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [showCustomMessageModal, setShowCustomMessageModal] = useState(false)
  const [customMessageMotorista, setCustomMessageMotorista] = useState('')
  const [customMessageQuantidade, setCustomMessageQuantidade] = useState(0)
  const [customMessageTelefone, setCustomMessageTelefone] = useState('')
  
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

  // Handler para confirmar exclusão de bipagens
  const handleConfirmDeleteBipagens = async () => {
    setDeletingBipagens(true)
    try {
      const response = await api.delete(API_ENDPOINTS.DELETE_BIPAGENS)
      if (response.data.success) {
        showSuccess(
          `✅ Dados deletados com sucesso!\n\n` +
          `Deletados: ${response.data.deleted_count?.toLocaleString('pt-BR') || 0} registros\n` +
          `Total anterior: ${response.data.previous_count?.toLocaleString('pt-BR') || 0} registros`
        )
        limparCache()
        setSelectedBasesBipagens([])
        carregarBasesETempos()
        setShowDeleteModal(false)
      }
    } catch (error) {
      showError(`Erro ao deletar dados: ${error.response?.data?.detail || error.message || 'Erro desconhecido'}`)
    } finally {
      setDeletingBipagens(false)
    }
  }

  // Handler para confirmar exclusão de D1 (Gestão de 1 Mês)
  const handleConfirmDeleteD1 = async () => {
    setDeletingD1(true)
    try {
      const response = await api.delete(API_ENDPOINTS.DELETE_D1)
      if (response.data.success) {
        showSuccess(
          `✅ Dados deletados com sucesso!\n\n` +
          `Deletados: ${response.data.deleted_count?.toLocaleString('pt-BR') || 0} documentos\n` +
          `d1_main: ${response.data.deleted_counts?.d1_main?.toLocaleString('pt-BR') || 0}\n` +
          `d1_chunks: ${response.data.deleted_counts?.d1_chunks?.toLocaleString('pt-BR') || 0}\n` +
          `Total anterior: ${response.data.previous_counts?.total?.toLocaleString('pt-BR') || 0} documentos`
        )
        refetchBases()
        setSelectedBases([])
        setShowDeleteD1Modal(false)
      }
    } catch (error) {
      showError(`Erro ao deletar dados: ${error.response?.data?.detail || error.message || 'Erro desconhecido'}`)
    } finally {
      setDeletingD1(false)
    }
  }

  // Hooks
  const { cacheRef, gerarChaveCache, isCacheValido, limparCache } = useD1Cache()
  const {
    basesBipagens,
    temposParados,
    loadingBasesBipagens,
    saveBasesEnabled,
    setSaveBasesEnabled,
    basesLoaded,
    setBasesLoaded,
    carregarBasesETempos
  } = useD1BasesETempos()
  const {
    telefoneMotorista,
    setTelefoneMotorista,
    showWhatsApp,
    setShowWhatsApp,
    buscarTelefoneMotorista,
    handleTelefoneAdicionado: handleTelefoneAdicionadoHook,
    resetTelefone
  } = useD1Telefone(cacheRef, gerarChaveCache)
  const {
    cidadesData,
    loadingCidades
  } = useD1Cidades(selectedBasesBipagens)
  const {
    motoristasData,
    loadingMotoristas,
    motoristasStatus,
    setMotoristasStatus,
    carregarMotoristas
  } = useD1Motoristas(selectedBasesBipagens, selectedTemposParados, selectedCidades)
  
  // Filtrar motoristas baseado no searchText
  const filteredMotoristasData = useMemo(() => {
    if (!searchText.trim()) {
      return motoristasData
    }

    const term = searchText.toLowerCase().trim()
    
    return motoristasData.filter((motorista) => {
      // Pesquisar no nome do motorista
      const nomeMotorista = (motorista.motorista || '').toLowerCase()
      if (nomeMotorista.includes(term)) {
        return true
      }

      // Pesquisar na base
      const base = (motorista.base_entrega || '').toLowerCase()
      if (base.includes(term)) {
        return true
      }

      // Pesquisar por números (total de pedidos, entregues, não entregues)
      const totalPedidos = String(motorista.total_pedidos || 0)
      const totalEntregues = String(motorista.total_entregues || 0)
      const totalNaoEntregues = String(motorista.total_nao_entregues || 0)
      
      if (totalPedidos.includes(term) || 
          totalEntregues.includes(term) || 
          totalNaoEntregues.includes(term)) {
        return true
      }

      // Pesquisa parcial no nome
      const palavrasTermo = term.split(/\s+/)
      const palavrasNome = nomeMotorista.split(/\s+/)
      
      const todasPalavrasEncontradas = palavrasTermo.every(palavraTermo =>
        palavrasNome.some(palavraNome => palavraNome.includes(palavraTermo))
      )
      
      if (todasPalavrasEncontradas) {
        return true
      }

      return false
    })
  }, [motoristasData, searchText])
  
  const {
    overlayMotorista,
    pedidosMotorista,
    loadingPedidosMotorista,
    baseMotorista,
    setBaseMotorista,
    carregarPedidosMotorista: carregarPedidosMotoristaHook,
    fecharOverlay
  } = useD1PedidosMotorista(
    selectedBasesBipagens,
    selectedTemposParados,
    cacheRef,
    gerarChaveCache,
    isCacheValido,
    buscarTelefoneMotorista
  )
  const {
    numerosPedidos,
    loadingPedidos,
    numerosPedidosBipagens,
    loadingPedidosBipagens,
    showLotesDropdown,
    setShowLotesDropdown,
    buscarPedidosBipagens: buscarPedidosBipagensHook
  } = useD1Pedidos(
    selectedBases,
    selectedBasesBipagens,
    selectedTemposParados,
    cacheRef,
    gerarChaveCache,
    isCacheValido
  )

  // Hooks de handlers e renderização
  const {
    handleUploadSuccess,
    handleUploadError,
    handleBipagensUploadSuccess,
    handleBipagensUploadError,
    carregarPedidosMotorista,
    handleTelefoneAdicionado,
    buscarPedidosBipagens,
    handleCopyPedido,
    handleCopyAllPedidos
  } = useD1Handlers({
    showSuccess,
    showError,
    showInfo,
    limparCache,
    carregarBasesETempos,
    carregarMotoristas,
    selectedBasesBipagens,
    resetTelefone,
    carregarPedidosMotoristaHook,
    setTelefoneMotorista,
    setShowWhatsApp,
    buscarPedidosBipagensHook,
    pedidosMotorista,
    handleTelefoneAdicionadoHook
  })

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
      await api.post(`/d1/bipagens/motorista/${encodeURIComponent(motorista)}/status`, {
        motorista: motorista,
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

  // Carregar observações salvas quando há dados
  useEffect(() => {
    const carregarObservacoes = async () => {
      if (!motoristasData || motoristasData.length === 0) return
      
      setIsLoadingObservacoes(true)
      try {
        // Buscar todas as observações salvas dos motoristas D1
        // Usar endpoint que retorna status de todos os motoristas
        const response = await api.get('/d1/bipagens/motorista/all-status')
        
        if (response.data?.success && response.data?.statuses) {
          const observacoesMap = {}
          
          response.data.statuses.forEach(statusItem => {
            const statusKey = statusItem.base 
              ? `${statusItem.responsavel}||${statusItem.base}` 
              : statusItem.responsavel
            if (statusItem.observacao) {
              observacoesMap[statusKey] = statusItem.observacao
            }
          })
          
          setObservacoes(observacoesMap)
        }
      } catch (error) {
        // Erro silencioso ao carregar observações
      } finally {
        setIsLoadingObservacoes(false)
      }
    }
    
    carregarObservacoes()
  }, [motoristasData])

  const { renderCellContent } = useD1TableRender({
    motoristasStatus,
    setMotoristasStatus,
    carregarPedidosMotorista,
    observacoes,
    onOpenObservacao: handleOpenObservacao
  })

  // Carregar bases salvas do localStorage quando as bases estiverem disponíveis (apenas uma vez)
  useEffect(() => {
    if (basesBipagens.length > 0 && !basesLoaded) {
      const savedBases = localStorage.getItem(STORAGE_KEYS.BIPAGENS_SAVED_BASES)
      const saveEnabled = localStorage.getItem(STORAGE_KEYS.BIPAGENS_SAVE_ENABLED) === 'true'

      if (saveEnabled && savedBases) {
        try {
          const bases = JSON.parse(savedBases)
          if (Array.isArray(bases) && bases.length > 0) {
            const validBases = bases.filter(base => basesBipagens.includes(base))
            if (validBases.length > 0) {
              setSelectedBasesBipagens(validBases)
              setSaveBasesEnabled(true)
            }
          }
        } catch (error) {
        }
      }
      setBasesLoaded(true)
    }
  }, [basesBipagens, basesLoaded, setSaveBasesEnabled])

  // Carregar tempos salvos do localStorage quando os tempos estiverem disponíveis (apenas uma vez)
  useEffect(() => {
    if (basesLoaded && temposParados.length > 0) {
      const savedTempos = localStorage.getItem(STORAGE_KEYS.BIPAGENS_SAVED_TEMPOS)
      const saveTemposEnabled = localStorage.getItem(STORAGE_KEYS.BIPAGENS_SAVE_TEMPOS_ENABLED) === 'true'
      
      if (saveTemposEnabled && savedTempos) {
        try {
          const tempos = JSON.parse(savedTempos)
          if (Array.isArray(tempos) && tempos.length > 0) {
            const validTempos = tempos.filter(tempo => temposParados.includes(tempo))
            if (validTempos.length > 0) {
              setSelectedTemposParados(validTempos)
              setSaveTemposEnabled(true)
            }
          }
        } catch (error) {
        }
      }
    }
  }, [basesLoaded, temposParados])

  // Salvar bases no localStorage quando o checkbox estiver marcado (apenas após carregar)
  useEffect(() => {
    if (basesLoaded) {
      if (saveBasesEnabled && selectedBasesBipagens.length > 0) {
        localStorage.setItem(STORAGE_KEYS.BIPAGENS_SAVED_BASES, JSON.stringify(selectedBasesBipagens))
        localStorage.setItem(STORAGE_KEYS.BIPAGENS_SAVE_ENABLED, 'true')
      } else if (!saveBasesEnabled) {
        localStorage.removeItem(STORAGE_KEYS.BIPAGENS_SAVED_BASES)
        localStorage.setItem(STORAGE_KEYS.BIPAGENS_SAVE_ENABLED, 'false')
      }
    }
  }, [selectedBasesBipagens, saveBasesEnabled, basesLoaded])

  // Salvar tempos no localStorage quando o checkbox estiver marcado (apenas após carregar)
  useEffect(() => {
    if (basesLoaded) {
      if (saveTemposEnabled && selectedTemposParados.length > 0) {
        localStorage.setItem(STORAGE_KEYS.BIPAGENS_SAVED_TEMPOS, JSON.stringify(selectedTemposParados))
        localStorage.setItem(STORAGE_KEYS.BIPAGENS_SAVE_TEMPOS_ENABLED, 'true')
      } else if (!saveTemposEnabled) {
        localStorage.removeItem(STORAGE_KEYS.BIPAGENS_SAVED_TEMPOS)
        localStorage.setItem(STORAGE_KEYS.BIPAGENS_SAVE_TEMPOS_ENABLED, 'false')
      }
    }
  }, [selectedTemposParados, saveTemposEnabled, basesLoaded])


  // Função para copiar lote
  const copiarLoteD1 = useCallback(async (lote) => {
    try {
      const numeros = lote.pedidos || []
      if (numeros.length === 0) {
        showError('Nenhum número de pedido válido encontrado neste lote.')
        return
      }
      await navigator.clipboard.writeText(numeros.join('\n'))
      showSuccess(`📋 Lote ${lote.numero_lote} copiado! ${numeros.length.toLocaleString('pt-BR')} números de pedidos copiados para a área de transferência.`)
    } catch (error) {
      showError('Erro ao copiar lote. Tente novamente.')
      console.error('Erro ao copiar lote:', error)
    }
  }, [showSuccess, showError])

  // Gerar lotes a partir de numerosPedidos
  useEffect(() => {
    if (numerosPedidos.length > 0 && !loadingPedidos) {
      const lotes = []
      const tamanho = CONFIG.LOTES_SIZE
      for (let i = 0; i < numerosPedidos.length; i += tamanho) {
        lotes.push({
          numero_lote: Math.floor(i / tamanho) + 1,
          total_pedidos: Math.min(tamanho, numerosPedidos.length - i),
          pedidos: numerosPedidos.slice(i, i + tamanho)
        })
      }
      setD1PedidosLotes(lotes)
    } else {
      setD1PedidosLotes([])
    }
  }, [numerosPedidos, loadingPedidos])

  // Mostrar mensagem quando pedidos forem carregados automaticamente
  useEffect(() => {
    if (numerosPedidos.length > 0 && !loadingPedidos && selectedBases.length > 0) {
      showInfo(`✅ ${numerosPedidos.length.toLocaleString('pt-BR')} números de pedidos encontrados para ${selectedBases.length} base(s)`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numerosPedidos.length, loadingPedidos, selectedBases.length])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLotesDropdown && !event.target.closest('.d1-lotes-dropdown-container')) {
        setShowLotesDropdown(false)
      }
    }

    if (showLotesDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLotesDropdown])

  // Registrar configurações do D1 no contexto global
  useEffect(() => {
    registerD1Config({
      selectedBases,
      onBasesChange: setSelectedBases,
      availableBases,
      basesLoading,
      gestaoEndpoint: API_ENDPOINTS.D1_UPLOAD,
      bipagensEndpoint: API_ENDPOINTS.BIPAGENS_UPLOAD,
      onGestaoUploadSuccess: (result) => {
        handleUploadSuccess(result)
        if (result.success) {
          setTimeout(() => {
            refetchBases()
          }, 2000)
        }
      },
      onGestaoUploadError: handleUploadError,
      onBipagensUploadSuccess: handleBipagensUploadSuccess,
      onBipagensUploadError: handleBipagensUploadError,
      onDeleteD1Click: () => setShowDeleteD1Modal(true),
      deletingD1,
      onOpenCustomMessage: () => {
        setCustomMessageMotorista('')
        setCustomMessageQuantidade(pedidosMotorista.length || 0)
        setCustomMessageTelefone(telefoneMotorista || '')
        setShowCustomMessageModal(true)
      },
      d1PedidosLotes,
      setD1PedidosLotes,
      copiarLoteD1
    })
    
    return () => {
      unregisterD1Config()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedBases,
    availableBases,
    basesLoading,
    deletingD1,
    pedidosMotorista.length,
    telefoneMotorista,
    baseMotorista,
    d1PedidosLotes,
    registerD1Config,
    unregisterD1Config
  ])

  return (
    <div className="d1-page" ref={d1PageRef}>
      <D1Header
        showLotes={showLotes}
        setShowLotes={setShowLotes}
        hasPedidos={numerosPedidos.length > 0 && !loadingPedidos}
      />

      <div className="d1-content" ref={d1ContentRef}>
        {selectedBases.length > 0 && (
          <D1PedidosSection
            numerosPedidos={numerosPedidos}
            loadingPedidos={loadingPedidos}
            selectedBases={selectedBases}
            showSuccess={showSuccess}
            showError={showError}
            showInfo={showInfo}
            showLotes={showLotes}
            setShowLotes={setShowLotes}
          />
        )}

        {/* Tabela de Bipagens */}
        {isUploading ? (
          <LoadingState 
            message={
              uploadingGestao ? "Processando Arquivo de Gestão de 1 Mês..." :
              uploadingBipagens ? "Processando Arquivo de Bipagens em Tempo Real..." :
              "Processando arquivo..."
            }
            subtitle={
              uploadingGestao 
                ? "Aguarde enquanto importamos e processamos os dados de Gestão de 1 Mês. Isso pode levar alguns minutos..." 
                : uploadingBipagens
                  ? "Aguarde enquanto processamos os dados de Bipagens em Tempo Real. Isso pode levar alguns segundos..."
                  : "Aguarde enquanto processamos o arquivo..."
            }
            size="medium"
          />
        ) : (loadingBasesBipagens && !isUploading) ? (
          <LoadingState 
            message="Verificando dados..."
            subtitle="Aguarde enquanto verificamos se há dados de bipagens disponíveis."
            size="medium"
          />
        ) : basesBipagens.length === 0 ? (
          <EmptyState
            type="no-filter"
            title="Faça Upload de Bipagens"
            message="Faça upload de um arquivo de Bipagens em Tempo Real para começar a visualizar os dados."
          />
        ) : (
          <div className="d1-bipagens-section">
            <D1BipagensHeader
              d1ContentRef={d1ContentRef}
              loadingBasesBipagens={loadingBasesBipagens}
              deletingBipagens={deletingBipagens}
              selectedBasesBipagens={selectedBasesBipagens}
              selectedTemposParados={selectedTemposParados}
              motoristasData={motoristasData}
              filteredMotoristasData={filteredMotoristasData}
              searchText={searchText}
              setSearchText={setSearchText}
              limparCache={limparCache}
              carregarBasesETempos={carregarBasesETempos}
              carregarMotoristas={carregarMotoristas}
              showSuccess={showSuccess}
              showError={showError}
              api={api}
              setSelectedBasesBipagens={setSelectedBasesBipagens}
              onDeleteClick={() => setShowDeleteModal(true)}
              loadingPedidosBipagens={loadingPedidosBipagens}
              buscarPedidosBipagens={buscarPedidosBipagens}
              showLotesDropdown={showLotesDropdown}
              numerosPedidosBipagens={numerosPedidosBipagens}
              setShowLotesDropdown={setShowLotesDropdown}
              saveBasesEnabled={saveBasesEnabled}
              setSaveBasesEnabled={setSaveBasesEnabled}
              saveTemposEnabled={saveTemposEnabled}
              setSaveTemposEnabled={setSaveTemposEnabled}
              setSelectedTemposParados={setSelectedTemposParados}
              cidadesData={cidadesData}
              loadingCidades={loadingCidades}
              selectedCidades={selectedCidades}
              setSelectedCidades={setSelectedCidades}
              basesBipagens={basesBipagens}
              temposParados={temposParados}
            />

            <div className="d1-bipagens-content">
              {selectedBasesBipagens.length === 0 ? (
                <EmptyState
                  type="no-filter"
                  title="Selecione as Bases"
                  message="Selecione uma ou mais bases nos filtros acima para visualizar os motoristas e seus pedidos retidos."
                />
              ) : (loadingMotoristas && !isUploading) ? (
                <LoadingState 
                  message="Carregando motoristas..."
                  subtitle="Aguarde enquanto buscamos os dados dos motoristas."
                  size="medium"
                />
              ) : motoristasData.length > 0 ? (
                <Table
                  data={transformMotoristasData(filteredMotoristasData.length > 0 ? filteredMotoristasData : motoristasData)}
                  columns={MOTORISTAS_COLUMNS}
                  emptyMessage="Nenhum motorista encontrado"
                  renderCellContent={renderCellContent}
                />
              ) : (
                <EmptyState
                  type="no-search"
                  title="Nenhum Motorista Encontrado"
                  message="Não encontramos motoristas para os filtros selecionados. Tente ajustar as bases ou tempos de pedido parado."
                />
              )}
            </div>
          </div>
        )}

        {/* Overlay de Pedidos do Motorista */}
        <TableOverlay
          isOpen={!!overlayMotorista}
          onClose={() => {
            fecharOverlay()
            resetTelefone()
          }}
          title={`Pedidos de ${overlayMotorista || ''}`}
          subtitle={`Total de ${pedidosMotorista.length} pedidos${baseMotorista ? ` | Base: ${baseMotorista}` : ''}`}
          data={transformPedidosMotoristaData(pedidosMotorista)}
          columns={PEDIDOS_MOTORISTA_COLUMNS}
          emptyMessage={loadingPedidosMotorista ? 'Carregando pedidos...' : 'Nenhum pedido encontrado.'}
          isLoading={loadingPedidosMotorista}
          filterColumns={false}
          motorista={overlayMotorista || ''}
          baseName={baseMotorista}
          showWhatsApp={showWhatsApp}
          showAddPhone={true}
          telefoneMotorista={telefoneMotorista}
          telefoneCarregado={!!telefoneMotorista}
          onTelefoneAdicionado={handleTelefoneAdicionado}
          onCopyPedido={(row) => handleCopyPedido(row, showSuccess)}
          onCopyAllPedidos={handleCopyAllPedidos}
          onCopyFormattedData={true}
          overlayType=""
          totalPedidos={pedidosMotorista.length}
        />
      </div>

      {/* Modal de confirmação para deletar bipagens */}
      <Suspense fallback={null}>
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDeleteBipagens}
          title="⚠️ Deletar TODOS os Dados de Bipagens?"
          message="Esta ação irá deletar TODOS os dados da coleção d1_bipagens."
          warningMessage="⚠️ ATENÇÃO: Esta ação não pode ser desfeita! Todos os dados de bipagens em tempo real serão permanentemente deletados."
          confirmText="Sim, Deletar Tudo"
          cancelText="Cancelar"
          type="danger"
          loading={deletingBipagens}
        />
        
        {/* Modal de confirmação para deletar D1 (Gestão de 1 Mês) */}
        <ConfirmModal
          isOpen={showDeleteD1Modal}
          onClose={() => setShowDeleteD1Modal(false)}
          onConfirm={handleConfirmDeleteD1}
          title="⚠️ Deletar TODOS os Dados de Gestão de 1 Mês?"
          message="Esta ação irá deletar TODOS os dados das coleções d1_main e d1_chunks."
          warningMessage="⚠️ ATENÇÃO: Esta ação não pode ser desfeita! Todos os dados de Gestão de 1 Mês serão permanentemente deletados."
          confirmText="Sim, Deletar Tudo"
          cancelText="Cancelar"
          type="danger"
          loading={deletingD1}
        />
      </Suspense>

      {/* Modal de Mensagem Personalizada */}
      <CustomMessageModal
        isOpen={showCustomMessageModal}
        onClose={() => setShowCustomMessageModal(false)}
        motorista={customMessageMotorista}
        quantidade={customMessageQuantidade}
        baseName={baseMotorista}
        phoneNumber={customMessageTelefone}
        onSend={(message) => {
          showSuccess('Mensagem personalizada salva com sucesso!')
        }}
      />

      {/* Modal de Observação */}
      <Suspense fallback={null}>
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
      <D1UploadProgress />
    </div>
  )
}

const D1 = () => {
  return (
    <D1LoadingProvider>
      <D1Content />
    </D1LoadingProvider>
  )
}

export default D1

