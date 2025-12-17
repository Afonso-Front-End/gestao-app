import React from 'react'
import MultiSelect from '../../../PedidosRetidos/components/MultiSelect'
import Table from '../../../PedidosRetidos/components/Table/Table'
import './FiltrosColunasModal.css'

const FiltrosColunasModal = ({
  isOpen,
  isClosing,
  onClose,
  selectedBaseEntregaFiltro,
  setSelectedBaseEntregaFiltro,
  opcoesBaseEntrega,
  dadosFiltradosColunas,
  tableColumnsFiltros,
  selectedRows,
  renderCellContent,
  renderHeader,
  onCopyRemessasFiltradas,
  onOpenQRCodeModal,
  onLoadDevolucaoQRCodes,
  loadingDevolucao,
  onOpenLotes1000,
  remessasLotes1000
}) => {
  if (!isOpen && !isClosing) return null

  return (
    <div className={`sem-movimentacao-sc-filtros-colunas-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="sem-movimentacao-sc-filtros-colunas-modal">
        <div className="sem-movimentacao-sc-filtros-colunas-modal-header">
          <h2>Filtros de Colunas</h2>
          <button
            className="sem-movimentacao-sc-filtros-colunas-modal-close"
            onClick={onClose}
            title="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="sem-movimentacao-sc-filtros-colunas-modal-content">
          <div className="sem-movimentacao-sc-filtros-colunas-filters">
            <div className="filtros-colunas-select-item">
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
                  <button
                    className="sem-movimentacao-sc-copy-remessas-btn"
                    onClick={onCopyRemessasFiltradas}
                    title="Copiar todos os números de remessa filtrados"
                  >
                    📋 Copiar Remessas
                  </button>
                  {remessasLotes1000 && remessasLotes1000.length > 0 && (
                    <button
                      className="sem-movimentacao-sc-lotes-btn"
                      onClick={onOpenLotes1000}
                      title="Ver lotes de 1000 remessas"
                    >
                      📦 Lotes 1000 ({remessasLotes1000.length})
                    </button>
                  )}
                  {selectedRows.size > 0 && (
                    <button
                      className="sem-movimentacao-sc-qrcode-btn"
                      onClick={onOpenQRCodeModal}
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
                    onClick={onLoadDevolucaoQRCodes}
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
  )
}

export default FiltrosColunasModal

