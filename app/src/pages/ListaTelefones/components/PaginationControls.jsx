import React from 'react'

const PaginationControls = ({ 
  pagination, 
  loading, 
  onPageChange, 
  onPrevious, 
  onNext, 
  canGoPrevious, 
  canGoNext 
}) => {
  if (pagination.totalPages <= 1) {
    return null
  }

  return (
    <>
      {/* Controles de Paginação */}
      <div className="lista-telefones-pagination">
        <button
          className="lista-telefones-pagination-button"
          onClick={onPrevious}
          disabled={!canGoPrevious || loading}
        >
          ← Anterior
        </button>

        <span className="lista-telefones-pagination-info">
          Página {pagination.currentPage} de {pagination.totalPages}
        </span>

        <button
          className="lista-telefones-pagination-button"
          onClick={onNext}
          disabled={!canGoNext || loading}
        >
          Próxima →
        </button>
      </div>

      {/* Informações de registros */}
      <div className="lista-telefones-stats">
        Total: <span className="lista-telefones-stats-highlight">{pagination.totalRecords}</span> registros | 
        <span className="lista-telefones-stats-highlight"> {pagination.limit}</span> por página
      </div>
    </>
  )
}

export default PaginationControls
