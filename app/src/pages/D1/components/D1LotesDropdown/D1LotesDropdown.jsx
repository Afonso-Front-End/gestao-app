import React from 'react'
import { CONFIG } from '../../constants/D1Constants'

const D1LotesDropdown = ({
  showLotesDropdown,
  numerosPedidosBipagens,
  selectedBasesBipagens,
  selectedTemposParados,
  setShowLotesDropdown,
  showSuccess,
  showError
}) => {
  if (!showLotesDropdown || numerosPedidosBipagens.length === 0) return null

  const handleCopyLote = async (lotePedidos, numeroLote) => {
    try {
      await navigator.clipboard.writeText(lotePedidos.join('\n'))
      showSuccess(`✅ Lote ${numeroLote} copiado! ${lotePedidos.length.toLocaleString('pt-BR')} pedidos`)
    } catch (error) {
      showError(`Erro ao copiar lote: ${error.message}`)
    }
  }

  const generateLotes = () => {
    const totalLotes = Math.ceil(numerosPedidosBipagens.length / CONFIG.LOTES_SIZE)
    const botoes = []

    for (let i = 0; i < totalLotes; i++) {
      const inicio = i * CONFIG.LOTES_SIZE
      const fim = Math.min(inicio + CONFIG.LOTES_SIZE, numerosPedidosBipagens.length)
      const lotePedidos = numerosPedidosBipagens.slice(inicio, fim)
      const numeroLote = i + 1

      botoes.push(
        <button
          key={i}
          className="d1-btn-copy-lote-dropdown"
          onClick={() => handleCopyLote(lotePedidos, numeroLote)}
          title={`Copiar ${lotePedidos.length.toLocaleString('pt-BR')} pedidos do lote ${numeroLote}`}
        >
          📋 Lote {numeroLote}
          <span className="d1-lote-count-badge">({lotePedidos.length.toLocaleString('pt-BR')})</span>
        </button>
      )
    }

    return botoes
  }

  return (
    <div className="d1-lotes-dropdown">
      <div className="d1-lotes-dropdown-header">
        <div className="d1-lotes-dropdown-title-section">
          <span className="d1-lotes-dropdown-title">
            {numerosPedidosBipagens.length.toLocaleString('pt-BR')} pedidos em {Math.ceil(numerosPedidosBipagens.length / CONFIG.LOTES_SIZE)} lote(s)
          </span>
          <div className="d1-lotes-dropdown-filters">
            <span className="d1-lotes-filter-badge">
              Bases: {selectedBasesBipagens.length}
            </span>
            {selectedTemposParados.length > 0 && (
              <span className="d1-lotes-filter-badge">
                Tempos: {selectedTemposParados.length}
              </span>
            )}
          </div>
        </div>
        <button
          className="d1-lotes-dropdown-close"
          onClick={() => setShowLotesDropdown(false)}
          title="Fechar dropdown"
        >
          ✕
        </button>
      </div>
      <div className="d1-lotes-dropdown-content">
        {generateLotes()}
      </div>
    </div>
  )
}

export default D1LotesDropdown

