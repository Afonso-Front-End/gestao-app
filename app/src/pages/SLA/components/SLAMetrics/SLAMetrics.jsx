import React from 'react'
import './SLAMetrics.css'

const SLAMetrics = ({ metrics, baseName, selectedCities }) => {
  if (!metrics || metrics.totalPedidos === 0) {
    return (
      <div className="sla-metrics">
        <h3>Métricas SLA</h3>
        <div className="no-data">Nenhum dado disponível para cálculo</div>
      </div>
    )
  }

  const getSLAStatus = (percentual) => {
    if (percentual >= 95) return { status: 'excelente', color: '#28a745', icon: '🟢' }
    if (percentual >= 85) return { status: 'bom', color: '#17a2b8', icon: '🔵' }
    if (percentual >= 70) return { status: 'regular', color: '#ffc107', icon: '🟡' }
    return { status: 'crítico', color: '#dc3545', icon: '🔴' }
  }

  const slaStatus = getSLAStatus(metrics.percentualSLA)

  return (
    <div className="sla-metrics">
      <div className="metrics-header">
        <h3>Métricas SLA</h3>
        <div className="metrics-subtitle">
          {baseName}
          {selectedCities.length > 0 && ` - ${selectedCities.length} cidades selecionadas`}
        </div>
      </div>

      <div className="metrics-grid">
        {/* Métricas Principais */}
        <div className="metric-card primary">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.totalPedidos}</div>
            <div className="metric-label">Total de Pedidos</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.entregasNoPrazo}</div>
            <div className="metric-label">Entregas no Prazo</div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">⏰</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.entregasAtrasadas}</div>
            <div className="metric-label">Entregas Atrasadas</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">⏳</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.entregasPendentes}</div>
            <div className="metric-label">Pendentes</div>
          </div>
        </div>

        {/* SLA Principal */}
        <div className="metric-card sla-main" style={{ borderColor: slaStatus.color }}>
          <div className="metric-icon">{slaStatus.icon}</div>
          <div className="metric-content">
            <div className="metric-value" style={{ color: slaStatus.color }}>
              {metrics.percentualSLA}%
            </div>
            <div className="metric-label">SLA - {slaStatus.status.toUpperCase()}</div>
          </div>
        </div>

        {/* Métricas Adicionais */}
        <div className="metric-card secondary">
          <div className="metric-icon">🏙️</div>
          <div className="metric-content">
            <div className="metric-value">{metrics.coberturaCidades}</div>
            <div className="metric-label">Cidades Atendidas</div>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">🚚</div>
          <div className="metric-content">
            <div className="metric-value">{Object.keys(metrics.motoristasBreakdown).length}</div>
            <div className="metric-label">Motoristas Ativos</div>
          </div>
        </div>
      </div>

      {/* Breakdowns Detalhados */}
      <div className="breakdowns-section">
        <div className="breakdown-card">
          <h4>Status de Entrega</h4>
          <div className="breakdown-list">
            {Object.entries(metrics.statusBreakdown).slice(0, 5).map(([status, count]) => (
              <div key={status} className="breakdown-item">
                <span className="breakdown-label">{status}</span>
                <span className="breakdown-count">{count}</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${(count / metrics.totalPedidos) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="breakdown-card">
          <h4>Top Cidades</h4>
          <div className="breakdown-list">
            {Object.entries(metrics.cidadesBreakdown).slice(0, 5).map(([cidade, count]) => (
              <div key={cidade} className="breakdown-item">
                <span className="breakdown-label">{cidade}</span>
                <span className="breakdown-count">{count}</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${(count / metrics.totalPedidos) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="breakdown-card">
          <h4>Top Motoristas</h4>
          <div className="breakdown-list">
            {Object.entries(metrics.motoristasBreakdown).slice(0, 5).map(([motorista, count]) => (
              <div key={motorista} className="breakdown-item">
                <span className="breakdown-label">{motorista}</span>
                <span className="breakdown-count">{count}</span>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${(count / metrics.totalPedidos) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SLAMetrics
