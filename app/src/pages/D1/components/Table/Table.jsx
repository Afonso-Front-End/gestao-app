import React from 'react'
import '../../../PedidosRetidos/components/Table/Table.css'

const Table = ({
  data = [],
  columns = [],
  title = "Tabela",
  emptyMessage = "Nenhum dado encontrado",
  renderCellContent = null, // Função personalizada para renderizar conteúdo das células
  width = "100%", // Largura da tabela
  height = "auto" // Altura da tabela
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="pr-table-container" style={{ width, height }}>
        <h3>{title}</h3>
        <div className="pr-table-empty">
          <p>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  // Se não foram definidas colunas, usar as chaves do primeiro item
  const tableColumns = columns.length > 0 ? columns : (data[0] ? Object.keys(data[0]) : [])


  const renderCellContentInternal = (row, rowIndex, column, colIndex) => {
    const key = typeof column === 'string' ? column : column.key
    const value = row[key]

    // Se há uma função personalizada de renderização, usar ela
    if (renderCellContent) {
      return renderCellContent(value, key, row)
    }

    // Renderização padrão
    return value
  }

  return (
    <div className="pr-table-container">
      <div className="pr-table-wrapper">
        <table className="pr-table">
          <thead>
            <tr>
              {tableColumns.map((column, index) => (
                <th key={index}>
                  {typeof column === 'string' ? column : column.header || column.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {tableColumns.map((column, colIndex) => {
                  const key = typeof column === 'string' ? column : column.key
                  return (
                    <td key={colIndex}>
                      {renderCellContentInternal(row, rowIndex, column, colIndex)}
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

export default Table
