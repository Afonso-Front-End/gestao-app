import React from 'react'
import './BarChart.css'

const BarChart = ({ data, maxItems = 10, title }) => {
  if (!data || data.length === 0) return null

  const items = data.slice(0, maxItems)
  const maxValue = Math.max(...items.map(i => i.count))

  return (
    <div className="sem-movimentacao-sc-chart-section-compact">
      <h3>{title}</h3>
      <div className="sem-movimentacao-sc-bar-chart-container">
        <div className="sem-movimentacao-sc-bar-chart">
          {items.map((item, index) => {
            const height = (item.count / maxValue) * 100
            return (
              <div key={index} className="sem-movimentacao-sc-bar-chart-item">
                <div className="sem-movimentacao-sc-bar-chart-bar-wrapper">
                  <div 
                    className="sem-movimentacao-sc-bar-chart-bar"
                    style={{ height: `${height}%` }}
                    title={`${item.label}: ${item.count} (${item.percentage}%)`}
                  >
                    <span className="sem-movimentacao-sc-bar-chart-value">{item.count}</span>
                  </div>
                </div>
                <div className="sem-movimentacao-sc-bar-chart-label">{item.label}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BarChart

