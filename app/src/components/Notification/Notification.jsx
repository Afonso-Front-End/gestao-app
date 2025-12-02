import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCheckCircle, 
  faExclamationTriangle, 
  faInfoCircle, 
  faTimes,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons'
import './Notification.css'

const Notification = ({ notification, onClose }) => {
  const [isClosing, setIsClosing] = React.useState(false)
  const [isAutoRemoving, setIsAutoRemoving] = React.useState(false)

  // Detectar quando a notificação está sendo removida automaticamente
  React.useEffect(() => {
    if (notification.type !== 'loading' && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsAutoRemoving(true)
        setTimeout(() => {
          onClose(notification.id)
        }, 300) // Tempo da animação
      }, notification.duration - 300) // Iniciar animação 300ms antes do fim
      
      return () => clearTimeout(timer)
    }
  }, [notification.duration, notification.type, notification.id, onClose])

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return faCheckCircle
      case 'error':
        return faTimesCircle
      case 'warning':
        return faExclamationTriangle
      case 'loading':
        return null // Loading terá um spinner custom
      case 'info':
      default:
        return faInfoCircle
    }
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose(notification.id)
    }, 300) // Tempo da animação
  }

  const getClassName = () => {
    const baseClass = `notification notification-${notification.type}`
    if (isClosing || isAutoRemoving) {
      return `${baseClass} slide-out`
    }
    return baseClass
  }

  return (
    <div className={getClassName()}>
      <div className="notification-icon">
        {notification.type === 'loading' ? (
          <div className="notification-spinner"></div>
        ) : (
          <FontAwesomeIcon icon={getIcon()} />
        )}
      </div>
      <div className="notification-content">
        {notification.title && (
          <div className="notification-title">{notification.title}</div>
        )}
        <div className="notification-message">{notification.message}</div>
      </div>
      {notification.type !== 'loading' && (
        <button 
          className="notification-close" 
          onClick={handleClose}
          aria-label="Fechar notificação"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  )
}

export default Notification
