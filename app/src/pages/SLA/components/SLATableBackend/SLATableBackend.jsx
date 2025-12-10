import React, { useState, useRef, useEffect, useCallback } from 'react'
import TableOverlay from '../TableOverlay/TableOverlay'
import ScreenshotButton from '../ScreenshotButton/ScreenshotButton'
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton'
import CopyFormattedButton from '../CopyFormattedButton/CopyFormattedButton'
import StatusMarkers from '../StatusMarkers/StatusMarkers'
import ObservacaoModal from '../ObservacaoModal/ObservacaoModal'
import { useNotification } from '../../../../contexts/NotificationContext'
import useApiCache from '../../../../hooks/useApiCache'
import useMotoristaStatusSLA from '../../hooks/useMotoristaStatusSLA'
import { buildApiUrl } from '../../../../utils/api-utils'
import { getApiHeaders } from '../../../../utils/api-headers'
import './SLATableBackend.css'

const SLATableBackend = ({ slaData, baseName, cidade, selectedCities = [], isLoading = false, showStatusColumn = true }) => {
  // ==================== STATES ====================
  const [showOverlay, setShowOverlay] = useState(false)
  const [loadingOverlay, setLoadingOverlay] = useState(false)
  const { showSuccess, showError, showInfo } = useNotification()
  const [overlayData, setOverlayData] = useState([])
  const [overlayTitle, setOverlayTitle] = useState('')
  const [overlayType, setOverlayType] = useState('') // 'all', 'entregues', 'nao_entregues'
  const [sortBy, setSortBy] = useState(() => {
    const savedSort = localStorage.getItem('sla-sort-by')
    return savedSort || 'sla'
  })
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [motoristasTotaisReais, setMotoristasTotaisReais] = useState({})
  const [motoristaTelefone, setMotoristaTelefone] = useState('')
  const [telefoneCarregado, setTelefoneCarregado] = useState(false)
  const [observacaoModal, setObservacaoModal] = useState({
    isOpen: false,
    statusKey: '',
    motorista: '',
    base: '',
    status: '',
    observacao: ''
  })
  const tableRef = useRef(null)
  
  // Cache para totais de motoristas (TTL de 5 minutos)
  const cache = useApiCache(5 * 60 * 1000)

  // Hook para gerenciar status dos motoristas
  const {
    motoristasStatus,
    atualizarStatus,
    observacoes,
    salvarObservacao
  } = useMotoristaStatusSLA(slaData?.motoristas || [], baseName)


  // ==================== EFFECTS ====================
  useEffect(() => {
    const savedSort = localStorage.getItem('sla-sort-by')
    if (savedSort && savedSort !== sortBy) {
      setSortBy(savedSort)
    }
  }, [])

  // Buscar totais reais de todos os motoristas (sem filtro de cidade)
  // Versão otimizada com cache e batch de requisições
  useEffect(() => {
    const fetchTotaisReais = async () => {
      if (!slaData?.motoristas) return

      const motoristasSemCache = []
      const motoristasComCache = {}

      // 1. Verificar cache para cada motorista
      slaData.motoristas.forEach(motorista => {
        const url = buildApiUrl(`sla/calculator/pedidos/${encodeURIComponent(baseName)}?motorista=${encodeURIComponent(motorista.motorista)}`)
        const cached = cache.get(url, {})
        
        if (cached !== null && Array.isArray(cached)) {
          motoristasComCache[motorista.motorista] = cached.length
        } else {
          motoristasSemCache.push(motorista.motorista)
        }
      })

      // Preencher com dados do cache primeiro (UI instantânea)
      setMotoristasTotaisReais(motoristasComCache)

      // 2. Buscar apenas os que não estão em cache
      if (motoristasSemCache.length === 0) return

      // 3. Limitar requisições simultâneas (batch de 5)
      const BATCH_SIZE = 5
      for (let i = 0; i < motoristasSemCache.length; i += BATCH_SIZE) {
        const batch = motoristasSemCache.slice(i, i + BATCH_SIZE)
        
        const promises = batch.map(async (motorista) => {
          try {
            const url = buildApiUrl(`sla/calculator/pedidos/${encodeURIComponent(baseName)}?motorista=${encodeURIComponent(motorista)}`)
            const response = await fetch(url, {
              headers: getApiHeaders()
            })

            if (response.ok) {
              const result = await response.json()
              const total = result.data?.length || 0
              
              // Armazenar no cache
              cache.set(url, {}, result.data || [])
              
              return { motorista, total }
            } else {
              // Se a resposta não for ok (ex: 429), usar valor padrão
              const motoristaObj = slaData.motoristas.find(m => m.motorista === motorista)
              return { 
                motorista, 
                total: motoristaObj?.total || 0 
              }
            }
          } catch (error) {
            // Em caso de erro, usar valor padrão
            const motoristaObj = slaData.motoristas.find(m => m.motorista === motorista)
            return { 
              motorista, 
              total: motoristaObj?.total || 0 
            }
          }
        })

        const results = await Promise.all(promises)
        
        // Atualizar estado incrementalmente
        // Filtrar resultados undefined e garantir que tenham as propriedades esperadas
        setMotoristasTotaisReais(prev => {
          const updated = { ...prev }
          results
            .filter(result => result && result.motorista && typeof result.total !== 'undefined')
            .forEach(({ motorista, total }) => {
              updated[motorista] = total
            })
          return updated
        })
      }
    }

    fetchTotaisReais()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slaData, baseName])

  // ==================== UTILITY FUNCTIONS ====================
  const getSLAStatus = (slaValue) => {
    if (slaValue >= 90) return 'EXCELENTE'
    if (slaValue >= 80) return 'BOM'
    if (slaValue >= 50) return 'MÉDIO'
    return 'BAIXO'
  }

  const getSLAClass = (slaValue) => {
    const status = getSLAStatus(slaValue)
    return status.toLowerCase().replace('é', 'e')
  }

  const getParticipationClass = (participation) => {
    if (participation >= 15) return 'high'
    if (participation >= 8) return 'medium'
    return 'low'
  }

  const sortMotoristas = (motoristas) => {
    return [...motoristas].sort((a, b) => {
      switch (sortBy) {
        case 'sla':
          return b.sla - a.sla // Maior SLA primeiro
        case 'participacao':
          return b.participacao - a.participacao // Maior participação primeiro
        case 'entregues':
          return b.entregues - a.entregues // Mais entregues primeiro
        case 'total':
          return b.total - a.total // Mais pedidos primeiro
        case 'nome':
          return a.motorista.localeCompare(b.motorista) // Ordem alfabética
        default:
          return b.sla - a.sla
      }
    })
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setShowSortDropdown(false)
    localStorage.setItem('sla-sort-by', newSort)
  }

  // ==================== COPY FUNCTIONS ====================
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // Mostrar feedback visual (opcional)
    } catch (err) {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
  }

  // Função para buscar telefone do motorista
  const buscarTelefoneMotorista = async (motorista) => {
    try {
      const response = await fetch(`/api/lista-telefones/motorista/${encodeURIComponent(motorista)}?base_name=${encodeURIComponent(baseName)}`, {
        headers: getApiHeaders()
      })
      const data = await response.json()

      if (data.success && data.tem_telefone && data.match_exato) {
        setMotoristaTelefone(data.telefone)
        setTelefoneCarregado(true)
        return data.telefone
      } else {
        setMotoristaTelefone('')
        setTelefoneCarregado(true)
        return null
      }
    } catch (error) {
      setTelefoneCarregado(true)
      return null
    }
  }

  // Função para quando telefone for adicionado
  const handleTelefoneAdicionado = (novoTelefone) => {
    setMotoristaTelefone(novoTelefone)
    setTelefoneCarregado(true)
  }

  const handleCopyAllPedidos = async () => {
    try {
      // Copiar apenas os pedidos da tabela aberta (overlayData)
      const numerosPedidos = overlayData.map(pedido => pedido['Número de pedido JMS']).filter(Boolean)
      const textoParaCopiar = numerosPedidos.join('\n')

      await copyToClipboard(textoParaCopiar)
      showSuccess(`Copiados ${numerosPedidos.length} números de pedidos desta tabela!`)
    } catch (error) {
      showError('Erro ao copiar pedidos da tabela: ' + error.message)
    }
  }


  // ==================== API HANDLERS ====================
  const handleVerPedidos = async (motorista) => {
    try {
      setShowOverlay(true)
      setLoadingOverlay(true)
      setOverlayTitle(`Total de Pedidos - ${motorista}`)
      setOverlayType('all')
      setOverlayData([])

      // Aguardar animação do overlay antes de buscar dados
      await new Promise(resolve => setTimeout(resolve, 600))

      // Sempre buscar TODOS os pedidos do motorista, sem filtro de cidade
      const url = buildApiUrl(`sla/calculator/pedidos/${encodeURIComponent(baseName)}?motorista=${encodeURIComponent(motorista)}`)
      const response = await fetch(url, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      const totalPedidos = result.data?.length || 0
      const cidadesUnicas = [...new Set(result.data?.map(pedido => pedido['Cidade Destino']).filter(Boolean))] || []
      const totalCidades = cidadesUnicas.length

      setOverlayData(result.data || [])
      setOverlayTitle(`Total de Pedidos - ${motorista} (${totalPedidos} pedidos, ${totalCidades} cidades)`)
      setLoadingOverlay(false)

    } catch (error) {
      showError('Erro ao buscar todos os pedidos: ' + error.message)
      setLoadingOverlay(false)
    }
  }

  const handleClickEntregues = async (motorista) => {
    try {
      setShowOverlay(true)
      setLoadingOverlay(true)
      setOverlayTitle(`Pedidos Entregues - ${motorista}`)
      setOverlayType('entregues')
      setOverlayData([])

      // Aguardar animação do overlay antes de buscar dados
      await new Promise(resolve => setTimeout(resolve, 600))

      // Construir URL com filtro de cidades se aplicável
      let url = buildApiUrl(`sla/calculator/pedidos/${encodeURIComponent(baseName)}?motorista=${encodeURIComponent(motorista)}&status=entregues`)

      // Usar selectedCities se disponível (múltiplas cidades), senão usar cidade única
      const cidadesParaFiltrar = (selectedCities && selectedCities.length > 0) ? selectedCities : (cidade ? [cidade] : [])
      
      if (cidadesParaFiltrar.length > 0) {
        // Construir query string manualmente para evitar erro com URL relativa
        const queryParams = cidadesParaFiltrar.map(cidadeItem => `cidades=${encodeURIComponent(cidadeItem)}`).join('&')
        url = `${url}&${queryParams}`
      }

      const response = await fetch(url, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const totalPedidos = result.data?.length || 0
      const cidadesUnicas = [...new Set(result.data?.map(pedido => pedido['Cidade Destino']).filter(Boolean))] || []
      const totalCidades = cidadesUnicas.length

      setOverlayData(result.data || [])
      setOverlayTitle(`Pedidos Entregues - ${motorista} (${totalPedidos} pedidos, ${totalCidades} cidades)`)
      setLoadingOverlay(false)

    } catch (error) {
      showError('Erro ao buscar pedidos entregues: ' + error.message)
      setLoadingOverlay(false)
    }
  }

  const handleClickNaoEntregues = async (motorista) => {
    try {
      // Resetar estados do telefone
      setTelefoneCarregado(false)
      setMotoristaTelefone('')

      setShowOverlay(true)
      setLoadingOverlay(true)
      setOverlayTitle(`Pedidos Não Entregues - ${motorista}`)
      setOverlayType('nao_entregues')
      setOverlayData([])

      // Aguardar animação do overlay antes de buscar dados
      await new Promise(resolve => setTimeout(resolve, 600))

      // Construir URL com filtro de cidades se aplicável
      let url = buildApiUrl(`sla/calculator/pedidos/${encodeURIComponent(baseName)}?motorista=${encodeURIComponent(motorista)}&status=nao_entregues`)

      // Usar selectedCities se disponível (múltiplas cidades), senão usar cidade única
      const cidadesParaFiltrar = (selectedCities && selectedCities.length > 0) ? selectedCities : (cidade ? [cidade] : [])
      
      if (cidadesParaFiltrar.length > 0) {
        // Construir query string manualmente para evitar erro com URL relativa
        const queryParams = cidadesParaFiltrar.map(cidadeItem => `cidades=${encodeURIComponent(cidadeItem)}`).join('&')
        url = `${url}&${queryParams}`
      }

      const response = await fetch(url, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const totalPedidos = result.data?.length || 0
      const cidadesUnicas = [...new Set(result.data?.map(pedido => pedido['Cidade Destino']).filter(Boolean))] || []
      const totalCidades = cidadesUnicas.length

      setOverlayData(result.data || [])
      setOverlayTitle(`Pedidos Não Entregues - ${motorista} (${totalPedidos} pedidos, ${totalCidades} cidades)`)
      setLoadingOverlay(false)

      // Buscar telefone do motorista
      await buscarTelefoneMotorista(motorista)

    } catch (error) {
      showError('Erro ao buscar pedidos não entregues: ' + error.message)
      setLoadingOverlay(false)
    }
  }

  const handleClickGalpao = async (motorista) => {
    try {
      setShowOverlay(true)
      setLoadingOverlay(true)
      setOverlayTitle(`Pedidos no Galpão - ${motorista}`)
      setOverlayType('galpao')
      setOverlayData([])

      // Aguardar animação do overlay antes de buscar dados
      await new Promise(resolve => setTimeout(resolve, 600))

      const url = buildApiUrl(`sla/pedidos-galpao/${encodeURIComponent(baseName)}/motorista/${encodeURIComponent(motorista)}`)
      const response = await fetch(url, {
        headers: getApiHeaders()
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      const totalPedidos = result.pedidos?.length || 0
      const cidadesUnicas = [...new Set(result.pedidos?.map(pedido => pedido['Cidade Destino']).filter(Boolean))] || []
      const totalCidades = cidadesUnicas.length

      setOverlayData(result.pedidos || [])
      setOverlayTitle(`Pedidos no Galpão - ${motorista} (${totalPedidos} pedidos, ${totalCidades} cidades)`)
      setLoadingOverlay(false)

    } catch (error) {
      showError('Erro ao buscar pedidos no galpão: ' + error.message)
      setLoadingOverlay(false)
    }
  }

  // Função para copiar número do pedido no overlay
  const handleCopyPedidoOverlay = async (pedido) => {
    try {
      const numeroPedido = pedido['Número de pedido JMS']
      if (numeroPedido) {
        await copyToClipboard(numeroPedido)
        showSuccess(`Número do pedido copiado: ${numeroPedido}`)
      } else {
        showInfo('Número do pedido não encontrado')
      }
    } catch (error) {
      showError('Erro ao copiar número do pedido')
    }
  }

  // Função para copiar dados formatados (agora é um componente separado)
  const handleCopyFormattedData = () => {
    // Esta função agora é apenas um placeholder
    // A lógica real está no componente CopyFormattedButton
  }

  // ==================== RENDER HELPERS ====================
  // Função para determinar a classe de performance baseada na porcentagem
  const getPerformanceClass = (percentage) => {
    if (percentage >= 80) return 'excellent'
    if (percentage >= 60) return 'good'
    if (percentage >= 40) return 'average'
    return 'poor'
  }

  const renderCitiesInfo = (motorista) => {
    if (cidade) {
      return cidade
    }

    if (motorista.todas_cidades && motorista.todas_cidades.length > 0) {
      return `CIDADES ${motorista.todas_cidades.join('/')}`
    }

    if (motorista.cidade) {
      return motorista.cidade
    }

    return 'N/A'
  }

  const renderSortOptions = () => {
    const sortOptions = [
      { value: 'sla', label: 'SLA (Maior → Menor)' },
      { value: 'entregues', label: 'Entregues (Maior → Menor)' },
      { value: 'nome', label: 'Nome (A → Z)' }
    ]

    return sortOptions.map(option => (
      <div
        key={option.value}
        className="sla-sort-option"
        onClick={() => handleSortChange(option.value)}
      >
        {option.label}
      </div>
    ))
  }

  // ==================== DATA EXTRACTION ====================
  const motoristas = slaData?.motoristas || []
  const totais = slaData?.totais || {
    totalMotoristas: 0,
    totalPedidos: 0,
    entregues: 0,
    naoEntregues: 0,
    taxaEntrega: 0,
    slaMedio: 0,
    motoristasExcelentes: 0
  }

  // Handler para abrir modal de observação
  const handleOpenObservacao = useCallback((statusKey, motorista, base, status) => {
    setObservacaoModal({
      isOpen: true,
      statusKey,
      motorista,
      base,
      status,
      observacao: observacoes[statusKey] || ''
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
      await salvarObservacao(statusKey, motorista, base, status, observacao)
      showSuccess(`Observação ${observacao.trim() ? 'salva' : 'removida'} com sucesso!`)
    } catch (error) {
      showError('Erro ao salvar observação. Tente novamente.')
      throw error
    }
  }, [observacaoModal, salvarObservacao, showSuccess, showError])

  const isTableLoading = isLoading || (!slaData || !slaData.motoristas)

  // ==================== MAIN RENDER ====================
  return (
    <div className="sla-table-container" ref={tableRef}>
      <div className="sla-table-wrapper">
        <table className="sla-table">
          <thead>
            <tr>
              <th>Motorista</th>
              <th>Entregues</th>
              <th>Não Entregues</th>
              <th>Entradas no Galpão</th>
              <th>SLA</th>
              <th>Total Real</th>
              {showStatusColumn && <th>Status</th>}
            </tr>
          </thead>
          <tbody>
            {isTableLoading ? (
              <tr>
                <td colSpan={showStatusColumn ? "7" : "6"} className="sla-loading-message">
                  <div className="sla-loading-state">
                    {isLoading ? 'Calculando SLA no servidor...' : 'Carregando dados...'}
                  </div>
                </td>
              </tr>
            ) : motoristas.length === 0 ? (
              <tr>
                <td colSpan={showStatusColumn ? "7" : "6"} className="sla-empty-message">
                  <div className="sla-empty-state">
                    Nenhum motorista encontrado. Selecione uma base e filtros para visualizar os dados.
                  </div>
                </td>
              </tr>
            ) : (
              sortMotoristas(motoristas).map((motorista, index) => (
                <tr key={index}>
                  <td className="sla-motorista-name">
                    <div className="sla-motorista-info">
                      <div 
                        className="sla-motorista-name-text sla-motorista-copyable"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(motorista.motorista)
                            showSuccess(`✅ Nome do motorista "${motorista.motorista}" copiado!`)
                          } catch (error) {
                            showError('Erro ao copiar nome do motorista')
                          }
                        }}
                        title="Clique para copiar o nome do motorista"
                      >
                        {motorista.motorista}
                      </div>
                      <div className="sla-motorista-cities">
                        {renderCitiesInfo(motorista)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="sla-delivered-pill sla-clickable"
                      onClick={() => handleClickEntregues(motorista.motorista)}
                      title="Clique para ver pedidos entregues"
                    >
                      {motorista.entregues}
                    </span>
                  </td>
                  <td>
                    <span
                      className="sla-not-delivered-pill sla-clickable"
                      onClick={() => handleClickNaoEntregues(motorista.motorista)}
                      title="Clique para ver pedidos não entregues"
                    >
                      {motorista.naoEntregues}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`sla-galpao-pill sla-clickable ${motorista.pedidosGalpao > 0 ? 'sla-has-galpao' : 'sla-no-galpao'}`}
                      onClick={() => handleClickGalpao(motorista.motorista)}
                      title={motorista.pedidosGalpao > 0 ? `Clique para ver ${motorista.pedidosGalpao} pedidos no galpão` : 'Nenhum pedido no galpão'}
                    >
                      {motorista.pedidosGalpao || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`sla-pill ${getSLAClass(motorista.percentual_entregues)}`}>
                      {motorista.percentual_entregues}% - {getSLAStatus(motorista.percentual_entregues)}
                    </span>
                  </td>
                  <td>
                    <span
                      className="sla-total-pill sla-clickable"
                      onClick={() => handleVerPedidos(motorista.motorista)}
                      title="Clique para ver todos os pedidos"
                    >
                      {motorista.totalReal || motorista.total}
                    </span>
                  </td>
                  {showStatusColumn && (
                    <td>
                      {baseName && (
                        <StatusMarkers
                          currentStatus={motoristasStatus[`${motorista.motorista}||${baseName}`] || null}
                          onStatusClick={async (newStatus) => {
                            const statusKey = `${motorista.motorista}||${baseName}`
                            const currentStatus = motoristasStatus[statusKey] || null
                            const finalStatus = currentStatus === newStatus ? null : newStatus
                            try {
                              await atualizarStatus(statusKey, motorista.motorista, baseName, finalStatus)
                              showSuccess(`Status ${finalStatus ? 'atualizado' : 'removido'} com sucesso!`)
                            } catch (error) {
                              showError('Erro ao atualizar status. Tente novamente.')
                            }
                          }}
                          onOpenObservacao={handleOpenObservacao}
                          hasObservacao={!!(observacoes[`${motorista.motorista}||${baseName}`] && observacoes[`${motorista.motorista}||${baseName}`].trim() !== '')}
                          statusKey={`${motorista.motorista}||${baseName}`}
                          motorista={motorista.motorista}
                          base={baseName}
                        />
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sla-table-footer">
        <div className="sla-summary-stats">
          <div className="sla-stat-card">
            <span className="sla-stat-label" >Entregues:</span>
            <span className="sla-stat-value delivered">{totais.entregues}</span>
          </div>
          <div className="sla-stat-card">
            <span className="sla-stat-label">Não Entregues:</span>
            <span className="sla-stat-value not-delivered">{totais.naoEntregues}</span>
          </div>
          <div className="sla-stat-card">
            <span className="sla-stat-label">Entrada no Galpão:</span>
            <span className="sla-stat-value galpao">{motoristas.reduce((total, motorista) => total + (motorista.pedidosGalpao || 0), 0)}</span>
          </div>
          <div className="sla-stat-card">
            <span className="sla-stat-label">Taxa de Entrega:</span>
            <span className="sla-stat-value performance">{totais.taxaEntrega}%</span>
          </div>
          <div className="sla-stat-card">
            <span className="sla-stat-label">SLA Médio:</span>
            <span className="sla-stat-value sla">{totais.slaMedio}%</span>
          </div>
          <div className="sla-stat-card">
            <span className="sla-stat-label">Motoristas Excelentes:</span>
            <span className="sla-stat-value excellent">{totais.motoristasExcelentes}</span>
          </div>
        </div>
      </div>

      {showOverlay && (
        <TableOverlay
          isOpen={showOverlay}
          onClose={() => {
            setShowOverlay(false)
            setLoadingOverlay(false)
          }}
          data={overlayData}
          title={overlayTitle}
          subtitle={`Tipo: ${overlayType}`}
          isLoading={loadingOverlay}
          onCopyPedido={handleCopyPedidoOverlay}
          onCopyAllPedidos={handleCopyAllPedidos}
          onCopyFormattedData={handleCopyFormattedData}
          baseName={baseName}
          motorista={overlayTitle.includes(' - ') ? overlayTitle.split(' - ')[1].split(' (')[0] : ''}
          showWhatsApp={overlayType === 'entregues' || overlayType === 'nao_entregues' || overlayType === 'galpao'}
          showAddPhone={overlayType === 'nao_entregues'}
          telefoneMotorista={motoristaTelefone}
          telefoneCarregado={telefoneCarregado}
          telefoneInicial={motoristaTelefone}
          onTelefoneAdicionado={handleTelefoneAdicionado}
          filterColumns={false}
          overlayType={overlayType}
        />
      )}

      {/* Modal de Observação */}
      <ObservacaoModal
        isOpen={observacaoModal.isOpen}
        onClose={handleCloseObservacao}
        onSave={handleSaveObservacao}
        initialValue={observacaoModal.observacao}
        motorista={observacaoModal.motorista}
        status={observacaoModal.status}
      />
    </div>
  )
}

export default SLATableBackend