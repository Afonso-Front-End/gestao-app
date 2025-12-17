import React, { memo, useCallback } from 'react'
import './QRCodeDevolucaoHeader.css'

const QRCodeDevolucaoHeader = memo(({
  basesDevolucao,
  selectedBaseDevolucao,
  onBaseChange,
  loadingBasesDevolucao,
  loadingDevolucao,
  onDeleteAll,
  onDeleteBase,
  deletingDevolucao
}) => {
  const handleDeleteAllClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    onDeleteAll()
  }, [onDeleteAll])

  const handleDeleteBaseClick = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (selectedBaseDevolucao && selectedBaseDevolucao.length > 0 && selectedBaseDevolucao[0]) {
      onDeleteBase(selectedBaseDevolucao[0])
    }
  }, [onDeleteBase, selectedBaseDevolucao])

  const handleBaseSelectChange = useCallback((e) => {
    const selectedValue = e.target.value
    if (selectedValue === '') {
      onBaseChange([])
    } else {
      onBaseChange([selectedValue])
    }
  }, [onBaseChange])

  const selectedBase = selectedBaseDevolucao && selectedBaseDevolucao.length > 0 ? selectedBaseDevolucao[0] : ''

  return (
    <div className="sem-movimentacao-sc-qrcode-devolucao-header-content">
      <div className="sem-movimentacao-sc-qrcode-devolucao-filter-group">
        <label htmlFor="base-devolucao-select">Filtrar por Base de Entrega</label>
        <select
          id="base-devolucao-select"
          value={selectedBase}
          onChange={handleBaseSelectChange}
          disabled={loadingBasesDevolucao || loadingDevolucao}
          className="sem-movimentacao-sc-base-select"
        >
          <option value="">Todas as bases</option>
          {basesDevolucao.map((base) => (
            <option key={base} value={base}>
              {base}
            </option>
          ))}
        </select>
      </div>
      <div className="sem-movimentacao-sc-qrcode-devolucao-actions">
        <button
          className="sem-movimentacao-sc-delete-devolucao-btn"
          onClick={handleDeleteAllClick}
          title="Deletar todas as devoluções"
          disabled={loadingDevolucao || deletingDevolucao}
          type="button"
        >
          🗑️ Deletar Todas
        </button>
        {selectedBase && (
          <button
            className="sem-movimentacao-sc-delete-devolucao-btn base"
            onClick={handleDeleteBaseClick}
            title={`Deletar devoluções da base "${selectedBase}"`}
            disabled={loadingDevolucao || deletingDevolucao}
            type="button"
          >
            🗑️ Deletar Base ({selectedBase})
          </button>
        )}
      </div>
    </div>
  )
})

QRCodeDevolucaoHeader.displayName = 'QRCodeDevolucaoHeader'

export default QRCodeDevolucaoHeader
