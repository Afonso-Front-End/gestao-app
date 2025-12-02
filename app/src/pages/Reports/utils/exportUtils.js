/**
 * Utilidades para exportação de relatórios
 */

/**
 * Exporta dados do snapshot para Excel (CSV)
 */
export function exportToExcel(snapshot) {
  if (!snapshot?.metrics) {
    console.error('Nenhum dado para exportar')
    return
  }

  const { metrics } = snapshot
  const timestamp = new Date(snapshot.created_at).toLocaleString('pt-BR').replace(/[/:]/g, '-')
  
  // Criar conteúdo CSV
  let csvContent = '\uFEFF' // BOM para UTF-8
  
  // Cabeçalho do relatório
  csvContent += `RELATÓRIO DE PEDIDOS PARADOS\n`
  csvContent += `Data de criação: ${new Date(snapshot.created_at).toLocaleString('pt-BR')}\n\n`
  
  // Métricas Gerais
  csvContent += `MÉTRICAS GERAIS\n`
  csvContent += `Total de Pedidos,${metrics.total_pedidos}\n`
  csvContent += `Pedidos Entregues,${metrics.entregues}\n`
  csvContent += `Pedidos Não Entregues,${metrics.nao_entregues}\n`
  csvContent += `Taxa de Entrega,${metrics.taxa_entrega}%\n`
  csvContent += `Total de Motoristas,${metrics.total_motoristas}\n`
  csvContent += `Total de Bases,${metrics.total_bases}\n`
  csvContent += `Total de Cidades,${metrics.total_cidades}\n\n`
  
  // Status de Contatos
  csvContent += `STATUS DE CONTATOS\n`
  csvContent += `Retornou,${metrics.contatos.retornou}\n`
  csvContent += `Não Retornou,${metrics.contatos.nao_retornou}\n`
  csvContent += `Esperando Retorno,${metrics.contatos.esperando_retorno}\n`
  csvContent += `Número Errado,${metrics.contatos.numero_errado}\n\n`
  
  // Distribuição por Base
  if (metrics.por_base && metrics.por_base.length > 0) {
    csvContent += `DISTRIBUIÇÃO POR BASE\n`
    csvContent += `Base,Total,Entregues,Não Entregues,Taxa de Entrega (%)\n`
    metrics.por_base.forEach(item => {
      csvContent += `${item.base},${item.total},${item.entregues},${item.nao_entregues},${item.taxa_entrega}\n`
    })
    csvContent += `\n`
  }
  
  // Top Motoristas
  if (metrics.top_motoristas && metrics.top_motoristas.length > 0) {
    csvContent += `TOP MOTORISTAS\n`
    csvContent += `Motorista,Total,Entregues,Não Entregues,Taxa de Entrega (%)\n`
    metrics.top_motoristas.forEach(item => {
      csvContent += `${item.motorista},${item.total},${item.entregues},${item.nao_entregues},${item.taxa_entrega}\n`
    })
    csvContent += `\n`
  }
  
  // Distribuição por Aging
  if (metrics.por_aging && metrics.por_aging.length > 0) {
    csvContent += `DISTRIBUIÇÃO POR AGING\n`
    csvContent += `Aging,Total\n`
    metrics.por_aging.forEach(item => {
      csvContent += `${item.aging},${item.total}\n`
    })
    csvContent += `\n`
  }
  
  // Top Cidades
  if (metrics.top_cidades && metrics.top_cidades.length > 0) {
    csvContent += `TOP CIDADES\n`
    csvContent += `Cidade,Total de Pedidos\n`
    metrics.top_cidades.forEach(item => {
      csvContent += `${item.cidade},${item.total}\n`
    })
    csvContent += `\n`
  }
  
  // Criar blob e fazer download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `relatorio_pedidos_parados_${timestamp}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Exporta dados do snapshot para PDF (texto formatado)
 */
export function exportToPDF(snapshot) {
  if (!snapshot?.metrics) {
    console.error('Nenhum dado para exportar')
    return
  }

  const { metrics } = snapshot
  const timestamp = new Date(snapshot.created_at).toLocaleString('pt-BR')
  
  // Criar conteúdo HTML para impressão
  const printWindow = window.open('', '_blank')
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Relatório de Pedidos Parados</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        h1 {
          color: #111827;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h2 {
          color: #3b82f6;
          margin-top: 30px;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .timestamp {
          color: #6b7280;
          font-size: 14px;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 600;
          color: #111827;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .metric-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          background: #f9fafb;
        }
        .metric-label {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 5px;
        }
        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }
        @media print {
          body { padding: 20px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>📊 Relatório de Pedidos Parados</h1>
      <div class="timestamp">Data de criação: ${timestamp}</div>
      
      <h2>Métricas Gerais</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total de Pedidos</div>
          <div class="metric-value">${metrics.total_pedidos.toLocaleString('pt-BR')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Taxa de Entrega</div>
          <div class="metric-value">${metrics.taxa_entrega}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Pedidos Entregues</div>
          <div class="metric-value">${metrics.entregues.toLocaleString('pt-BR')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Pedidos Não Entregues</div>
          <div class="metric-value">${metrics.nao_entregues.toLocaleString('pt-BR')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total de Motoristas</div>
          <div class="metric-value">${metrics.total_motoristas.toLocaleString('pt-BR')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total de Bases</div>
          <div class="metric-value">${metrics.total_bases.toLocaleString('pt-BR')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total de Cidades</div>
          <div class="metric-value">${metrics.total_cidades.toLocaleString('pt-BR')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Contatos Realizados</div>
          <div class="metric-value">${metrics.contatos.retornou.toLocaleString('pt-BR')}</div>
        </div>
      </div>
      
      <h2>Status de Contatos</h2>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Retornou</td><td>${metrics.contatos.retornou}</td></tr>
          <tr><td>Não Retornou</td><td>${metrics.contatos.nao_retornou}</td></tr>
          <tr><td>Esperando Retorno</td><td>${metrics.contatos.esperando_retorno}</td></tr>
          <tr><td>Número Errado</td><td>${metrics.contatos.numero_errado}</td></tr>
        </tbody>
      </table>
  `
  
  // Distribuição por Base
  if (metrics.por_base && metrics.por_base.length > 0) {
    htmlContent += `
      <h2>Distribuição por Base (Top 20)</h2>
      <table>
        <thead>
          <tr>
            <th>Base</th>
            <th>Total</th>
            <th>Entregues</th>
            <th>Não Entregues</th>
            <th>Taxa (%)</th>
          </tr>
        </thead>
        <tbody>
    `
    metrics.por_base.slice(0, 20).forEach(item => {
      htmlContent += `
        <tr>
          <td>${item.base}</td>
          <td>${item.total}</td>
          <td>${item.entregues}</td>
          <td>${item.nao_entregues}</td>
          <td>${item.taxa_entrega}%</td>
        </tr>
      `
    })
    htmlContent += `</tbody></table>`
  }
  
  // Top Motoristas
  if (metrics.top_motoristas && metrics.top_motoristas.length > 0) {
    htmlContent += `
      <h2>Top 20 Motoristas</h2>
      <table>
        <thead>
          <tr>
            <th>Motorista</th>
            <th>Total</th>
            <th>Entregues</th>
            <th>Não Entregues</th>
            <th>Taxa (%)</th>
          </tr>
        </thead>
        <tbody>
    `
    metrics.top_motoristas.slice(0, 20).forEach(item => {
      htmlContent += `
        <tr>
          <td>${item.motorista}</td>
          <td>${item.total}</td>
          <td>${item.entregues}</td>
          <td>${item.nao_entregues}</td>
          <td>${item.taxa_entrega}%</td>
        </tr>
      `
    })
    htmlContent += `</tbody></table>`
  }
  
  // Distribuição por Aging
  if (metrics.por_aging && metrics.por_aging.length > 0) {
    htmlContent += `
      <h2>Distribuição por Aging</h2>
      <table>
        <thead>
          <tr>
            <th>Aging</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
    `
    metrics.por_aging.forEach(item => {
      htmlContent += `<tr><td>${item.aging}</td><td>${item.total}</td></tr>`
    })
    htmlContent += `</tbody></table>`
  }
  
  // Top Cidades
  if (metrics.top_cidades && metrics.top_cidades.length > 0) {
    htmlContent += `
      <h2>Top 20 Cidades</h2>
      <table>
        <thead>
          <tr>
            <th>Cidade</th>
            <th>Total de Pedidos</th>
          </tr>
        </thead>
        <tbody>
    `
    metrics.top_cidades.slice(0, 20).forEach(item => {
      htmlContent += `<tr><td>${item.cidade}</td><td>${item.total}</td></tr>`
    })
    htmlContent += `</tbody></table>`
  }
  
  htmlContent += `
      <div style="margin-top: 40px; text-align: center;">
        <button onclick="window.print()" style="
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
        ">🖨️ Imprimir / Salvar PDF</button>
        <button onclick="window.close()" style="
          padding: 12px 24px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
        ">Fechar</button>
      </div>
    </body>
    </html>
  `
  
  printWindow.document.write(htmlContent)
  printWindow.document.close()
}

