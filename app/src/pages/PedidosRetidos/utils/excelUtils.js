/**
 * Utilitários para geração de arquivos Excel usando ExcelJS
 */
import ExcelJS from 'exceljs'

/**
 * Gera e baixa arquivo Excel a partir dos dados da tabela
 * @param {Array} data - Array de objetos com os dados da tabela
 * @param {Array} columns - Array de colunas (objetos com key e header ou strings)
 * @param {string} filename - Nome do arquivo (sem extensão)
 * @param {Function} showSuccess - Função para mostrar sucesso
 * @param {Function} showError - Função para mostrar erro
 */
export const gerarExcelTabela = async (data, columns, filename = 'tabela', showSuccess, showError) => {
  try {
    if (!data || data.length === 0) {
      if (showError) showError('Não há dados para exportar')
      return
    }

    // Preparar dados para Excel
    const dadosParaExcel = []
    
    // Adicionar cabeçalhos
    const headers = columns
      .filter(col => {
        const key = typeof col === 'string' ? col : col.key
        // Filtrar coluna de copiar
        return key !== 'copy'
      })
      .map(col => {
        if (typeof col === 'string') {
          return col
        }
        return col.header || col.key
      })
    dadosParaExcel.push(headers)

    // Adicionar linhas de dados
    data.forEach(row => {
      const linha = columns
        .filter(col => {
          const key = typeof col === 'string' ? col : col.key
          // Filtrar coluna de copiar
          return key !== 'copy'
        })
        .map(col => {
          const key = typeof col === 'string' ? col : col.key
          const valor = row[key]
          
          // Limpar valores HTML ou formatação se necessário
          if (typeof valor === 'string') {
            // Remover tags HTML se houver
            return valor.replace(/<[^>]*>/g, '').trim() || ''
          }
          
          // Converter null/undefined para string vazia
          if (valor === null || valor === undefined) {
            return ''
          }
          
          return valor
        })
      dadosParaExcel.push(linha)
    })

    // Criar workbook e worksheet com ExcelJS
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Dados')

    // Adicionar cabeçalhos com estilo
    worksheet.addRow(headers)
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }

    // Adicionar dados
    dadosParaExcel.slice(1).forEach(row => {
      worksheet.addRow(row)
    })

    // Ajustar largura das colunas automaticamente
    worksheet.columns.forEach((column, index) => {
      let maxLength = headers[index]?.length || 10
      column.eachCell({ includeEmpty: false }, (cell) => {
        const cellValue = String(cell.value || '')
        if (cellValue.length > maxLength) {
          maxLength = cellValue.length
        }
      })
      column.width = Math.min(Math.max(maxLength + 2, 10), 50)
    })

    // Gerar buffer
    const excelBuffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Criar link de download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    // O filename já vem com a data, então só adicionar a extensão
    link.download = `${filename}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    if (showSuccess) {
      showSuccess(`✅ Arquivo Excel gerado e baixado com sucesso!\n\nArquivo: ${filename}.xlsx`)
    }
  } catch (error) {
    console.error('Erro ao gerar Excel:', error)
    if (showError) {
      showError(`Erro ao gerar Excel: ${error.message}`)
    }
  }
}

