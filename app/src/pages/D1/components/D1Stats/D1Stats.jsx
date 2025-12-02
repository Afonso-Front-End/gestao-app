import React from 'react'
import { calculateStats } from '../../utils/dataTransformers'

const D1Stats = ({ motoristasData, selectedBasesBipagens, selectedTemposParados }) => {
  if (motoristasData.length === 0) return null

  const stats = calculateStats(motoristasData)

  return (
    <div className="d1-bipagens-stats">
      <div className="d1-stat-card">
        <div className="d1-stat-icon">📦</div>
        <div className="d1-stat-content">
          <div className="d1-stat-label">Total de Pedidos</div>
          <div className="d1-stat-value">
            {stats.totalPedidos.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
      <div className="d1-stat-card">
        <div className="d1-stat-icon">👤</div>
        <div className="d1-stat-content">
          <div className="d1-stat-label">Total de Motoristas</div>
          <div className="d1-stat-value">{stats.totalMotoristas.toLocaleString('pt-BR')}</div>
        </div>
      </div>
      <div className="d1-stat-card">
        <div className="d1-stat-icon">📊</div>
        <div className="d1-stat-content">
          <div className="d1-stat-label">Média de Pedidos/Motorista</div>
          <div className="d1-stat-value">
            {stats.mediaPedidosPorMotorista.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
      <div className="d1-stat-card">
        <div className="d1-stat-icon">⏱️</div>
        <div className="d1-stat-content">
          <div className="d1-stat-label">Bases Selecionadas</div>
          <div className="d1-stat-value">
            {selectedBasesBipagens.length > 0
              ? `${selectedBasesBipagens.length} base${selectedBasesBipagens.length > 1 ? 's' : ''}`
              : 'Nenhuma'}
          </div>
        </div>
      </div>
      <div className="d1-stat-card">
        <div className="d1-stat-icon">⏳</div>
        <div className="d1-stat-content">
          <div className="d1-stat-label">Tempos Parados Selecionados</div>
          <div className="d1-stat-value">
            {selectedTemposParados.length > 0
              ? `${selectedTemposParados.length} tempo${selectedTemposParados.length > 1 ? 's' : ''}`
              : 'Todos'}
          </div>
        </div>
      </div>
      <div className="d1-stat-card">
        <div className="d1-stat-icon">✅</div>
        <div className="d1-stat-content">
          <div className="d1-stat-label">Total Entregues</div>
          <div className="d1-stat-value" style={{ color: '#0DAF7A' }}>
            {stats.totalEntregues.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
      <div className="d1-stat-card">
        <div className="d1-stat-icon">❌</div>
        <div className="d1-stat-content">
          <div className="d1-stat-label">Total Não Entregues</div>
          <div className="d1-stat-value" style={{ color: '#EF4444' }}>
            {stats.totalNaoEntregues.toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default D1Stats

