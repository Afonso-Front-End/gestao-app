import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { useConfig } from '../../contexts/ConfigContext'
import { useSemMovimentacaoSCData } from './hooks/useSemMovimentacaoSCData'
import { useSemMovimentacaoSCFilters } from './hooks/useSemMovimentacaoSCFilters'
import MultiSelect from '../PedidosRetidos/components/MultiSelect'
import Table from '../PedidosRetidos/components/Table/Table'
import LoadingState from '../../components/LoadingState/LoadingState'
import EmptyState from './components/EmptyState/EmptyState'
import DetailsModal from './components/DetailsModal/DetailsModal'
import LotesModal from './components/LotesModal/LotesModal'
import QRCodeModal from './components/QRCodeModal/QRCodeModal'
import MoveRemessaModal from './components/MoveRemessaModal/MoveRemessaModal'
import api from '../../services/api'
import './SemMovimentacaoSC.css'

const ConfirmModal = lazy(() => import('../../components/ConfirmModal/ConfirmModal'))

const SemMovimentacaoSC = () => {
  const { showSuccess, showError } = useNotification()
  const { registerSemMovimentacaoSCConfig, unregisterSemMovimentacaoSCConfig } = useConfig()
  const [isUploading, setIsUploading] = useState(false)
  const [deletingData, setDeletingData] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLotesModal1000, setShowLotesModal1000] = useState(false)
  const [showLotesModal500, setShowLotesModal500] = useState(false)
  const [remessasLotes1000, setRemessasLotes1000] = useState([])
  const [remessasLotes500, setRemessasLotes500] = useState([])
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFiltrosColunasModal, setShowFiltrosColunasModal] = useState(false)
  const [isClosingFiltrosColunas, setIsClosingFiltrosColunas] = useState(false)
  
  // Estados dos filtros
  const [selectedTiposOperacao, setSelectedTiposOperacao] = useState([])
  const [selectedAgings, setSelectedAgings] = useState([])
  
  // Estados dos filtros de colunas (para o modal de filtros)
  const [selectedBaseEntregaFiltro, setSelectedBaseEntregaFiltro] = useState([])
  const [selectedAgingFiltro, setSelectedAgingFiltro] = useState([])
  
  // Estado para linhas selecionadas no modal de filtros de colunas
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [showUnselectConfirmModal, setShowUnselectConfirmModal] = useState(false)
  const [remessaToUnselect, setRemessaToUnselect] = useState(null)
  const [showQRCodeModal, setShowQRCodeModal] = useState(false)
  const [showQRCodeDevolucaoModal, setShowQRCodeDevolucaoModal] = useState(false)
  const [remessasDevolucao, setRemessasDevolucao] = useState([])
  const [loadingDevolucao, setLoadingDevolucao] = useState(false)
  const [showMoveRemessaModal, setShowMoveRemessaModal] = useState(false)
  const [remessaToMove, setRemessaToMove] = useState(null)
  const [movingRemessa, setMovingRemessa] = useState(false)
  
  // Estado de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 1000

  // Buscar opções dos filtros
  const { tiposOperacao, agings, loading: filtersLoading, refetch: refetchFilters } = useSemMovimentacaoSCFilters()

  // Buscar dados baseado nos filtros
  const { data, loading: dataLoading, error, total, refetch } = useSemMovimentacaoSCData(
    selectedTiposOperacao,
    selectedAgings
  )

  // Usar useRef para callbacks estáveis
  const handleImportSuccessRef = React.useRef(null)
  const handleImportErrorRef = React.useRef(null)

  const handleImportSuccess = useCallback((result) => {
    showSuccess('✅ Arquivo importado com sucesso!')
    setIsUploading(false)
    // Recarregar dados e filtros após upload
    refetchFilters()
    refetch()
  }, [showSuccess, refetch, refetchFilters])

  const handleImportError = useCallback((error) => {
    showError(`Erro ao importar arquivo: ${error.message}`)
    setIsUploading(false)
  }, [showError])

  // Handler para confirmar limpeza de dados
  const handleConfirmClearData = useCallback(async () => {
    setDeletingData(true)
    try {
      const response = await api.delete('/sem-movimentacao-sc/clear')
      if (response.data.success) {
        const deleted = response.data.deleted
        showSuccess(
          `✅ Dados limpos com sucesso!\n\n` +
          `Documentos principais removidos: ${deleted.main_documents?.toLocaleString('pt-BR') || 0}\n` +
          `Chunks removidos: ${deleted.chunks?.toLocaleString('pt-BR') || 0}\n` +
          `Total: ${deleted.total?.toLocaleString('pt-BR') || 0} documentos`
        )
        // Recarregar dados e filtros após limpeza
        refetchFilters()
        refetch()
        setShowDeleteModal(false)
      }
    } catch (error) {
      showError(`Erro ao limpar dados: ${error.response?.data?.detail || error.message || 'Erro desconhecido'}`)
    } finally {
      setDeletingData(false)
    }
  }, [showSuccess, showError, refetchFilters, refetch])


  // Atualizar refs quando callbacks mudarem
  React.useEffect(() => {
    handleImportSuccessRef.current = handleImportSuccess
    handleImportErrorRef.current = handleImportError
  }, [handleImportSuccess, handleImportError])

  // Registrar configuração no contexto global
  useEffect(() => {
    const config = {
      uploadEndpoint: '/sem-movimentacao-sc/upload',
      onImportSuccess: (...args) => handleImportSuccessRef.current?.(...args),
      onImportError: (...args) => handleImportErrorRef.current?.(...args),
      onClearDataClick: () => setShowDeleteModal(true),
      deletingData
    }
    
    registerSemMovimentacaoSCConfig(config)

    return () => {
      unregisterSemMovimentacaoSCConfig()
    }
  }, [registerSemMovimentacaoSCConfig, unregisterSemMovimentacaoSCConfig, deletingData])

  // Definir colunas da tabela com headers amigáveis (memoizado)
  const tableColumns = useMemo(() => [
    { key: 'remessa', header: 'Remessa' },
    { key: 'nome_base_mais_recente', header: 'Nome da Base Mais Recente' },
    { key: 'unidade_responsavel', header: 'Unidade Responsável' },
    { key: 'base_entrega', header: 'Base de Entrega' },
    { key: 'horario_ultima_operacao', header: 'Horário da Última Operação' },
    { key: 'tipo_ultima_operacao', header: 'Tipo da Última Operação' },
    { key: 'operador_bipe_mais_recente', header: 'Operador do Bipe Mais Recente' },
    { key: 'aging', header: 'Aging' },
    { key: 'numero_id', header: 'Número do ID' }
  ], [])

  // Agrupar dados por remessa (uma linha por remessa)
  const remessasUnicas = useMemo(() => {
    const remessasMap = new Map()
    
    data.forEach(item => {
      const remessa = item.remessa
      if (!remessasMap.has(remessa)) {
        remessasMap.set(remessa, item)
      }
    })
    
    return Array.from(remessasMap.values())
  }, [data])

  // Obter opções únicas de Base de Entrega e Aging dos dados filtrados
  const opcoesBaseEntrega = useMemo(() => {
    const bases = new Set()
    remessasUnicas.forEach(item => {
      if (item.base_entrega) {
        bases.add(item.base_entrega)
      }
    })
    return Array.from(bases).sort()
  }, [remessasUnicas])

  const opcoesAgingFiltro = useMemo(() => {
    const agings = new Set()
    remessasUnicas.forEach(item => {
      if (item.aging) {
        agings.add(item.aging)
      }
    })
    return Array.from(agings).sort()
  }, [remessasUnicas])

  // Filtrar dados baseado nos filtros de colunas selecionados
  const dadosFiltradosColunas = useMemo(() => {
    let filtrados = remessasUnicas

    if (selectedBaseEntregaFiltro.length > 0) {
      filtrados = filtrados.filter(item => 
        selectedBaseEntregaFiltro.includes(item.base_entrega || '')
      )
    }

    if (selectedAgingFiltro.length > 0) {
      filtrados = filtrados.filter(item => 
        selectedAgingFiltro.includes(item.aging || '')
      )
    }

    return filtrados
  }, [remessasUnicas, selectedBaseEntregaFiltro, selectedAgingFiltro])

  // Colunas da tabela de filtros
  const tableColumnsFiltros = useMemo(() => [
    { key: '_checkbox', header: 'Selecionar', isCheckbox: true },
    { key: 'remessa', header: 'Remessa' },
    { key: 'unidade_responsavel', header: 'Unidade Responsável' },
    { key: 'base_entrega', header: 'Base de Entrega' },
    { key: 'tipo_ultima_operacao', header: 'Tipo da Última Operação' }
  ], [])

  // Chave para localStorage - salvar apenas os DESMARCADOS
  const STORAGE_KEY = 'sem_movimentacao_sc_unselected_rows'

  // Carregar remessas desmarcadas salvas do localStorage
  const loadUnselectedRows = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const savedArray = JSON.parse(saved)
        return new Set(savedArray)
      }
    } catch (error) {
      console.error('Erro ao carregar remessas desmarcadas:', error)
    }
    return new Set()
  }, [])

  // Salvar apenas as remessas DESMARCADAS no localStorage
  const saveUnselectedRows = useCallback((allRemessas, selectedRemessas) => {
    try {
      // Calcular quais remessas estão desmarcadas
      const unselected = Array.from(allRemessas).filter(remessa => !selectedRemessas.has(remessa))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unselected))
    } catch (error) {
      console.error('Erro ao salvar remessas desmarcadas:', error)
    }
  }, [])

  // Carregar seleções quando o modal abrir - SEMPRE marcar todas por padrão, exceto as desmarcadas salvas
  useEffect(() => {
    if (showFiltrosColunasModal && dadosFiltradosColunas.length > 0) {
      // Todas as remessas começam marcadas por padrão
      const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
      
      // Carregar remessas desmarcadas salvas
      const unselectedSaved = loadUnselectedRows()
      
      // Aplicar desmarcações salvas
      const selected = new Set(Array.from(allRemessas).filter(remessa => !unselectedSaved.has(remessa)))
      
      setSelectedRows(selected)
    }
  }, [showFiltrosColunasModal, dadosFiltradosColunas.length, loadUnselectedRows]) // Quando modal abrir ou dados mudarem

  // Funções para gerenciar seleção de linhas
  const handleRowSelect = useCallback((remessa) => {
    const isCurrentlySelected = selectedRows.has(remessa)
    
    if (isCurrentlySelected) {
      // Se está marcado, mostrar modal de confirmação para desmarcar
      setRemessaToUnselect(remessa)
      setShowUnselectConfirmModal(true)
    } else {
      // Se não está marcado, marcar e atualizar localStorage (remover dos desmarcados)
      setSelectedRows(prev => {
        const newSet = new Set(prev)
        newSet.add(remessa)
        
        // Obter todas as remessas disponíveis
        const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
        saveUnselectedRows(allRemessas, newSet)
        
        return newSet
      })
    }
  }, [selectedRows, dadosFiltradosColunas, saveUnselectedRows])

  // Confirmar desmarcação
  const handleConfirmUnselect = useCallback(() => {
    if (remessaToUnselect) {
      // Encontrar os dados da remessa
      const remessaData = dadosFiltradosColunas.find(item => item.remessa === remessaToUnselect)
      if (remessaData) {
        setRemessaToMove(remessaData)
        setShowUnselectConfirmModal(false)
        setShowMoveRemessaModal(true)
      }
    }
  }, [remessaToUnselect, dadosFiltradosColunas])

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === dadosFiltradosColunas.length) {
      // Desmarcar todas - mostrar modal de confirmação
      setRemessaToUnselect(null) // null indica "todas"
      setShowUnselectConfirmModal(true)
    } else {
      // Marcar todas
      const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
      setSelectedRows(allRemessas)
      
      // Limpar desmarcados (todas estão marcadas)
      saveUnselectedRows(allRemessas, allRemessas)
    }
  }, [selectedRows.size, dadosFiltradosColunas, saveUnselectedRows])

  // Confirmar desmarcação de todas
  const handleConfirmUnselectAll = useCallback(() => {
    // Para desmarcar todas, não mostramos o modal de mover
    // Apenas desmarcamos diretamente
    const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
    setSelectedRows(new Set())
    
    // Salvar todas como desmarcadas
    saveUnselectedRows(allRemessas, new Set())
    
    setShowUnselectConfirmModal(false)
    setRemessaToUnselect(null)
  }, [dadosFiltradosColunas, saveUnselectedRows])

  // Função para mover remessa para devolução
  const handleMoveToDevolucao = useCallback(async () => {
    if (!remessaToMove) return

    setMovingRemessa(true)
    try {
      const dataToSave = {
        remessa: remessaToMove.remessa,
        unidade_responsavel: remessaToMove.unidade_responsavel,
        base_entrega: remessaToMove.base_entrega,
        tipo_ultima_operacao: remessaToMove.tipo_ultima_operacao
      }

      await api.post('/sem-movimentacao-sc/move-to-devolucao', dataToSave)
      
      // Desmarcar a remessa após mover
      setSelectedRows(prev => {
        const newSet = new Set(prev)
        newSet.delete(remessaToMove.remessa)
        
        const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
        saveUnselectedRows(allRemessas, newSet)
        
        return newSet
      })

      showSuccess(`Remessa ${remessaToMove.remessa} movida para devolução com sucesso!`)
      setShowMoveRemessaModal(false)
      setRemessaToMove(null)
    } catch (error) {
      console.error('Erro ao mover remessa para devolução:', error)
      showError('Erro ao mover remessa para devolução. Tente novamente.')
    } finally {
      setMovingRemessa(false)
    }
  }, [remessaToMove, dadosFiltradosColunas, saveUnselectedRows, showSuccess, showError])

  // Função para mover remessa para cobrar base
  const handleMoveToCobrarBase = useCallback(async () => {
    if (!remessaToMove) return

    setMovingRemessa(true)
    try {
      const dataToSave = {
        remessa: remessaToMove.remessa,
        unidade_responsavel: remessaToMove.unidade_responsavel,
        base_entrega: remessaToMove.base_entrega,
        tipo_ultima_operacao: remessaToMove.tipo_ultima_operacao
      }

      await api.post('/sem-movimentacao-sc/move-to-cobrar-base', dataToSave)
      
      // Desmarcar a remessa após mover
      setSelectedRows(prev => {
        const newSet = new Set(prev)
        newSet.delete(remessaToMove.remessa)
        
        const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
        saveUnselectedRows(allRemessas, newSet)
        
        return newSet
      })

      showSuccess(`Remessa ${remessaToMove.remessa} movida para cobrar base com sucesso!`)
      setShowMoveRemessaModal(false)
      setRemessaToMove(null)
    } catch (error) {
      console.error('Erro ao mover remessa para cobrar base:', error)
      showError('Erro ao mover remessa para cobrar base. Tente novamente.')
    } finally {
      setMovingRemessa(false)
    }
  }, [remessaToMove, dadosFiltradosColunas, saveUnselectedRows, showSuccess, showError])

  // Função para carregar remessas em devolução e abrir modal de QR codes
  const handleLoadDevolucaoQRCodes = useCallback(async () => {
    setLoadingDevolucao(true)
    try {
      const response = await api.get('/sem-movimentacao-sc/devolucao/list')
      if (response.data.success && response.data.data) {
        const remessas = response.data.data.map(item => item.remessa).filter(Boolean)
        if (remessas.length > 0) {
          setRemessasDevolucao(remessas)
          setShowQRCodeDevolucaoModal(true)
          showSuccess(`${remessas.length} remessa(s) em devolução carregada(s)!`)
        } else {
          showError('Nenhuma remessa encontrada em devolução.')
        }
      } else {
        showError('Erro ao carregar remessas em devolução.')
      }
    } catch (error) {
      console.error('Erro ao carregar remessas em devolução:', error)
      showError('Erro ao carregar remessas em devolução. Tente novamente.')
    } finally {
      setLoadingDevolucao(false)
    }
  }, [showSuccess, showError])

  const isAllSelected = dadosFiltradosColunas.length > 0 && selectedRows.size === dadosFiltradosColunas.length
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < dadosFiltradosColunas.length

  // Calcular paginação baseada em REMESSAS, não registros
  const totalPages = useMemo(() => {
    return Math.ceil(remessasUnicas.length / itemsPerPage)
  }, [remessasUnicas.length])

  // Resetar para página 1 quando os dados mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [remessasUnicas.length, selectedTiposOperacao, selectedAgings])

  // Dados da página atual (paginar por REMESSAS)
  const displayedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return remessasUnicas.slice(startIndex, endIndex)
  }, [remessasUnicas, currentPage])

  // Funções de navegação
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll para o topo da tabela
      const tableContainer = document.querySelector('.sem-movimentacao-sc-table-container')
      if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [totalPages])

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }, [currentPage, totalPages, goToPage])

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  const hasFilters = selectedTiposOperacao.length > 0 || selectedAgings.length > 0
  const isLoading = filtersLoading || dataLoading

  // Função para renderizar células com tooltip
  const renderCellContent = useCallback((value, key, row) => {
    // Renderizar checkbox para coluna de seleção
    if (key === '_checkbox') {
      const remessa = row.remessa
      const isSelected = remessa && selectedRows.has(remessa)
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleRowSelect(remessa)}
            title={isSelected ? 'Desmarcar' : 'Marcar'}
            style={{ 
              cursor: 'pointer', 
              width: '18px', 
              height: '18px',
              margin: '0 auto'
            }}
          />
        </div>
      )
    }
    
    const text = value?.toString() || ''
    const maxLength = 50
    
    if (text.length > maxLength) {
      return (
        <span title={text} className="sem-movimentacao-sc-cell-text">
          {text.substring(0, maxLength)}...
        </span>
      )
    }
    return <span className="sem-movimentacao-sc-cell-text">{text}</span>
  }, [selectedRows, handleRowSelect])

  // Ref para o checkbox do header
  const headerCheckboxRef = React.useRef(null)

  // Atualizar estado indeterminate do checkbox do header
  React.useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate
    }
  }, [isIndeterminate])

  // Função para renderizar header com clique
  const renderHeader = useCallback((column, index) => {
    const columnKey = typeof column === 'string' ? column : column.key
    const headerText = typeof column === 'string' ? column : column.header || column.key
    const isCheckbox = typeof column === 'object' && column.isCheckbox
    
    // Header de checkbox para selecionar todas
    if (isCheckbox) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%'
        }}>
          <input
            type="checkbox"
            ref={headerCheckboxRef}
            checked={isAllSelected}
            onChange={handleSelectAll}
            title={isAllSelected ? 'Desmarcar todas' : isIndeterminate ? 'Desmarcar todas' : 'Marcar todas'}
            style={{ 
              cursor: 'pointer', 
              width: '18px', 
              height: '18px',
              margin: '0 auto'
            }}
          />
        </div>
      )
    }
    
    // Tornar "Horário da Última Operação" clicável
    if (columnKey === 'horario_ultima_operacao') {
      return (
        <span
          className="sem-movimentacao-sc-clickable-header"
          onClick={() => setShowDetailsModal(true)}
          title="Clique para ver detalhes e estatísticas"
        >
          {headerText} 📊
        </span>
      )
    }
    
    return headerText
  }, [isAllSelected, isIndeterminate, handleSelectAll])

  // Processar estatísticas dos dados filtrados
  const statistics = useMemo(() => {
    if (remessasUnicas.length === 0) {
      return {
        total: 0,
        byAging: {},
        byTipoOperacao: {},
        byBaseEntrega: {},
        byUnidadeResponsavel: {},
        byOperador: {},
        agingDistribution: [],
        tipoOperacaoDistribution: [],
        baseEntregaDistribution: [],
        horarioDistribution: []
      }
    }

    const stats = {
      total: remessasUnicas.length,
      byAging: {},
      byTipoOperacao: {},
      byBaseEntrega: {},
      byUnidadeResponsavel: {},
      byOperador: {}
    }

    remessasUnicas.forEach(item => {
      // Contar por Aging
      const aging = item.aging || 'Não informado'
      stats.byAging[aging] = (stats.byAging[aging] || 0) + 1

      // Contar por Tipo de Operação
      const tipoOp = item.tipo_ultima_operacao || 'Não informado'
      stats.byTipoOperacao[tipoOp] = (stats.byTipoOperacao[tipoOp] || 0) + 1

      // Contar por Base de Entrega
      const baseEntrega = item.base_entrega || 'Não informado'
      stats.byBaseEntrega[baseEntrega] = (stats.byBaseEntrega[baseEntrega] || 0) + 1

      // Contar por Unidade Responsável
      const unidade = item.unidade_responsavel || 'Não informado'
      stats.byUnidadeResponsavel[unidade] = (stats.byUnidadeResponsavel[unidade] || 0) + 1

      // Contar por Operador
      const operador = item.operador_bipe_mais_recente || 'Não informado'
      stats.byOperador[operador] = (stats.byOperador[operador] || 0) + 1
    })

    // Converter para arrays ordenados
    stats.agingDistribution = Object.entries(stats.byAging)
      .map(([key, value]) => ({ label: key, count: value, percentage: ((value / stats.total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)

    stats.tipoOperacaoDistribution = Object.entries(stats.byTipoOperacao)
      .map(([key, value]) => ({ label: key, count: value, percentage: ((value / stats.total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)

    stats.baseEntregaDistribution = Object.entries(stats.byBaseEntrega)
      .map(([key, value]) => ({ label: key, count: value, percentage: ((value / stats.total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 bases

    // Distribuição por horário da última operação (agrupar por data)
    const horarioDistribution = {}
    remessasUnicas.forEach(item => {
      const horario = item.horario_ultima_operacao
      if (horario) {
        try {
          // Tentar extrair a data do horário (formato pode variar)
          // Exemplos: "2024-01-15 14:30:00" ou "15/01/2024 14:30" ou "14:30:00"
          let dataFormatada = 'Sem data'
          
          // Tentar formato ISO: 2024-01-15 ou 2024-01-15 14:30:00
          const isoMatch = horario.match(/(\d{4}-\d{2}-\d{2})/)
          if (isoMatch) {
            const data = new Date(isoMatch[1])
            dataFormatada = data.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            })
          } else {
            // Tentar formato brasileiro: 15/01/2024
            const brMatch = horario.match(/(\d{2}\/\d{2}\/\d{4})/)
            if (brMatch) {
              dataFormatada = brMatch[1]
            } else {
              // Tentar extrair apenas a data de qualquer formato
              const qualquerDataMatch = horario.match(/(\d{2,4}[-\/]\d{2}[-\/]\d{2,4})/)
              if (qualquerDataMatch) {
                dataFormatada = qualquerDataMatch[1]
              } else {
                dataFormatada = horario.split(' ')[0] || horario
              }
            }
          }
          
          horarioDistribution[dataFormatada] = (horarioDistribution[dataFormatada] || 0) + 1
        } catch (e) {
          horarioDistribution['Data inválida'] = (horarioDistribution['Data inválida'] || 0) + 1
        }
      } else {
        horarioDistribution['Sem horário'] = (horarioDistribution['Sem horário'] || 0) + 1
      }
    })

    stats.horarioDistribution = Object.entries(horarioDistribution)
      .map(([key, value]) => ({ label: key, count: value, percentage: ((value / stats.total) * 100).toFixed(1) }))
      .sort((a, b) => {
        // Tentar ordenar por data (mais recente primeiro)
        try {
          const dataA = new Date(a.label.split(' ')[0].split('/').reverse().join('-'))
          const dataB = new Date(b.label.split(' ')[0].split('/').reverse().join('-'))
          if (!isNaN(dataA.getTime()) && !isNaN(dataB.getTime())) {
            return dataB - dataA // Mais recente primeiro
          }
        } catch (e) {
          // Se não conseguir ordenar por data, ordena por quantidade
        }
        return b.count - a.count
      })

    return stats
  }, [remessasUnicas])

  // Função para copiar todos os números de remessa
  const handleCopyRemessas = useCallback(async () => {
    try {
      if (remessasUnicas.length === 0) {
        showError('Nenhuma remessa disponível para copiar')
        return
      }
      
      const remessas = remessasUnicas.map(item => item.remessa).filter(Boolean)
      
      if (remessas.length === 0) {
        showError('Nenhuma remessa válida encontrada')
        return
      }
      
      await navigator.clipboard.writeText(remessas.join('\n'))
      showSuccess(`📋 ${remessas.length.toLocaleString('pt-BR')} remessa(s) copiada(s)!`)
    } catch (error) {
      showError('Erro ao copiar remessas. Tente novamente.')
    }
  }, [remessasUnicas, showSuccess, showError])

  // Gerar lotes de remessas de 1000
  useEffect(() => {
    if (remessasUnicas.length > 0) {
      const lotes = []
      const tamanhoLote = 1000
      const remessas = remessasUnicas.map(item => item.remessa).filter(Boolean)
      
      for (let i = 0; i < remessas.length; i += tamanhoLote) {
        const loteRemessas = remessas.slice(i, i + tamanhoLote)
        lotes.push({
          numero_lote: Math.floor(i / tamanhoLote) + 1,
          total_remessas: loteRemessas.length,
          remessas: loteRemessas
        })
      }
      setRemessasLotes1000(lotes)
    } else {
      setRemessasLotes1000([])
    }
  }, [remessasUnicas])

  // Gerar lotes de remessas de 500
  useEffect(() => {
    if (remessasUnicas.length > 0) {
      const lotes = []
      const tamanhoLote = 500
      const remessas = remessasUnicas.map(item => item.remessa).filter(Boolean)
      
      for (let i = 0; i < remessas.length; i += tamanhoLote) {
        const loteRemessas = remessas.slice(i, i + tamanhoLote)
        lotes.push({
          numero_lote: Math.floor(i / tamanhoLote) + 1,
          total_remessas: loteRemessas.length,
          remessas: loteRemessas
        })
      }
      setRemessasLotes500(lotes)
    } else {
      setRemessasLotes500([])
    }
  }, [remessasUnicas])

  // Função para copiar um lote específico
  const handleCopyLote = useCallback(async (lote) => {
    try {
      if (lote.remessas.length === 0) {
        showError('Nenhuma remessa válida encontrada neste lote')
        return
      }
      
      await navigator.clipboard.writeText(lote.remessas.join('\n'))
      showSuccess(`📋 Lote ${lote.numero_lote} copiado! ${lote.total_remessas.toLocaleString('pt-BR')} remessa(s) copiada(s)`)
    } catch (error) {
      showError('Erro ao copiar lote. Tente novamente.')
    }
  }, [showSuccess, showError])

  return (
    <div className="sem-movimentacao-sc">
      <div className="sem-movimentacao-sc-header">
        <h1>Sem Movimentação SC</h1>
        <p className="sem-movimentacao-sc-subtitle">
          Gerencie pedidos sem movimentação de Santa Catarina
        </p>
      </div>
      
      <div className="sem-movimentacao-sc-content">
        {/* Filtros */}
        <div className="sem-movimentacao-sc-filters-section">
          <div className="sem-movimentacao-sc-filters-header">
            <h3>Filtros de Busca</h3>
            <p>Selecione os filtros para visualizar os dados</p>
          </div>
          <div className="sem-movimentacao-sc-filters">
            <div className="sem-movimentacao-sc-filter-item">
              <label className="sem-movimentacao-sc-filter-label">
                Tipo da Última Operação
              </label>
              <MultiSelect
                selectedValues={selectedTiposOperacao}
                setSelectedValues={setSelectedTiposOperacao}
                options={tiposOperacao}
                placeholder="Selecione o tipo de operação"
                selectAllText="Selecionar Todos"
                clearAllText="Limpar Todos"
                allSelectedText="Todos os tipos selecionados"
                showCount={true}
                disabled={filtersLoading}
                className="theme-green"
              />
            </div>
            <div className="sem-movimentacao-sc-filter-item">
              <label className="sem-movimentacao-sc-filter-label">
                Aging
              </label>
              <MultiSelect
                selectedValues={selectedAgings}
                setSelectedValues={setSelectedAgings}
                options={agings}
                placeholder="Selecione o aging"
                selectAllText="Selecionar Todos"
                clearAllText="Limpar Todos"
                allSelectedText="Todos os agings selecionados"
                showCount={true}
                disabled={filtersLoading}
                className="theme-orange"
              />
            </div>
          </div>
        </div>

        {/* Tabela */}
        {isLoading ? (
          <LoadingState 
            message="Carregando dados..."
            subtitle="Aguarde enquanto buscamos as informações"
            size="medium"
          />
        ) : error ? (
          <EmptyState
            type="error"
            title="Erro ao carregar dados"
            message={error}
            icon="⚠️"
          />
        ) : !hasFilters ? (
          <EmptyState
            type="no-data"
            title="Selecione os filtros"
            message="Selecione pelo menos um filtro (Tipo da última operação ou Aging) para visualizar os dados"
            icon="🔍"
          />
        ) : data.length === 0 ? (
          <EmptyState
            type="no-data"
            title="Nenhum dado encontrado"
            message="Nenhum registro encontrado com os filtros selecionados"
            icon="📭"
          />
        ) : (
          <div className="sem-movimentacao-sc-table-container">
            <div className="sem-movimentacao-sc-table-header">
              <div className="sem-movimentacao-sc-table-header-content">
                <h2>Dados de Sem Movimentação SC</h2>
                <span className="sem-movimentacao-sc-total">
                  Total: {total} remessa(s)
                </span>
              </div>
              <div className="sem-movimentacao-sc-table-header-actions">
                <button
                  className="sem-movimentacao-sc-copy-remessas-btn"
                  onClick={handleCopyRemessas}
                  title="Copiar todos os números de remessa"
                >
                  📋 Copiar Remessas
                </button>
                {remessasLotes1000.length > 0 && (
                  <button
                    className="sem-movimentacao-sc-lotes-btn"
                    onClick={() => setShowLotesModal1000(true)}
                    title="Ver lotes de 1000 remessas"
                  >
                    📦 Lotes 1000 ({remessasLotes1000.length})
                  </button>
                )}
                {remessasLotes500.length > 0 && (
                  <button
                    className="sem-movimentacao-sc-lotes-btn"
                    onClick={() => setShowLotesModal500(true)}
                    title="Ver lotes de 500 remessas"
                  >
                    📦 Lotes 500 ({remessasLotes500.length})
                  </button>
                )}
                <button
                  className="sem-movimentacao-sc-filtros-colunas-btn"
                  onClick={() => setShowFiltrosColunasModal(true)}
                  title="Filtrar por colunas"
                >
                  🔍 Filtros de Colunas
                </button>
              </div>
            </div>
            <Table
              data={displayedData}
              columns={tableColumns}
              title=""
              emptyMessage="Nenhum dado encontrado"
              renderCellContent={renderCellContent}
              renderHeader={renderHeader}
            />
            <div className="sem-movimentacao-sc-table-footer">
              {/* Paginação */}
              {totalPages > 1 && (
                <div className="sem-movimentacao-sc-pagination">
                  <button
                    className="sem-movimentacao-sc-pagination-btn"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    title="Página anterior"
                  >
                    ‹ Anterior
                  </button>
                  
                  <div className="sem-movimentacao-sc-pagination-info">
                    Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                    <span className="sem-movimentacao-sc-pagination-detail">
                      (Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, remessasUnicas.length)} de {remessasUnicas.length} remessa(s))
                    </span>
                  </div>
                  
                  <button
                    className="sem-movimentacao-sc-pagination-btn"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    title="Próxima página"
                  >
                    Próxima ›
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes e Estatísticas */}
      <DetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        statistics={statistics}
        selectedTiposOperacao={selectedTiposOperacao}
        selectedAgings={selectedAgings}
      />

      {/* Modal de confirmação para limpar dados */}
      <Suspense fallback={null}>
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmClearData}
          title="⚠️ Limpar TODOS os Dados de Sem Movimentação SC?"
          message="Esta ação irá deletar TODOS os dados das coleções sem_movimentacao_sc e sem_movimentacao_sc_chunks."
          warningMessage="⚠️ ATENÇÃO: Esta ação não pode ser desfeita! Todos os dados serão permanentemente deletados."
          confirmText="Sim, Limpar Tudo"
          cancelText="Cancelar"
          type="danger"
          loading={deletingData}
        />
      </Suspense>

      {/* Modal de Lotes 1000 */}
      <LotesModal
        isOpen={showLotesModal1000}
        onClose={() => setShowLotesModal1000(false)}
        remessasLotes={remessasLotes1000}
        remessasUnicas={remessasUnicas}
        onCopyLote={handleCopyLote}
        tamanhoLote={1000}
      />

      {/* Modal de Lotes 500 */}
      <LotesModal
        isOpen={showLotesModal500}
        onClose={() => setShowLotesModal500(false)}
        remessasLotes={remessasLotes500}
        remessasUnicas={remessasUnicas}
        onCopyLote={handleCopyLote}
        tamanhoLote={500}
      />

      {/* Modal de Confirmação para Desmarcar */}
      <Suspense fallback={null}>
        <ConfirmModal
          isOpen={showUnselectConfirmModal}
          onClose={() => {
            setShowUnselectConfirmModal(false)
            setRemessaToUnselect(null)
          }}
          onConfirm={remessaToUnselect === null ? handleConfirmUnselectAll : handleConfirmUnselect}
          title="⚠️ Confirmar Desmarcação"
          message={
            remessaToUnselect === null
              ? `Tem certeza que deseja desmarcar todas as ${selectedRows.size} remessa(s) selecionada(s)?`
              : `Tem certeza que deseja desmarcar a remessa "${remessaToUnselect}"?`
          }
          warningMessage="Esta ação não pode ser desfeita. A seleção será removida permanentemente."
          confirmText="Sim, Desmarcar"
          cancelText="Cancelar"
          type="warning"
        />
      </Suspense>

      {/* Modal de QR Codes */}
      {showQRCodeModal && (
        <QRCodeModal
          isOpen={showQRCodeModal}
          onClose={() => setShowQRCodeModal(false)}
          remessas={Array.from(selectedRows).sort()}
        />
      )}

      {/* Modal de QR Codes - Devolução */}
      {showQRCodeDevolucaoModal && (
        <QRCodeModal
          isOpen={showQRCodeDevolucaoModal}
          onClose={() => setShowQRCodeDevolucaoModal(false)}
          remessas={remessasDevolucao.sort()}
        />
      )}

      {/* Modal de Mover Remessa */}
      <MoveRemessaModal
        isOpen={showMoveRemessaModal}
        onClose={() => {
          if (!movingRemessa) {
            setShowMoveRemessaModal(false)
            setRemessaToMove(null)
          }
        }}
        remessaData={remessaToMove}
        onMoveToDevolucao={handleMoveToDevolucao}
        onMoveToCobrarBase={handleMoveToCobrarBase}
        loading={movingRemessa}
      />

      {/* Modal de Filtros de Colunas */}
      {(showFiltrosColunasModal || isClosingFiltrosColunas) && (
        <div className={`sem-movimentacao-sc-filtros-colunas-modal-overlay ${isClosingFiltrosColunas ? 'closing' : ''}`}>
          <div className="sem-movimentacao-sc-filtros-colunas-modal">
            <div className="sem-movimentacao-sc-filtros-colunas-modal-header">
              <h2>Filtros de Colunas</h2>
              <button
                className="sem-movimentacao-sc-filtros-colunas-modal-close"
                onClick={() => {
                  setIsClosingFiltrosColunas(true)
                  setTimeout(() => {
                    setIsClosingFiltrosColunas(false)
                    setShowFiltrosColunasModal(false)
                  }, 250)
                }}
                title="Fechar"
              >
                ✕
              </button>
            </div>
            <div className="sem-movimentacao-sc-filtros-colunas-modal-content">
              <div className="sem-movimentacao-sc-filtros-colunas-filters">
                <div className="sem-movimentacao-sc-filtros-colunas-filter-group">
                  <label>Base de Entrega</label>
                  <MultiSelect
                    selectedValues={selectedBaseEntregaFiltro}
                    setSelectedValues={setSelectedBaseEntregaFiltro}
                    options={opcoesBaseEntrega}
                    placeholder="Selecione as bases de entrega"
                    selectAllText="Selecionar Todas"
                    clearAllText="Limpar Todas"
                    allSelectedText="Todas as bases selecionadas"
                    showCount={true}
                    className="theme-purple"
                    enableSearch={true}
                    searchPlaceholder="Pesquisar base de entrega..."
                  />
                </div>
                <div className="sem-movimentacao-sc-filtros-colunas-filter-group">
                  <label>Aging</label>
                  <MultiSelect
                    selectedValues={selectedAgingFiltro}
                    setSelectedValues={setSelectedAgingFiltro}
                    options={opcoesAgingFiltro}
                    placeholder="Selecione os agings"
                    selectAllText="Selecionar Todos"
                    clearAllText="Limpar Todos"
                    allSelectedText="Todos os agings selecionados"
                    showCount={true}
                    className="theme-orange"
                  />
                </div>
              </div>
              <div className="sem-movimentacao-sc-filtros-colunas-table-container">
                <div className="sem-movimentacao-sc-filtros-colunas-table-header">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <h3>
                      Resultados: {dadosFiltradosColunas.length.toLocaleString('pt-BR')} remessa(s)
                      {selectedRows.size > 0 && (
                        <span className="sem-movimentacao-sc-selected-count">
                          {' '}({selectedRows.size} selecionada(s))
                        </span>
                      )}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {selectedRows.size > 0 && (
                        <button
                          className="sem-movimentacao-sc-qrcode-btn"
                          onClick={() => setShowQRCodeModal(true)}
                          title="Gerar QR Codes para remessas selecionadas"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="5" height="5" />
                            <rect x="16" y="3" width="5" height="5" />
                            <rect x="3" y="16" width="5" height="5" />
                            <path d="M21 16h-3" />
                            <path d="M9 21v-3" />
                            <path d="M21 12v-1" />
                            <path d="M12 3H13" />
                            <path d="M3 12H4" />
                            <path d="M16 16h5" />
                            <path d="M16 21h5" />
                            <path d="M12 8v5" />
                            <path d="M8 12h5" />
                          </svg>
                          QR Codes
                        </button>
                      )}
                      <button
                        className="sem-movimentacao-sc-qrcode-devolucao-btn"
                        onClick={handleLoadDevolucaoQRCodes}
                        disabled={loadingDevolucao}
                        title="Gerar QR Codes das remessas em devolução"
                      >
                        {loadingDevolucao ? (
                          '⏳ Carregando...'
                        ) : (
                          <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="5" height="5" />
                              <rect x="16" y="3" width="5" height="5" />
                              <rect x="3" y="16" width="5" height="5" />
                              <path d="M21 16h-3" />
                              <path d="M9 21v-3" />
                              <path d="M21 12v-1" />
                              <path d="M12 3H13" />
                              <path d="M3 12H4" />
                              <path d="M16 16h5" />
                              <path d="M16 21h5" />
                              <path d="M12 8v5" />
                              <path d="M8 12h5" />
                            </svg>
                            QR Codes Devolução
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <Table
                  data={dadosFiltradosColunas}
                  columns={tableColumnsFiltros}
                  title=""
                  emptyMessage="Nenhum dado encontrado com os filtros selecionados"
                  renderCellContent={renderCellContent}
                  renderHeader={renderHeader}
                  getRowClassName={(row) => {
                    const remessa = row.remessa
                    return remessa && selectedRows.has(remessa) 
                      ? 'sem-movimentacao-sc-row-selected' 
                      : ''
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SemMovimentacaoSC

