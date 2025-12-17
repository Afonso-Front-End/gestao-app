import React from 'react'
import { FaFileExcel } from 'react-icons/fa'
import ExcelJS from 'exceljs'
import './DownloadExcelButton.css'

// Obter nome do mês em português
const getMonthName = (monthIndex) => {
  const months = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ]
  return months[monthIndex] || 'DEZEMBRO'
}

// Gerar datas do mês (1 a 31)
const generateDates = () => {
  const dates = []
  for (let i = 1; i <= 31; i++) {
    dates.push(i)
  }
  return dates
}

const DownloadExcelButton = ({ 
  data, 
  selectedMonth, 
  selectedYear, 
  onSuccess, 
  onError 
}) => {
  const handleDownload = async () => {
    if (!data || !data.metricas || data.metricas.length === 0) {
      if (onError) onError('Não há dados para exportar')
      return
    }

    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Indicadores SC')
      
      const dates = generateDates()
      const monthName = getMonthName(selectedMonth)
      const baseName = data.baseName || 'SJS'
      
      // Criar cabeçalho principal
      const headerText = `SC ${baseName} ${monthName} Meta`
      worksheet.mergeCells(1, 1, 1, 32) // Mesclar da coluna A até AF (32 colunas: 1 métrica + 31 datas)
      const headerCell = worksheet.getCell(1, 1)
      headerCell.value = headerText
      headerCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
      headerCell.alignment = { horizontal: 'center', vertical: 'middle' }
      headerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' }
      }
      
      // Criar linha de cabeçalho das datas
      const dateRow = worksheet.addRow([])
      dateRow.getCell(1).value = '' // Célula vazia para a coluna de métricas
      dateRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
      dateRow.getCell(1).font = { bold: true }
      dateRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
      dateRow.getCell(1).border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      }
      
      // Adicionar cabeçalhos das datas
      dates.forEach((date, index) => {
        const cell = dateRow.getCell(index + 2)
        const monthStr = String(selectedMonth + 1).padStart(2, '0')
        cell.value = `${date}/${monthStr}/${selectedYear}`
        cell.font = { bold: true }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        }
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
      })
      
      // Adicionar linhas de métricas
      data.metricas.forEach((metrica) => {
        const row = worksheet.addRow([])
        
        // Coluna de métrica (nome, nome chinês e meta)
        const metricaCell = row.getCell(1)
        const metaText = metrica.tipo === 'percentual' 
          ? `${metrica.meta.toFixed(2)}%` 
          : metrica.meta.toLocaleString('pt-BR')
        metricaCell.value = `${metrica.nome}\n${metrica.nomeChines}\nMeta: ${metaText}`
        metricaCell.alignment = { 
          horizontal: 'left', 
          vertical: 'top',
          wrapText: true
        }
        metricaCell.font = { size: 11 }
        metricaCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        }
        metricaCell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        }
        
        // Adicionar valores das datas
        dates.forEach((date, index) => {
          const cell = row.getCell(index + 2)
          const valor = metrica.valores[date] || '-'
          cell.value = valor === '' ? '-' : valor
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
          cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
          
          // Aplicar cores baseadas na meta (se houver valor)
          if (valor && valor !== '' && valor !== '-') {
            // Remover % e converter para número
            let numValor = valor.toString().replace('%', '').replace(',', '.').trim()
            numValor = parseFloat(numValor)
            
            if (!isNaN(numValor)) {
              const atendeMeta = metrica.maiorMelhor 
                ? numValor >= metrica.meta 
                : numValor <= metrica.meta
              
              if (atendeMeta) {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFD1FAE5' } // Verde claro
                }
              } else {
                cell.fill = {
                  type: 'pattern',
                  pattern: 'solid',
                  fgColor: { argb: 'FFFEE2E2' } // Vermelho claro
                }
              }
            }
          }
        })
      })
      
      // Ajustar largura das colunas
      worksheet.getColumn(1).width = 30 // Coluna de métricas
      // Ajustar todas as colunas de datas para 12
      for (let i = 2; i <= 32; i++) {
        worksheet.getColumn(i).width = 12
      }
      
      // Ajustar altura das linhas
      worksheet.getRow(1).height = 30 // Cabeçalho principal
      worksheet.getRow(2).height = 25 // Cabeçalho de datas
      data.metricas.forEach((_, index) => {
        worksheet.getRow(index + 3).height = 60 // Linhas de métricas
      })
      
      // Gerar buffer e fazer download
      const excelBuffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const monthNameLower = monthName.toLowerCase()
      link.download = `indicadores-sc-${selectedYear}-${monthNameLower}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      if (onSuccess) {
        onSuccess(`✅ Tabela exportada com sucesso!\n\nArquivo: indicadores-sc-${selectedYear}-${monthNameLower}.xlsx`)
      }
    } catch (error) {
      console.error('Erro ao exportar Excel:', error)
      if (onError) {
        onError(`Erro ao exportar tabela: ${error.message}`)
      }
    }
  }

  return (
    <button 
      className="download-excel-button" 
      onClick={handleDownload}
      title="Baixar tabela em Excel"
      disabled={!data || !data.metricas || data.metricas.length === 0}
    >
      <FaFileExcel />
    </button>
  )
}

export default DownloadExcelButton

