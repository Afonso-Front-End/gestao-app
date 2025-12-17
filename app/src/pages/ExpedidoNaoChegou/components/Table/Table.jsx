import React from 'react'
import './Table.css'

const Table = ({ data, columns, onRowSelect, selectedRows, isAllSelected, onSelectAll }) => {
  if (!data || data.length === 0) {
    return (
      <div className="expedido-nao-chegou-table-empty">
        <p>Nenhum dado encontrado</p>
      </div>
    )
  }

  const getRemessaKey = (item) => {
    // Tentar encontrar o número de pedido JMS em várias variações
    return item.número_de_pedido_jms || 
           item.numero_de_pedido_jms || 
           item['número de pedido jms'] ||
           item['numero de pedido jms'] ||
           item.remessa || 
           item.codigo_remessa || 
           item.numero_remessa || 
           item._id
  }

  const getCellValue = (item, columnKey) => {
    const value = item[columnKey]
    if (value === null || value === undefined) {
      return '-'
    }
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return String(value)
  }

  return (
    <div className="expedido-nao-chegou-table-wrapper">
      <table className="expedido-nao-chegou-table">
        <thead>
          <tr>
            <th className="expedido-nao-chegou-table-checkbox">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                title="Selecionar todas"
              />
            </th>
            {columns.map(column => (
              <th key={column.key} className="expedido-nao-chegou-table-header">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const remessaKey = getRemessaKey(item)
            const isSelected = selectedRows.has(remessaKey)
            
            return (
              <tr
                key={remessaKey || index}
                className={`expedido-nao-chegou-table-row ${isSelected ? 'selected' : ''}`}
              >
                <td className="expedido-nao-chegou-table-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onRowSelect(remessaKey)}
                  />
                </td>
                {columns.map(column => (
                  <td key={column.key} className="expedido-nao-chegou-table-cell">
                    {getCellValue(item, column.key)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Table


