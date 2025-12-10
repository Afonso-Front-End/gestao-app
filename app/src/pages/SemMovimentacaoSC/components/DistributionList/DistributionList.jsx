import React from 'react'
import './DistributionList.css'

const DistributionList = ({ data, title }) => {
  if (!data || data.length === 0) return null

  return (
    <div className="sem-movimentacao-sc-details-section">
      <h3>{title}</h3>
      <div className="sem-movimentacao-sc-distribution-list">
        {data.map((item, index) => (
          <div key={index} className="sem-movimentacao-sc-distribution-item">
            <div className="sem-movimentacao-sc-distribution-header">
              <span className="sem-movimentacao-sc-distribution-label">{item.label}</span>
              <span className="sem-movimentacao-sc-distribution-count">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="sem-movimentacao-sc-progress-bar">
              <div
                className="sem-movimentacao-sc-progress-fill"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DistributionList

