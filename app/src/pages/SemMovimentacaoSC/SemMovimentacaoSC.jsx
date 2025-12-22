import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { useConfig } from '../../contexts/ConfigContext'
import { useSemMovimentacaoSCData } from './hooks/useSemMovimentacaoSCData'
import { useSemMovimentacaoSCFilters } from './hooks/useSemMovimentacaoSCFilters'
import { useDevolucao } from './hooks/useDevolucao'
import { usePagination } from './hooks/usePagination'
import { useRowSelection } from './hooks/useRowSelection'
import { useRowSelectionMain } from './hooks/useRowSelectionMain'
import { useRemessasUnicas } from './hooks/useRemessasUnicas'
import { useStatistics } from './hooks/useStatistics'
import { useLotes } from './hooks/useLotes'
import { useRemessaActions } from './hooks/useRemessaActions'
import { useFiltrosColunas } from './hooks/useFiltrosColunas'
import { useTableRenderers } from './hooks/useTableRenderers'
import { useModals } from './hooks/useModals'
import { useDataManagement } from './hooks/useDataManagement'
import { useMoveRemessa } from './hooks/useMoveRemessa'
import { tableColumns, tableColumnsFiltros } from './constants/tableColumns'
import SemMovimentacaoSCHeader from './components/SemMovimentacaoSCHeader/SemMovimentacaoSCHeader'
import SemMovimentacaoSCContent from './components/SemMovimentacaoSCContent/SemMovimentacaoSCContent'
import FiltrosColunasModal from './components/FiltrosColunasModal/FiltrosColunasModal'
import DeleteDevolucaoModal from './components/DeleteDevolucaoModal/DeleteDevolucaoModal'
import QRCodeModalDevolucao from './components/QRCodeModalDevolucao/QRCodeModalDevolucao'
import DetailsModal from './components/DetailsModal/DetailsModal'
import LotesModal from './components/LotesModal/LotesModal'
import LotesFiltrosModal from './components/LotesFiltrosModal/LotesFiltrosModal'
import QRCodeModal from './components/QRCodeModal/QRCodeModal'
import MoveRemessaModal from './components/MoveRemessaModal/MoveRemessaModal'
import './SemMovimentacaoSC.css'

const ConfirmModal = lazy(() => import('../../components/ConfirmModal/ConfirmModal'))

