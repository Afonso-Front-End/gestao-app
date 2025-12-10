import React, { memo } from 'react'
import './EmptyState.css'
import { 
  IoDocumentTextOutline, 
  IoSearchOutline, 
  IoFilterOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

/**
 * Componente de estado vazio local para Sem Movimentação SC
 * @param {string} type - Tipo do estado vazio: 'no-data' | 'no-search' | 'no-filter' | 'error'
 * @param {string} title - Título personalizado
 * @param {string} message - Mensagem personalizada
 * @param {ReactNode} icon - Ícone personalizado
 * @param {function} onAction - Função chamada ao clicar no botão de ação
 * @param {string} actionText - Texto do botão de ação
 */
const EmptyState = memo(({
  type = 'no-data',
  title,
  message,
  icon,
  onAction,
  actionText
}) => {
  // Configurações padrão por tipo (específicas para Sem Movimentação SC)
  const configs = {
    'no-data': {
      icon: <IoDocumentTextOutline />,
      title: 'Nenhum Dado Disponível',
      message: 'Não há informações para exibir no momento. Faça o upload de arquivos ou aplique filtros para visualizar os dados.',
      actionText: 'Fazer Upload',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    'no-search': {
      icon: <IoSearchOutline />,
      title: 'Nenhum Resultado Encontrado',
      message: 'Não encontramos nenhum resultado para sua pesquisa. Tente usar outros termos ou ajustar os filtros.',
      actionText: 'Limpar Pesquisa',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    'no-filter': {
      icon: <IoFilterOutline />,
      title: 'Selecione os Filtros',
      message: 'Selecione pelo menos um filtro (Tipo da última operação ou Aging) para visualizar os dados.',
      actionText: 'Abrir Filtros',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    'error': {
      icon: <IoAlertCircleOutline />,
      title: 'Erro ao Carregar Dados',
      message: 'Ocorreu um erro ao carregar as informações. Tente novamente ou entre em contato com o suporte.',
      actionText: 'Tentar Novamente',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
    }
  }

  const config = configs[type] || configs['no-data']
  const displayTitle = title || config.title
  const displayMessage = message || config.message
  const displayIcon = icon || config.icon
  const displayActionText = actionText || config.actionText

  return (
    <div className="sem-movimentacao-sc-empty-state-container">
      <div className="sem-movimentacao-sc-empty-state-content">
        {/* Ícone animado */}
        <div 
          className="sem-movimentacao-sc-empty-state-icon"
          style={{ background: config.gradient }}
        >
          {displayIcon}
        </div>

        {/* Título */}
        <h3 className="sem-movimentacao-sc-empty-state-title">{displayTitle}</h3>

        {/* Mensagem */}
        <p className="sem-movimentacao-sc-empty-state-message">{displayMessage}</p>

        {/* Botão de ação (opcional) */}
        {onAction && (
          <button 
            className="sem-movimentacao-sc-empty-state-action"
            onClick={onAction}
            style={{ background: config.gradient }}
          >
            {displayActionText}
          </button>
        )}
      </div>

      {/* Decoração de fundo */}
      <div className="sem-movimentacao-sc-empty-state-decoration">
        <div className="sem-movimentacao-sc-decoration-circle sem-movimentacao-sc-decoration-circle-1"></div>
        <div className="sem-movimentacao-sc-decoration-circle sem-movimentacao-sc-decoration-circle-2"></div>
        <div className="sem-movimentacao-sc-decoration-circle sem-movimentacao-sc-decoration-circle-3"></div>
      </div>
    </div>
  )
})

EmptyState.displayName = 'SemMovimentacaoSCEmptyState'

export default EmptyState

