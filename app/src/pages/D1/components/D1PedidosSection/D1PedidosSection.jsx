import React, { useState, useEffect } from 'react'
import { CONFIG } from '../../constants/D1Constants'

const D1PedidosSection = ({
  numerosPedidos,
  loadingPedidos,
  selectedBases,
  showSuccess,
  showError,
  showInfo,
  showLotes,
  setShowLotes
}) => {

  const handleCopyLote = async (lotePedidos, numeroLote) => {
    try {
      await navigator.clipboard.writeText(lotePedidos.join('\n'))
      showSuccess(`✅ Lote ${numeroLote} copiado! ${lotePedidos.length.toLocaleString('pt-BR')} pedidos`)
    } catch (error) {
      showError(`Erro ao copiar lote: ${error.message}`)
    }
  }

  const generateLotes = () => {
    const totalLotes = Math.ceil(numerosPedidos.length / CONFIG.LOTES_SIZE)
    const botoes = []

    for (let i = 0; i < totalLotes; i++) {
      const inicio = i * CONFIG.LOTES_SIZE
      const fim = Math.min(inicio + CONFIG.LOTES_SIZE, numerosPedidos.length)
      const lotePedidos = numerosPedidos.slice(inicio, fim)
      const numeroLote = i + 1

      botoes.push(
        <div key={i} className="d1-lote-card">
          <button
            className="d1-btn-copy-lote"
            onClick={() => handleCopyLote(lotePedidos, numeroLote)}
            title={`Copiar ${lotePedidos.length.toLocaleString('pt-BR')} pedidos do lote ${numeroLote}`}
          >
            <p>Copiar {lotePedidos.length.toLocaleString('pt-BR')} pedidos</p>
          </button>
        </div>
      )
    }

    return botoes
  }

  // Não renderizar nada - lotes agora são exibidos no ConfigModal
  return null
}

export default D1PedidosSection

