import React, { useState, useCallback, useMemo, lazy, Suspense } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { useExpedidoNaoChegouData } from './hooks/useExpedidoNaoChegouData'
import { useExpedidoNaoChegouFilters } from './hooks/useExpedidoNaoChegouFilters'
import { useRemessasUnicas } from './hooks/useRemessasUnicas'
import { usePagination } from './hooks/usePagination'
import { useRowSelection } from './hooks/useRowSelection'
import { useTableColumns } from './hooks/useTableColumns'
import { useAllRemessas } from './hooks/useAllRemessas'
import { useLotes } from './hooks/useLotes'
import FileImport from './components/FileImport/FileImport'
import QRCodeModal from './components/QRCodeModal/QRCodeModal'
import LotesModal from './components/LotesModal/LotesModal'
import Table from './components/Table/Table'
import api from '../../services/api'
import './ExpedidoNaoChegou.css'

const ConfirmModal = lazy(() => import('../../components/ConfirmModal/ConfirmModal'))

const ExpedidoNaoChegou = () => {
  const { showSuccess, showError } = useNotification()
  
  // Buscar dados
  const { data, loading: dataLoading, error, total, refetch } = useExpedidoNaoChegouData()
  
  // Buscar filtros
  const { basesEntrega, status, loading: filtersLoading } = useExpedidoNaoChegouFilters()
  
  // Agrupar dados por remessa
  const remessasUnicas = useRemessasUnicas(data)
  
  // Paginação
  const itemsPerPage = 1000
  const pagination = usePagination(remessasUnicas, itemsPerPage)
  
  // Seleção de linhas
  const rowSelection = useRowSelection(pagination.displayedData)
  
  // Colunas da tabela
  const tableColumns = useTableColumns(remessasUnicas)
  
  // Hook para buscar todas as remessas
  const { fetchAllRemessas, loading: loadingRemessas } = useAllRemessas()
  
  // Estados
  const [showQRCodeModal, setShowQRCodeModal] = useState(false)
  const [allRemessas, setAllRemessas] = useState([])
  const [loadingQRRemessas, setLoadingQRRemessas] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingData, setDeletingData] = useState(false)
  const [showLotesModal1000, setShowLotesModal1000] = useState(false)
  const [showLotesModal500, setShowLotesModal500] = useState(false)
  
  // Gerar lotes
  const remessasLotes1000 = useLotes(remessasUnicas, 1000)
  const remessasLotes500 = useLotes(remessasUnicas, 500)
  
  // Handlers
  const handleUploadSuccess = useCallback((response) => {
    showSuccess('Arquivo importado com sucesso!')
    refetch()
  }, [showSuccess, refetch])
  
  const handleUploadError = useCallback((error) => {
    showError(error.message || 'Erro ao importar arquivo')
  }, [showError])
  
  const handleOpenQRCodeModal = useCallback(async () => {
    setLoadingQRRemessas(true)
    try {
      const result = await fetchAllRemessas()
      if (result.success && result.remessas.length > 0) {
        setAllRemessas(result.remessas)
        setShowQRCodeModal(true)
        showSuccess(`${result.remessas.length} remessa(s) carregada(s) para QR Codes!`)
      } else {
        showError('Nenhuma remessa encontrada no banco de dados')
      }
    } catch (err) {
      showError('Erro ao carregar remessas para QR Codes')
    } finally {
      setLoadingQRRemessas(false)
    }
  }, [fetchAllRemessas, showSuccess, showError])
  
  // Remessas ordenadas para o modal
  const remessasSorted = useMemo(() => {
    return [...allRemessas].sort()
  }, [allRemessas])
  
  // Copiar remessas selecionadas
  const handleCopyRemessas = useCallback(() => {
    if (rowSelection.selectedRows.size === 0) {
      showError('Selecione pelo menos uma remessa')
      return
    }
    const remessasText = Array.from(rowSelection.selectedRows).join('\n')
    navigator.clipboard.writeText(remessasText)
    showSuccess(`${rowSelection.selectedRows.size} remessa(s) copiada(s)!`)
  }, [rowSelection.selectedRows, showSuccess, showError])
  
  // Copiar lote
  const handleCopyLote = useCallback((lote) => {
    const remessasText = lote.remessas.join('\n')
    navigator.clipboard.writeText(remessasText)
    showSuccess(`${lote.total_remessas} remessa(s) do lote ${lote.numero_lote} copiada(s)!`)
  }, [showSuccess])
  
  // Handler para deletar todos os dados
  const handleDeleteAllData = useCallback(async () => {
    setDeletingData(true)
    try {
      const response = await api.delete('/expedido-nao-chegou/clear')
      if (response.data.success) {
        const deleted = response.data.deleted
        showSuccess(
          `✅ Dados limpos com sucesso!\n\n` +
          `Documentos principais removidos: ${deleted.main_documents?.toLocaleString('pt-BR') || 0}\n` +
          `Chunks removidos: ${deleted.chunks?.toLocaleString('pt-BR') || 0}\n` +
          `Total: ${deleted.total?.toLocaleString('pt-BR') || 0} documentos`
        )
        // Recarregar dados após limpeza
        refetch()
        setShowDeleteModal(false)
      }
    } catch (error) {
      showError(`Erro ao limpar dados: ${error.response?.data?.detail || error.message || 'Erro desconhecido'}`)
    } finally {
      setDeletingData(false)
    }
  }, [showSuccess, showError, refetch])
  
  const isLoading = filtersLoading || dataLoading
  
  return (
    <div className="expedido-nao-chegou">
      <div className="expedido-nao-chegou-header">
        <h1>Expedido e Não Chegou</h1>
        <div className="expedido-nao-chegou-actions">
          <FileImport
            endpoint="/expedido-nao-chegou/upload"
            title="Importar Tabela"
            onSuccess={handleUploadSuccess}
            onError={handleUploadError}
          />
          <button
            className="expedido-nao-chegou-qr-btn"
            onClick={handleOpenQRCodeModal}
            disabled={loadingQRRemessas || remessasUnicas.length === 0}
          >
            {loadingQRRemessas ? (
              <>⏳ Carregando...</>
            ) : (
              <>QR Codes ({remessasUnicas.length})</>
            )}
          </button>
          <button
            className="expedido-nao-chegou-delete-btn"
            onClick={() => setShowDeleteModal(true)}
            disabled={deletingData || total === 0}
            title="Deletar todos os dados da coleção"
          >
            🗑️ Deletar Todos os Dados
          </button>
        </div>
      </div>
      
      <div className="expedido-nao-chegou-content">
        {isLoading ? (
          <div className="expedido-nao-chegou-loading">
            <p>Carregando dados...</p>
          </div>
        ) : error ? (
          <div className="expedido-nao-chegou-error">
            <p>Erro: {error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="expedido-nao-chegou-empty">
            <p>Nenhum dado encontrado. Importe um arquivo para começar.</p>
          </div>
        ) : (
          <div className="expedido-nao-chegou-table-container">
            <div className="expedido-nao-chegou-table-header-section">
              <div className="expedido-nao-chegou-table-header-info">
                <h2>Dados de Expedido e Não Chegou</h2>
                <span className="expedido-nao-chegou-table-total">
                  Total: {total} registros | Remessas únicas: {remessasUnicas.length}
                </span>
              </div>
              <div className="expedido-nao-chegou-table-header-actions">
                <button
                  className="expedido-nao-chegou-copy-btn"
                  onClick={handleCopyRemessas}
                  disabled={rowSelection.selectedRows.size === 0}
                  title="Copiar remessas selecionadas"
                >
                  📋 Copiar ({rowSelection.selectedRows.size})
                </button>
                {remessasLotes1000.length > 0 && (
                  <button
                    className="expedido-nao-chegou-lotes-btn"
                    onClick={() => setShowLotesModal1000(true)}
                    title="Ver lotes de 1000 remessas"
                  >
                    📦 Lotes 1000 ({remessasLotes1000.length})
                  </button>
                )}
                {remessasLotes500.length > 0 && (
                  <button
                    className="expedido-nao-chegou-lotes-btn"
                    onClick={() => setShowLotesModal500(true)}
                    title="Ver lotes de 500 remessas"
                  >
                    📦 Lotes 500 ({remessasLotes500.length})
                  </button>
                )}
              </div>
            </div>
            
            <Table
              data={pagination.displayedData}
              columns={tableColumns}
              onRowSelect={rowSelection.toggleRow}
              selectedRows={rowSelection.selectedRows}
              isAllSelected={rowSelection.isAllSelected()}
              onSelectAll={(checked) => checked ? rowSelection.selectAll() : rowSelection.deselectAll()}
            />
            
            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="expedido-nao-chegou-pagination">
                <button
                  className="expedido-nao-chegou-pagination-btn"
                  onClick={pagination.goToPreviousPage}
                  disabled={pagination.currentPage === 1}
                  title="Página anterior"
                >
                  ‹ Anterior
                </button>
                
                <div className="expedido-nao-chegou-pagination-info">
                  Página <strong>{pagination.currentPage}</strong> de <strong>{pagination.totalPages}</strong>
                  <span className="expedido-nao-chegou-pagination-detail">
                    (Mostrando {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} a {Math.min(pagination.currentPage * pagination.itemsPerPage, remessasUnicas.length)} de {remessasUnicas.length} remessa(s))
                  </span>
                </div>
                
                <button
                  className="expedido-nao-chegou-pagination-btn"
                  onClick={pagination.goToNextPage}
                  disabled={pagination.currentPage === pagination.totalPages}
                  title="Próxima página"
                >
                  Próxima ›
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Modal de QR Codes */}
      <QRCodeModal
        isOpen={showQRCodeModal}
        onClose={() => setShowQRCodeModal(false)}
        remessas={remessasSorted}
      />
      
      {/* Modal de confirmação para limpar dados */}
      <Suspense fallback={null}>
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAllData}
          title="⚠️ Limpar TODOS os Dados de Expedido e Não Chegou?"
          message="Esta ação irá deletar TODOS os dados das coleções expedido_nao_chegou e expedido_nao_chegou_chunks."
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
    </div>
  )
}

export default ExpedidoNaoChegou

