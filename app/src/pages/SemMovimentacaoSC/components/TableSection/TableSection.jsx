import React from 'react'
import Table from '../../../PedidosRetidos/components/Table/Table'
import './TableSection.css'

const TableSection = ({
  displayedData,
  tableColumns,
  total,
  remessasUnicas,
  currentPage,
  totalPages,
  itemsPerPage,
  goToPreviousPage,
  goToNextPage,
  renderCellContent,
  renderHeader,
  onCopyRemessas,
  onOpenLotes1000,
  onOpenLotes500,
  onOpenFiltrosColunas,
  remessasLotes1000,
  remessasLotes500
}) => {
  return (
    <div className="table-section-container">
      <div className="table-section-header">
        <div className="table-section-header-content">
          <h2>Dados de Sem Movimentação SC</h2>
          <span className="table-section-total">
            Total: {total} remessa(s)
          </span>
        </div>
        <div className="table-section-header-actions">
          <button
            className="table-section-copy-btn"
            onClick={onCopyRemessas}
            title="Copiar todos os números de remessa"
          >
            📋 Copiar Remessas
          </button>
          {remessasLotes1000.length > 0 && (
            <button
              className="table-section-lotes-btn"
              onClick={onOpenLotes1000}
              title="Ver lotes de 1000 remessas"
            >
              📦 Lotes 1000 ({remessasLotes1000.length})
            </button>
          )}
          {remessasLotes500.length > 0 && (
            <button
              className="table-section-lotes-btn"
              onClick={onOpenLotes500}
              title="Ver lotes de 500 remessas"
            >
              📦 Lotes 500 ({remessasLotes500.length})
            </button>
          )}
          <button
            className="table-section-filtros-btn"
            onClick={onOpenFiltrosColunas}
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
      <div className="table-section-footer">
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="table-section-pagination">
            <button
              className="table-section-pagination-btn"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              title="Página anterior"
            >
              ‹ Anterior
            </button>
            
            <div className="table-section-pagination-info">
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
              <span className="table-section-pagination-detail">
                (Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, remessasUnicas.length)} de {remessasUnicas.length} remessa(s))
              </span>
            </div>
            
            <button
              className="table-section-pagination-btn"
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
  )
}

export default TableSection

