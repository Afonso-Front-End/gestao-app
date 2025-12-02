/**
 * Utilitários para geração de relatórios
 */
import api from '../../../services/api'

/**
 * Gera e baixa relatório Excel de contato
 * @param {Array} filtroBases - Array de bases filtradas
 * @param {Function} showSuccess - Função para mostrar sucesso
 * @param {Function} showError - Função para mostrar erro
 * @param {Function} showInfo - Função para mostrar informação
 */
export const gerarRelatorioExcel = async (filtroBases, showSuccess, showError, showInfo) => {
  try {
    const basesParam = filtroBases.length > 0 ? filtroBases.join(',') : ''
    const url = basesParam
      ? `/retidos/gerar-relatorio-contato?bases=${encodeURIComponent(basesParam)}`
      : '/retidos/gerar-relatorio-contato'

    showInfo('Gerando relatório Excel...')

    const response = await api.get(url, {
      responseType: 'blob'
    })

    // Obter o nome do arquivo do header ou gerar um
    const contentDisposition = response.headers['content-disposition']
    let filename = 'Relatorio_Contato.xlsx'
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '')
      }
    }

    // Fazer download do arquivo
    const blob = response.data
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(downloadUrl)
    document.body.removeChild(a)

    showSuccess(`✅ Relatório Excel gerado e baixado com sucesso!\n\nArquivo: ${filename}`)
  } catch (error) {
    // Erro ao gerar relatório
    showError(`Erro ao gerar relatório: ${error.message}`)
  }
}

