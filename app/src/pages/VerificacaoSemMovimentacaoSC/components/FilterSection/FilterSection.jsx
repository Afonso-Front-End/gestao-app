import React, { useMemo } from 'react'
import MultiSelect from '../../../PedidosRetidos/components/MultiSelect'
import './FilterSection.css'

const FilterSection = ({
  // Filtros de múltipla seleção
  selectedNumeroPedidoJMS,
  setSelectedNumeroPedidoJMS,
  numeroPedidoJMSOptions,
  
  selectedTempoDigitalizacao,
  setSelectedTempoDigitalizacao,
  tempoDigitalizacaoOptions,
  
  selectedTipoBipagem,
  setSelectedTipoBipagem,
  tipoBipagemOptions,
  
  selectedBaseEscaneamento,
  setSelectedBaseEscaneamento,
  baseEscaneamentoOptions,
  
  selectedDigitalizador,
  setSelectedDigitalizador,
  digitalizadorOptions,
  
  selectedCorreioColetaEntrega,
  setSelectedCorreioColetaEntrega,
  correioColetaEntregaOptions,
  
  selectedOrigemDados,
  setSelectedOrigemDados,
  origemDadosOptions,
  
  selectedTipoProblematico,
  setSelectedTipoProblematico,
  tipoProblematicoOptions,
  
  selectedBase,
  setSelectedBase,
  baseOptions,
  
  selectedDestino,
  setSelectedDestino,
  destinoOptions
}) => {
  // Converter opções de data para formato exibido e criar mapeamento reverso
  const tempoDigitalizacaoFormatted = useMemo(() => {
    return tempoDigitalizacaoOptions.map(date => {
      try {
        const dateObj = new Date(date + 'T00:00:00')
        const formatted = dateObj.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
        return `${formatted} (${date})`
      } catch {
        return date
      }
    })
  }, [tempoDigitalizacaoOptions])

  // Converter valores selecionados formatados de volta para formato original
  const handleTempoDigitalizacaoChange = (formattedValuesOrFunction) => {
    // O MultiSelect pode passar uma função ou um array diretamente
    if (typeof formattedValuesOrFunction === 'function') {
      // Se for uma função, criar um wrapper que converte os valores
      setSelectedTempoDigitalizacao(prevOriginal => {
        // Converter valores originais anteriores para formato formatado
        const prevFormatted = prevOriginal.map(date => {
          try {
            const dateObj = new Date(date + 'T00:00:00')
            const formatted = dateObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })
            return `${formatted} (${date})`
          } catch {
            return date
          }
        })
        
        // Obter novos valores formatados
        const newFormatted = formattedValuesOrFunction(prevFormatted)
        const valuesArray = Array.isArray(newFormatted) ? newFormatted : [newFormatted].filter(Boolean)
        
        // Converter de volta para formato original
        return valuesArray.map(formatted => {
          // Extrair YYYY-MM-DD do formato "DD/MM/YYYY (YYYY-MM-DD)"
          const match = String(formatted).match(/\((\d{4}-\d{2}-\d{2})\)/)
          return match ? match[1] : formatted
        })
      })
    } else {
      // Se for um array diretamente
      const valuesArray = Array.isArray(formattedValuesOrFunction) 
        ? formattedValuesOrFunction 
        : [formattedValuesOrFunction].filter(Boolean)
      
      const originalValues = valuesArray.map(formatted => {
        // Extrair YYYY-MM-DD do formato "DD/MM/YYYY (YYYY-MM-DD)"
        const match = String(formatted).match(/\((\d{4}-\d{2}-\d{2})\)/)
        return match ? match[1] : formatted
      })
      setSelectedTempoDigitalizacao(originalValues)
    }
  }

  // Converter valores selecionados originais para formato exibido
  const selectedTempoDigitalizacaoFormatted = useMemo(() => {
    return selectedTempoDigitalizacao.map(date => {
      try {
        const dateObj = new Date(date + 'T00:00:00')
        const formatted = dateObj.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
        return `${formatted} (${date})`
      } catch {
        return date
      }
    })
  }, [selectedTempoDigitalizacao])

  return (
    <div className="verificacao-filters-section">
      <div className="verificacao-filters-header">
        <h3>Filtros de Busca</h3>
        <p>Filtre os dados por qualquer coluna</p>
      </div>
      <div className="verificacao-filters-grid">
        {/* Filtro MultiSelect: Número de pedido JMS */}
        <div className="verificacao-filter-item">
          <label className="verificacao-filter-label">
            Número de pedido JMS
          </label>
          <MultiSelect
            selectedValues={selectedNumeroPedidoJMS}
            setSelectedValues={setSelectedNumeroPedidoJMS}
            options={numeroPedidoJMSOptions}
            placeholder="Selecione o número do pedido"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos selecionados"
            showCount={true}
            className="theme-blue"
          />
        </div>

        {/* Filtro MultiSelect: Tempo de digitalização (agrupado por data) */}
        <div className="verificacao-filter-item">
          <label className="verificacao-filter-label">
            Tempo de digitalização (por data)
          </label>
          <MultiSelect
            selectedValues={selectedTempoDigitalizacaoFormatted}
            setSelectedValues={handleTempoDigitalizacaoChange}
            options={tempoDigitalizacaoFormatted}
            placeholder="Selecione a data de digitalização"
            selectAllText="Selecionar Todas"
            clearAllText="Limpar Todas"
            allSelectedText="Todas as datas selecionadas"
            showCount={true}
            className="theme-green"
          />
        </div>

        {/* Filtro MultiSelect: Tipo de bipagem */}
        <div className="verificacao-filter-item">
          <label className="verificacao-filter-label">
            Tipo de bipagem
          </label>
          <MultiSelect
            selectedValues={selectedTipoBipagem}
            setSelectedValues={setSelectedTipoBipagem}
            options={tipoBipagemOptions}
            placeholder="Selecione o tipo de bipagem"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos selecionados"
            showCount={true}
            className="theme-blue"
          />
        </div>

        {/* Filtro MultiSelect: Base de escaneamento */}
        <div className="verificacao-filter-item">
          <label className="verificacao-filter-label">
            Base de escaneamento
          </label>
          <MultiSelect
            selectedValues={selectedBaseEscaneamento}
            setSelectedValues={setSelectedBaseEscaneamento}
            options={baseEscaneamentoOptions}
            placeholder="Selecione a base de escaneamento"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos selecionados"
            showCount={true}
            className="theme-green"
          />
        </div>

        {/* Filtro MultiSelect: Digitalizador */}
        <div className="verificacao-filter-item">
          <label className="verificacao-filter-label">
            Digitalizador
          </label>
          <MultiSelect
            selectedValues={selectedDigitalizador}
            setSelectedValues={setSelectedDigitalizador}
            options={digitalizadorOptions}
            placeholder="Selecione o digitalizador"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos selecionados"
            showCount={true}
            className="theme-purple"
          />
        </div>

        {/* Filtro MultiSelect: Correio de coleta ou entrega */}
        <div className="verificacao-filter-item">
          <label className="verificacao-filter-label">
            Correio de coleta ou entrega
          </label>
          <MultiSelect
            selectedValues={selectedCorreioColetaEntrega}
            setSelectedValues={setSelectedCorreioColetaEntrega}
            options={correioColetaEntregaOptions}
            placeholder="Selecione o correio"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos selecionados"
            showCount={true}
            className="theme-orange"
          />
        </div>

        {/* Filtro MultiSelect: Origem de dados */}
        <div className="verificacao-filter-item">
          <label className="verificacao-filter-label">
            Origem de dados
          </label>
          <MultiSelect
            selectedValues={selectedOrigemDados}
            setSelectedValues={setSelectedOrigemDados}
            options={origemDadosOptions}
            placeholder="Selecione a origem de dados"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos selecionados"
            showCount={true}
            className="theme-teal"
          />
        </div>

        {/* Filtro MultiSelect: Tipo problemático */}
        <div className="verificacao-filter-item">
          <label className="verificacao-filter-label">
            Tipo problemático
          </label>
          <MultiSelect
            selectedValues={selectedTipoProblematico}
            setSelectedValues={setSelectedTipoProblematico}
            options={tipoProblematicoOptions}
            placeholder="Selecione o tipo problemático"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos selecionados"
            showCount={true}
            className="theme-red"
          />
        </div>

        {/* Filtro MultiSelect: Base */}
        <div className="verificacao-filter-item">
          <label className="verificacao-filter-label">
            Base
          </label>
          <MultiSelect
            selectedValues={selectedBase}
            setSelectedValues={setSelectedBase}
            options={baseOptions}
            placeholder="Selecione a base"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos selecionados"
            showCount={true}
            className="theme-indigo"
          />
        </div>

        {/* Filtro MultiSelect: Destino */}
        <div className="verificacao-filter-item">
          <label className="verificacao-filter-label">
            Destino
          </label>
          <MultiSelect
            selectedValues={selectedDestino}
            setSelectedValues={setSelectedDestino}
            options={destinoOptions}
            placeholder="Selecione o destino"
            selectAllText="Selecionar Todos"
            clearAllText="Limpar Todos"
            allSelectedText="Todos selecionados"
            showCount={true}
            className="theme-pink"
          />
        </div>
      </div>
    </div>
  )
}

export default FilterSection

