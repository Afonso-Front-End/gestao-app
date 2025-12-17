import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { FaCog } from 'react-icons/fa'
import { useNotification } from '../../contexts/NotificationContext'
import api from '../../services/api'
import IndicadoresTable from './components/IndicadoresTable/IndicadoresTable'
import ScreenshotButton from './components/ScreenshotButton/ScreenshotButton'
import DownloadExcelButton from './components/DownloadExcelButton/DownloadExcelButton'
import MetricasManager from './components/IndicadoresTable/components/MetricasManager/MetricasManager'
import './IndicadoresSC.css'

// Obter nome do mês em português
const getMonthName = (monthIndex) => {
  const months = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ]
  return months[monthIndex] || 'DEZEMBRO'
}

// Obter mês atual
const getCurrentMonth = () => {
  return new Date().getMonth() // 0-11
}

// Obter ano atual
const getCurrentYear = () => {
  return new Date().getFullYear()
}

// Gerar lista de anos (ano atual - 1 até ano atual + 1)
const generateYears = () => {
  const currentYear = getCurrentYear()
  const years = []
  for (let i = currentYear - 1; i <= currentYear + 1; i++) {
    years.push(i)
  }
  return years
}

const IndicadoresSC = () => {
  const { showSuccess, showError } = useNotification()
  
  const [indicadoresData, setIndicadoresData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [selectedYear, setSelectedYear] = useState(getCurrentYear())
  const [isLocked, setIsLocked] = useState(false)
  const [managerOpen, setManagerOpen] = useState(false)
  const [indicadoresDataForManager, setIndicadoresDataForManager] = useState(null)
  const tableRef = useRef(null)
  const availableYears = useMemo(() => generateYears(), [])
  
  // Carregar dados do mês e ano selecionados
  const loadData = useCallback(async (month, year) => {
    setLoading(true)
    try {
      const response = await api.get(`/indicadores-sc/data?mes=${month}&ano=${year}`)
      if (response.data.success && response.data.data) {
        setIndicadoresData(response.data.data)
      } else {
        // Se não houver dados, inicializar com null (a tabela criará os dados iniciais)
        setIndicadoresData(null)
      }
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 500) {
        // Não há dados ainda, inicializar vazio
        setIndicadoresData(null)
      } else {
        console.error('Erro ao carregar dados:', error)
        showError('Erro ao carregar dados dos indicadores')
      }
    } finally {
      setLoading(false)
    }
  }, [showError])
  
  useEffect(() => {
    loadData(selectedMonth, selectedYear)
  }, [selectedMonth, selectedYear, loadData])
  
  // Salvar dados do mês e ano selecionados
  const handleSave = useCallback(async (data) => {
    if (isLocked) {
      showError('A tabela está bloqueada. Desbloqueie para editar.')
      return
    }
    
    setSaving(true)
    try {
      const response = await api.post('/indicadores-sc/save', { 
        data: {
          ...data,
          mes: selectedMonth,
          ano: selectedYear
        }
      })
      if (response.data.success) {
        showSuccess('Dados salvos com sucesso!')
        setIndicadoresData(data)
      }
    } catch (error) {
      showError('Erro ao salvar dados dos indicadores')
    } finally {
      setSaving(false)
    }
  }, [showSuccess, showError, selectedMonth, selectedYear, isLocked])
  
  // Handler para mudança de mês
  const handleMonthChange = useCallback((newMonth) => {
    const monthNum = parseInt(newMonth)
    setSelectedMonth(monthNum)
  }, [])
  
  // Handler para mudança de ano
  const handleYearChange = useCallback((newYear) => {
    const yearNum = parseInt(newYear)
    setSelectedYear(yearNum)
  }, [])
  
  // Handler para bloquear/desbloquear
  const handleToggleLock = useCallback(() => {
    setIsLocked(prev => !prev)
    showSuccess(isLocked ? 'Tabela desbloqueada' : 'Tabela bloqueada')
  }, [isLocked, showSuccess])
  
  // Callback estável para atualizar dados
  const handleDataChange = useCallback((newData) => {
    setIndicadoresData(newData)
    setIndicadoresDataForManager(newData)
  }, [])
  
  // Handler para salvar métricas do manager
  const handleSaveMetricas = useCallback((newMetricas) => {
    if (!indicadoresDataForManager) return
    
    const newData = {
      ...indicadoresDataForManager,
      metricas: newMetricas
    }
    
    setIndicadoresData(newData)
    setIndicadoresDataForManager(newData)
    
    // Salvar no backend
    handleSave(newData)
  }, [indicadoresDataForManager, handleSave])
  
  // Atualizar dados do manager quando indicadoresData mudar
  useEffect(() => {
    if (indicadoresData) {
      setIndicadoresDataForManager(indicadoresData)
    }
  }, [indicadoresData])
  
  if (loading) {
    return (
      <div className="indicadores-sc">
        <div className="indicadores-sc-loading">
          <p>Carregando dados...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="indicadores-sc">
      <div className="indicadores-sc-header">
        <h1>Indicadores SC - Meta</h1>
        <div className="indicadores-sc-actions">
          <select
            className="indicadores-sc-year-select"
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            title="Selecionar ano"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            className="indicadores-sc-month-select"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            title="Selecionar mês"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {getMonthName(i)}
              </option>
            ))}
          </select>
          <button
            className={`indicadores-sc-lock-btn ${isLocked ? 'locked' : ''}`}
            onClick={handleToggleLock}
            title={isLocked ? 'Desbloquear edição' : 'Bloquear edição'}
          >
            {isLocked ? '🔒 Bloqueado' : '🔓 Desbloqueado'}
          </button>
          <button
            className="indicadores-sc-save-btn"
            onClick={() => handleSave(indicadoresData)}
            disabled={saving || !indicadoresData || isLocked}
          >
            {saving ? '⏳ Salvando...' : '💾 Salvar Dados'}
          </button>
          <button
            className="indicadores-manage-metricas-btn"
            onClick={() => setManagerOpen(true)}
            title="Gerenciar métricas"
            disabled={isLocked}
          >
            <FaCog />
          </button>
          <ScreenshotButton
            targetRef={tableRef}
            filename={`indicadores-sc-${selectedYear}-${getMonthName(selectedMonth).toLowerCase()}`}
            onSuccess={(message) => showSuccess(message)}
            onError={(error) => showError(error)}
            title="Capturar screenshot da tabela"
            size="medium"
          />
          <DownloadExcelButton
            data={indicadoresData}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSuccess={(message) => showSuccess(message)}
            onError={(error) => showError(error)}
          />
        </div>
      </div>
      
      <div className="indicadores-sc-content" ref={tableRef}>
        <IndicadoresTable
          data={indicadoresData}
          onDataChange={handleDataChange}
          onSave={handleSave}
          isLocked={isLocked}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
      
      <MetricasManager
        isOpen={managerOpen}
        onClose={() => setManagerOpen(false)}
        metricas={indicadoresDataForManager?.metricas || []}
        onSave={handleSaveMetricas}
        isLocked={isLocked}
      />
    </div>
  )
}

export default IndicadoresSC

