import React from 'react'
import './StatsCards.css'

const StatsCards = ({ statistics }) => {
  return (
    <div className="sem-movimentacao-sc-details-section">
      <h3>Estatísticas Gerais</h3>
      <div className="sem-movimentacao-sc-stats-grid">
        <div className="sem-movimentacao-sc-stat-card">
          <div className="sem-movimentacao-sc-stat-value">
            {statistics.total.toLocaleString('pt-BR')}
          </div>
          <div className="sem-movimentacao-sc-stat-label">Total de Remessas</div>
        </div>
        <div className="sem-movimentacao-sc-stat-card">
          <div className="sem-movimentacao-sc-stat-value">
            {Object.keys(statistics.byAging).length}
          </div>
          <div className="sem-movimentacao-sc-stat-label">Tipos de Aging</div>
        </div>
        <div className="sem-movimentacao-sc-stat-card">
          <div className="sem-movimentacao-sc-stat-value">
            {Object.keys(statistics.byTipoOperacao).length}
          </div>
          <div className="sem-movimentacao-sc-stat-label">Tipos de Operação</div>
        </div>
        <div className="sem-movimentacao-sc-stat-card">
          <div className="sem-movimentacao-sc-stat-value">
            {Object.keys(statistics.byBaseEntrega).length}
          </div>
          <div className="sem-movimentacao-sc-stat-label">Bases de Entrega</div>
        </div>
      </div>
    </div>
  )
}

export default StatsCards

