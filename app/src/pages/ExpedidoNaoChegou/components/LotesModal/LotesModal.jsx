import React, { useState, useCallback, useMemo, useRef, memo, useEffect } from 'react'
import ExcelJS from 'exceljs'
import './LotesModal.css'

// Componente de linha memoizado para evitar re-renders desnecessários
const PlanilhaRow = memo(({ row, rowIndex, globalIndex, onCellChange, onPaste }) => {
  return (
    <tr>
      <td>
        <input
          type="text"
          value={row.numerosPedidos}
          onChange={(e) => onCellChange(globalIndex, 'numerosPedidos', e.target.value)}
          onPaste={(e) => onPaste(globalIndex, e)}
          className="lotes-planilha-input lotes-planilha-input-numbers"
          placeholder="Cole os números aqui"
        />
      </td>
      <td>
        <input
          type="text"
          value={row.tipoOperacao}
          onChange={(e) => onCellChange(globalIndex, 'tipoOperacao', e.target.value)}
          className="lotes-planilha-input"
        />
      </td>
      <td>
        <input
          type="text"
          value={row.primeiroNivelCodificacao}
          onChange={(e) => onCellChange(globalIndex, 'primeiroNivelCodificacao', e.target.value)}
          className="lotes-planilha-input"
        />
      </td>
      <td>
        <input
          type="text"
          value={row.nivelIICodificacao}
          onChange={(e) => onCellChange(globalIndex, 'nivelIICodificacao', e.target.value)}
          className="lotes-planilha-input"
        />
      </td>
      <td>
        <input
          type="text"
          value={row.causaProblema}
          onChange={(e) => onCellChange(globalIndex, 'causaProblema', e.target.value)}
          className="lotes-planilha-input"
        />
      </td>
    </tr>
  )
})

PlanilhaRow.displayName = 'PlanilhaRow'

