import React, { useCallback } from 'react'
import { IoDocumentTextOutline } from 'react-icons/io5'

/**
 * Hook para gerenciar renderização de células da tabela
 * @param {Object} motoristasStatus - Objeto com status dos motoristas
 * @param {Function} atualizarStatus - Função para atualizar status
 * @param {Function} handleMotoristaClick - Handler para clique no motorista
 * @param {Function} handleNaoEntreguesClick - Handler para clique em não entregues
 * @param {Function} onOpenObservacao - Handler para abrir modal de observação
 * @param {Object} observacoes - Objeto com observações salvas
 * @returns {Function} Função renderCellContent
 */
const useTableRender = (
  motoristasStatus,
  atualizarStatus,
  handleMotoristaClick,
  handleNaoEntreguesClick,
  onOpenObservacao,
  observacoes = {}
) => {
  // Constantes de status (atualizadas para corresponder ao servidor)
  const STATUS_OK = 'Retornou'
  const STATUS_NAO_RETORNOU = 'Não retornou'
  const STATUS_PENDENTE = 'Esperando retorno'
  const STATUS_NUMERO_ERRADO = 'Número de contato errado'

  /**
   * Renderiza marcadores de status
   */
  const renderStatusMarkers = useCallback((currentStatus, handleStatusClick, statusKey, motorista, base) => {
    const hasObservacao = observacoes[statusKey] && observacoes[statusKey].trim() !== ''
    
    return (
      <div className="pr-status-markers">
        <div className="pr-status-marker-wrapper">
          <button
            className={`pr-status-btn pr-entregue ${currentStatus === STATUS_OK ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleStatusClick(STATUS_OK)
            }}
            title="Retornou"
          />
          {currentStatus === STATUS_OK && (
            <button
              className={`pr-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onOpenObservacao(statusKey, motorista, base, STATUS_OK, observacoes[statusKey] || '')
              }}
              title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
            >
              <IoDocumentTextOutline size={14} />
            </button>
          )}
        </div>

        <div className="pr-status-marker-wrapper">
          <button
            className={`pr-status-btn pr-nao-entregue ${currentStatus === STATUS_NAO_RETORNOU ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleStatusClick(STATUS_NAO_RETORNOU)
            }}
            title="Não retornou"
          />
          {currentStatus === STATUS_NAO_RETORNOU && (
            <button
              className={`pr-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onOpenObservacao(statusKey, motorista, base, STATUS_NAO_RETORNOU, observacoes[statusKey] || '')
              }}
              title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
            >
              <IoDocumentTextOutline size={14} />
            </button>
          )}
        </div>

        <div className="pr-status-marker-wrapper">
          <button
            className={`pr-status-btn pr-anulado ${currentStatus === STATUS_PENDENTE ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleStatusClick(STATUS_PENDENTE)
            }}
            title="Esperando retorno"
          />
          {currentStatus === STATUS_PENDENTE && (
            <button
              className={`pr-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onOpenObservacao(statusKey, motorista, base, STATUS_PENDENTE, observacoes[statusKey] || '')
              }}
              title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
            >
              <IoDocumentTextOutline size={14} />
            </button>
          )}
        </div>

        <div className="pr-status-marker-wrapper">
          <button
            className={`pr-status-btn pr-resolvido ${currentStatus === STATUS_NUMERO_ERRADO ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleStatusClick(STATUS_NUMERO_ERRADO)
            }}
            title="Número de contato errado"
          />
          {currentStatus === STATUS_NUMERO_ERRADO && (
            <button
              className={`pr-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                onOpenObservacao(statusKey, motorista, base, STATUS_NUMERO_ERRADO, observacoes[statusKey] || '')
              }}
              title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
            >
              <IoDocumentTextOutline size={14} />
            </button>
          )}
        </div>
      </div>
    )
  }, [onOpenObservacao, observacoes, STATUS_OK, STATUS_NAO_RETORNOU, STATUS_PENDENTE, STATUS_NUMERO_ERRADO])

  /**
   * Função principal de renderização de células
   */
  const renderCellContent = useCallback((value, key, row) => {
    // Renderização especial para a coluna Status
    if (key === 'status') {
      const motoristaKey = row.responsavel || row.motorista || ''
      const baseKey = row.base || ''
      // Usar chave composta: motorista + base
      const statusKey = baseKey ? `${motoristaKey}||${baseKey}` : motoristaKey
      const currentStatus = motoristasStatus[statusKey] || null

      const handleStatusClick = async (newStatus) => {
        const newStatusValue = currentStatus === newStatus ? null : newStatus
        await atualizarStatus(statusKey, motoristaKey, baseKey, newStatusValue)
      }

      return renderStatusMarkers(currentStatus, handleStatusClick, statusKey, motoristaKey, baseKey)
    }

    // Formatação especial para números
    if (['total', 'entregues', 'nao_entregues', 'entrada_galpao'].includes(key)) {
      // Garantir que o valor seja um número válido, senão usar 0
      const numericValue = (value && !isNaN(value) && value !== null && value !== undefined)
        ? Number(value)
        : 0

      const isClickable = key === 'total' || key === 'nao_entregues'
      const clickHandler = key === 'total' ? handleMotoristaClick :
        key === 'nao_entregues' ? handleNaoEntreguesClick : undefined
      const title = key === 'total' ? 'Clique para ver todos os pedidos deste motorista' :
        key === 'nao_entregues' ? 'Clique para ver apenas os pedidos NÃO ENTREGUES deste motorista' : ''

      return (
        <span
          className={`stat-number ${key} ${isClickable ? 'clickable-stat' : ''}`}
          onClick={isClickable ? (e) => {
            e.stopPropagation()
            clickHandler(row)
          } : undefined}
          style={isClickable ? { cursor: 'pointer' } : {}}
          title={title}
        >
          {numericValue.toLocaleString('pt-BR')}
        </span>
      )
    }

    // Para outras colunas, também garantir que valores vazios mostrem algo apropriado
    if (value === null || value === undefined || value === '') {
      // Colunas de texto mostram 'N/A', colunas numéricas mostram '0'
      if (key === 'responsavel' || key === 'base') {
        return 'N/A'
      }
      return '0'
    }

    return value
  }, [motoristasStatus, atualizarStatus, handleMotoristaClick, handleNaoEntreguesClick, renderStatusMarkers])

  return renderCellContent
}

export default useTableRender

