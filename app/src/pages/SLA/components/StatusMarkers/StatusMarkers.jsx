import React from 'react'
import { IoDocumentTextOutline } from 'react-icons/io5'
import './StatusMarkers.css'

// Constantes de status
const STATUS_OK = 'Retornou'
const STATUS_NAO_RETORNOU = 'Não retornou'
const STATUS_PENDENTE = 'Esperando retorno'
const STATUS_NUMERO_ERRADO = 'Número de contato errado'

const StatusMarkers = ({
  currentStatus,
  onStatusClick,
  onOpenObservacao,
  hasObservacao = false,
  statusKey,
  motorista,
  base
}) => {
  return (
    <div className="sla-status-markers">
      <div className="sla-status-marker-wrapper">
        <button
          className={`sla-status-btn sla-entregue ${currentStatus === STATUS_OK ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onStatusClick(STATUS_OK)
          }}
          title="Retornou"
        />
        {currentStatus === STATUS_OK && (
          <button
            className={`sla-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onOpenObservacao(statusKey, motorista, base, STATUS_OK)
            }}
            title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
          >
            <IoDocumentTextOutline size={14} />
          </button>
        )}
      </div>

      <div className="sla-status-marker-wrapper">
        <button
          className={`sla-status-btn sla-nao-entregue ${currentStatus === STATUS_NAO_RETORNOU ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onStatusClick(STATUS_NAO_RETORNOU)
          }}
          title="Não retornou"
        />
        {currentStatus === STATUS_NAO_RETORNOU && (
          <button
            className={`sla-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onOpenObservacao(statusKey, motorista, base, STATUS_NAO_RETORNOU)
            }}
            title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
          >
            <IoDocumentTextOutline size={14} />
          </button>
        )}
      </div>

      <div className="sla-status-marker-wrapper">
        <button
          className={`sla-status-btn sla-anulado ${currentStatus === STATUS_PENDENTE ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onStatusClick(STATUS_PENDENTE)
          }}
          title="Esperando retorno"
        />
        {currentStatus === STATUS_PENDENTE && (
          <button
            className={`sla-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onOpenObservacao(statusKey, motorista, base, STATUS_PENDENTE)
            }}
            title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
          >
            <IoDocumentTextOutline size={14} />
          </button>
        )}
      </div>

      <div className="sla-status-marker-wrapper">
        <button
          className={`sla-status-btn sla-resolvido ${currentStatus === STATUS_NUMERO_ERRADO ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onStatusClick(STATUS_NUMERO_ERRADO)
          }}
          title="Número de contato errado"
        />
        {currentStatus === STATUS_NUMERO_ERRADO && (
          <button
            className={`sla-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              onOpenObservacao(statusKey, motorista, base, STATUS_NUMERO_ERRADO)
            }}
            title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
          >
            <IoDocumentTextOutline size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default StatusMarkers

