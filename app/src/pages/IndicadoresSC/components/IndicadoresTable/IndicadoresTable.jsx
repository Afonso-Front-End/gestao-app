import React, { useState, useEffect, useMemo, useRef } from 'react'
import './IndicadoresTable.css'

// Definição das métricas e suas metas
const METRICAS = [
  {
    id: 'tx_expedicao_sc_sc',
    nome: 'Tx de expedição SC-SC',
    nomeChines: '出港转运及时率',
    meta: 95.00,
    tipo: 'percentual',
    maiorMelhor: true
  },
  {
    id: 'tx_expedicao_sc_dc',
    nome: 'Tx de expedição SC-DC',
    nomeChines: '进港转运及时率',
    meta: 98.00,
    tipo: 'percentual',
    maiorMelhor: true
  },
  {
    id: 'envio_errado_sc_sc',
    nome: 'Envio errado SC-SC',
    nomeChines: '中心错发率',
    meta: 0.50,
    tipo: 'percentual',
    maiorMelhor: false
  },
  {
    id: 'erro_triagem_sc_dc',
    nome: 'Erro de triagem SC-DC',
    nomeChines: '发件漏扫',
    meta: 0.20,
    tipo: 'percentual',
    maiorMelhor: false
  },
  {
    id: 'avaria_ppm',
    nome: 'Avaria(PPM)',
    nomeChines: '百万票破损',
    meta: 130,
    tipo: 'numero',
    maiorMelhor: false
  },
  {
    id: 'extravio_ppm',
    nome: 'Extravio(PPM)',
    nomeChines: '百万票遗失',
    meta: 350,
    tipo: 'numero',
    maiorMelhor: false
  },
  {
    id: 'eficiencia',
    nome: 'Eficiencia',
    nomeChines: '操作人效 - 剔除后',
    meta: 1000,
    tipo: 'numero',
    maiorMelhor: true
  }
]

// Gerar datas do mês (1 a 31)
const generateDates = () => {
  const dates = []
  for (let i = 1; i <= 31; i++) {
    dates.push(i)
  }
  return dates
}

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