const SemMovimentacaoSC = () => {
  const { showSuccess, showError } = useNotification()
  const { registerSemMovimentacaoSCConfig, unregisterSemMovimentacaoSCConfig } = useConfig()
  
  // Estados dos filtros - carregar do localStorage se existir
  const loadFiltersFromStorage = () => {
    try {
      const saved = localStorage.getItem('sem-movimentacao-sc-filters')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          tiposOperacao: parsed.tiposOperacao || [],
          agings: parsed.agings || []
        }
      }
    } catch (error) {
      console.error('Erro ao carregar filtros salvos:', error)
    }
    return { tiposOperacao: [], agings: [] }
  }

  const savedFilters = loadFiltersFromStorage()
  const [selectedTiposOperacao, setSelectedTiposOperacao] = useState(savedFilters.tiposOperacao)
  const [selectedAgings, setSelectedAgings] = useState(savedFilters.agings)
  const [selectedBaseEntregaFiltro, setSelectedBaseEntregaFiltro] = useState([])
  
  const itemsPerPage = 1000

  // Salvar filtros no localStorage quando mudarem
  useEffect(() => {
    try {
      const filtersToSave = {
        tiposOperacao: selectedTiposOperacao,
        agings: selectedAgings
      }
      localStorage.setItem('sem-movimentacao-sc-filters', JSON.stringify(filtersToSave))
    } catch (error) {
      console.error('Erro ao salvar filtros:', error)
    }
  }, [selectedTiposOperacao, selectedAgings])

  // Buscar opções dos filtros
  const { tiposOperacao, agings, loading: filtersLoading, refetch: refetchFilters } = useSemMovimentacaoSCFilters()

  // Buscar dados baseado nos filtros
  const { data, loading: dataLoading, error, total, refetch } = useSemMovimentacaoSCData(
    selectedTiposOperacao,
    selectedAgings
  )

  // Gerenciar dados (import/export/limpeza)
  const dataManagement = useDataManagement(
    showSuccess,
    showError,
    refetchFilters,
    refetch,
    registerSemMovimentacaoSCConfig,
    unregisterSemMovimentacaoSCConfig
  )

  // Agrupar dados por remessa
  const remessasUnicas = useRemessasUnicas(data)

  // Filtros de colunas
  const { opcoesBaseEntrega, dadosFiltradosColunas } = useFiltrosColunas(
    remessasUnicas,
    selectedBaseEntregaFiltro
  )

  // Gerar lotes
  const remessasLotes1000 = useLotes(remessasUnicas, 1000)
  const remessasLotes500 = useLotes(remessasUnicas, 500)
  
  // Gerar lotes de 1000 para os dados filtrados (usado no modal de filtros de colunas)
  const remessasLotes1000Filtros = useLotes(dadosFiltradosColunas, 1000)

  // Hook de seleção de linhas para a página principal
  const rowSelectionMain = useRowSelectionMain(remessasUnicas)

  // Hook de seleção de linhas para o modal de filtros
  const rowSelection = useRowSelection(dadosFiltradosColunas)

  // Hook de paginação
  const pagination = usePagination(remessasUnicas, itemsPerPage)

  // Estatísticas
  const statistics = useStatistics(remessasUnicas)

  // Ações de remessas
  const remessaActions = useRemessaActions(showSuccess, showError)

  // Gerenciar modais
  const modals = useModals()

  // Movimentação de remessas
  const moveRemessa = useMoveRemessa(showSuccess, showError, rowSelection, dadosFiltradosColunas)

  // Hook de devolução
  const devolucao = useDevolucao(showSuccess, showError)

  // Carregar bases quando abrir o modal e limpar seleção anterior
  useEffect(() => {
    if (modals.showQRCodeDevolucaoModal) {
      try {
        localStorage.removeItem('sem_movimentacao_sc_selected_base_devolucao')
      } catch (e) {
        // Ignorar erro
      }
      devolucao.loadBasesDevolucao()
    }
  }, [modals.showQRCodeDevolucaoModal, devolucao.loadBasesDevolucao])

  // Carregar seleções quando o modal abrir
  const loadUnselectedRowsRef = React.useRef(rowSelection.loadUnselectedRows)
  const setSelectedRowsRef = React.useRef(rowSelection.setSelectedRows)
  
  React.useEffect(() => {
    loadUnselectedRowsRef.current = rowSelection.loadUnselectedRows
    setSelectedRowsRef.current = rowSelection.setSelectedRows
  }, [rowSelection.loadUnselectedRows, rowSelection.setSelectedRows])
  
  useEffect(() => {
    if (modals.showFiltrosColunasModal && dadosFiltradosColunas.length > 0) {
      const allRemessas = new Set(dadosFiltradosColunas.map(item => item.remessa).filter(Boolean))
      const unselectedSaved = loadUnselectedRowsRef.current()
      const selected = new Set(Array.from(allRemessas).filter(remessa => !unselectedSaved.has(remessa)))
      setSelectedRowsRef.current(selected)
    }
  }, [modals.showFiltrosColunasModal, dadosFiltradosColunas.length])

  // Renderizadores de tabela para a página principal
  const { renderCellContent: renderCellContentMain, renderHeader: renderHeaderMain } = useTableRenderers(
    rowSelectionMain,
    () => modals.setShowDetailsModal(true)
  )

  // Renderizadores de tabela para o modal de filtros
  const { renderCellContent, renderHeader } = useTableRenderers(
    rowSelection,
    () => modals.setShowDetailsModal(true)
  )

  // Confirmar desmarcação
  const handleConfirmUnselect = useCallback(() => {
    if (rowSelection.remessaToUnselect) {
      const needsMoveModal = rowSelection.handleConfirmUnselect()
      if (needsMoveModal) {
        const remessaData = dadosFiltradosColunas.find(item => item.remessa === rowSelection.remessaToUnselect)
        if (remessaData) {
          modals.setRemessaToMove(remessaData)
          modals.setShowMoveRemessaModal(true)
        }
      }
    }
  }, [rowSelection, dadosFiltradosColunas, modals])

  // Função para mover remessa para devolução
  const handleMoveToDevolucao = useCallback(async () => {
    if (!modals.remessaToMove) return
    modals.setMovingRemessa(true)
    try {
      await moveRemessa.handleMoveToDevolucao(
        modals.remessaToMove,
        modals.setRemessaToMove,
        modals.setShowMoveRemessaModal
      )
    } catch (error) {
      // Erro já foi tratado no hook
    } finally {
      modals.setMovingRemessa(false)
    }
  }, [modals.remessaToMove, moveRemessa, modals])

  // Função para mover remessa para cobrar base
  const handleMoveToCobrarBase = useCallback(async () => {
    if (!modals.remessaToMove) return
    modals.setMovingRemessa(true)
    try {
      await moveRemessa.handleMoveToCobrarBase(
        modals.remessaToMove,
        modals.setRemessaToMove,
        modals.setShowMoveRemessaModal
      )
    } catch (error) {
      // Erro já foi tratado no hook
    } finally {
      modals.setMovingRemessa(false)
    }
  }, [modals.remessaToMove, moveRemessa, modals])

  // Função para carregar remessas em devolução e abrir modal de QR codes
  const handleLoadDevolucaoQRCodes = useCallback(async () => {
    const success = await devolucao.handleLoadDevolucaoQRCodes()
    if (success) {
      modals.setShowQRCodeDevolucaoModal(true)
    }
  }, [devolucao.handleLoadDevolucaoQRCodes, modals])

  // Função para recarregar remessas quando base mudar
  const handleBaseDevolucaoChange = useCallback(async (newBases) => {
    const currentBases = devolucao.selectedBaseDevolucao
    if (JSON.stringify(currentBases) === JSON.stringify(newBases)) {
      return
    }
    await devolucao.handleBaseDevolucaoChange(newBases, modals.showQRCodeDevolucaoModal)
  }, [modals.showQRCodeDevolucaoModal, devolucao.handleBaseDevolucaoChange, devolucao.selectedBaseDevolucao])
  
  // Handlers para deletar devoluções
  const handleDeleteAllDevolucao = useCallback(() => {
    devolucao.setDeleteDevolucaoType('all')
    devolucao.setShowDeleteDevolucaoModal(true)
  }, [devolucao.setDeleteDevolucaoType, devolucao.setShowDeleteDevolucaoModal])
  
  const handleDeleteBaseDevolucao = useCallback((base) => {
    devolucao.setDeleteDevolucaoType(base)
    devolucao.setShowDeleteDevolucaoModal(true)
  }, [devolucao.setDeleteDevolucaoType, devolucao.setShowDeleteDevolucaoModal])
  
  // Memoizar remessas ordenadas
  const remessasDevolucaoSorted = useMemo(() => {
    return [...devolucao.remessasDevolucao].sort()
  }, [devolucao.remessasDevolucao])

  const hasFilters = selectedTiposOperacao.length > 0 || selectedAgings.length > 0
  const isLoading = filtersLoading || dataLoading

  // Handlers com remessasUnicas
  const handleCopyRemessas = useCallback(() => {
    remessaActions.handleCopyRemessas(remessasUnicas)
  }, [remessasUnicas, remessaActions])

  const handleCopyRemessasFiltradas = useCallback(() => {
    remessaActions.handleCopyRemessasFiltradas(dadosFiltradosColunas)
  }, [dadosFiltradosColunas, remessaActions])

  const handleCopyLote = useCallback((lote) => {
    remessaActions.handleCopyLote(lote)
  }, [remessaActions])

  return (
    <div className="sem-movimentacao-sc">
      {/* <SemMovimentacaoSCHeader /> */}

      <SemMovimentacaoSCContent
        selectedTiposOperacao={selectedTiposOperacao}
        setSelectedTiposOperacao={setSelectedTiposOperacao}
        tiposOperacao={tiposOperacao}
        selectedAgings={selectedAgings}
        setSelectedAgings={setSelectedAgings}
        agings={agings}
        filtersLoading={filtersLoading}
        isLoading={isLoading}
        error={error}
        hasFilters={hasFilters}
        data={data}
        pagination={pagination}
        tableColumns={tableColumns}
        total={total}
        remessasUnicas={remessasUnicas}
        renderCellContent={renderCellContentMain}
        renderHeader={renderHeaderMain}
        onCopyRemessas={handleCopyRemessas}
        onOpenLotes1000={() => modals.setShowLotesModal1000(true)}
        onOpenLotes500={() => modals.setShowLotesModal500(true)}
        onOpenFiltrosColunas={() => modals.setShowFiltrosColunasModal(true)}
        remessasLotes1000={remessasLotes1000}
        remessasLotes500={remessasLotes500}
      />

      {/* Modal de Detalhes e Estatísticas */}
      <DetailsModal
        isOpen={modals.showDetailsModal}
        onClose={() => modals.setShowDetailsModal(false)}
        statistics={statistics}
        selectedTiposOperacao={selectedTiposOperacao}
        selectedAgings={selectedAgings}
      />

      {/* Modal de confirmação para limpar dados */}
      <Suspense fallback={null}>
        <ConfirmModal
          isOpen={dataManagement.showDeleteModal}
          onClose={() => dataManagement.setShowDeleteModal(false)}
          onConfirm={dataManagement.handleConfirmClearData}
          title="⚠️ Limpar TODOS os Dados de Sem Movimentação SC?"
          message="Esta ação irá deletar TODOS os dados das coleções sem_movimentacao_sc e sem_movimentacao_sc_chunks."
          warningMessage="⚠️ ATENÇÃO: Esta ação não pode ser desfeita! Todos os dados serão permanentemente deletados."
          confirmText="Sim, Limpar Tudo"
          cancelText="Cancelar"
          type="danger"
          loading={dataManagement.deletingData}
        />
      </Suspense>

      {/* Modal de Lotes 1000 */}
      <LotesModal
        isOpen={modals.showLotesModal1000}
        onClose={() => modals.setShowLotesModal1000(false)}
        remessasLotes={remessasLotes1000}
        remessasUnicas={remessasUnicas}
        onCopyLote={handleCopyLote}
        tamanhoLote={1000}
      />

      {/* Modal de Lotes 500 */}
      <LotesModal
        isOpen={modals.showLotesModal500}
        onClose={() => modals.setShowLotesModal500(false)}
        remessasLotes={remessasLotes500}
        remessasUnicas={remessasUnicas}
        onCopyLote={handleCopyLote}
        tamanhoLote={500}
      />

      {/* Modal de Confirmação para Desmarcar */}
      <Suspense fallback={null}>
        <ConfirmModal
          isOpen={rowSelection.showUnselectConfirmModal}
          onClose={() => {
            rowSelection.setShowUnselectConfirmModal(false)
            rowSelection.setRemessaToUnselect(null)
          }}
          onConfirm={rowSelection.remessaToUnselect === null ? rowSelection.handleConfirmUnselectAll : handleConfirmUnselect}
          title="⚠️ Confirmar Desmarcação"
          message={
            rowSelection.remessaToUnselect === null
              ? `Tem certeza que deseja desmarcar todas as ${rowSelection.selectedRows.size} remessa(s) selecionada(s)?`
              : `Tem certeza que deseja desmarcar a remessa "${rowSelection.remessaToUnselect}"?`
          }
          warningMessage="Esta ação não pode ser desfeita. A seleção será removida permanentemente."
          confirmText="Sim, Desmarcar"
          cancelText="Cancelar"
          type="warning"
        />
      </Suspense>

      {/* Modal de QR Codes */}
      {modals.showQRCodeModal && (
        <QRCodeModal
          isOpen={modals.showQRCodeModal}
          onClose={() => modals.setShowQRCodeModal(false)}
          remessas={Array.from(rowSelection.selectedRows).sort()}
        />
      )}

      {/* Modal de QR Codes - Devolução */}
      {modals.showQRCodeDevolucaoModal && (
        <QRCodeModalDevolucao
          isOpen={modals.showQRCodeDevolucaoModal}
          onClose={() => modals.setShowQRCodeDevolucaoModal(false)}
          remessasDevolucao={remessasDevolucaoSorted}
          basesDevolucao={devolucao.basesDevolucao}
          selectedBaseDevolucao={devolucao.selectedBaseDevolucao}
          onBaseChange={handleBaseDevolucaoChange}
          loadingBasesDevolucao={devolucao.loadingBasesDevolucao}
          loadingDevolucao={devolucao.loadingDevolucao}
          onDeleteAll={handleDeleteAllDevolucao}
          onDeleteBase={handleDeleteBaseDevolucao}
          deletingDevolucao={devolucao.deletingDevolucao}
        />
      )}

      {/* Modal de Confirmação para Deletar Devoluções */}
      <DeleteDevolucaoModal
        isOpen={devolucao.showDeleteDevolucaoModal}
        onClose={() => {
          if (!devolucao.deletingDevolucao) {
            devolucao.setShowDeleteDevolucaoModal(false)
            devolucao.setDeleteDevolucaoType(null)
          }
        }}
        deleteDevolucaoType={devolucao.deleteDevolucaoType}
        deletingDevolucao={devolucao.deletingDevolucao}
        onConfirm={devolucao.handleDeleteDevolucao}
      />

      {/* Modal de Mover Remessa */}
      <MoveRemessaModal
        isOpen={modals.showMoveRemessaModal}
        onClose={modals.handleCloseMoveRemessa}
        remessaData={modals.remessaToMove}
        onMoveToDevolucao={handleMoveToDevolucao}
        onMoveToCobrarBase={handleMoveToCobrarBase}
        loading={modals.movingRemessa}
      />

      {/* Modal de Filtros de Colunas */}
      <FiltrosColunasModal
        isOpen={modals.showFiltrosColunasModal}
        isClosing={modals.isClosingFiltrosColunas}
        onClose={modals.handleCloseFiltrosColunas}
        selectedBaseEntregaFiltro={selectedBaseEntregaFiltro}
        setSelectedBaseEntregaFiltro={setSelectedBaseEntregaFiltro}
        opcoesBaseEntrega={opcoesBaseEntrega}
        dadosFiltradosColunas={dadosFiltradosColunas}
        tableColumnsFiltros={tableColumnsFiltros}
        selectedRows={rowSelection.selectedRows}
        renderCellContent={renderCellContent}
        renderHeader={renderHeader}
        onCopyRemessasFiltradas={handleCopyRemessasFiltradas}
        onOpenQRCodeModal={() => modals.setShowQRCodeModal(true)}
        onLoadDevolucaoQRCodes={handleLoadDevolucaoQRCodes}
        loadingDevolucao={devolucao.loadingDevolucao}
        onOpenLotes1000={() => modals.setShowLotesModal1000Filtros(true)}
        remessasLotes1000={remessasLotes1000Filtros}
      />

      {/* Modal de Lotes 1000 (do Filtros de Colunas) */}
      <LotesFiltrosModal
        isOpen={modals.showLotesModal1000Filtros}
        onClose={() => modals.setShowLotesModal1000Filtros(false)}
        remessasLotes={remessasLotes1000Filtros}
        remessasUnicas={dadosFiltradosColunas}
        onCopyLote={handleCopyLote}
        tamanhoLote={1000}
      />
    </div>
  )
}

export default SemMovimentacaoSC
