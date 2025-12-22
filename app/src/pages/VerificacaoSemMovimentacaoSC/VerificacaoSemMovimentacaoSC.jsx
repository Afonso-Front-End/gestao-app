import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import api from '../../services/api'
import FileImport from '../SemMovimentacaoSC/components/FileImport/FileImport'
import FilterSection from './components/FilterSection/FilterSection'
import MultiSelect from '../PedidosRetidos/components/MultiSelect'
import MovePedidosModal from './components/MovePedidosModal/MovePedidosModal'
import LotesModal from './components/LotesModal/LotesModal'
import { useLotes } from './hooks/useLotes'
import './VerificacaoSemMovimentacaoSC.css'

const VerificacaoSemMovimentacaoSC = () => {
  const { showSuccess, showError } = useNotification()
  const [allData, setAllData] = useState([]) // Todos os dados carregados
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30) // segundos
  const [deleting, setDeleting] = useState(false)
  const [moving, setMoving] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showLotesModal, setShowLotesModal] = useState(false)

  // Estados dos filtros
  const [selectedNumeroPedidoJMS, setSelectedNumeroPedidoJMS] = useState([])
  const [selectedTempoDigitalizacao, setSelectedTempoDigitalizacao] = useState([])
  const [selectedTipoBipagem, setSelectedTipoBipagem] = useState([])
  const [selectedBaseEscaneamento, setSelectedBaseEscaneamento] = useState([])
  const [selectedDigitalizador, setSelectedDigitalizador] = useState([])
  const [selectedCorreioColetaEntrega, setSelectedCorreioColetaEntrega] = useState([])
  const [selectedOrigemDados, setSelectedOrigemDados] = useState([])
  const [selectedTipoProblematico, setSelectedTipoProblematico] = useState([])
  const [selectedBase, setSelectedBase] = useState([])
  const [selectedDestino, setSelectedDestino] = useState([])
  
  // Estado para seleção de pedidos
  const [selectedPedidos, setSelectedPedidos] = useState(new Set())

  // Buscar dados
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get('/sem-movimentacao-sc/verificacao-tempo-real', {
        params: {
          limit: 100000, // Limite alto para buscar todos os registros
          skip: 0
        }
      })
      
      if (response.data?.success) {
        setAllData(response.data.data || [])
        showSuccess('Dados atualizados com sucesso!')
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
      setError(err.message || 'Erro ao buscar dados')
      showError('Erro ao buscar dados')
    } finally {
      setLoading(false)
    }
  }, [showSuccess, showError])

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      // Buscar imediatamente
      fetchData()

      // Configurar intervalo
      const interval = setInterval(() => {
        fetchData()
      }, refreshInterval * 1000)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, fetchData])

  // Extrair valores únicos para os filtros MultiSelect
  // IMPORTANTE: As opções são filtradas primeiro pelo "Tipo de bipagem" selecionado
  const filterOptions = useMemo(() => {
    const options = {
      numeroPedidoJMS: [],
      tempoDigitalizacao: [],
      tipoBipagem: [],
      baseEscaneamento: [],
      digitalizador: [],
      correioColetaEntrega: [],
      origemDados: [],
      tipoProblematico: [],
      base: [],
      destino: []
    }

    // Primeiro, filtrar os dados pelo "Tipo de bipagem" se houver seleção
    let dataToProcess = allData
    if (selectedTipoBipagem.length > 0) {
      dataToProcess = allData.filter(item => 
        item.tipo_bipagem && selectedTipoBipagem.includes(item.tipo_bipagem)
      )
    }

    // Agora extrair as opções únicas dos dados filtrados
    dataToProcess.forEach(item => {
      if (item.numero_pedido_jms && !options.numeroPedidoJMS.includes(item.numero_pedido_jms)) {
        options.numeroPedidoJMS.push(item.numero_pedido_jms)
      }
      // Extrair apenas a data (sem hora) do tempo de digitalização
      if (item.tempo_digitalizacao) {
        try {
          // Tentar extrair a data do formato ISO ou string
          let dateStr = item.tempo_digitalizacao
          if (typeof dateStr === 'string') {
            // Extrair apenas a parte da data (YYYY-MM-DD)
            const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/)
            if (dateMatch) {
              const dateOnly = dateMatch[1]
              if (!options.tempoDigitalizacao.includes(dateOnly)) {
                options.tempoDigitalizacao.push(dateOnly)
              }
            } else {
              // Tentar outros formatos
              const dateObj = new Date(dateStr)
              if (!isNaN(dateObj.getTime())) {
                const dateOnly = dateObj.toISOString().split('T')[0]
                if (!options.tempoDigitalizacao.includes(dateOnly)) {
                  options.tempoDigitalizacao.push(dateOnly)
                }
              }
            }
          }
        } catch (e) {
          // Ignorar erros de parsing
        }
      }
      // Tipo de bipagem sempre mostra todas as opções (não filtra por ele mesmo)
      if (item.tipo_bipagem && !options.tipoBipagem.includes(item.tipo_bipagem)) {
        options.tipoBipagem.push(item.tipo_bipagem)
      }
      if (item.base_escaneamento && !options.baseEscaneamento.includes(item.base_escaneamento)) {
        options.baseEscaneamento.push(item.base_escaneamento)
      }
      if (item.digitalizador && !options.digitalizador.includes(item.digitalizador)) {
        options.digitalizador.push(item.digitalizador)
      }
      if (item.correio_coleta_entrega && !options.correioColetaEntrega.includes(item.correio_coleta_entrega)) {
        options.correioColetaEntrega.push(item.correio_coleta_entrega)
      }
      if (item.origem_dados && !options.origemDados.includes(item.origem_dados)) {
        options.origemDados.push(item.origem_dados)
      }
      if (item.tipo_problematico && !options.tipoProblematico.includes(item.tipo_problematico)) {
        options.tipoProblematico.push(item.tipo_problematico)
      }
      if (item.base && !options.base.includes(item.base)) {
        options.base.push(item.base)
      }
      if (item.destino && !options.destino.includes(item.destino)) {
        options.destino.push(item.destino)
      }
    })

    // Ordenar alfabeticamente (exceto números que devem ser ordenados numericamente)
    options.numeroPedidoJMS.sort((a, b) => {
      // Tentar ordenar numericamente se possível
      const numA = parseFloat(a)
      const numB = parseFloat(b)
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      }
      return String(a).localeCompare(String(b))
    })
    
    // Tempo de digitalização ordenar por data (mais recente primeiro)
    // Já está no formato YYYY-MM-DD, então podemos ordenar diretamente
    options.tempoDigitalizacao.sort((a, b) => {
      // Comparar strings no formato YYYY-MM-DD (ordenação lexicográfica funciona)
      return b.localeCompare(a) // Mais recente primeiro
    })
    
    // Ordenar os outros alfabeticamente
    Object.keys(options).forEach(key => {
      if (key !== 'numeroPedidoJMS' && key !== 'tempoDigitalizacao') {
        options[key].sort()
      }
    })

    return options
  }, [allData, selectedTipoBipagem])

  // Limpar valores selecionados que não existem mais nas opções filtradas quando "Tipo de bipagem" mudar
  useEffect(() => {
    // Só limpar se houver seleção em "Tipo de bipagem"
    if (selectedTipoBipagem.length === 0) {
      return
    }

    // Limpar Número de pedido JMS
    if (selectedNumeroPedidoJMS.length > 0) {
      const validValues = selectedNumeroPedidoJMS.filter(val => 
        filterOptions.numeroPedidoJMS.includes(val)
      )
      if (validValues.length !== selectedNumeroPedidoJMS.length) {
        setSelectedNumeroPedidoJMS(validValues)
      }
    }

    // Limpar Tempo de digitalização
    if (selectedTempoDigitalizacao.length > 0) {
      const validValues = selectedTempoDigitalizacao.filter(val => 
        filterOptions.tempoDigitalizacao.includes(val)
      )
      if (validValues.length !== selectedTempoDigitalizacao.length) {
        setSelectedTempoDigitalizacao(validValues)
      }
    }

    // Limpar Base de escaneamento
    if (selectedBaseEscaneamento.length > 0) {
      const validValues = selectedBaseEscaneamento.filter(val => 
        filterOptions.baseEscaneamento.includes(val)
      )
      if (validValues.length !== selectedBaseEscaneamento.length) {
        setSelectedBaseEscaneamento(validValues)
      }
    }

    // Limpar Digitalizador
    if (selectedDigitalizador.length > 0) {
      const validValues = selectedDigitalizador.filter(val => 
        filterOptions.digitalizador.includes(val)
      )
      if (validValues.length !== selectedDigitalizador.length) {
        setSelectedDigitalizador(validValues)
      }
    }

    // Limpar Correio de coleta ou entrega
    if (selectedCorreioColetaEntrega.length > 0) {
      const validValues = selectedCorreioColetaEntrega.filter(val => 
        filterOptions.correioColetaEntrega.includes(val)
      )
      if (validValues.length !== selectedCorreioColetaEntrega.length) {
        setSelectedCorreioColetaEntrega(validValues)
      }
    }

    // Limpar Origem de dados
    if (selectedOrigemDados.length > 0) {
      const validValues = selectedOrigemDados.filter(val => 
        filterOptions.origemDados.includes(val)
      )
      if (validValues.length !== selectedOrigemDados.length) {
        setSelectedOrigemDados(validValues)
      }
    }

    // Limpar Tipo problemático
    if (selectedTipoProblematico.length > 0) {
      const validValues = selectedTipoProblematico.filter(val => 
        filterOptions.tipoProblematico.includes(val)
      )
      if (validValues.length !== selectedTipoProblematico.length) {
        setSelectedTipoProblematico(validValues)
      }
    }

    // Limpar Base
    if (selectedBase.length > 0) {
      const validValues = selectedBase.filter(val => 
        filterOptions.base.includes(val)
      )
      if (validValues.length !== selectedBase.length) {
        setSelectedBase(validValues)
      }
    }

    // Limpar Destino
    if (selectedDestino.length > 0) {
      const validValues = selectedDestino.filter(val => 
        filterOptions.destino.includes(val)
      )
      if (validValues.length !== selectedDestino.length) {
        setSelectedDestino(validValues)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTipoBipagem]) // Executar apenas quando selectedTipoBipagem mudar

  // Filtrar dados baseado nos filtros selecionados
  const filteredData = useMemo(() => {
    return allData.filter(item => {
      // Filtro: Número de pedido JMS
      if (selectedNumeroPedidoJMS.length > 0 && !selectedNumeroPedidoJMS.includes(item.numero_pedido_jms)) {
        return false
      }

      // Filtro: Tempo de digitalização (comparar apenas a data, ignorando hora)
      if (selectedTempoDigitalizacao.length > 0) {
        let itemDate = null
        try {
          if (item.tempo_digitalizacao) {
            if (typeof item.tempo_digitalizacao === 'string') {
              // Extrair apenas a parte da data (YYYY-MM-DD)
              const dateMatch = item.tempo_digitalizacao.match(/^(\d{4}-\d{2}-\d{2})/)
              if (dateMatch) {
                itemDate = dateMatch[1]
              } else {
                // Tentar criar Date object
                const dateObj = new Date(item.tempo_digitalizacao)
                if (!isNaN(dateObj.getTime())) {
                  itemDate = dateObj.toISOString().split('T')[0]
                }
              }
            }
          }
        } catch (e) {
          // Ignorar erros
        }
        
        // selectedTempoDigitalizacao já contém valores no formato YYYY-MM-DD
        if (!itemDate || !selectedTempoDigitalizacao.includes(itemDate)) {
          return false
        }
      }

      // Filtro: Tipo de bipagem
      if (selectedTipoBipagem.length > 0 && !selectedTipoBipagem.includes(item.tipo_bipagem)) {
        return false
      }

      // Filtro: Base de escaneamento
      if (selectedBaseEscaneamento.length > 0 && !selectedBaseEscaneamento.includes(item.base_escaneamento)) {
        return false
      }

      // Filtro: Digitalizador
      if (selectedDigitalizador.length > 0 && !selectedDigitalizador.includes(item.digitalizador)) {
        return false
      }

      // Filtro: Correio de coleta ou entrega
      if (selectedCorreioColetaEntrega.length > 0 && !selectedCorreioColetaEntrega.includes(item.correio_coleta_entrega)) {
        return false
      }

      // Filtro: Origem de dados
      if (selectedOrigemDados.length > 0 && !selectedOrigemDados.includes(item.origem_dados)) {
        return false
      }

      // Filtro: Tipo problemático
      if (selectedTipoProblematico.length > 0 && !selectedTipoProblematico.includes(item.tipo_problematico)) {
        return false
      }

      // Filtro: Base
      if (selectedBase.length > 0 && !selectedBase.includes(item.base)) {
        return false
      }

      // Filtro: Destino
      if (selectedDestino.length > 0 && !selectedDestino.includes(item.destino)) {
        return false
      }

      return true
    })
  }, [
    allData,
    selectedNumeroPedidoJMS,
    selectedTempoDigitalizacao,
    selectedTipoBipagem,
    selectedBaseEscaneamento,
    selectedDigitalizador,
    selectedCorreioColetaEntrega,
    selectedOrigemDados,
    selectedTipoProblematico,
    selectedBase,
    selectedDestino
  ])

  // Extrair números de pedidos JMS únicos dos dados filtrados
  const pedidosJMSUnicos = useMemo(() => {
    const pedidos = new Set()
    filteredData.forEach(item => {
      if (item.numero_pedido_jms) {
        pedidos.add(item.numero_pedido_jms)
      }
    })
    return Array.from(pedidos).sort()
  }, [filteredData])

  // Gerar lotes de 500 pedidos
  const pedidosLotes500 = useLotes(pedidosJMSUnicos, 500)

  // Função para copiar lote
  const handleCopyLote = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess('Pedidos copiados para a área de transferência!')
    }).catch(err => {
      console.error('Erro ao copiar:', err)
      showError('Erro ao copiar pedidos')
    })
  }, [showSuccess, showError])

  // Deletar todos os dados
  const handleDeleteAll = useCallback(async () => {
    // Confirmar antes de deletar
    const confirmMessage = `Tem certeza que deseja deletar TODOS os dados de verificação tempo real?\n\nEsta ação não pode ser desfeita!`
    if (!window.confirm(confirmMessage)) {
      return
    }

    // Segunda confirmação
    if (!window.confirm('⚠️ ATENÇÃO: Esta ação irá deletar TODOS os dados permanentemente!\n\nDeseja continuar?')) {
      return
    }

    setDeleting(true)
    try {
      const response = await api.delete('/sem-movimentacao-sc/verificacao-tempo-real')
      
      if (response.data?.success) {
        showSuccess(`Todos os dados foram deletados com sucesso! ${response.data.total_deleted || 0} registros removidos.`)
        // Limpar dados locais
        setAllData([])
        // Limpar filtros
        setSelectedNumeroPedidoJMS([])
        setSelectedTempoDigitalizacao([])
        setSelectedTipoBipagem([])
        setSelectedBaseEscaneamento([])
        setSelectedDigitalizador([])
        setSelectedCorreioColetaEntrega([])
        setSelectedOrigemDados([])
        setSelectedTipoProblematico([])
        setSelectedBase([])
        setSelectedDestino([])
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (err) {
      console.error('Erro ao deletar dados:', err)
      showError('Erro ao deletar dados')
    } finally {
      setDeleting(false)
    }
  }, [showSuccess, showError])

  // Converter opções de data para formato exibido (para os filtros rápidos)
  const tempoDigitalizacaoFormatted = useMemo(() => {
    return filterOptions.tempoDigitalizacao.map(date => {
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
  }, [filterOptions.tempoDigitalizacao])

  // Converter valores selecionados originais para formato exibido (para os filtros rápidos)
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

  // Converter valores selecionados formatados de volta para formato original (para os filtros rápidos)
  const handleTempoDigitalizacaoChangeQuick = (formattedValuesOrFunction) => {
    if (typeof formattedValuesOrFunction === 'function') {
      setSelectedTempoDigitalizacao(prevOriginal => {
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
        const newFormatted = formattedValuesOrFunction(prevFormatted)
        const valuesArray = Array.isArray(newFormatted) ? newFormatted : [newFormatted].filter(Boolean)
        return valuesArray.map(formatted => {
          const match = String(formatted).match(/\((\d{4}-\d{2}-\d{2})\)/)
          return match ? match[1] : formatted
        })
      })
    } else {
      const valuesArray = Array.isArray(formattedValuesOrFunction) 
        ? formattedValuesOrFunction 
        : [formattedValuesOrFunction].filter(Boolean)
      const originalValues = valuesArray.map(formatted => {
        const match = String(formatted).match(/\((\d{4}-\d{2}-\d{2})\)/)
        return match ? match[1] : formatted
      })
      setSelectedTempoDigitalizacao(originalValues)
    }
  }

  // Funções para seleção de pedidos
  const handleSelectPedido = useCallback((pedidoJMS) => {
    if (!pedidoJMS) return
    setSelectedPedidos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pedidoJMS)) {
        newSet.delete(pedidoJMS)
      } else {
        newSet.add(pedidoJMS)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedPedidos.size === filteredData.length && filteredData.length > 0) {
      // Desselecionar todos
      setSelectedPedidos(new Set())
    } else {
      // Selecionar todos os pedidos filtrados
      const allPedidos = new Set(filteredData.map(item => item.numero_pedido_jms).filter(Boolean))
      setSelectedPedidos(allPedidos)
    }
  }, [filteredData, selectedPedidos.size])

  const isAllSelected = filteredData.length > 0 && selectedPedidos.size === filteredData.length
  const isIndeterminate = selectedPedidos.size > 0 && selectedPedidos.size < filteredData.length

  // Calcular total de pedidos que serão movidos
  const totalPedidosParaMover = useMemo(() => {
    if (selectedPedidos.size === 0) return 0
    
    let pedidosParaMover = Array.from(selectedPedidos)
    
    if (selectedTipoBipagem.length > 0) {
      pedidosParaMover = filteredData
        .filter(item => 
          selectedPedidos.has(item.numero_pedido_jms) && 
          selectedTipoBipagem.includes(item.tipo_bipagem)
        )
        .map(item => item.numero_pedido_jms)
        .filter(Boolean)
    }
    
    return pedidosParaMover.length
  }, [selectedPedidos, selectedTipoBipagem, filteredData])

  // Abrir modal de mover pedidos
  const handleOpenMoveModal = useCallback(() => {
    if (selectedPedidos.size === 0) {
      showError('Nenhum pedido selecionado para mover')
      return
    }

    // Usar os valores selecionados no filtro de tipo_bipagem
    let pedidosParaMover = Array.from(selectedPedidos)
    
    if (selectedTipoBipagem.length > 0) {
      // Filtrar apenas os pedidos selecionados que têm o tipo de bipagem selecionado
      pedidosParaMover = filteredData
        .filter(item => 
          selectedPedidos.has(item.numero_pedido_jms) && 
          selectedTipoBipagem.includes(item.tipo_bipagem)
        )
        .map(item => item.numero_pedido_jms)
        .filter(Boolean)
      
      if (pedidosParaMover.length === 0) {
        showError('Nenhum pedido selecionado corresponde aos tipos de bipagem filtrados')
        return
      }
    }

    setShowMoveModal(true)
  }, [selectedPedidos, selectedTipoBipagem, filteredData, showError])

  // Mover pedidos selecionados (chamado após confirmar no modal)
  const handleMovePedidos = useCallback(async (observacao = '') => {
    if (selectedPedidos.size === 0) {
      showError('Nenhum pedido selecionado para mover')
      return
    }

    // Usar os valores selecionados no filtro de tipo_bipagem
    let pedidosParaMover = Array.from(selectedPedidos)
    
    if (selectedTipoBipagem.length > 0) {
      // Filtrar apenas os pedidos selecionados que têm o tipo de bipagem selecionado
      pedidosParaMover = filteredData
        .filter(item => 
          selectedPedidos.has(item.numero_pedido_jms) && 
          selectedTipoBipagem.includes(item.tipo_bipagem)
        )
        .map(item => item.numero_pedido_jms)
        .filter(Boolean)
      
      if (pedidosParaMover.length === 0) {
        showError('Nenhum pedido selecionado corresponde aos tipos de bipagem filtrados')
        return
      }
    }

    setMoving(true)
    setShowMoveModal(false)
    
    try {
      const response = await api.post('/sem-movimentacao-sc/verificacao-tempo-real/move', {
        pedidos_jms: pedidosParaMover,
        agrupar_por: 'tipo_bipagem',  // Sempre agrupar por tipo_bipagem
        observacao: observacao || undefined
      })
      
      if (response.data?.success) {
        showSuccess(`✅ ${response.data.total_pedidos_movidos} pedido(s) movido(s) com sucesso! ${response.data.total_grupos} grupo(s) criado(s).`)
        
        // Limpar seleção
        setSelectedPedidos(new Set())
        
        // Recarregar dados
        setTimeout(() => {
          fetchData()
        }, 1000)
      } else {
        throw new Error('Resposta inválida do servidor')
      }
    } catch (err) {
      console.error('Erro ao mover pedidos:', err)
      showError('Erro ao mover pedidos')
    } finally {
      setMoving(false)
    }
  }, [selectedPedidos, selectedTipoBipagem, filteredData, showSuccess, showError, fetchData])

  // Copiar todos os números de pedido JMS filtrados
  const handleCopyPedidosJMS = useCallback(async () => {
    try {
      // Coletar todos os números de pedido JMS dos dados filtrados
      const pedidos = filteredData
        .map(item => item.numero_pedido_jms)
        .filter(pedido => pedido) // Remover valores vazios/null
        .join('\n') // Separar por quebra de linha
      
      if (!pedidos) {
        showError('Nenhum pedido JMS encontrado para copiar')
        return
      }

      // Copiar para a área de transferência
      await navigator.clipboard.writeText(pedidos)
      showSuccess(`${filteredData.length} número(s) de pedido JMS copiado(s) para a área de transferência!`)
    } catch (err) {
      console.error('Erro ao copiar pedidos JMS:', err)
      showError('Erro ao copiar números de pedido JMS')
    }
  }, [filteredData, showSuccess, showError])

  return (
    <div className="verificacao-sem-movimentacao-sc">
      <div className="verificacao-header">
        <h1>Verificação sem movimentação SC - Em tempo real</h1>
        <div className="verificacao-controls">
          <FileImport
            endpoint="/sem-movimentacao-sc/verificacao-tempo-real/upload"
            title="Importar Tabela"
            acceptedFormats=".xlsx,.xls,.csv"
            onSuccess={(response) => {
              showSuccess(`Arquivo importado com sucesso! ${response.total_items || 0} registros processados.`)
              // Recarregar dados após importação
              setTimeout(() => {
                fetchData()
              }, 1000)
            }}
            onError={(error) => {
              showError(`Erro ao importar arquivo: ${error.message}`)
            }}
          />
          <div className="verificacao-auto-refresh">
            <label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>Atualização automática</span>
            </label>
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="verificacao-interval-select"
              >
                <option value={10}>10 segundos</option>
                <option value={30}>30 segundos</option>
                <option value={60}>1 minuto</option>
                <option value={120}>2 minutos</option>
                <option value={300}>5 minutos</option>
              </select>
            )}
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="verificacao-refresh-btn"
          >
            {loading ? '🔄 Atualizando...' : '🔄 Atualizar Agora'}
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={deleting || allData.length === 0}
            className="verificacao-delete-btn"
            title="Deletar todos os dados de verificação tempo real"
          >
            {deleting ? '🗑️ Deletando...' : '🗑️ Deletar Todos os Dados'}
          </button>
        </div>
      </div>

      {error && (
        <div className="verificacao-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading && !allData.length && (
        <div className="verificacao-loading">
          <p>Carregando dados...</p>
        </div>
      )}

      {!loading && allData.length === 0 && !error && (
        <div className="verificacao-empty">
          <p>Nenhum dado encontrado</p>
        </div>
      )}

      {allData.length > 0 && (
        <div className="verificacao-content">
          {/* Seção de Filtros */}
          <FilterSection
            selectedNumeroPedidoJMS={selectedNumeroPedidoJMS}
            setSelectedNumeroPedidoJMS={setSelectedNumeroPedidoJMS}
            numeroPedidoJMSOptions={filterOptions.numeroPedidoJMS}
            selectedTempoDigitalizacao={selectedTempoDigitalizacao}
            setSelectedTempoDigitalizacao={setSelectedTempoDigitalizacao}
            tempoDigitalizacaoOptions={filterOptions.tempoDigitalizacao}
            selectedTipoBipagem={selectedTipoBipagem}
            setSelectedTipoBipagem={setSelectedTipoBipagem}
            tipoBipagemOptions={filterOptions.tipoBipagem}
            selectedBaseEscaneamento={selectedBaseEscaneamento}
            setSelectedBaseEscaneamento={setSelectedBaseEscaneamento}
            baseEscaneamentoOptions={filterOptions.baseEscaneamento}
            selectedDigitalizador={selectedDigitalizador}
            setSelectedDigitalizador={setSelectedDigitalizador}
            digitalizadorOptions={filterOptions.digitalizador}
            selectedCorreioColetaEntrega={selectedCorreioColetaEntrega}
            setSelectedCorreioColetaEntrega={setSelectedCorreioColetaEntrega}
            correioColetaEntregaOptions={filterOptions.correioColetaEntrega}
            selectedOrigemDados={selectedOrigemDados}
            setSelectedOrigemDados={setSelectedOrigemDados}
            origemDadosOptions={filterOptions.origemDados}
            selectedTipoProblematico={selectedTipoProblematico}
            setSelectedTipoProblematico={setSelectedTipoProblematico}
            tipoProblematicoOptions={filterOptions.tipoProblematico}
            selectedBase={selectedBase}
            setSelectedBase={setSelectedBase}
            baseOptions={filterOptions.base}
            selectedDestino={selectedDestino}
            setSelectedDestino={setSelectedDestino}
            destinoOptions={filterOptions.destino}
          />

          <div className="verificacao-stats">
            <div className="verificacao-stat-card">
              <h3>Total de Pedidos (Filtrados)</h3>
              <p className="stat-value">{filteredData.length}</p>
              {filteredData.length !== allData.length && (
                <p className="stat-subtitle">de {allData.length} total</p>
              )}
            </div>
            <div className="verificacao-stat-card">
              <h3>Total de Pedidos (Sem Filtros)</h3>
              <p className="stat-value">{allData.length}</p>
              <p className="stat-subtitle">Total absoluto</p>
            </div>
            <div className="verificacao-stat-card">
              <h3>Última Atualização</h3>
              <p className="stat-value">{new Date().toLocaleTimeString('pt-BR')}</p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="verificacao-actions-section">
            <div className="verificacao-move-section">
              <div className="verificacao-move-controls">
                {selectedTipoBipagem.length > 0 && (
                  <div className="verificacao-move-info">
                    <span>📌 Agrupando por tipo de bipagem: {selectedTipoBipagem.length} tipo(s) selecionado(s)</span>
                  </div>
                )}
                <button
                  onClick={handleOpenMoveModal}
                  disabled={moving || selectedPedidos.size === 0}
                  className="verificacao-move-btn"
                >
                  {moving ? '🔄 Movendo...' : selectedPedidos.size > 0 ? `📦 Mover ${selectedPedidos.size} Pedido(s) Selecionado(s)` : '📦 Mover Pedidos (selecione pedidos primeiro)'}
                </button>
              </div>
            </div>
            {pedidosLotes500.length > 0 && (
              <div className="verificacao-lotes-section">
                <button
                  onClick={() => setShowLotesModal(true)}
                  className="verificacao-lotes-btn"
                  title="Ver lotes de 500 pedidos"
                >
                  📦 Lotes 500 ({pedidosLotes500.length})
                </button>
              </div>
            )}
          </div>

          {/* Filtros rápidos acima da tabela */}
          <div className="verificacao-quick-filters">
            <div className="verificacao-quick-filter-item">
              <label>Tipo de bipagem</label>
              <MultiSelect
                selectedValues={selectedTipoBipagem}
                setSelectedValues={setSelectedTipoBipagem}
                options={filterOptions.tipoBipagem}
                placeholder="Todos"
                selectAllText="Selecionar Todos"
                clearAllText="Limpar"
                allSelectedText="Todos"
                showCount={false}
                className="theme-blue"
              />
            </div>
            <div className="verificacao-quick-filter-item">
              <label>Tempo de digitalização</label>
              <MultiSelect
                selectedValues={selectedTempoDigitalizacaoFormatted || []}
                setSelectedValues={handleTempoDigitalizacaoChangeQuick}
                options={tempoDigitalizacaoFormatted || []}
                placeholder="Todas as datas"
                selectAllText="Selecionar Todas"
                clearAllText="Limpar"
                allSelectedText="Todas"
                showCount={false}
                className="theme-green"
              />
            </div>
            <div className="verificacao-quick-filter-item">
              <label>Base de escaneamento</label>
              <MultiSelect
                selectedValues={selectedBaseEscaneamento}
                setSelectedValues={setSelectedBaseEscaneamento}
                options={filterOptions.baseEscaneamento}
                placeholder="Todas"
                selectAllText="Selecionar Todos"
                clearAllText="Limpar"
                allSelectedText="Todos"
                showCount={false}
                className="theme-green"
              />
            </div>
            <div className="verificacao-quick-filter-item">
              <label>Origem de dados</label>
              <MultiSelect
                selectedValues={selectedOrigemDados}
                setSelectedValues={setSelectedOrigemDados}
                options={filterOptions.origemDados}
                placeholder="Todas"
                selectAllText="Selecionar Todos"
                clearAllText="Limpar"
                allSelectedText="Todos"
                showCount={false}
                className="theme-teal"
              />
            </div>
            <div className="verificacao-quick-filter-item">
              <label>Tipo problemático</label>
              <MultiSelect
                selectedValues={selectedTipoProblematico}
                setSelectedValues={setSelectedTipoProblematico}
                options={filterOptions.tipoProblematico}
                placeholder="Todos"
                selectAllText="Selecionar Todos"
                clearAllText="Limpar"
                allSelectedText="Todos"
                showCount={false}
                className="theme-red"
              />
            </div>
          </div>

          <div className="verificacao-table-container">
            <table className="verificacao-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate
                      }}
                      onChange={handleSelectAll}
                      title={isAllSelected ? "Desselecionar todos" : "Selecionar todos"}
                    />
                  </th>
                  <th 
                    className="verificacao-th-copyable" 
                    onClick={handleCopyPedidosJMS}
                    title="Clique para copiar todos os números de pedido JMS filtrados"
                  >
                    Número de pedido JMS 📋
                  </th>
                  <th>Tipo de bipagem</th>
                  <th>Tempo de digitalização</th>
                  <th>Base de escaneamento</th>
                  <th>Digitalizador</th>
                  <th>Correio de coleta ou entrega</th>
                  <th>Origem de dados</th>
                  <th>Tipo problemático</th>
                  <th>Base</th>
                  <th>Destino</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                      Nenhum registro encontrado com os filtros aplicados
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => {
                    const pedidoJMS = item.numero_pedido_jms
                    const isSelected = pedidoJMS && selectedPedidos.has(pedidoJMS)
                    
                    return (
                      <tr key={index} className={isSelected ? 'verificacao-row-selected' : ''}>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected || false}
                            onChange={() => handleSelectPedido(pedidoJMS)}
                            disabled={!pedidoJMS}
                          />
                        </td>
                        <td>{pedidoJMS || '-'}</td>
                      <td>{item.tipo_bipagem || '-'}</td>
                      <td>{item.tempo_digitalizacao || '-'}</td>
                      <td>{item.base_escaneamento || '-'}</td>
                      <td>{item.digitalizador || '-'}</td>
                      <td>{item.correio_coleta_entrega || '-'}</td>
                      <td>{item.origem_dados || '-'}</td>
                      <td>{item.tipo_problematico || '-'}</td>
                      <td>{item.base || '-'}</td>
                      <td>{item.destino || '-'}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de mover pedidos */}
      <MovePedidosModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onConfirm={handleMovePedidos}
        totalPedidos={totalPedidosParaMover}
        loading={moving}
      />

      {/* Modal de lotes de 500 */}
      <LotesModal
        isOpen={showLotesModal}
        onClose={() => setShowLotesModal(false)}
        pedidosLotes={pedidosLotes500}
        filteredData={filteredData}
        onCopyLote={handleCopyLote}
      />
    </div>
  )
}

export default VerificacaoSemMovimentacaoSC

