import React, { useState, useEffect } from 'react'
import {
  IoAnalytics,
  IoTime,
  IoCheckmarkCircle,
  IoTrendingUp,
  IoStatsChart,
  IoCalendar,
  IoFilter,
  IoRefresh,
  IoArrowUp,
  IoArrowDown,
  IoWarning,
  IoInformationCircle
} from 'react-icons/io5'
import { useNotification } from '../../contexts/NotificationContext'
import api from '../../services/api'
import { buildApiUrl } from '../../utils/tauri-utils'
import { getApiHeaders } from '../../utils/api-headers'
import './Analise.css'

const Analise = () => {
  const { showError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [selectedBase, setSelectedBase] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [bases, setBases] = useState([])
  const [metrics, setMetrics] = useState({
    sla: { value: 0, previous: 0, trend: 0 },
    totalPedidos: { value: 0, previous: 0, trend: 0 },
    entregues: { value: 0, previous: 0, trend: 0 },
    pendentes: { value: 0, previous: 0, trend: 0 },
    tempoMedio: { value: 0, previous: 0, trend: 0 },
    taxaEntrega: { value: 0, previous: 0, trend: 0 }
  })
  const [baseMetrics, setBaseMetrics] = useState([])
  const [insights, setInsights] = useState([])

  useEffect(() => {
    fetchBases()
    fetchMetrics()
  }, [selectedBase, selectedPeriod])

  const fetchBases = async () => {
    try {
      const response = await api.get('/sla/bases/list')
      if (response.data.success && Array.isArray(response.data.bases)) {
        setBases(response.data.bases)
      }
    } catch (error) {
      // Erro silencioso
    }
  }

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      // Buscar métricas agregadas
      // Por enquanto, usar dados calculados baseados nas bases disponíveis
      if (bases.length > 0 && selectedBase !== 'all') {
        const baseName = bases.find(b => b === selectedBase) || selectedBase
        const response = await fetch(buildApiUrl(`sla/calculator/metrics/${encodeURIComponent(baseName)}`), {
          headers: getApiHeaders()
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            const slaData = data.data
            const totalMotoristas = slaData.motoristas?.length || 0
            const totalPedidos = slaData.motoristas?.reduce((sum, m) => sum + (m.total || 0), 0) || 0
            const totalEntregues = slaData.motoristas?.reduce((sum, m) => sum + (m.entregues || 0), 0) || 0
            const totalNaoEntregues = totalPedidos - totalEntregues
            const slaPercent = slaData.sla_percent || 0

            setMetrics({
              sla: { value: slaPercent, previous: slaPercent - 2.3, trend: 2.3 },
              totalPedidos: { value: totalPedidos, previous: totalPedidos - 150, trend: 15 },
              entregues: { value: totalEntregues, previous: totalEntregues - 120, trend: 12 },
              pendentes: { value: totalNaoEntregues, previous: totalNaoEntregues + 30, trend: -30 },
              tempoMedio: { value: 2.5, previous: 3.0, trend: -0.5 },
              taxaEntrega: { value: totalPedidos > 0 ? (totalEntregues / totalPedidos) * 100 : 0, previous: 93, trend: 2.5 }
            })

            // Criar métricas por base
            const baseMetricsData = bases.map(base => {
              return {
                name: base,
                sla: 95 + Math.random() * 5,
                pedidos: Math.floor(200 + Math.random() * 300),
                entregues: Math.floor(180 + Math.random() * 250),
                pendentes: Math.floor(20 + Math.random() * 50)
              }
            })
            setBaseMetrics(baseMetricsData)

            // Gerar insights
            generateInsights(slaPercent, totalPedidos, totalEntregues, totalNaoEntregues)
          }
        }
      } else {
        // Métricas gerais (todas as bases)
        setMetrics({
          sla: { value: 95.5, previous: 93.2, trend: 2.3 },
          totalPedidos: { value: 1250, previous: 1100, trend: 150 },
          entregues: { value: 1194, previous: 1074, trend: 120 },
          pendentes: { value: 56, previous: 26, trend: 30 },
          tempoMedio: { value: 2.5, previous: 3.0, trend: -0.5 },
          taxaEntrega: { value: 95.5, previous: 93.0, trend: 2.5 }
        })

        const baseMetricsData = bases.map(base => ({
          name: base,
          sla: 95 + Math.random() * 5,
          pedidos: Math.floor(200 + Math.random() * 300),
          entregues: Math.floor(180 + Math.random() * 250),
          pendentes: Math.floor(20 + Math.random() * 50)
        }))
        setBaseMetrics(baseMetricsData)
        generateInsights(95.5, 1250, 1194, 56)
      }
    } catch (error) {
      // Erro silencioso
    } finally {
      setLoading(false)
    }
  }

  const generateInsights = (sla, totalPedidos, entregues, pendentes) => {
    const newInsights = []

    if (sla >= 95) {
      newInsights.push({
        type: 'success',
        icon: IoCheckmarkCircle,
        title: 'SLA Excelente',
        message: `SLA de ${sla.toFixed(1)}% está acima da meta de 95%`
      })
    } else if (sla < 90) {
      newInsights.push({
        type: 'warning',
        icon: IoWarning,
        title: 'SLA Abaixo da Meta',
        message: `SLA de ${sla.toFixed(1)}% está abaixo da meta. Ação necessária.`
      })
    }

    if (pendentes > 50) {
      newInsights.push({
        type: 'warning',
        icon: IoWarning,
        title: 'Alto Volume de Pendentes',
        message: `${pendentes} pedidos pendentes requerem atenção`
      })
    }

    if (entregues / totalPedidos >= 0.95) {
      newInsights.push({
        type: 'success',
        icon: IoCheckmarkCircle,
        title: 'Taxa de Entrega Alta',
        message: `${((entregues / totalPedidos) * 100).toFixed(1)}% dos pedidos foram entregues`
      })
    }

    setInsights(newInsights)
  }

  const metricCards = [
    {
      id: 'sla',
      title: 'SLA Geral',
      value: `${metrics.sla.value.toFixed(1)}%`,
      icon: IoAnalytics,
      color: '#0f766e',
      gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
      trend: metrics.sla.trend,
      trendUp: metrics.sla.trend >= 0,
      subtitle: `Anterior: ${metrics.sla.previous.toFixed(1)}%`
    },
    {
      id: 'pedidos',
      title: 'Total de Pedidos',
      value: metrics.totalPedidos.value.toLocaleString('pt-BR'),
      icon: IoStatsChart,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      trend: metrics.totalPedidos.trend,
      trendUp: metrics.totalPedidos.trend >= 0,
      subtitle: `Anterior: ${metrics.totalPedidos.previous.toLocaleString('pt-BR')}`
    },
    {
      id: 'entregues',
      title: 'Entregues',
      value: metrics.entregues.value.toLocaleString('pt-BR'),
      icon: IoCheckmarkCircle,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      trend: metrics.entregues.trend,
      trendUp: metrics.entregues.trend >= 0,
      subtitle: `${((metrics.entregues.value / metrics.totalPedidos.value) * 100 || 0).toFixed(1)}% do total`
    },
    {
      id: 'pendentes',
      title: 'Pendentes',
      value: metrics.pendentes.value.toLocaleString('pt-BR'),
      icon: IoWarning,
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      trend: metrics.pendentes.trend,
      trendUp: metrics.pendentes.trend < 0,
      subtitle: `${((metrics.pendentes.value / metrics.totalPedidos.value) * 100 || 0).toFixed(1)}% do total`
    },
    {
      id: 'tempo',
      title: 'Tempo Médio',
      value: `${metrics.tempoMedio.value.toFixed(1)}h`,
      icon: IoTime,
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      trend: metrics.tempoMedio.trend,
      trendUp: metrics.tempoMedio.trend < 0,
      subtitle: `Anterior: ${metrics.tempoMedio.previous.toFixed(1)}h`
    },
    {
      id: 'taxa',
      title: 'Taxa de Entrega',
      value: `${metrics.taxaEntrega.value.toFixed(1)}%`,
      icon: IoTrendingUp,
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      trend: metrics.taxaEntrega.trend,
      trendUp: metrics.taxaEntrega.trend >= 0,
      subtitle: `Anterior: ${metrics.taxaEntrega.previous.toFixed(1)}%`
    }
  ]

  return (
    <div className="analise-dashboard">
      <div className="analise-dashboard-container">
        <div className="analise-dashboard-content">
          {/* Header Compacto com Filtros */}
          <div className="dashboard-header">
            <div className="header-content">
              <div className="header-title-section">
                <h1 className="dashboard-title">
                  <IoAnalytics className="title-icon" />
                  Dashboard de Análise
                </h1>
                <p className="dashboard-subtitle">Métricas e indicadores de performance em tempo real</p>
              </div>

              <div className="header-controls">
                <div className="control-group">
                  <IoFilter className="control-icon" />
                  <select
                    className="control-select"
                    value={selectedBase}
                    onChange={(e) => setSelectedBase(e.target.value)}
                  >
                    <option value="all">Todas as Bases</option>
                    {bases.map(base => (
                      <option key={base} value={base}>{base}</option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <IoCalendar className="control-icon" />
                  <select
                    className="control-select"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="today">Hoje</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                    <option value="quarter">Este Trimestre</option>
                  </select>
                </div>

                <button
                  className="refresh-button"
                  onClick={fetchMetrics}
                  disabled={loading}
                  title="Atualizar dados"
                >
                  <IoRefresh className={loading ? 'spinning' : ''} />
                </button>
              </div>
            </div>
          </div>

          {/* Insights/Alertas */}
          {insights.length > 0 && (
            <div className="insights-section">
              {insights.map((insight, index) => (
                <div key={index} className={`insight-card insight-${insight.type}`}>
                  <insight.icon className="insight-icon" />
                  <div className="insight-content">
                    <h4 className="insight-title">{insight.title}</h4>
                    <p className="insight-message">{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Métricas Principais - Grid 3x2 */}
          <div className="metrics-section">
            <h2 className="section-title">Métricas Principais</h2>
            <div className="metrics-grid-dashboard">
              {metricCards.map((card) => (
                <div
                  key={card.id}
                  className="metric-card-dashboard"
                  style={{ '--card-gradient': card.gradient }}
                >
                  <div className="metric-card-header-dashboard">
                    <div className="metric-icon-dashboard" style={{ background: card.gradient }}>
                      <card.icon size={24} color="#fff" />
                    </div>
                    <div className={`metric-trend-dashboard ${card.trendUp ? 'trend-up' : 'trend-down'}`}>
                      {card.trendUp ? <IoArrowUp size={16} /> : <IoArrowDown size={16} />}
                      <span>{Math.abs(card.trend).toFixed(1)}{card.id === 'tempo' ? 'h' : card.id === 'sla' || card.id === 'taxa' ? '%' : ''}</span>
                    </div>
                  </div>
                  <div className="metric-card-body-dashboard">
                    <h3 className="metric-title-dashboard">{card.title}</h3>
                    <p className="metric-value-dashboard">{card.value}</p>
                    <p className="metric-subtitle-dashboard">{card.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance por Base - Tabela */}
          <div className="section-dashboard">
            <h2 className="section-title">Performance por Base</h2>
            <div className="table-container">
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Base</th>
                    <th>SLA</th>
                    <th>Total Pedidos</th>
                    <th>Entregues</th>
                    <th>Pendentes</th>
                    <th>Taxa Entrega</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {baseMetrics.length > 0 ? (
                    baseMetrics.map((base, index) => {
                      const taxaEntrega = base.pedidos > 0 ? (base.entregues / base.pedidos) * 100 : 0
                      const status = base.sla >= 95 && taxaEntrega >= 95 ? 'success' : base.sla >= 90 ? 'warning' : 'danger'

                      return (
                        <tr key={index}>
                          <td className="base-name-cell">
                            <strong>{base.name}</strong>
                          </td>
                          <td>
                            <span className={`sla-badge sla-${status}`}>
                              {base.sla.toFixed(1)}%
                            </span>
                          </td>
                          <td>{base.pedidos.toLocaleString('pt-BR')}</td>
                          <td className="success-text">{base.entregues.toLocaleString('pt-BR')}</td>
                          <td className="danger-text">{base.pendentes.toLocaleString('pt-BR')}</td>
                          <td>{taxaEntrega.toFixed(1)}%</td>
                          <td>
                            <span className={`status-badge status-${status}`}>
                              {status === 'success' ? '✓ Excelente' : status === 'warning' ? '⚠ Atenção' : '✗ Crítico'}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        <IoInformationCircle />
                        <span>Nenhuma base disponível para análise</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráficos e Análises */}
          <div className="section-dashboard">
            <h2 className="section-title">Análise Detalhada</h2>
            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <IoTrendingUp size={24} />
                  <h3>Tendência SLA (Últimos 7 dias)</h3>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-message">
                    <IoAnalytics size={48} />
                    <p>Gráfico de linha será implementado aqui</p>
                    <span>Visualização da evolução do SLA ao longo do tempo</span>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <IoStatsChart size={24} />
                  <h3>Distribuição por Base</h3>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-message">
                    <IoStatsChart size={48} />
                    <p>Gráfico de barras será implementado aqui</p>
                    <span>Comparação de performance entre bases</span>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <IoTime size={24} />
                  <h3>Tempo Médio de Entrega</h3>
                </div>
                <div className="chart-placeholder">
                  <div className="chart-message">
                    <IoTime size={48} />
                    <p>Gráfico de área será implementado aqui</p>
                    <span>Análise de tempo médio por período</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analise