const IndicadoresTable = ({ data, onDataChange, onSave, isLocked = false, selectedMonth = null, selectedYear = null }) => {
  const [localData, setLocalData] = useState(null)
  const [editingCell, setEditingCell] = useState(null)
  const [baseName, setBaseName] = useState('SJS')
  const currentMonth = selectedMonth !== null ? selectedMonth : getCurrentMonth()
  const currentYear = selectedYear !== null ? selectedYear : new Date().getFullYear()
  const dates = useMemo(() => generateDates(), [])
  const initializedRef = useRef(false)
  
  // Inicializar dados se não existirem
  useEffect(() => {
    // Resetar quando o mês mudar
    initializedRef.current = false
    
    // Se já temos dados do backend, usar eles
    if (data) {
      // Carregar nome da base se existir
      if (data.baseName) {
        setBaseName(data.baseName)
      }
      setLocalData(data)
      initializedRef.current = true
      return
    }
    
    // Se não há dados e ainda não inicializamos, criar estrutura inicial
    if (!initializedRef.current) {
      // Se não há métricas nos dados, usar as padrão
      const metricasIniciais = data?.metricas && data.metricas.length > 0
        ? data.metricas
        : METRICAS.map(metrica => ({
            ...metrica,
            valores: dates.reduce((acc, date) => {
              acc[date] = ''
              return acc
            }, {})
          }))
      
      const initialData = {
        baseName: data?.baseName || 'SJS',
        mes: currentMonth,
        mesNome: getMonthName(currentMonth),
        ano: currentYear,
        metricas: metricasIniciais
      }
      setLocalData(initialData)
      initializedRef.current = true
    }
  }, [data, dates, currentMonth, currentYear]) // Adicionado currentYear
  
  // Função para verificar se o valor atende à meta
  const checkMeta = (metrica, valor) => {
    if (!valor || valor === '' || valor === '-') return null
    
    // Remover % e converter para número
    let numValor = valor.toString().replace('%', '').replace(',', '.').trim()
    numValor = parseFloat(numValor)
    
    if (isNaN(numValor)) return null
    
    if (metrica.maiorMelhor) {
      return numValor >= metrica.meta
    } else {
      return numValor <= metrica.meta
    }
  }
  
  // Função para formatar valor ao exibir (não usada no input, mas útil para display)
  const formatValue = (metrica, valor) => {
    if (!valor || valor === '' || valor === '-') return '-'
    if (metrica.tipo === 'percentual') {
      const num = parseFloat(valor.toString().replace(',', '.'))
      if (isNaN(num)) return valor
      return num.toFixed(2).replace('.', ',') + '%'
    }
    return valor.toString()
  }
  
  // Função para obter classe CSS baseada na meta
  const getCellClass = (metrica, valor) => {
    const atendeMeta = checkMeta(metrica, valor)
    if (atendeMeta === null) return 'indicadores-cell-empty'
    return atendeMeta ? 'indicadores-cell-good' : 'indicadores-cell-bad'
  }
  
  // Handler para mudança de célula
  const handleCellChange = (metricaId, date, value) => {
    if (!localData || isLocked) return
    
    const newData = { ...localData }
    const metrica = newData.metricas.find(m => m.id === metricaId)
    if (metrica) {
      metrica.valores[date] = value
      setLocalData(newData)
      // Atualizar o estado do pai apenas quando o usuário edita
      if (onDataChange) {
        onDataChange(newData)
      }
    }
  }
  
  // Handler para mudança do nome da base
  const handleBaseNameChange = (newBaseName) => {
    if (isLocked) return
    setBaseName(newBaseName)
    if (localData) {
      const newData = {
        ...localData,
        baseName: newBaseName
      }
      setLocalData(newData)
      if (onDataChange) {
        onDataChange(newData)
      }
    }
  }
  
  // Handler para salvar ao sair da célula
  const handleCellBlur = () => {
    if (editingCell && localData) {
      // Auto-save após edição
      setTimeout(() => {
        onSave(localData)
      }, 500)
    }
    setEditingCell(null)
  }
  
  
  if (!localData) {
    return <div className="indicadores-table-loading">Carregando...</div>
  }
  
  return (
    <>
      <div className="indicadores-table-container">
        <div className="indicadores-table-wrapper">
          <table className="indicadores-table">
            <thead>
              <tr>
                <th className="indicadores-th-metrica">
                  <div className="indicadores-header-base">
                    <span>SC </span>
                    <input
                      type="text"
                      value={baseName}
                      onChange={(e) => handleBaseNameChange(e.target.value)}
                      onBlur={() => {
                        if (localData && onSave && !isLocked) {
                          setTimeout(() => {
                            onSave(localData)
                          }, 500)
                        }
                      }}
                      className="indicadores-base-input"
                      placeholder="Nome da base"
                      disabled={isLocked}
                      readOnly={isLocked}
                    />
                    <span> {localData?.mesNome || getMonthName(currentMonth)} Meta</span>
                  </div>
                </th>
                {dates.map(date => (
                  <th key={date} className="indicadores-th-date">
                    {date}/{String(currentMonth + 1).padStart(2, '0')}/{currentYear}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {localData.metricas.map((metrica) => (
                <tr key={metrica.id}>
                <td className="indicadores-td-metrica">
                  <div className="indicadores-metrica-info">
                    <div className="indicadores-metrica-nome">{metrica.nome}</div>
                    <div className="indicadores-metrica-chines">{metrica.nomeChines}</div>
                    <div className="indicadores-metrica-meta">
                      Meta: {metrica.tipo === 'percentual' 
                        ? metrica.meta.toFixed(2) + '%' 
                        : metrica.meta.toLocaleString('pt-BR')}
                    </div>
                  </div>
                </td>
                  {dates.map(date => {
                    const valor = metrica.valores[date] || ''
                    const cellKey = `${metrica.id}-${date}`
                    const isEditing = editingCell === cellKey
                    
                    return (
                      <td
                        key={date}
                        className={`indicadores-cell ${getCellClass(metrica, valor)}`}
                      >
                        <input
                          type="text"
                          value={valor}
                          onChange={(e) => handleCellChange(metrica.id, date, e.target.value)}
                          onFocus={() => setEditingCell(cellKey)}
                          onBlur={handleCellBlur}
                          className="indicadores-cell-input"
                          placeholder="-"
                          disabled={isLocked}
                          readOnly={isLocked}
                        />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </>
  )
}

export default IndicadoresTable

