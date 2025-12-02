import React from 'react'
import { 
  MdDeliveryDining, MdCheckCircle, MdCancel, MdPercent,
  MdPeople, MdLocationCity, MdBusiness, MdRefresh,
  MdPictureAsPdf, MdTableChart
} from 'react-icons/md'
import MetricsCard from './components/MetricsCard'
import useReports from './hooks/useReports'
import LoadingState from '../../components/LoadingState/LoadingState'
import EmptyState from '../../components/EmptyState/EmptyState'
import { exportToExcel, exportToPDF } from './utils/exportUtils'
import { useNotification } from '../../contexts/NotificationContext'
import './Reports.css'

export default function Reports() {
  const { latestSnapshot, isLoading, error, refresh } = useReports()
  const { showSuccess, showError } = useNotification()

  // Handlers de export
  const handleExportExcel = () => {
    try {
      exportToExcel(latestSnapshot)
      showSuccess('✅ Relatório exportado para Excel com sucesso!')
    } catch (err) {
      console.error('Erro ao exportar Excel:', err)
      showError('Erro ao exportar relatório para Excel')
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(latestSnapshot)
      showSuccess('✅ Relatório preparado para impressão/PDF!')
    } catch (err) {
      console.error('Erro ao exportar PDF:', err)
      showError('Erro ao preparar relatório para PDF')
    }
  }


  // Loading state
  if (isLoading) {
    return (
      <div className="reports-page">
        <LoadingState message="Carregando relatórios..." />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="reports-page">
        <EmptyState
          type="error"
          title="Erro ao carregar relatórios"
          message={error}
          actionText="Tentar novamente"
          onAction={refresh}
        />
      </div>
    )
  }

  // Empty state
  if (!latestSnapshot) {
    return (
      <div className="reports-page">
        <EmptyState
          type="no-data"
          title="Nenhum relatório disponível"
          message="Ainda não há dados de relatórios. Vá até a página de Pedidos Parados e clique no botão roxo para salvar um snapshot."
        />
      </div>
    )
  }

  const { metrics } = latestSnapshot

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header">
        <div className="reports-header-content">
          <h1 className="reports-title">📊 Relatórios & Analytics</h1>
          <p className="reports-subtitle">
            Última atualização: {new Date(latestSnapshot.created_at).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="reports-header-actions">
          <button 
            className="reports-export-btn reports-export-excel"
            onClick={handleExportExcel}
            title="Exportar para Excel"
          >
            <MdTableChart />
            <span>Excel</span>
          </button>
          <button 
            className="reports-export-btn reports-export-pdf"
            onClick={handleExportPDF}
            title="Exportar para PDF"
          >
            <MdPictureAsPdf />
            <span>PDF</span>
          </button>
          <button 
            className="reports-refresh-btn"
            onClick={refresh}
            title="Atualizar dados"
          >
            <MdRefresh />
          </button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="reports-metrics-grid">
        <MetricsCard
          title="Total de Pedidos"
          value={metrics.total_pedidos.toLocaleString('pt-BR')}
          icon={MdDeliveryDining}
          color="blue"
        />
        <MetricsCard
          title="Entregues"
          value={metrics.entregues.toLocaleString('pt-BR')}
          subtitle={`${metrics.taxa_entrega}% do total`}
          icon={MdCheckCircle}
          color="green"
        />
        <MetricsCard
          title="Não Entregues"
          value={metrics.nao_entregues.toLocaleString('pt-BR')}
          subtitle={`${100 - metrics.taxa_entrega}% do total`}
          icon={MdCancel}
          color="red"
        />
        <MetricsCard
          title="Taxa de Entrega"
          value={`${metrics.taxa_entrega}%`}
          icon={MdPercent}
          color="purple"
        />
        <MetricsCard
          title="Motoristas"
          value={metrics.total_motoristas.toLocaleString('pt-BR')}
          icon={MdPeople}
          color="orange"
        />
        <MetricsCard
          title="Bases"
          value={metrics.total_bases.toLocaleString('pt-BR')}
          icon={MdBusiness}
          color="blue"
        />
        <MetricsCard
          title="Cidades"
          value={metrics.total_cidades.toLocaleString('pt-BR')}
          icon={MdLocationCity}
          color="green"
        />
        <MetricsCard
          title="Contatos Realizados"
          value={metrics.contatos.retornou.toLocaleString('pt-BR')}
          subtitle="Retornaram contato"
          icon={MdCheckCircle}
          color="purple"
        />
      </div>

    </div>
  )
}
