import React from 'react'
import { IoRefresh, IoTrash, IoHourglass } from 'react-icons/io5'
import ScreenshotButton from '../ScreenshotButton/ScreenshotButton'
import FileImport from '../FileImport/FileImport'
import SearchInput from '../../../PedidosRetidos/components/SearchInput/SearchInput'
import D1LotesButton from '../D1LotesButton/D1LotesButton'
import D1Filters from '../D1Filters/D1Filters'
import { API_ENDPOINTS, CONFIG } from '../../constants/D1Constants'
import { calculateStats } from '../../utils/dataTransformers'

const D1BipagensHeader = ({
  d1ContentRef,
  loadingBasesBipagens,
  deletingBipagens,
  selectedBasesBipagens,
  selectedTemposParados,
  motoristasData,
  filteredMotoristasData,
  searchText,
  setSearchText,
  limparCache,
  carregarBasesETempos,
  carregarMotoristas,
  showSuccess,
  showError,
  api,
  setSelectedBasesBipagens,
  onDeleteClick,
  // Props para D1LotesButton
  loadingPedidosBipagens,
  buscarPedidosBipagens,
  showLotesDropdown,
  numerosPedidosBipagens,
  setShowLotesDropdown,
  // Props para D1Filters
  saveBasesEnabled,
  setSaveBasesEnabled,
  saveTemposEnabled,
  setSaveTemposEnabled,
  setSelectedTemposParados,
  cidadesData,
  loadingCidades,
  selectedCidades,
  setSelectedCidades,
  basesBipagens,
  temposParados
}) => {
  const handleRefresh = () => {
    limparCache()
    carregarBasesETempos()
    if (selectedBasesBipagens.length > 0) {
      carregarMotoristas()
    }
  }

  const handleDeleteAll = () => {
    onDeleteClick()
  }

  const handleUpdateStatusSuccess = (result) => {
    if (result.success) {
      showSuccess(
        `✅ Atualização concluída!\n\n` +
        `Processados: ${result.total_processados?.toLocaleString('pt-BR') || 0}\n` +
        `Atualizados: ${result.total_atualizados?.toLocaleString('pt-BR') || 0}\n` +
        `Não encontrados: ${result.total_nao_encontrados?.toLocaleString('pt-BR') || 0}${result.total_erros > 0 ? `\nErros: ${result.total_erros}` : ''}`
      )
      limparCache()
      setTimeout(() => {
        carregarBasesETempos()
        if (selectedBasesBipagens.length > 0) {
          carregarMotoristas()
        }
      }, CONFIG.CACHE_RELOAD_DELAY)
    }
  }

  // Calcular estatísticas
  const dataToUse = filteredMotoristasData.length > 0 ? filteredMotoristasData : motoristasData
  const stats = calculateStats(dataToUse)

  return (
    <div className="d1-table-header">
      <div className="d1-table-title-section">
        <h3 className="d1-table-title">
          Pedidos Retidos Bipagens em Tempo Real {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </h3>
        <p className="d1-table-subtitle">
          📊 Dados agrupados por Motorista das bases selecionadas!
        </p>
        <div className="d1-table-info">
          <div className="d1-info-item">
            <span className="d1-info-label">Total de Pedidos:</span>
            <span className="d1-info-value">{stats.totalPedidos.toLocaleString('pt-BR')}</span>
          </div>
          <div className="d1-info-item">
            <span className="d1-info-label">Motoristas:</span>
            <span className="d1-info-value">{dataToUse.length}</span>
          </div>
          <div className="d1-info-item">
            <span className="d1-info-label">Bases Filtradas:</span>
            <span className="d1-info-value">{selectedBasesBipagens.length > 0 ? selectedBasesBipagens.length : 'Todas'}</span>
          </div>
          <div className="d1-info-item">
            <span className="d1-info-label">Tempos Parados:</span>
            <span className="d1-info-value">{selectedTemposParados.length > 0 ? selectedTemposParados.length : 'Todos'}</span>
          </div>
        </div>
        <SearchInput
          value={searchText}
          onChange={setSearchText}
          placeholder="Pesquisar motorista, base, número..."
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "flex-end" }}>
          <ScreenshotButton
            targetRef={d1ContentRef}
            filename="d1-screenshot"
            excludeSelectors={['footer', '.footer', '#footer', '[class*="footer"]', '[id*="footer"]']}
            openPrintDialog={false}
            onSuccess={(message) => showSuccess(message)}
            onError={(message) => showError(message)}
            title="Capturar Screenshot do conteúdo"
            size="medium"
          />
          <button
            className="d1-btn-refresh"
            onClick={handleRefresh}
            disabled={loadingBasesBipagens}
            title="Atualizar dados"
          >
            <IoRefresh size={24} />
          </button>
          <button
            className="d1-btn-delete"
            onClick={handleDeleteAll}
            disabled={deletingBipagens || loadingBasesBipagens}
            title="Deletar todos os dados de bipagens"
          >
            {deletingBipagens ? (
              <IoHourglass size={24} className="spinning" />
            ) : (
              <IoTrash size={24} />
            )}
          </button>
          <FileImport
            endpoint={API_ENDPOINTS.ATUALIZAR_STATUS}
            title="Atualizar Status"
            acceptedFormats=".xlsx,.xls"
            onSuccess={handleUpdateStatusSuccess}
            onError={(error) => {
              showError(`Erro ao atualizar marca de assinatura: ${error.message || 'Erro desconhecido'}`)
            }}
          />
        </div>
        <div className="d1-header-filters-lotes">
          <D1Filters
            saveBasesEnabled={saveBasesEnabled}
            setSaveBasesEnabled={setSaveBasesEnabled}
            selectedBasesBipagens={selectedBasesBipagens}
            setSelectedBasesBipagens={setSelectedBasesBipagens}
            basesBipagens={basesBipagens}
            loadingBasesBipagens={loadingBasesBipagens}
            selectedTemposParados={selectedTemposParados}
            setSelectedTemposParados={setSelectedTemposParados}
            temposParados={temposParados}
            saveTemposEnabled={saveTemposEnabled}
            setSaveTemposEnabled={setSaveTemposEnabled}
            selectedCidades={selectedCidades}
            setSelectedCidades={setSelectedCidades}
            cidadesData={cidadesData}
            loadingCidades={loadingCidades}
          />
          <D1LotesButton
            loadingPedidosBipagens={loadingPedidosBipagens}
            selectedBasesBipagens={selectedBasesBipagens}
            buscarPedidosBipagens={buscarPedidosBipagens}
            showLotesDropdown={showLotesDropdown}
            numerosPedidosBipagens={numerosPedidosBipagens}
            selectedTemposParados={selectedTemposParados}
            setShowLotesDropdown={setShowLotesDropdown}
            showSuccess={showSuccess}
            showError={showError}
          />
        </div>
        
        {/* Legenda dos Marcadores de Status */}
        <div className="d1-status-legend">
          <span className="d1-status-legend-title">Legenda:</span>
          <div className="d1-status-legend-items">
            <div className="d1-status-legend-item">
              <button className="pr-status-btn pr-entregue active"></button>
              <span>Retornou</span>
            </div>
            <div className="d1-status-legend-item">
              <button className="pr-status-btn pr-nao-entregue active"></button>
              <span>Não retornou</span>
            </div>
            <div className="d1-status-legend-item">
              <button className="pr-status-btn pr-anulado active"></button>
              <span>Esperando retorno</span>
            </div>
            <div className="d1-status-legend-item">
              <button className="pr-status-btn pr-resolvido active"></button>
              <span>Número de contato errado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default D1BipagensHeader

