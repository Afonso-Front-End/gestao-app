import React from 'react'
import './MetricsCard.css'

/**
 * Card para exibir métricas individuais
 */
export default function MetricsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue',
  trend,
  loading = false
}) {
  return (
    <div className={`metrics-card metrics-card-${color}`}>
      {loading ? (
        <div className="metrics-card-loading">
          <div className="metrics-card-skeleton-icon"></div>
          <div className="metrics-card-skeleton-content">
            <div className="metrics-card-skeleton-title"></div>
            <div className="metrics-card-skeleton-value"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="metrics-card-header">
            <div className="metrics-card-icon">
              {Icon && <Icon />}
            </div>
            <div className="metrics-card-content">
              <h3 className="metrics-card-title">{title}</h3>
              <div className="metrics-card-value">{value}</div>
              {subtitle && (
                <p className="metrics-card-subtitle">{subtitle}</p>
              )}
              {trend && (
                <div className={`metrics-card-trend ${trend.direction}`}>
                  {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

