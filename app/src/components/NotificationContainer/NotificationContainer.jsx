import React from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import Notification from '../Notification/Notification'
import './NotificationContainer.css'

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  )
}

export default NotificationContainer
