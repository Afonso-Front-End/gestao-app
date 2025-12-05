import React, { useState } from 'react'
import {
  MdDeliveryDining, MdCheckCircle, MdCancel, MdPercent,
  MdPeople, MdLocationCity, MdBusiness, MdRefresh,
  MdPictureAsPdf, MdTableChart, MdTrendingUp, MdAccessTime,
  MdInventory, MdBarChart, MdTimer, MdCalendarToday,
  MdHourglassEmpty, MdPhone, MdAssessment
} from 'react-icons/md'
import { FaFileExcel, FaFilePdf } from 'react-icons/fa'
import MetricsCard from './components/MetricsCard'
import Accordion from './components/Accordion/Accordion'
import useReports from './hooks/useReports'
import LoadingState from '../../components/LoadingState/LoadingState'
import EmptyState from '../../components/EmptyState/EmptyState'
import { exportToExcel, exportToPDF } from './utils/exportUtils'
import { useNotification } from '../../contexts/NotificationContext'
import './Reports.css'

const MODULES = [
  { value: 'pedidos_parados', label: 'Pedidos Retidos', icon: MdInventory, color: '#3b82f6' },
  { value: 'd1', label: 'D-1 Bipagens', icon: MdBarChart, color: '#10b981' },
  { value: 'sla', label: 'SLA', icon: MdTimer, color: '#8b5cf6' }
]

