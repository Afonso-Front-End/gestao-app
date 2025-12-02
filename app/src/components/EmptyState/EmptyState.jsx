import React, { memo } from 'react'
import './EmptyState.css'
import { 
  IoDocumentTextOutline, 
  IoSearchOutline, 
  IoCloudUploadOutline,
  IoFilterOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

/**
 * Componente de estado vazio profissional
 * @param {string} type - Tipo do estado vazio: 'no-data' | 'no-search' | 'no-upload' | 'no-filter' | 'error'
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
  // Configurações padrão por tipo
  const configs = {
    'no-data': {
      icon: <IoDocumentTextOutline />,
      title: 'Nenhum Dado Disponível',
      message: 'Não há informações para exibir no momento. Faça o upload de arquivos ou aplique filtros para visualizar os dados.',
      actionText: 'Fazer Upload',
      gradient: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)'
    },
    'no-search': {
      icon: <IoSearchOutline />,
      title: 'Nenhum Resultado Encontrado',
      message: 'Não encontramos nenhum resultado para sua pesquisa. Tente usar outros termos ou ajustar os filtros.',
      actionText: 'Limpar Pesquisa',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
    },
    'no-upload': {
      icon: <IoCloudUploadOutline />,
      title: 'Faça o Upload dos Arquivos',
      message: 'Para começar, faça o upload dos arquivos de pedidos retidos e consultados.',
      actionText: 'Fazer Upload',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    },
    'no-filter': {
      icon: <IoFilterOutline />,
      title: 'Aplique Filtros para Buscar',
      message: 'Selecione bases, tipos de operação ou aging nos filtros e clique em "Buscar Pedidos".',
      actionText: 'Abrir Filtros',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
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
    <div className="empty-state-container">
      <div className="empty-state-content">
        {/* Ícone animado */}
        <div 
          className="empty-state-icon"
          style={{ background: config.gradient }}
        >
          {displayIcon}
        </div>

        {/* Título */}
        <h3 className="empty-state-title">{displayTitle}</h3>

        {/* Mensagem */}
        <p className="empty-state-message">{displayMessage}</p>

        {/* Botão de ação (opcional) */}
        {onAction && (
          <button 
            className="empty-state-action"
            onClick={onAction}
            style={{ background: config.gradient }}
          >
            {displayActionText}
          </button>
        )}
      </div>

      {/* Decoração de fundo */}
      <div className="empty-state-decoration">
        <div className="decoration-circle decoration-circle-1"></div>
        <div className="decoration-circle decoration-circle-2"></div>
        <div className="decoration-circle decoration-circle-3"></div>
      </div>
    </div>
  )
})

EmptyState.displayName = 'EmptyState'

export default EmptyState

