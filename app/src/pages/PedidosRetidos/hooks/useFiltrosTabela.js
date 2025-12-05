import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../../../services/api'
import { extrairBasesUnicas } from '../utils/pedidosUtils'

/**
 * Hook para gerenciar filtros da tabela (bases e cidades)
 * @param {Array} availableBases - Bases disponíveis do hook principal
 * @param {Array} selectedBases - Bases selecionadas no filtro principal
 * @param {Function} setPedidosParadosData - Função para atualizar dados de pedidos parados
 * @param {Function} setTotalPedidos - Função para atualizar total de pedidos
 * @returns {Object} Estado e funções relacionadas aos filtros da tabela
 */
const useFiltrosTabela = (availableBases, selectedBases, setPedidosParadosData, setTotalPedidos) => {
  const [filtroBases, setFiltroBases] = useState([])
  const [filtroCidades, setFiltroCidades] = useState([])
  const [basesDisponiveis, setBasesDisponiveis] = useState([])
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([])
  const refreshTriggerRef = useRef(0) // Para forçar atualização quando necessário

  // Extrair bases únicas dos dados originais (sem filtros)
  useEffect(() => {
    const buscarDadosOriginais = async () => {
      try {
        const response = await api.get('/retidos/pedidos-parados')
        const result = response.data

        if (result.success && result.data.length > 0) {
          const bases = extrairBasesUnicas(result.data)
          setBasesDisponiveis(bases)
        }
      } catch (error) {
      }
    }

    buscarDadosOriginais()
  }, []) // Executar apenas uma vez ao montar o componente

  // Sincronizar bases disponíveis (tabela) com as bases carregadas no topo
  useEffect(() => {
    const carregarBasesTabelaDados = async () => {
      try {
        const resp = await api.get('/retidos/bases-tabela-dados')
        const result = resp.data
        if (result.success && Array.isArray(result.data)) {
          setBasesDisponiveis(result.data)
          // se ainda não houver seleção, pré-selecionar todas
          if (filtroBases.length === 0 && selectedBases.length === 0) {
            setFiltroBases(result.data)
          }
        } else if (Array.isArray(availableBases) && availableBases.length > 0) {
          setBasesDisponiveis(availableBases)
        }
      } catch {
        if (Array.isArray(availableBases) && availableBases.length > 0) {
          setBasesDisponiveis(availableBases)
        }
      }
    }
    carregarBasesTabelaDados()
  }, [availableBases, filtroBases.length, selectedBases.length])

  // Quando as bases do topo mudarem, refletir na seleção de bases da tabela
  useEffect(() => {
    if (Array.isArray(selectedBases) && selectedBases.length > 0) {
      setFiltroBases(selectedBases)
    }
  }, [selectedBases])

  // Função para atualizar cidades (pode ser chamada externamente)
  const atualizarCidades = useCallback(async () => {
    try {
      // Buscar cidades direto da coleção tabela_dados_chunks
      const params = new URLSearchParams()
      if (filtroBases.length > 0) params.append('bases', filtroBases.join(','))
      const url = `/retidos/cidades${params.toString() ? '?' + params.toString() : ''}`
      const response = await api.get(url)
      const result = response.data
      if (result.success && Array.isArray(result.data)) {
        setCidadesDisponiveis(result.data)
        const cidadesValidas = result.data.filter(cidade => filtroCidades.includes(cidade))
        if (cidadesValidas.length !== filtroCidades.length) {
          setFiltroCidades(cidadesValidas)
        }
      }
    } catch (error) {
    }
  }, [filtroBases, filtroCidades])

  // Atualizar cidades disponíveis baseado nas bases filtradas (filtroBases)
  useEffect(() => {
    atualizarCidades()
  }, [filtroBases, filtroCidades, atualizarCidades, refreshTriggerRef.current])

  // Função para forçar atualização de bases e cidades (útil após upload)
  const refetchFiltrosTabela = useCallback(async () => {
    try {
      // Atualizar bases disponíveis
      const resp = await api.get('/retidos/bases-tabela-dados')
      const result = resp.data
      if (result.success && Array.isArray(result.data)) {
        setBasesDisponiveis(result.data)
      } else if (Array.isArray(availableBases) && availableBases.length > 0) {
        setBasesDisponiveis(availableBases)
      }
      
      // Forçar atualização de cidades incrementando o trigger
      refreshTriggerRef.current += 1
      await atualizarCidades()
    } catch (error) {
      // Em caso de erro, tentar usar availableBases
      if (Array.isArray(availableBases) && availableBases.length > 0) {
        setBasesDisponiveis(availableBases)
      }
    }
  }, [availableBases, atualizarCidades])

  // Carregar dados da tabela conforme selects de base e cidade
  useEffect(() => {
    const carregarTabela = async () => {
      try {
        const params = new URLSearchParams()
        if (filtroBases.length > 0) params.append('bases', filtroBases.join(','))
        if (filtroCidades.length > 0) params.append('cidades', filtroCidades.join(','))
        const url = `/retidos/pedidos-parados${params.toString() ? '?' + params.toString() : ''}`
        const response = await api.get(url)
        const result = response.data
        if (result.success) {
          setPedidosParadosData(result.data || [])
          if (typeof result.total_pedidos === 'number') setTotalPedidos(result.total_pedidos)
        } else {
          setPedidosParadosData([])
        }
      } catch (_e) {
        setPedidosParadosData([])
      }
    }
    carregarTabela()
  }, [filtroBases, filtroCidades, setPedidosParadosData, setTotalPedidos])

  return {
    filtroBases,
    setFiltroBases,
    filtroCidades,
    setFiltroCidades,
    basesDisponiveis,
    cidadesDisponiveis,
    refetchFiltrosTabela // Função para forçar atualização após upload
  }
}

export default useFiltrosTabela

