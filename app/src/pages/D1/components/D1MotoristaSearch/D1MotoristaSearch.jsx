import React, { useState, useMemo } from 'react'
import { FaSearch, FaTimes } from 'react-icons/fa'
import './D1MotoristaSearch.css'

const D1MotoristaSearch = ({ 
  motoristasData, 
  onFilteredDataChange,
  placeholder = 'Pesquisar por motorista, base ou número...'
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Função de pesquisa inteligente
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return motoristasData
    }

    const term = searchTerm.toLowerCase().trim()
    
    return motoristasData.filter((motorista) => {
      // Pesquisar no nome do motorista
      const nomeMotorista = (motorista.motorista || '').toLowerCase()
      if (nomeMotorista.includes(term)) {
        return true
      }

      // Pesquisar na base
      const base = (motorista.base_entrega || '').toLowerCase()
      if (base.includes(term)) {
        return true
      }

      // Pesquisar por números (total de pedidos, entregues, não entregues)
      const totalPedidos = String(motorista.total_pedidos || 0)
      const totalEntregues = String(motorista.total_entregues || 0)
      const totalNaoEntregues = String(motorista.total_nao_entregues || 0)
      
      if (totalPedidos.includes(term) || 
          totalEntregues.includes(term) || 
          totalNaoEntregues.includes(term)) {
        return true
      }

      // Pesquisa parcial no nome (ex: "joão" encontra "João Silva")
      const palavrasTermo = term.split(/\s+/)
      const palavrasNome = nomeMotorista.split(/\s+/)
      
      const todasPalavrasEncontradas = palavrasTermo.every(palavraTermo =>
        palavrasNome.some(palavraNome => palavraNome.includes(palavraTermo))
      )
      
      if (todasPalavrasEncontradas) {
        return true
      }

      return false
    })
  }, [motoristasData, searchTerm])

  // Notificar componente pai sobre dados filtrados sempre que mudar
  React.useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredData)
    }
  }, [filteredData, onFilteredDataChange])

  // Inicializar com todos os dados quando componente montar ou dados mudarem
  React.useEffect(() => {
    if (onFilteredDataChange && motoristasData.length > 0 && !searchTerm) {
      onFilteredDataChange(motoristasData)
    }
  }, [motoristasData, onFilteredDataChange, searchTerm])

  const handleClear = () => {
    setSearchTerm('')
  }

  return (
    <div className="d1-motorista-search-container">
      <div className="d1-motorista-search-wrapper">
        <FaSearch className="d1-motorista-search-icon" />
        <input
          type="text"
          className="d1-motorista-search-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="d1-motorista-search-clear"
            onClick={handleClear}
            title="Limpar pesquisa"
          >
            <FaTimes />
          </button>
        )}
      </div>
      {searchTerm && (
        <div className="d1-motorista-search-results">
          {filteredData.length > 0 ? (
            <span className="d1-motorista-search-count">
              {filteredData.length} motorista{filteredData.length !== 1 ? 's' : ''} encontrado{filteredData.length !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="d1-motorista-search-no-results">
              Nenhum motorista encontrado
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default D1MotoristaSearch

