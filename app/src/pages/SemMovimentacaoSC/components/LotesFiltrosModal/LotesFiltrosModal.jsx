import React, { useState, useCallback, useEffect } from 'react'
import './LotesFiltrosModal.css'

const LotesFiltrosModal = ({ isOpen, onClose, remessasLotes, remessasUnicas, onCopyLote, tamanhoLote = 1000 }) => {
  const [isClosing, setIsClosing] = useState(false)

  // Função para fechar com animação
  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 250) // Tempo da animação
  }, [onClose])

  // Resetar estado de fechamento quando abrir
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  if (!isOpen && !isClosing) return null

  return (
    <div className={`lotes-filtros-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="lotes-filtros-modal">
        <div className="lotes-filtros-modal-header">
          <h2>Lotes de Remessas Filtradas ({tamanhoLote} por lote)</h2>
          <button
            className="lotes-filtros-modal-close"
            onClick={handleClose}
            title="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="lotes-filtros-modal-content">
          <p className="lotes-filtros-modal-info">
            Total: {remessasUnicas.length.toLocaleString('pt-BR')} remessa(s) filtrada(s) divididas em {remessasLotes.length} lote(s) de {tamanhoLote}
          </p>
          
          <div className="lotes-filtros-grid">
            {remessasLotes.map((lote) => (
              <div key={lote.numero_lote} className="lote-filtros-card">
                <button
                  className="lotes-filtros-btn-copy-lote"
                  onClick={() => onCopyLote(lote)}
                  title={`Copiar ${lote.total_remessas.toLocaleString('pt-BR')} remessa(s) do lote ${lote.numero_lote}`}
                >
                  <p>Lote {lote.numero_lote}</p>
                  <p className="lote-filtros-count">{lote.total_remessas.toLocaleString('pt-BR')} remessa(s)</p>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LotesFiltrosModal




