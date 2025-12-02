import { useCallback } from 'react'
import { IoDocumentTextOutline } from 'react-icons/io5'
import { MOTORISTA_STATUS } from '../constants/D1Constants'
import api from '../../../services/api'

/**
 * Hook para renderização de células da tabela de motoristas
 */
export const useD1TableRender = ({
  motoristasStatus,
  setMotoristasStatus,
  carregarPedidosMotorista,
  observacoes = {},
  onOpenObservacao = null
}) => {
  const renderCellContent = useCallback((value, key, row) => {
    const isTotalRow = row.Responsável === 'TOTAL'
    
    if (key === 'Total') {
      if (isTotalRow) {
        return (
          <strong style={{ fontSize: '15px', color: '#2d3748' }}>
            {value.toLocaleString('pt-BR')}
          </strong>
        )
      }
      const motorista = row._motorista || row.Responsável
      return (
        <span
          className="stat-number total clickable-stat"
          onClick={() => carregarPedidosMotorista(motorista)}
          title={`Clique para ver todos os pedidos deste motorista`}
          style={{ cursor: 'pointer' }}
        >
          {value.toLocaleString('pt-BR')}
        </span>
      )
    }
    
    if (key === 'Entregues') {
      if (isTotalRow) {
        return (
          <strong className="stat-number entregues" style={{ fontSize: '15px', padding: '6px 12px' }}>
            {value.toLocaleString('pt-BR')}
          </strong>
        )
      }
      return (
        <span
          className="stat-number entregues"
          title=""
        >
          {value.toLocaleString('pt-BR')}
        </span>
      )
    }
    
    if (key === 'Não Entregues') {
      if (isTotalRow) {
        return (
          <strong className="stat-number nao_entregues" style={{ fontSize: '15px', padding: '6px 12px' }}>
            {value.toLocaleString('pt-BR')}
          </strong>
        )
      }
      const motorista = row._motorista || row.Responsável
      return (
        <span
          className="stat-number nao_entregues clickable-stat"
          onClick={() => carregarPedidosMotorista(motorista, 'nao_entregue')}
          title={`Clique para ver apenas os pedidos NÃO ENTREGUES deste motorista`}
          style={{ cursor: 'pointer' }}
        >
          {value.toLocaleString('pt-BR')}
        </span>
      )
    }
    
    if (key === 'Status') {
      if (isTotalRow) {
        return <strong style={{ fontSize: '15px', color: '#2d3748' }}>-</strong>
      }
      
      const motoristaKey = row._motorista || row.Responsável || ''
      const baseKey = row._base || ''
      const statusKey = baseKey ? `${motoristaKey}||${baseKey}` : motoristaKey
      const currentStatus = motoristasStatus[statusKey] || MOTORISTA_STATUS.NAO_CONTATEI

      const handleStatusClick = async (newStatus) => {
        const newStatusValue = currentStatus === newStatus ? null : newStatus

        // Atualizar estado local
        setMotoristasStatus(prev => {
          const updated = {
            ...prev,
            [statusKey]: newStatusValue
          }
          // Salvar no localStorage
          localStorage.setItem('d1-bipagens-status', JSON.stringify(updated))
          return updated
        })

        // Salvar no backend
        try {
          await api.post(`/d1/bipagens/motorista/${encodeURIComponent(motoristaKey)}/status`, {
            status: newStatusValue,
            motorista: motoristaKey,
            base: baseKey
          })
        } catch (error) {
          // Erro silencioso ao salvar status
        }
      }

      // Verificar se há observação para este motorista
      const hasObservacao = observacoes[statusKey] && observacoes[statusKey].trim() !== ''
      
      return (
        <div className="pr-status-markers">
          <div className="pr-status-marker-wrapper">
            <button
              className={`pr-status-btn pr-entregue ${currentStatus === MOTORISTA_STATUS.OK ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusClick(MOTORISTA_STATUS.OK)
              }}
              title="Retornou"
            />
            {currentStatus === MOTORISTA_STATUS.OK && onOpenObservacao && (
              <button
                className={`pr-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenObservacao(statusKey, motoristaKey, baseKey, MOTORISTA_STATUS.OK, observacoes[statusKey] || '')
                }}
                title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
              >
                <IoDocumentTextOutline size={14} />
              </button>
            )}
          </div>

          <div className="pr-status-marker-wrapper">
            <button
              className={`pr-status-btn pr-nao-entregue ${currentStatus === MOTORISTA_STATUS.NAO_RETORNOU ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusClick(MOTORISTA_STATUS.NAO_RETORNOU)
              }}
              title="Não retornou"
            />
            {currentStatus === MOTORISTA_STATUS.NAO_RETORNOU && onOpenObservacao && (
              <button
                className={`pr-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenObservacao(statusKey, motoristaKey, baseKey, MOTORISTA_STATUS.NAO_RETORNOU, observacoes[statusKey] || '')
                }}
                title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
              >
                <IoDocumentTextOutline size={14} />
              </button>
            )}
          </div>

          <div className="pr-status-marker-wrapper">
            <button
              className={`pr-status-btn pr-anulado ${currentStatus === MOTORISTA_STATUS.PENDENTE ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusClick(MOTORISTA_STATUS.PENDENTE)
              }}
              title="Esperando retorno"
            />
            {currentStatus === MOTORISTA_STATUS.PENDENTE && onOpenObservacao && (
              <button
                className={`pr-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenObservacao(statusKey, motoristaKey, baseKey, MOTORISTA_STATUS.PENDENTE, observacoes[statusKey] || '')
                }}
                title={hasObservacao ? "Ver/Editar observação" : "Adicionar observação"}
              >
                <IoDocumentTextOutline size={14} />
              </button>
            )}
          </div>

          <div className="pr-status-marker-wrapper">
            <button
              className={`pr-status-btn pr-resolvido ${currentStatus === MOTORISTA_STATUS.NUMERO_ERRADO ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation()
                handleStatusClick(MOTORISTA_STATUS.NUMERO_ERRADO)
              }}
              title="Número de contato errado"
            />
            {currentStatus === MOTORISTA_STATUS.NUMERO_ERRADO && onOpenObservacao && (
              <button
                className={`pr-status-obs-btn ${hasObservacao ? 'has-observacao' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenObservacao(statusKey, motoristaKey, baseKey, MOTORISTA_STATUS.NUMERO_ERRADO, observacoes[statusKey] || '')
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
    
    if (isTotalRow && key === 'Responsável') {
      return <strong style={{ fontSize: '15px', color: '#2d3748' }}>{value}</strong>
    }
    
    return value
  }, [motoristasStatus, setMotoristasStatus, carregarPedidosMotorista, observacoes, onOpenObservacao])

  return { renderCellContent }
}