const LotesModal = ({ isOpen, onClose, remessasLotes, remessasUnicas, onCopyLote, tamanhoLote = 1000 }) => {
  const planilhaDataRef = useRef({})
  const [, forceUpdate] = useState(0)

  // Valores padrão para as colunas
  const defaultValues = useMemo(() => ({
    tipoOperacao: 'Transit',
    primeiroNivelCodificacao: 'N00',
    nivelIICodificacao: 'N29a',
    causaProblema: 'Encomenda.expedido.mas.não.chegou.有发未到件',
    numerosPedidos: ''
  }), [])

  // Função para obter ou criar linha (lazy loading)
  const getRow = useCallback((index) => {
    if (!planilhaDataRef.current[index]) {
      planilhaDataRef.current[index] = {
        id: index + 1,
        ...defaultValues
      }
    }
    return planilhaDataRef.current[index]
  }, [defaultValues])


  // Função para obter chave do localStorage (adaptado para Expedido e Não Chegou)
  const getStorageKey = useCallback((loteNumero) => {
    return `expedido_nao_chegou_lote_${loteNumero}_planilha`
  }, [])

  // Carregar dados do localStorage
  const loadFromStorage = useCallback((loteNumero) => {
    try {
      const key = getStorageKey(loteNumero)
      const saved = localStorage.getItem(key)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Erro ao carregar do localStorage:', e)
    }
    return null
  }, [getStorageKey])

  // Salvar dados no localStorage
  const saveToStorage = useCallback((loteNumero, data) => {
    try {
      const key = getStorageKey(loteNumero)
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e)
    }
  }, [getStorageKey])

  // Inicializar e preencher automaticamente
  React.useEffect(() => {
    if (isOpen && tamanhoLote === 500 && remessasLotes.length > 0) {
      
      let needsUpdate = false
      
      // Para cada lote, verificar se há dados salvos ou preencher automaticamente
      remessasLotes.forEach((lote) => {
        const startIndex = (lote.numero_lote - 1) * 500
        const savedData = loadFromStorage(lote.numero_lote)
        
        if (savedData && Object.keys(savedData).length > 0) {
          // Carregar dados salvos
          Object.keys(savedData).forEach(index => {
            const numIndex = parseInt(index)
            if (numIndex >= startIndex && numIndex < startIndex + 500) {
              planilhaDataRef.current[numIndex] = savedData[index]
              needsUpdate = true
            }
          })
        } else {
          // Preencher automaticamente com os números das remessas
          lote.remessas.forEach((remessa, index) => {
            const globalIndex = startIndex + index
            if (globalIndex < startIndex + 500) {
              planilhaDataRef.current[globalIndex] = {
                id: globalIndex + 1,
                ...defaultValues,
                numerosPedidos: remessa
              }
              needsUpdate = true
            }
          })
          
          // Preencher linhas restantes com valores padrão
          for (let i = lote.remessas.length; i < 500; i++) {
            const globalIndex = startIndex + i
            planilhaDataRef.current[globalIndex] = {
              id: globalIndex + 1,
              ...defaultValues
            }
          }
          
          // Salvar automaticamente após preencher
          const loteData = {}
          for (let i = startIndex; i < startIndex + 500; i++) {
            if (planilhaDataRef.current[i]) {
              loteData[i] = planilhaDataRef.current[i]
            }
          }
          saveToStorage(lote.numero_lote, loteData)
        }
      })
      
      if (needsUpdate) {
        forceUpdate(prev => prev + 1)
      }
    } else if (!isOpen || tamanhoLote !== 500) {
      planilhaDataRef.current = {}
    }
  }, [isOpen, tamanhoLote, remessasLotes, defaultValues, loadFromStorage, saveToStorage])

  // Função para colar dados na coluna de números de pedidos
  const handlePasteNumbers = useCallback((rowIndex, event) => {
    if (tamanhoLote !== 500) return
    
    event.preventDefault()
    const pastedText = (event.clipboardData || window.clipboardData).getData('text')
    // Separar por quebra de linha (cada número em uma linha)
    const numeros = pastedText.split(/\r?\n/).map(num => num.trim()).filter(num => num !== '')
    
    const loteNumero = Math.floor(rowIndex / 500) + 1
    const startIndex = (loteNumero - 1) * 500
    
    // Cada número ocupa uma linha, começando da linha atual
    numeros.forEach((numero, index) => {
      const targetIndex = rowIndex + index
      if (targetIndex < startIndex + 500) {
        const existingRow = planilhaDataRef.current[targetIndex] || {
          id: targetIndex + 1,
          ...defaultValues
        }
        planilhaDataRef.current[targetIndex] = {
          ...existingRow,
          numerosPedidos: numero
        }
      }
    })
    
    // Salvar no localStorage automaticamente
    const loteData = {}
    for (let i = startIndex; i < startIndex + 500; i++) {
      if (planilhaDataRef.current[i]) {
        loteData[i] = planilhaDataRef.current[i]
      }
    }
    saveToStorage(loteNumero, loteData)
    
    forceUpdate(prev => prev + 1)
  }, [tamanhoLote, defaultValues, saveToStorage])

  // Função para exportar planilha para Excel
  const handleExportExcel = useCallback(async (lote) => {
    try {
      const startIndex = (lote.numero_lote - 1) * 500
      const endIndex = startIndex + 500
      
      // Coletar dados do lote
      const dados = []
      for (let i = startIndex; i < endIndex; i++) {
        const row = getRow(i)
        dados.push({
          'Número de Pedido': row.numerosPedidos || '',
          'Tipo de Operação': row.tipoOperacao || '',
          'Primeiro Nível Codificação': row.primeiroNivelCodificacao || '',
          'Nível II Codificação': row.nivelIICodificacao || '',
          'Causa do Problema': row.causaProblema || ''
        })
      }
      
      if (dados.length === 0) {
        return
      }
      
      // Criar workbook
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Lote ' + lote.numero_lote)
      
      // Definir cabeçalhos
      const headers = [
        'Número de Pedido',
        'Tipo de Operação',
        'Primeiro Nível Codificação',
        'Nível II Codificação',
        'Causa do Problema'
      ]
      
      // Adicionar cabeçalhos com estilo
      worksheet.addRow(headers)
      const headerRow = worksheet.getRow(1)
      headerRow.font = { bold: true, size: 12 }
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
      
      // Adicionar dados
      dados.forEach(row => {
        worksheet.addRow([
          row['Número de Pedido'],
          row['Tipo de Operação'],
          row['Primeiro Nível Codificação'],
          row['Nível II Codificação'],
          row['Causa do Problema']
        ])
      })
      
      // Ajustar largura das colunas
      worksheet.columns.forEach((column, index) => {
        let maxLength = headers[index]?.length || 10
        column.eachCell({ includeEmpty: false }, (cell) => {
          const cellValue = String(cell.value || '')
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length
          }
        })
        column.width = Math.min(Math.max(maxLength + 2, 15), 60)
      })
      
      // Gerar buffer e fazer download
      const excelBuffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const dateStr = new Date().toISOString().split('T')[0]
      link.download = `Lote_${lote.numero_lote}_ExpedidoNaoChegou_${dateStr}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
    }
  }, [getRow])

  // Função para atualizar célula
  const handleCellChange = useCallback((rowIndex, field, value) => {
    const existingRow = planilhaDataRef.current[rowIndex] || {
      id: rowIndex + 1,
      ...defaultValues
    }
    planilhaDataRef.current[rowIndex] = {
      ...existingRow,
      [field]: value
    }
    
    // Salvar no localStorage automaticamente
    const loteNumero = Math.floor(rowIndex / 500) + 1
    const startIndex = (loteNumero - 1) * 500
    const loteData = {}
    for (let i = startIndex; i < startIndex + 500; i++) {
      if (planilhaDataRef.current[i]) {
        loteData[i] = planilhaDataRef.current[i]
      }
    }
    saveToStorage(loteNumero, loteData)
    
    // Forçar re-render apenas se necessário
    forceUpdate(prev => prev + 1)
  }, [defaultValues, saveToStorage])

  const [isClosing, setIsClosing] = useState(false)

  // Função para fechar com animação
  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 250) // Tempo da animação
  }, [onClose])

  // Resetar estado de fechamento quando abrir
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  if (!isOpen && !isClosing) return null

  return (
    <div className={`lotes-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="lotes-modal">
        <div className="lotes-modal-header">
          <h2>Lotes de Remessas ({tamanhoLote} por lote)</h2>
          <button
            className="lotes-modal-close"
            onClick={handleClose}
            title="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="lotes-modal-content">
          <p className="lotes-modal-info">
            Total: {remessasUnicas.length.toLocaleString('pt-BR')} remessa(s) divididas em {remessasLotes.length} lote(s) de {tamanhoLote}
          </p>
          
          {tamanhoLote === 500 ? (
            <div className="lotes-planilha-container">
              {remessasLotes.map((lote) => (
                <div key={lote.numero_lote} className="lote-planilha">
                  <h3 className="lote-planilha-title">
                    Lote {lote.numero_lote} - {lote.total_remessas.toLocaleString('pt-BR')} remessa(s)
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="lotes-btn-copy-lote-small"
                        onClick={() => onCopyLote(lote)}
                        title="Copiar números de remessas"
                      >
                        📋 Copiar
                      </button>
                      <button
                        className="lotes-btn-download-excel"
                        onClick={() => handleExportExcel(lote)}
                        title="Baixar planilha em Excel"
                      >
                        📥 Excel
                      </button>
                    </div>
                  </h3>
                  <div className="lotes-planilha-wrapper">
                    <table className="lotes-planilha-table">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Tipo de Operação</th>
                          <th>Primeiro Nível Codificação</th>
                          <th>Nível II Codificação</th>
                          <th>Causa do Problema</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Renderizar todas as linhas (virtualização desabilitada temporariamente para melhor UX) */}
                        {Array.from({ length: 500 }, (_, rowIndex) => {
                          const globalIndex = (lote.numero_lote - 1) * 500 + rowIndex
                          const row = getRow(globalIndex)
                          return (
                            <PlanilhaRow
                              key={`lote-${lote.numero_lote}-row-${rowIndex}`}
                              row={row}
                              rowIndex={rowIndex}
                              globalIndex={globalIndex}
                              onCellChange={handleCellChange}
                              onPaste={handlePasteNumbers}
                            />
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="lotes-grid">
              {remessasLotes.map((lote) => (
                <div key={lote.numero_lote} className="lote-card">
                  <button
                    className="lotes-btn-copy-lote"
                    onClick={() => onCopyLote(lote)}
                    title={`Copiar ${lote.total_remessas.toLocaleString('pt-BR')} remessa(s) do lote ${lote.numero_lote}`}
                  >
                    <p>Copiar {lote.total_remessas.toLocaleString('pt-BR')} remessa(s)</p>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LotesModal