function SnapshotCard({ snapshot, module, onExportExcel, onExportPDF, compact = false }) {
  const { metrics } = snapshot
  const snapshotDate = new Date(snapshot.created_at || snapshot.snapshot_date)
  const formattedDate = snapshotDate.toLocaleString('pt-BR')
  const moduleInfo = MODULES.find(m => m.value === module)

  // Calcular se é recente (últimas 24 horas)
  const isRecent = (Date.now() - snapshotDate.getTime()) < 24 * 60 * 60 * 1000

  // Informações do snapshot
  const baseInfo = snapshot.base ? snapshot.base : 'Todas as bases'
  const citiesInfo = snapshot.cities && snapshot.cities.length > 0
    ? `${snapshot.cities.length} cidade(s)`
    : 'Todas as cidades'
  const citiesList = snapshot.cities && snapshot.cities.length > 0 ? snapshot.cities : []
  const isSpecific = snapshot.base && citiesList.length > 0 && citiesList.length < 50

  if (compact) {
    return (
      <div className="reports-snapshot-card-compact">
        <div className="reports-snapshot-header-compact">
          <div className="reports-snapshot-title-row-compact">
            <h4 className="reports-snapshot-title-compact">
              <span className="reports-snapshot-module-badge-compact" style={{ backgroundColor: moduleInfo?.color }}>
                {moduleInfo?.icon && <moduleInfo.icon />}
              </span>
              Snapshot
            </h4>
            <div className="reports-snapshot-badges-compact">
              {isRecent && (
                <span className="reports-snapshot-badge reports-snapshot-badge-recent" title="Criado nas últimas 24 horas">
                  Recente
                </span>
              )}
              {isSpecific && (
                <span className="reports-snapshot-badge reports-snapshot-badge-specific" title="Snapshot específico com filtros">
                  Específico
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="reports-snapshot-meta-container-compact">
          <div className="reports-snapshot-meta-item-compact">
            <MdBusiness className="reports-snapshot-meta-icon" />
            <span className="reports-snapshot-meta-text">{baseInfo}</span>
          </div>
          <div className="reports-snapshot-meta-item-compact">
            <MdLocationCity className="reports-snapshot-meta-icon" />
            <span className="reports-snapshot-meta-text">
              {citiesList.length > 0 ? citiesList.join(', ') : 'Todas as cidades'}
            </span>
          </div>
          <div className="reports-snapshot-meta-item-compact">
            <MdAccessTime className="reports-snapshot-meta-icon" />
            <span className="reports-snapshot-meta-text">{formattedDate}</span>
          </div>
        </div>

        {/* Métricas principais compactas */}
        <div className="reports-metrics-grid-compact">
          <MetricsCard
            title="Total"
            value={metrics.total_pedidos?.toLocaleString('pt-BR') || '0'}
            icon={MdDeliveryDining}
            color="blue"
          />
          <MetricsCard
            title="Entregues"
            value={metrics.entregues?.toLocaleString('pt-BR') || '0'}
            subtitle={`${metrics.taxa_entrega || 0}%`}
            icon={MdCheckCircle}
            color="green"
          />
          <MetricsCard
            title="Não Entregues"
            value={metrics.nao_entregues?.toLocaleString('pt-BR') || '0'}
            icon={MdCancel}
            color="red"
          />
        </div>

        {/* Status de Contatos */}
        {metrics.contatos && (
          <div className="reports-section-compact">
            <h4 className="reports-section-title-compact">
              <MdPeople /> Status de Contatos
            </h4>
            <div className="reports-contacts-grid-compact">
              <div className="reports-contact-card reports-contact-retornou">
                <MdCheckCircle className="reports-contact-icon" />
                <div className="reports-contact-content">
                  <div className="reports-contact-label">Retornou</div>
                  <div className="reports-contact-value">{metrics.contatos.retornou || 0}</div>
                </div>
              </div>
              <div className="reports-contact-card reports-contact-nao-retornou">
                <MdCancel className="reports-contact-icon" />
                <div className="reports-contact-content">
                  <div className="reports-contact-label">Não Retornou</div>
                  <div className="reports-contact-value">{metrics.contatos.nao_retornou || 0}</div>
                </div>
              </div>
              <div className="reports-contact-card reports-contact-esperando">
                <MdHourglassEmpty className="reports-contact-icon" />
                <div className="reports-contact-content">
                  <div className="reports-contact-label">Esperando Retorno</div>
                  <div className="reports-contact-value">{metrics.contatos.esperando_retorno || 0}</div>
                </div>
              </div>
              <div className="reports-contact-card reports-contact-errado">
                <MdPhone className="reports-contact-icon" />
                <div className="reports-contact-content">
                  <div className="reports-contact-label">Número Errado</div>
                  <div className="reports-contact-value">{metrics.contatos.numero_errado || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Distribuição por Base */}
        {metrics.por_base && metrics.por_base.length > 0 && (
          <div className="reports-section-compact">
            <h4 className="reports-section-title-compact">
              <MdBusiness /> Distribuição por Base
            </h4>
            <div className="reports-table-container-compact">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Base</th>
                    <th>Total</th>
                    <th>Entregues</th>
                    <th>Não Entregues</th>
                    <th>Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.por_base.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td className="reports-table-base">{item.base || 'N/A'}</td>
                      <td>{item.total?.toLocaleString('pt-BR') || 0}</td>
                      <td className="reports-table-success">{item.entregues?.toLocaleString('pt-BR') || 0}</td>
                      <td className="reports-table-danger">{item.nao_entregues?.toLocaleString('pt-BR') || 0}</td>
                      <td>
                        <div className="reports-table-rate">
                          <span className="reports-table-rate-value">{item.taxa_entrega || 0}%</span>
                          <div className="reports-table-rate-bar">
                            <div
                              className="reports-table-rate-fill"
                              style={{ width: `${item.taxa_entrega || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Motoristas */}
        {metrics.top_motoristas && metrics.top_motoristas.length > 0 && (
          <div className="reports-section-compact">
            <h4 className="reports-section-title-compact">
              <MdPeople /> Top Motoristas
            </h4>
            <div className="reports-table-container-compact">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Motorista</th>
                    <th>Total</th>
                    <th>Entregues</th>
                    <th>Não Entregues</th>
                    <th>Taxa</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.top_motoristas.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td className="reports-table-motorista">{item.motorista || 'N/A'}</td>
                      <td>{item.total?.toLocaleString('pt-BR') || 0}</td>
                      <td className="reports-table-success">{item.entregues?.toLocaleString('pt-BR') || 0}</td>
                      <td className="reports-table-danger">{item.nao_entregues?.toLocaleString('pt-BR') || 0}</td>
                      <td>
                        <div className="reports-table-rate">
                          <span className="reports-table-rate-value">{item.taxa_entrega || 0}%</span>
                          <div className="reports-table-rate-bar">
                            <div
                              className="reports-table-rate-fill"
                              style={{ width: `${item.taxa_entrega || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="reports-snapshot-card" style={{ borderLeftColor: moduleInfo?.color }}>
      <div className="reports-snapshot-header">
        <div className="reports-snapshot-info">
          <div className="reports-snapshot-title-row">
            <h3 className="reports-snapshot-title">
              <span className="reports-snapshot-module-badge" style={{ backgroundColor: moduleInfo?.color }}>
                {moduleInfo?.icon && <moduleInfo.icon />}
              </span>
              Snapshot
            </h3>
            {isRecent && (
              <span className="reports-snapshot-badge reports-snapshot-badge-recent" title="Criado nas últimas 24 horas">
                Recente
              </span>
            )}
            {isSpecific && (
              <span className="reports-snapshot-badge reports-snapshot-badge-specific" title="Snapshot específico com filtros">
                Específico
              </span>
            )}
          </div>
          <div className="reports-snapshot-meta-container">
            <div className="reports-snapshot-meta-item">
              <MdBusiness className="reports-snapshot-meta-icon" />
              <span className="reports-snapshot-meta-text">{baseInfo}</span>
            </div>
            <div className="reports-snapshot-meta-item" title={citiesList.length > 0 ? citiesList.join(', ') : 'Todas as cidades'}>
              <MdLocationCity className="reports-snapshot-meta-icon" />
              <span className="reports-snapshot-meta-text">{citiesInfo}</span>
            </div>
            <div className="reports-snapshot-meta-item">
              <MdAccessTime className="reports-snapshot-meta-icon" />
              <span className="reports-snapshot-meta-text">{formattedDate}</span>
            </div>
          </div>
        </div>
        <div className="reports-snapshot-actions">
          <button
            className="reports-export-btn reports-export-excel"
            onClick={() => onExportExcel(snapshot, module)}
            title="Exportar para Excel"
          >
            <FaFileExcel />
            <span>Excel</span>
          </button>
          <button
            className="reports-export-btn reports-export-pdf"
            onClick={() => onExportPDF(snapshot, module)}
            title="Exportar para PDF"
          >
            <FaFilePdf />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="reports-metrics-grid">
        <MetricsCard
          title="Total de Pedidos"
          value={metrics.total_pedidos?.toLocaleString('pt-BR') || '0'}
          icon={MdDeliveryDining}
          color="blue"
        />
        <MetricsCard
          title="Entregues"
          value={metrics.entregues?.toLocaleString('pt-BR') || '0'}
          subtitle={`${metrics.taxa_entrega || 0}% do total`}
          icon={MdCheckCircle}
          color="green"
        />
        <MetricsCard
          title="Não Entregues"
          value={metrics.nao_entregues?.toLocaleString('pt-BR') || '0'}
          subtitle={`${(100 - (metrics.taxa_entrega || 0)).toFixed(1)}% do total`}
          icon={MdCancel}
          color="red"
        />
        <MetricsCard
          title="Taxa de Entrega"
          value={`${metrics.taxa_entrega || 0}%`}
          icon={MdPercent}
          color="purple"
        />
        <MetricsCard
          title="Motoristas"
          value={metrics.total_motoristas?.toLocaleString('pt-BR') || '0'}
          icon={MdPeople}
          color="orange"
        />
        <MetricsCard
          title="Bases"
          value={metrics.total_bases?.toLocaleString('pt-BR') || '0'}
          icon={MdBusiness}
          color="blue"
        />
        <MetricsCard
          title="Cidades"
          value={metrics.total_cidades?.toLocaleString('pt-BR') || '0'}
          icon={MdLocationCity}
          color="green"
        />
        {metrics.contatos && (
          <MetricsCard
            title="Contatos Realizados"
            value={metrics.contatos.retornou?.toLocaleString('pt-BR') || '0'}
            subtitle="Retornaram contato"
            icon={MdCheckCircle}
            color="purple"
          />
        )}
      </div>

      {/* Status de Contatos */}
      {metrics.contatos && (
        <div className="reports-section">
          <h3 className="reports-section-title">
            <MdPeople /> Status de Contatos
          </h3>
          <div className="reports-contacts-grid">
            <div className="reports-contact-card reports-contact-retornou">
              <div className="reports-contact-icon">✅</div>
              <div className="reports-contact-content">
                <div className="reports-contact-label">Retornou</div>
                <div className="reports-contact-value">{metrics.contatos.retornou || 0}</div>
              </div>
            </div>
            <div className="reports-contact-card reports-contact-nao-retornou">
              <div className="reports-contact-icon">❌</div>
              <div className="reports-contact-content">
                <div className="reports-contact-label">Não Retornou</div>
                <div className="reports-contact-value">{metrics.contatos.nao_retornou || 0}</div>
              </div>
            </div>
            <div className="reports-contact-card reports-contact-esperando">
              <div className="reports-contact-icon">⏳</div>
              <div className="reports-contact-content">
                <div className="reports-contact-label">Esperando Retorno</div>
                <div className="reports-contact-value">{metrics.contatos.esperando_retorno || 0}</div>
              </div>
            </div>
            <div className="reports-contact-card reports-contact-errado">
              <div className="reports-contact-icon">📞</div>
              <div className="reports-contact-content">
                <div className="reports-contact-label">Número Errado</div>
                <div className="reports-contact-value">{metrics.contatos.numero_errado || 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribuição por Base */}
      {metrics.por_base && metrics.por_base.length > 0 && (
        <div className="reports-section">
          <h3 className="reports-section-title">
            <MdBusiness /> Distribuição por Base
          </h3>
          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Base</th>
                  <th>Total</th>
                  <th>Entregues</th>
                  <th>Não Entregues</th>
                  <th>Taxa de Entrega</th>
                </tr>
              </thead>
              <tbody>
                {metrics.por_base.slice(0, 20).map((item, index) => (
                  <tr key={index}>
                    <td className="reports-table-base">{item.base || 'N/A'}</td>
                    <td>{item.total?.toLocaleString('pt-BR') || 0}</td>
                    <td className="reports-table-success">{item.entregues?.toLocaleString('pt-BR') || 0}</td>
                    <td className="reports-table-danger">{item.nao_entregues?.toLocaleString('pt-BR') || 0}</td>
                    <td>
                      <div className="reports-table-rate">
                        <span className="reports-table-rate-value">{item.taxa_entrega || 0}%</span>
                        <div className="reports-table-rate-bar">
                          <div
                            className="reports-table-rate-fill"
                            style={{ width: `${item.taxa_entrega || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Motoristas */}
      {metrics.top_motoristas && metrics.top_motoristas.length > 0 && (
        <div className="reports-section">
          <h3 className="reports-section-title">
            <MdPeople /> Top Motoristas
          </h3>
          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Motorista</th>
                  <th>Total</th>
                  <th>Entregues</th>
                  <th>Não Entregues</th>
                  <th>Taxa de Entrega</th>
                </tr>
              </thead>
              <tbody>
                {metrics.top_motoristas.slice(0, 20).map((item, index) => (
                  <tr key={index}>
                    <td className="reports-table-motorista">{item.motorista || 'N/A'}</td>
                    <td>{item.total?.toLocaleString('pt-BR') || 0}</td>
                    <td className="reports-table-success">{item.entregues?.toLocaleString('pt-BR') || 0}</td>
                    <td className="reports-table-danger">{item.nao_entregues?.toLocaleString('pt-BR') || 0}</td>
                    <td>
                      <div className="reports-table-rate">
                        <span className="reports-table-rate-value">{item.taxa_entrega || 0}%</span>
                        <div className="reports-table-rate-bar">
                          <div
                            className="reports-table-rate-fill"
                            style={{ width: `${item.taxa_entrega || 0}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Distribuição por Tempo Parado (D1) ou Aging (PedidosRetidos) */}
      {(metrics.por_tempo_parado || metrics.por_aging) && (
        <div className="reports-section">
          <h3 className="reports-section-title">
            <MdAccessTime /> {metrics.por_tempo_parado ? 'Distribuição por Tempo Parado' : 'Distribuição por Aging'}
          </h3>
          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>{metrics.por_tempo_parado ? 'Tempo Parado' : 'Aging'}</th>
                  <th>Total de Pedidos</th>
                </tr>
              </thead>
              <tbody>
                {(metrics.por_tempo_parado || metrics.por_aging || []).map((item, index) => (
                  <tr key={index}>
                    <td className="reports-table-aging">{item.tempo_parado || item.aging || 'N/A'}</td>
                    <td>{item.total?.toLocaleString('pt-BR') || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function ModuleSection({ module, snapshots, error, onExportExcel, onExportPDF, selectedDate, onDateChange }) {
  const moduleInfo = MODULES.find(m => m.value === module)

  // Para SLA, Pedidos Retidos e D1, snapshots é um array; para outros, é um objeto único ou null
  const isSla = module === 'sla'
  const isPedidosRetidos = module === 'pedidos_parados'
  const isD1 = module === 'd1'
  const useAccordion = isSla || isPedidosRetidos || isD1
  const snapshotsArray = useAccordion ? (Array.isArray(snapshots) ? snapshots : []) : (snapshots ? [snapshots] : [])
  
  // Filtrar por data se selecionada (para SLA, Pedidos Retidos e D1)
  let filteredSnapshots = snapshotsArray
  if (useAccordion && selectedDate && selectedDate !== 'all') {
    filteredSnapshots = snapshotsArray.filter(snapshot => {
      const snapshotDate = new Date(snapshot.created_at || snapshot.snapshot_date)
      const snapshotDateStr = snapshotDate.toISOString().split('T')[0]
      return snapshotDateStr === selectedDate
    })
  }
  
  // Agrupar snapshots por data (formato YYYY-MM-DD) - para SLA, Pedidos Retidos e D1
  const snapshotsByDate = {}
  if (useAccordion) {
    filteredSnapshots.forEach(snapshot => {
      const snapshotDate = new Date(snapshot.created_at || snapshot.snapshot_date)
      const dateKey = snapshotDate.toISOString().split('T')[0]
      if (!snapshotsByDate[dateKey]) {
        snapshotsByDate[dateKey] = []
      }
      snapshotsByDate[dateKey].push(snapshot)
    })
  }
  
  // Ordenar datas (mais recente primeiro) - para SLA, Pedidos Retidos e D1
  const sortedDates = useAccordion ? Object.keys(snapshotsByDate).sort((a, b) => b.localeCompare(a)) : []

  // Agrupar snapshots por base dentro de cada data
  const groupSnapshotsByBase = (snapshots) => {
    const byBase = {}
    snapshots.forEach(snapshot => {
      const base = snapshot.base || 'Todas as bases'
      if (!byBase[base]) {
        byBase[base] = []
      }
      byBase[base].push(snapshot)
    })
    return byBase
  }

  // Formatar data para exibição
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Formatar título do snapshot
  const formatSnapshotTitle = (snapshot) => {
    const base = snapshot.base || 'Todas as bases'
    const cities = snapshot.cities && snapshot.cities.length > 0 ? snapshot.cities : []

    if (cities.length > 0 && cities.length <= 3) {
      return `${base} - ${cities.join(', ')}`
    } else if (cities.length > 3) {
      return `${base} - ${cities.slice(0, 2).join(', ')} e mais ${cities.length - 2}`
    } else {
      return `${base}`
    }
  }

  if (error) {
    return (
      <div className="reports-module-section">
        <div className="reports-module-header" style={{ borderLeftColor: moduleInfo?.color }}>
          <div className="reports-module-title-section">
            <h2 className="reports-module-title">
              <span className="reports-module-icon">{moduleInfo?.icon}</span>
              {moduleInfo?.label}
            </h2>
          </div>
        </div>
        <div className="reports-module-error">
          <p>Erro ao carregar dados: {error}</p>
        </div>
      </div>
    )
  }

  if (snapshotsArray.length === 0) {
    return (
      <div className="reports-module-section">
        <div className="reports-module-header" style={{ borderLeftColor: moduleInfo?.color }}>
          <div className="reports-module-title-section">
            <h2 className="reports-module-title">
              <span className="reports-module-icon">{moduleInfo?.icon}</span>
              {moduleInfo?.label}
            </h2>
          </div>
        </div>
        <div className="reports-module-empty">
          <p>Nenhum snapshot disponível. Vá até a página correspondente e clique no botão roxo para salvar um snapshot.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="reports-module-section">
      <div className="reports-module-header" style={{ borderLeftColor: moduleInfo?.color }}>
        <div className="reports-module-title-section">
          <h2 className="reports-module-title">
            <span className="reports-module-icon">{moduleInfo?.icon}</span>
            {moduleInfo?.label}
          </h2>
          <div className="reports-module-subtitle-row">
            <p className="reports-module-subtitle">
              {snapshotsArray.length} snapshot(s) disponível(is)
            </p>
            {snapshotsArray.length > 0 && (
              <span className="reports-module-badge-count" style={{ backgroundColor: moduleInfo?.color }}>
                {snapshotsArray.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Renderizar snapshots - Accordion para SLA, Pedidos Retidos e D1, lista simples para outros */}
      <div className="reports-snapshots-list">
        {useAccordion ? (
          // Para SLA, Pedidos Retidos e D1: usar accordion agrupado por data e base
          filteredSnapshots.length === 0 ? (
            <div className="reports-module-empty">
              <p>Nenhum snapshot encontrado para a data selecionada.</p>
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="reports-module-empty">
              <p>Erro ao processar snapshots. Total: {filteredSnapshots.length}</p>
            </div>
          ) : (
            sortedDates.map((dateKey) => {
              const dateSnapshots = snapshotsByDate[dateKey]
              const byBase = groupSnapshotsByBase(dateSnapshots)
              const bases = Object.keys(byBase).sort()

              return (
                <Accordion
                  key={dateKey}
                  title={formatDate(dateKey)}
                  icon={MdCalendarToday}
                  count={dateSnapshots.length}
                  defaultOpen={true} // Sempre abrir por padrão
                >
                  {bases.map((base) => {
                    const baseSnapshots = byBase[base]
                    return (
                      <Accordion
                        key={`${dateKey}-${base}`}
                        title={base}
                        icon={MdBusiness}
                        count={baseSnapshots.length}
                        defaultOpen={true} // Sempre abrir por padrão
                      >
                        <div className="reports-snapshots-base-list">
                          {baseSnapshots.map((snapshot, index) => (
                            <div key={snapshot._id || index} className="reports-snapshot-item">
                              <div className="reports-snapshot-item-header">
                                <div className="reports-snapshot-item-title">
                                  {formatSnapshotTitle(snapshot)}
                                </div>
                                <div className="reports-snapshot-item-actions">
                                  <button
                                    className="reports-export-btn reports-export-excel reports-export-btn-small"
                                    onClick={() => onExportExcel(snapshot, module)}
                                    title="Exportar para Excel"
                                  >
                                    <FaFileExcel />
                                  </button>
                                  <button
                                    className="reports-export-btn reports-export-pdf reports-export-btn-small"
                                    onClick={() => onExportPDF(snapshot, module)}
                                    title="Exportar para PDF"
                                  >
                                    <FaFilePdf />
                                  </button>
                                </div>
                              </div>
                              <SnapshotCard
                                snapshot={snapshot}
                                module={module}
                                onExportExcel={onExportExcel}
                                onExportPDF={onExportPDF}
                                compact={true}
                              />
                            </div>
                          ))}
                        </div>
                      </Accordion>
                    )
                  })}
                </Accordion>
              )
            })
          )
        ) : (
          // Para outros módulos: lista simples
          filteredSnapshots.length > 0 ? (
            filteredSnapshots.map((snapshot, index) => (
              <SnapshotCard
                key={snapshot._id || index}
                snapshot={snapshot}
                module={module}
                onExportExcel={onExportExcel}
                onExportPDF={onExportPDF}
              />
            ))
          ) : (
            <div className="reports-module-empty">
              <p>Nenhum snapshot disponível.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}


export default function Reports() {
  const { snapshots, isLoading, errors, refresh } = useReports()
  const { showSuccess, showError } = useNotification()
  const [selectedDate, setSelectedDate] = useState('all')

  // Obter lista de datas únicas dos snapshots SLA, Pedidos Retidos e D1
  const getAvailableDates = () => {
    const slaSnapshots = Array.isArray(snapshots.sla) ? snapshots.sla : []
    const pedidosRetidosSnapshots = Array.isArray(snapshots.pedidos_parados) ? snapshots.pedidos_parados : []
    const d1Snapshots = Array.isArray(snapshots.d1) ? snapshots.d1 : []
    const allSnapshots = [...slaSnapshots, ...pedidosRetidosSnapshots, ...d1Snapshots]
    const dates = new Set()
    allSnapshots.forEach(snapshot => {
      const date = new Date(snapshot.created_at || snapshot.snapshot_date)
      dates.add(date.toISOString().split('T')[0])
    })
    return Array.from(dates).sort((a, b) => b.localeCompare(a))
  }

  const availableDates = getAvailableDates()

  // Handlers de export
  const handleExportExcel = (snapshot, module) => {
    try {
      exportToExcel(snapshot, module)
      showSuccess('✅ Relatório exportado para Excel com sucesso!')
    } catch (err) {
      showError('Erro ao exportar relatório para Excel')
    }
  }

  const handleExportPDF = (snapshot, module) => {
    try {
      exportToPDF(snapshot, module)
      showSuccess('✅ Relatório preparado para impressão/PDF!')
    } catch (err) {
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

  return (
    <div className="reports-page">
      {/* Header Global */}
      <div className="reports-header">
        <div className="reports-header-content">
          <div className="reports-title-section">
            <h1 className="reports-title">
              <MdAssessment className="reports-title-icon" />
              Relatórios & Analytics
            </h1>
            <p className="reports-subtitle">
              Visão consolidada de todos os módulos do sistema
            </p>
          </div>

          {availableDates.length > 0 && (
            <div className="reports-date-filter-container">
              <div className="reports-date-filter">
                <label htmlFor="reports-date-select" className="reports-date-filter-label">
                  <MdAccessTime className="reports-date-filter-icon" />
                  Filtrar por data:
                </label>
                <select
                  id="reports-date-select"
                  className="reports-date-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <option value="all">Todas as datas ({availableDates.length} dia(s))</option>
                  {availableDates.map(date => {
                    const dateObj = new Date(date)
                    const formatted = dateObj.toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                    const slaSnapshots = Array.isArray(snapshots.sla) ? snapshots.sla : []
                    const pedidosSnapshots = Array.isArray(snapshots.pedidos_parados) ? snapshots.pedidos_parados : []
                    const d1Snapshots = Array.isArray(snapshots.d1) ? snapshots.d1 : []
                    const slaCount = slaSnapshots.filter(s => {
                      const sDate = new Date(s.created_at || s.snapshot_date)
                      return sDate.toISOString().split('T')[0] === date
                    }).length || 0
                    const pedidosCount = pedidosSnapshots.filter(s => {
                      const sDate = new Date(s.created_at || s.snapshot_date)
                      return sDate.toISOString().split('T')[0] === date
                    }).length || 0
                    const d1Count = d1Snapshots.filter(s => {
                      const sDate = new Date(s.created_at || s.snapshot_date)
                      return sDate.toISOString().split('T')[0] === date
                    }).length || 0
                    const count = slaCount + pedidosCount + d1Count
                    return (
                      <option key={date} value={date}>
                        {formatted} ({count} snapshot(s))
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          )}
        </div>
        {MODULES.map(module => (
          <ModuleSection
            key={module.value}
            module={module.value}
            snapshots={snapshots[module.value]}
            error={errors[module.value]}
            onExportExcel={handleExportExcel}
            onExportPDF={handleExportPDF}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        ))}
      </div>
    </div>
  )
}
