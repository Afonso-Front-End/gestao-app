import React from 'react'
import './PieChart.css'

const PieChart = ({ data, colors, size = 220, innerRadius = 30 }) => {
  if (!data || data.length === 0) return null

  const total = data.reduce((sum, item) => sum + item.count, 0)
  const center = size / 2
  const outerRadius = (size - 6) / 2 // -6 para border de 3px de cada lado
  
  // Calcular paths SVG - com sobreposição para eliminar linhas brancas
  let currentAngle = -90 // Começar do topo (0 graus no SVG = 3 horas)
  const overlap = 0.1 // Pequena sobreposição em graus para eliminar gaps visuais
  const paths = data.map((item, index) => {
    const angle = (item.count / total) * 360
    // Adicionar pequena sobreposição no início e fim para eliminar linhas brancas
    const startAngle = currentAngle - (index === 0 ? 0 : overlap)
    let endAngle = currentAngle + angle + (index === data.length - 1 ? 0 : overlap)
    
    // Se há apenas 1 item, criar um círculo completo (quase 360 graus)
    if (data.length === 1) {
      endAngle = startAngle + 359.99 // Quase 360 para criar círculo completo
    }
    
    currentAngle = currentAngle + angle
    
    // Converter para radianos com precisão
    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    
    // Calcular pontos do arco externo
    const x1 = center + outerRadius * Math.cos(startRad)
    const y1 = center + outerRadius * Math.sin(startRad)
    const x2 = center + outerRadius * Math.cos(endRad)
    const y2 = center + outerRadius * Math.sin(endRad)
    
    // Calcular pontos do arco interno (sentido inverso)
    const x3 = center + innerRadius * Math.cos(endRad)
    const y3 = center + innerRadius * Math.sin(endRad)
    const x4 = center + innerRadius * Math.cos(startRad)
    const y4 = center + innerRadius * Math.sin(startRad)
    
    // Criar path SVG para donut chart
    const largeArc = (endAngle - startAngle) > 180 ? 1 : 0
    // Path: Começar no ponto externo, arco externo, linha reta para interno, arco interno, fechar
    const path = `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} L ${x3.toFixed(3)} ${y3.toFixed(3)} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4.toFixed(3)} ${y4.toFixed(3)} Z`
    
    return {
      path,
      color: colors[index % colors.length],
      item
    }
  })

  return (
    <div className="sem-movimentacao-sc-pie-chart-container">
      <div className="sem-movimentacao-sc-pie-chart-wrapper">
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="sem-movimentacao-sc-pie-chart-svg"
          style={{ 
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))',
            shapeRendering: 'geometricPrecision'
          }}
        >
          {paths.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              stroke="none"
              shapeRendering="geometricPrecision"
            />
          ))}
        </svg>
      </div>
      <div className="sem-movimentacao-sc-pie-legend">
        {data.map((item, index) => (
          <div key={index} className="sem-movimentacao-sc-pie-legend-item">
            <span 
              className="sem-movimentacao-sc-pie-legend-color" 
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="sem-movimentacao-sc-pie-legend-label">{item.label}</span>
            <span className="sem-movimentacao-sc-pie-legend-value">
              {item.count} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PieChart

