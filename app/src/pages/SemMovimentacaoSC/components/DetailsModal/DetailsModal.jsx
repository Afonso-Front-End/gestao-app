import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNotification } from '../../../../contexts/NotificationContext'
import html2canvas from 'html2canvas'
import StatsCards from '../StatsCards/StatsCards'
import DistributionList from '../DistributionList/DistributionList'
import PieChart from '../PieChart/PieChart'
import BarChart from '../BarChart/BarChart'
import FiltersApplied from '../FiltersApplied/FiltersApplied'
import './DetailsModal.css'

const DetailsModal = ({ 
  isOpen, 
  onClose, 
  statistics, 
  selectedTiposOperacao, 
  selectedAgings 
}) => {
  const { showSuccess, showError } = useNotification()
  const [viewMode, setViewMode] = useState('detailed')
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false)
  const detailsModalRef = useRef(null)

  const handleCaptureScreenshot = useCallback(async () => {
    if (!detailsModalRef.current || isCapturingScreenshot) return

    setIsCapturingScreenshot(true)
    try {
      const modalElement = detailsModalRef.current

      const canvas = await html2canvas(modalElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth: modalElement.scrollWidth,
        windowHeight: modalElement.scrollHeight,
        width: modalElement.scrollWidth,
        height: modalElement.scrollHeight
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `resumo-sem-movimentacao-sc-${new Date().toISOString().split('T')[0]}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          showSuccess('📸 Screenshot capturado com sucesso!')
        }
      }, 'image/png')
    } catch (error) {
      console.error('Erro ao capturar screenshot:', error)
      showError('Erro ao capturar screenshot. Tente novamente.')
    } finally {
      setIsCapturingScreenshot(false)
    }
  }, [isCapturingScreenshot, showSuccess, showError])

  if (!isOpen) return null

  const colors = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554', '#0f172a', '#64748b']
  const pieChartData = statistics.agingDistribution.slice(0, 8)

  return (
    <div className="sem-movimentacao-sc-details-modal-overlay" onClick={onClose}>
      <div className="sem-movimentacao-sc-details-modal" ref={detailsModalRef} onClick={(e) => e.stopPropagation()}>
        <div className="sem-movimentacao-sc-details-modal-header">
          <h2>📊 Resumo Detalhado</h2>
          <div className="sem-movimentacao-sc-details-modal-header-actions">
            <div className="sem-movimentacao-sc-view-mode-selector">
              <button
                className={`sem-movimentacao-sc-view-mode-btn ${viewMode === 'detailed' ? 'active' : ''}`}
                onClick={() => setViewMode('detailed')}
                title="Visualização detalhada"
              >
                📋 Detalhado
              </button>
              <button
                className={`sem-movimentacao-sc-view-mode-btn ${viewMode === 'chart' ? 'active' : ''}`}
                onClick={() => setViewMode('chart')}
                title="Visualização em gráficos"
              >
                📊 Gráfico
              </button>
            </div>
            <button
              className="sem-movimentacao-sc-details-modal-screenshot"
              onClick={handleCaptureScreenshot}
              disabled={isCapturingScreenshot}
              title="Capturar screenshot do modal"
            >
              {isCapturingScreenshot ? '⏳' : '📸'}
              <span>{isCapturingScreenshot ? 'Capturando...' : 'Screenshot'}</span>
            </button>
            <button
              className="sem-movimentacao-sc-details-modal-close"
              onClick={onClose}
              title="Fechar"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="sem-movimentacao-sc-details-modal-content">
          {viewMode === 'detailed' ? (
            <>
              <StatsCards statistics={statistics} />
              
              {statistics.agingDistribution.length > 0 && (
                <DistributionList 
                  data={statistics.agingDistribution}
                  title="Distribuição por Aging"
                />
              )}

              {statistics.tipoOperacaoDistribution.length > 0 && (
                <DistributionList 
                  data={statistics.tipoOperacaoDistribution}
                  title="Distribuição por Tipo de Operação"
                />
              )}

              {statistics.baseEntregaDistribution.length > 0 && (
                <DistributionList 
                  data={statistics.baseEntregaDistribution}
                  title="Top 20 Bases de Entrega"
                />
              )}

              {statistics.horarioDistribution.length > 0 && (
                <div className="sem-movimentacao-sc-details-section">
                  <h3>Distribuição por Horário da Última Operação</h3>
                  <div className="sem-movimentacao-sc-horario-legend-grid">
                    {statistics.horarioDistribution.map((item, index) => (
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
              )}

              <FiltersApplied 
                selectedTiposOperacao={selectedTiposOperacao}
                selectedAgings={selectedAgings}
              />
            </>
          ) : (
            <>
              <div className="sem-movimentacao-sc-chart-view">
                <div className="sem-movimentacao-sc-chart-row">
                  <div className="sem-movimentacao-sc-chart-section-compact">
                    <h3>Resumo Geral</h3>
                    <div className="sem-movimentacao-sc-chart-stat-compact">
                      <div className="sem-movimentacao-sc-chart-stat-value-compact">
                        {statistics.total.toLocaleString('pt-BR')}
                      </div>
                      <div className="sem-movimentacao-sc-chart-stat-label-compact">Total de Remessas</div>
                    </div>
                  </div>

                  {pieChartData.length > 0 && (
                    <div className="sem-movimentacao-sc-chart-section-compact">
                      <h3>Distribuição por Aging</h3>
                      <PieChart data={pieChartData} colors={colors} />
                    </div>
                  )}
                </div>

                <div className="sem-movimentacao-sc-chart-row">
                  {statistics.tipoOperacaoDistribution.length > 0 && (
                    <BarChart 
                      data={statistics.tipoOperacaoDistribution}
                      maxItems={10}
                      title="Distribuição por Tipo de Operação"
                    />
                  )}

                  {statistics.baseEntregaDistribution.length > 0 && (
                    <BarChart 
                      data={statistics.baseEntregaDistribution}
                      maxItems={10}
                      title="Top 10 Bases de Entrega"
                    />
                  )}
                </div>

                {statistics.horarioDistribution.length > 0 && (
                  <div className="sem-movimentacao-sc-chart-row-full">
                    <div className="sem-movimentacao-sc-chart-section-full">
                      <h3>Distribuição por Horário da Última Operação</h3>
                      <div className="sem-movimentacao-sc-horario-legend-grid">
                        {statistics.horarioDistribution.map((item, index) => (
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
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default DetailsModal

