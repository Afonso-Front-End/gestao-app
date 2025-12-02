import React from 'react'
import './ListaTelefonesTable.css'

const ListaTelefonesTable = ({
  data = [],
  loading = false,
  title = "Lista de Telefones",
  titleSummary = null,
  titleLeft = null,
  width = "100%",
  height = "600px"
}) => {
  // Função para determinar a cor baseada no status
  const getStatusColor = (value, columnName = '') => {
    if (!value) return 'default'

    const valueStr = value.toString().toLowerCase()
    const columnStr = columnName.toString().toLowerCase()

    // Verificação prioritária: se contém * em HUB ou Contato = Vermelho
    if (valueStr.includes('*') && 
        (columnStr.includes('hub') || columnStr.includes('contato') || 
         columnStr.includes('telefone') || columnStr.includes('código'))) {
      return 'error'
    }

    // Status aprovados/positivos - Verde
    if (valueStr.includes('aprovado') || valueStr.includes('aprovada') ||
      valueStr.includes('ativo') || valueStr.includes('ativa') ||
      valueStr.includes('concluído') || valueStr.includes('concluida') ||
      valueStr.includes('entregue') || valueStr.includes('sucesso') ||
      valueStr.includes('finalizado') || valueStr.includes('finalizada')) {
      return 'success'
    }

    // Status rejeitados/negativos - Vermelho
    if (valueStr.includes('rejeitado') || valueStr.includes('rejeitada') ||
      valueStr.includes('cancelado') || valueStr.includes('cancelada') ||
      valueStr.includes('inativo') || valueStr.includes('inativa') ||
      valueStr.includes('erro') || valueStr.includes('falha') ||
      valueStr.includes('pendente') || valueStr.includes('aguardando')) {
      return 'error'
    }

    // Status em andamento - Amarelo/Laranja
    if (valueStr.includes('processando') || valueStr.includes('em andamento') ||
      valueStr.includes('aguardando') || valueStr.includes('pendente') ||
      valueStr.includes('em análise') || valueStr.includes('revisão')) {
      return 'warning'
    }

    // Contatos/Telefones - Azul (exceto se tiver *)
    if ((columnStr.includes('contato') || columnStr.includes('telefone') ||
      valueStr.includes('(') && valueStr.includes(')') ||
      /^\d{2,3}\s?\d{4,5}-?\d{4}$/.test(valueStr.replace(/[^\d]/g, ''))) &&
      !valueStr.includes('*')) {
      return 'info'
    }

    // Datas - Roxo
    if (columnStr.includes('data') || 
      /\d{2}\/\d{2}\/\d{4}/.test(valueStr) ||
      /\d{4}-\d{2}-\d{2}/.test(valueStr)) {
      return 'date'
    }

    // Cidades/Localização - Verde claro
    if (columnStr.includes('cidade') || columnStr.includes('local') ||
      columnStr.includes('endereço') || columnStr.includes('bairro')) {
      return 'location'
    }

    // Nomes de pessoas - Rosa
    if (columnStr.includes('motorista') || columnStr.includes('nome') ||
      columnStr.includes('pessoa') || columnStr.includes('responsável')) {
      return 'person'
    }

    // HUB/Códigos - Laranja (exceto se tiver *)
    if ((columnStr.includes('hub') || columnStr.includes('código') ||
      columnStr.includes('id') || columnStr.includes('numero')) &&
      !valueStr.includes('*')) {
      return 'code'
    }

    return 'default'
  }
  if (!data || data.length === 0) {
    return (
      <div className="lista-telefones-table-container">
        <div className="lista-telefones-table-header">
          <div className="lista-telefones-table-header-content">
            <h3>{title}</h3>
            <div>
              {titleSummary &&
                <div className="lista-telefones-table-title-summary">
                  {titleLeft &&
                    <div className="lista-telefones-table-title-left">{titleLeft}</div>}
                  {titleSummary}
                </div>}
            </div>
          </div>
        </div>
        <div className="lista-telefones-table-empty">
          <p>{loading ? 'Carregando dados...' : 'Nenhum dado encontrado'}</p>
        </div>
      </div>
    )
  }

  // Se não foram definidas colunas, usar as chaves do primeiro item
  const tableColumns = data[0] ? Object.keys(data[0]) : []

  return (
    <div className="lista-telefones-table-container">
      <div className="lista-telefones-table-header">
        <div className="lista-telefones-table-header-content">
          <h3>{title}</h3>
          <div>
            {titleSummary &&
              <div className="lista-telefones-table-title-summary">
                {titleLeft &&
                  <div className="lista-telefones-table-title-left">{titleLeft}</div>}
                {titleSummary}
              </div>}
          </div>
        </div>
      </div>
      <div className="lista-telefones-table-wrapper">
        <table className="lista-telefones-table">
          <thead>
            <tr>
              {tableColumns.map((column, index) => (
                <th key={index}><div>{column}</div></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {tableColumns.map((column, colIndex) => {
                  const value = row[column] || ''
                  const statusColor = getStatusColor(value, column)
                  return (
                    <td key={colIndex} className={`status-${statusColor}`}>
                      <div>
                        {typeof value === 'object' && value !== null
                          ? JSON.stringify(value, null, 2)
                          : value || 'N/A'
                        }
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ListaTelefonesTable
