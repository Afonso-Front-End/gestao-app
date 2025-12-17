import React from 'react'
import FilterSection from '../FilterSection/FilterSection'
import TableSection from '../TableSection/TableSection'
import LoadingState from '../../../../components/LoadingState/LoadingState'
import EmptyState from '../EmptyState/EmptyState'
import './SemMovimentacaoSCContent.css'

const SemMovimentacaoSCContent = ({
  selectedTiposOperacao,
  setSelectedTiposOperacao,
  tiposOperacao,
  selectedAgings,
  setSelectedAgings,
  agings,
  filtersLoading,
  isLoading,
  error,
  hasFilters,
  data,
  pagination,
  tableColumns,
  total,
  remessasUnicas,
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
    <div className="sem-movimentacao-sc-content">
      {/* Filtros */}
      <FilterSection
        selectedTiposOperacao={selectedTiposOperacao}
        setSelectedTiposOperacao={setSelectedTiposOperacao}
        tiposOperacao={tiposOperacao}
        selectedAgings={selectedAgings}
        setSelectedAgings={setSelectedAgings}
        agings={agings}
        filtersLoading={filtersLoading}
      />

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
        <TableSection
          displayedData={pagination.displayedData}
          tableColumns={tableColumns}
          total={total}
          remessasUnicas={remessasUnicas}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          itemsPerPage={pagination.itemsPerPage}
          goToPreviousPage={pagination.goToPreviousPage}
          goToNextPage={pagination.goToNextPage}
          renderCellContent={renderCellContent}
          renderHeader={renderHeader}
          onCopyRemessas={onCopyRemessas}
          onOpenLotes1000={onOpenLotes1000}
          onOpenLotes500={onOpenLotes500}
          onOpenFiltrosColunas={onOpenFiltrosColunas}
          remessasLotes1000={remessasLotes1000}
          remessasLotes500={remessasLotes500}
        />
      )}
    </div>
  )
}

export default SemMovimentacaoSCContent

