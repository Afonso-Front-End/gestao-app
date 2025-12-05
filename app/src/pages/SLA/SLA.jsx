import React, { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react'
import { IoAnalytics, IoSaveOutline } from 'react-icons/io5'
import SLAHeader from './components/SLAHeader'
import SLATableBackend from './components/SLATableBackend/SLATableBackend'
import ScreenshotButton from './components/ScreenshotButton/ScreenshotButton'
import CustomMessageModal from './components/CustomMessageModal/CustomMessageModal'
import useSLACalculator from './hooks/useSLACalculator'
import useBaseCitiesBackend from './hooks/useBaseCitiesBackend'
import { RefreshProvider, useRefresh } from './contexts/RefreshContext'
import { SLALoadingProvider } from './contexts/LoadingContext'
import { useNotification } from '../../contexts/NotificationContext'
import { useUpload } from '../../contexts/UploadContext'
import { useConfig } from '../../contexts/ConfigContext'
import EmptyState from '../../components/EmptyState/EmptyState'
import LoadingState from '../../components/LoadingState/LoadingState'
import SLAUploadProgress from './components/UploadProgress/UploadProgress'
import api from '../../services/api'
import './SLA.css'
import './components/SLATableBackend/SLATableBackend.css'

const ConfirmModal = lazy(() => import('../../components/ConfirmModal/ConfirmModal'))
const SnapshotConfirmModal = lazy(() => import('./components/SnapshotConfirmModal/SnapshotConfirmModal'))

const SLA = () => {
  return (
    <SLALoadingProvider>
      <RefreshProvider>
        <SLAContent />
      </RefreshProvider>
    </SLALoadingProvider>
  )
}

const SLAContent = () => {
  const { showSuccess, showError, showInfo } = useNotification()
  const upload = useUpload()
  const { activeUploads } = upload
  const { triggerRefresh, refreshTrigger } = useRefresh()
  const { registerSlaConfig, unregisterSlaConfig } = useConfig()
  
  // Verificar se há uploads ativos APENAS desta página (não de outras páginas)
  // Filtrar apenas uploads relevantes para SLA
  const relevantUploads = activeUploads.filter(upload => 
    upload.type === 'sla' || upload.type === 'sla-galpao'
  )
  const uploadingSLA = relevantUploads.some(upload => upload.type === 'sla')
  const uploadingGalpao = relevantUploads.some(upload => upload.type === 'sla-galpao')
  const isUploading = uploadingSLA || uploadingGalpao
  
  const [lastUpdate, setLastUpdate] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedBases, setSelectedBases] = useState(() => {
    // Carregar bases selecionadas do localStorage
    const savedBases = localStorage.getItem('sla-selected-bases')
    return savedBases ? JSON.parse(savedBases) : []
  })
  
  // Buscar último upload do servidor
  useEffect(() => {
    const fetchLastUpload = async () => {
      try {
        const response = await api.get('/sla/global-stats')
        if (response.data?.data?.last_processed) {
          setLastUpdate(new Date(response.data.data.last_processed))
        }
      } catch (error) {
        // Erro silencioso ao buscar último upload
      }
    }
    
    fetchLastUpload()
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchLastUpload, 30000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Atualizar horário atual a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  // Estados para o sistema de visualização SLA
  const [selectedProcessedBase, setSelectedProcessedBase] = useState(null)
  const [selectedCities, setSelectedCities] = useState([])
  const [showCustomMessageModal, setShowCustomMessageModal] = useState(false)
  const [customMessageMotorista, setCustomMessageMotorista] = useState('')
  const [customMessageQuantidade, setCustomMessageQuantidade] = useState(0)
  const [customMessageTelefone, setCustomMessageTelefone] = useState('')
  const [showStatusColumn, setShowStatusColumn] = useState(() => {
    const saved = localStorage.getItem('sla-show-status-column')
    return saved !== null ? saved === 'true' : true // Por padrão, mostrar a coluna
  })

  // Estados para modal de confirmação
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  // Hook para buscar cidades do backend
  const { cities: availableCities, loading: citiesLoading, error: citiesError } = useBaseCitiesBackend(selectedProcessedBase)

  // Hook para calcular SLA no backend
  const { slaData, loading: slaLoading, error: slaError } = useSLACalculator(selectedProcessedBase, selectedCities)
  
  // Ref para screenshot
  const tableHeaderRef = useRef(null)
  
  // Extrair totais dos dados SLA
  const totais = slaData?.totais || {
    totalMotoristas: 0,
    totalPedidos: 0,
    entregues: 0,
    naoEntregues: 0,
    taxaEntrega: 0,
    slaMedio: 0,
    motoristasExcelentes: 0
  }
  
  // Função para determinar classe de performance
  const getPerformanceClass = (percentage) => {
    if (percentage >= 80) return 'excellent'
    if (percentage >= 60) return 'good'
    if (percentage >= 40) return 'average'
    return 'poor'
  }
  
  // Verificar se há dados para exibir
  const hasData = selectedProcessedBase && slaData && (
    (Array.isArray(slaData) && slaData.length > 0) ||
    (typeof slaData === 'object' && Object.keys(slaData).length > 0)
  )


  const handleImportSuccess = (result) => {
    // Atualizar todos os selects após upload bem-sucedido
    triggerRefresh()
    
    // Buscar último upload do servidor após upload bem-sucedido
    setTimeout(async () => {
      try {
        const response = await api.get('/sla/global-stats')
        if (response.data?.data?.last_processed) {
          setLastUpdate(new Date(response.data.data.last_processed))
        }
      } catch (error) {
        // Erro silencioso ao buscar último upload
      }
    }, 2000) // Aguardar 2 segundos para o servidor processar
  }

  const handleImportError = (error) => {
    // Erro tratado pelo componente
  }

  const handleBasesChange = (bases) => {
    setSelectedBases(bases)
    // Salvar no localStorage
    localStorage.setItem('sla-selected-bases', JSON.stringify(bases))
  }

  const handleProcessedBaseChange = (baseName) => {
    setSelectedProcessedBase(baseName)
    setSelectedCities([]) // Limpar seleção de cidades
  }

  const handleCitiesChange = (cities) => {
    setSelectedCities(cities)
  }

  // Handler para confirmar exclusão de dados SLA
  const handleConfirmClearData = async () => {
    setIsClearing(true)
    try {
      const response = await api.delete('/sla/bases/data/clear-all')
      const result = response.data

      showSuccess(
        `✅ Dados limpos com sucesso!\n\n` +
        `📊 Registros removidos:\n` +
        `• Bases SLA: ${result.deleted_counts?.sla_bases?.toLocaleString('pt-BR') || 0}\n` +
        `• Arquivos SLA: ${result.deleted_counts?.sla_files?.toLocaleString('pt-BR') || 0}\n` +
        `• Chunks SLA: ${result.deleted_counts?.sla_chunks?.toLocaleString('pt-BR') || 0}\n` +
        `• Entradas Galpão: ${result.deleted_counts?.galpao_entradas?.toLocaleString('pt-BR') || 0}\n` +
        `• Pedidos no Galpão: ${result.deleted_counts?.pedidos_no_galpao?.toLocaleString('pt-BR') || 0}\n` +
        `• Total: ${result.deleted_counts?.total?.toLocaleString('pt-BR') || 0}`
      )
      
      setShowDeleteModal(false)
      
      // Atualizar selects e tabela primeiro para refletir que não há mais dados
      triggerRefresh()
      
      // Limpar dados da página após atualizar
      setTimeout(() => {
        setSelectedProcessedBase(null)
        setSelectedCities([])
        setSelectedBases([])
        setLastUpdate(null)
      }, 500) // Aguardar um pouco para o refresh processar
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Erro desconhecido'
      showError(`❌ Erro ao limpar dados: ${errorMessage}`)
    } finally {
      setIsClearing(false)
    }
  }

  // Estado para salvar snapshot
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false)
  const [showSnapshotConfirmModal, setShowSnapshotConfirmModal] = useState(false)

  // Handler para abrir modal de confirmação
  const handleOpenSnapshotConfirm = useCallback(() => {
    setShowSnapshotConfirmModal(true)
  }, [])

  // Handler para salvar snapshot
  const handleSaveSnapshot = useCallback(async (customDate = null) => {
    if (isSavingSnapshot) {
      return
    }

    setIsSavingSnapshot(true)
    setShowSnapshotConfirmModal(false)

    try {
      showInfo('⏳ Criando snapshot dos dados...')

      // Preparar payload com base e cidades se selecionadas
      const payload = {
        module: 'sla',
        period_type: 'manual'
      }

      // Se há base selecionada, adicionar ao payload
      if (selectedProcessedBase) {
        payload.base = selectedProcessedBase
        
        // Se há cidades selecionadas, adicionar ao payload
        if (selectedCities && selectedCities.length > 0) {
          payload.cities = selectedCities
        }
      }

      // Adicionar data customizada se fornecida
      if (customDate) {
        payload.custom_date = customDate
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
      showError('Erro ao salvar snapshot. Tente novamente.')
    } finally {
      setIsSavingSnapshot(false)
    }
  }, [isSavingSnapshot, selectedProcessedBase, selectedCities, showInfo, showSuccess, showError])

  // Handler para gerar relatório Excel
  const handleGerarRelatorio = useCallback(async () => {
    if (!selectedProcessedBase) {
      showError('Selecione uma base para gerar o relatório')
      return
    }
    
    try {
      const cidadesParam = selectedCities.length > 0 ? selectedCities.join(',') : ''
      
      let url = `/sla/gerar-relatorio-contato?base=${encodeURIComponent(selectedProcessedBase)}`
      if (cidadesParam) {
        url += `&cidade=${encodeURIComponent(cidadesParam)}`
      }
      
      showInfo('Gerando relatório Excel...')
      
      const response = await api.get(url, {
        responseType: 'blob'
      })
      
      // Obter o nome do arquivo do header ou gerar um
      const contentDisposition = response.headers['content-disposition']
      let filename = 'Relatorio_Contato_SLA.xlsx'
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '')
        }
      }
      
      // Fazer download do arquivo
      const blob = response.data
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      
      showSuccess(`✅ Relatório Excel gerado e baixado com sucesso!\n\nArquivo: ${filename}`)
    } catch (error) {
      showError(`Erro ao gerar relatório: ${error.message}`)
    }
  }, [selectedProcessedBase, selectedCities, showSuccess, showError, showInfo])

  // Registrar configurações da SLA no contexto global (depois de todas as definições)
  useEffect(() => {
    const totalPedidos = slaData?.totais?.totalPedidos || 0
    
    registerSlaConfig({
      selectedBases,
      onBasesChange: handleBasesChange,
      selectedProcessedBase,
      onImportSuccess: handleImportSuccess,
      onImportError: handleImportError,
      onClearDataClick: () => setShowDeleteModal(true),
      onOpenCustomMessage: () => {
        setCustomMessageMotorista('')
        setCustomMessageQuantidade(totalPedidos)
        setCustomMessageTelefone('')
        setShowCustomMessageModal(true)
      },
      triggerRefresh,
      refreshTrigger // Passar o refreshTrigger atual
    })
    
    return () => {
      unregisterSlaConfig()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedBases,
    selectedProcessedBase,
    slaData?.totais?.totalPedidos,
    refreshTrigger, // Incluir refreshTrigger para atualizar quando necessário
    // registerSlaConfig e unregisterSlaConfig são memoizados com useCallback
    // triggerRefresh é estável do contexto
    // Não incluir as funções handle* para evitar loops - elas são estáveis
  ])

  return (
    <div className="sla-page">
        <div className="sla-header-container">
          <div className="sla-header-content">
            <SLAHeader
              selectedProcessedBase={selectedProcessedBase}
              onProcessedBaseChange={handleProcessedBaseChange}
              selectedCities={selectedCities}
              onCitiesChange={handleCitiesChange}
              availableCities={availableCities}
              citiesLoading={citiesLoading}
              citiesError={citiesError}
              showStatusColumn={showStatusColumn}
              onToggleStatusColumn={() => {
                const newValue = !showStatusColumn
                setShowStatusColumn(newValue)
                localStorage.setItem('sla-show-status-column', String(newValue))
              }}
            />
          </div>
        </div>

        <div className="sla-content">
          <div className="sla-viewer-section">
            {(uploadingSLA || (slaLoading && !isUploading)) ? (
              <LoadingState 
                message={
                  uploadingSLA ? "Processando Arquivo SLA..." :
                  "Carregando dados SLA..."
                }
                subtitle={
                  uploadingSLA 
                    ? "Aguarde enquanto importamos e processamos os dados SLA." 
                    : "Aguarde enquanto buscamos os dados..."
                }
                size="medium"
              />
            ) : selectedProcessedBase && hasData ? (
              <div className="sla-info-section">
                {slaError ? (
                  <div className="error">Erro ao calcular SLA: {slaError}</div>
                ) : (
                  <div ref={tableHeaderRef} className="sla-table-wrapper-container">
                    <div className="sla-table-header">
                      <div className="sla-header-top">
                        <h2>Motoristas da Base: {selectedProcessedBase}</h2>
                        <div className="sla-sort-selector">
                          {handleGerarRelatorio && (
                            <button
                              onClick={handleGerarRelatorio}
                              className="btn-gerar-relatorio"
                              title="Gerar e baixar relatório Excel com dados de contato"
                            >
                              <span>📊</span>
                              <span>Gerar Relatório Excel</span>
                            </button>
                          )}
                          <ScreenshotButton
                            targetRef={tableHeaderRef}
                            filename={`relatorio-sla-${selectedProcessedBase}`}
                            onSuccess={(message) => showSuccess(message)}
                            onError={(error) => showError(error)}
                            title="Capturar Screenshot da Tabela SLA"
                            size="medium"
                          />
                          {handleOpenSnapshotConfirm && (
                            <button
                              onClick={handleOpenSnapshotConfirm}
                              className="btn-save-snapshot"
                              disabled={isSavingSnapshot || !slaData?.motoristas || slaData.motoristas.length === 0}
                              title="Salvar snapshot dos dados atuais para relatórios"
                            >
                              <IoSaveOutline size={20} className={isSavingSnapshot ? 'spinning' : ''} />
                            </button>
                          )}
                        </div>
                      </div>
                      {selectedCities.length === 1 && <p className="sla-cidade-info">Cidade selecionada: {selectedCities[0]}</p>}
                      <div className="sla-performance-info">
                        <span className="sla-motoristas-count">{totais.totalMotoristas} motorista(s) encontrado(s)</span>
                        <span className="sla-total-pedidos">Total de Pedidos: {totais.totalPedidos}</span>
                        <span className={`sla-performance-geral ${getPerformanceClass(totais.taxaEntrega)}`}>
                          <div className="sla-performance-content">
                            <p className="sla-performance-text">Performance Geral: {totais.taxaEntrega}%</p>
                            <div className="sla-performance-bar">
                              <div 
                                className="sla-performance-fill" 
                                style={{ width: `${Math.min(totais.taxaEntrega, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </span>
                        <span className="sla-upload-time">
                          {lastUpdate ? (
                            <>
                              Último Upload: {lastUpdate.toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </>
                          ) : (
                            'Último Upload: Nenhum upload realizado'
                          )}
                        </span>
                        <span className="sla-current-time">
                          Horário Atual: {currentTime.toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <SLATableBackend
                      slaData={slaData}
                      baseName={selectedProcessedBase}
                      cidade={selectedCities.length === 1 ? selectedCities[0] : null}
                      selectedCities={selectedCities}
                      isLoading={false}
                      showStatusColumn={showStatusColumn}
                    />
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                type="no-upload"
                title="Nenhum Dado SLA para Exibir"
                message={
                  !selectedProcessedBase 
                    ? "Selecione uma base processada para visualizar os dados SLA."
                    : "Nenhum dado encontrado para esta base. Faça o upload dos arquivos SLA e do galpão para visualizar os dados."
                }
                icon={<IoAnalytics size={64} />}
              />
            )}
          </div>
        </div>

        {/* Modal de Mensagem Personalizada */}
        <CustomMessageModal
          isOpen={showCustomMessageModal}
          onClose={() => setShowCustomMessageModal(false)}
          motorista={customMessageMotorista}
          quantidade={customMessageQuantidade}
          baseName={selectedProcessedBase}
          phoneNumber={customMessageTelefone}
          onSend={(message) => {
            showSuccess('Mensagem enviada com sucesso!')
          }}
        />

        {/* Modal de confirmação para salvar snapshot */}
        <Suspense fallback={null}>
          <SnapshotConfirmModal
            isOpen={showSnapshotConfirmModal}
            onClose={() => setShowSnapshotConfirmModal(false)}
            onConfirm={handleSaveSnapshot}
            selectedProcessedBase={selectedProcessedBase}
            selectedCities={selectedCities}
            loading={isSavingSnapshot}
          />
        </Suspense>

        {/* Modal de confirmação para deletar dados SLA */}
        <Suspense fallback={null}>
          <ConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmClearData}
            title="⚠️ Deletar TODOS os Dados SLA?"
            message="Esta ação irá deletar TODOS os dados das coleções SLA, incluindo bases, entradas do galpão, arquivos processados e chunks."
            warningMessage="⚠️ ATENÇÃO: Esta ação não pode ser desfeita! Todos os dados SLA serão permanentemente deletados."
            confirmText="Sim, Deletar Tudo"
            cancelText="Cancelar"
            type="danger"
            loading={isClearing}
          />
        </Suspense>

        {/* UploadProgress local para esta página */}
        <SLAUploadProgress />
      </div>
  )
}

export default SLA
