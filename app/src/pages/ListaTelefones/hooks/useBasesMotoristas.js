import { useState, useEffect, useRef } from 'react'
import { useNotification } from '../../../contexts/NotificationContext'
import useDebounce from '../../../hooks/useDebounce'
import { buildApiUrl } from '../../../utils/api-utils'
import { getApiHeaders } from '../../../utils/api-headers'

export const useBasesMotoristas = () => {
  const { showError, showLoading, hideLoading } = useNotification()
  const [bases, setBases] = useState([])
  const [loadingBases, setLoadingBases] = useState(false)
  const [motoristas, setMotoristas] = useState([])
  const [loadingMotoristas, setLoadingMotoristas] = useState(false)
  const [baseSelecionada, setBaseSelecionada] = useState('')
  const [busca, setBusca] = useState('')
  const buscaDebounced = useDebounce(busca, 500) // Debounce de 500ms
  const isInitialMount = useRef(true)

  const carregarBases = async () => {
    setLoadingBases(true)
    try {
      const response = await fetch(buildApiUrl('lista-telefones/bases'), {
        headers: getApiHeaders()
      })
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      const data = await response.json()
      if (data.success && Array.isArray(data.bases)) {
        setBases(data.bases)
      } else {
        setBases([])
      }
    } catch (error) {
      showError(`Erro ao carregar bases: ${error.message}`)
      setBases([])
    } finally {
      setLoadingBases(false)
    }
  }

  const carregarMotoristasPorBase = async (base, busca = '') => {
    if (!base) {
      setMotoristas([])
      return
    }

    setLoadingMotoristas(true)
    const loadingId = showLoading('Carregando motoristas...', 'Busca')
    
    try {
      const url = busca
        ? buildApiUrl(`lista-telefones/bases/${encodeURIComponent(base)}/motoristas?busca=${encodeURIComponent(busca)}`)
        : buildApiUrl(`lista-telefones/bases/${encodeURIComponent(base)}/motoristas`)
      
      const response = await fetch(url, {
        headers: getApiHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success && Array.isArray(data.motoristas)) {
        setMotoristas(data.motoristas)
      } else {
        setMotoristas([])
      }
    } catch (error) {
      showError(`Erro ao carregar motoristas: ${error.message}`)
      setMotoristas([])
    } finally {
      setLoadingMotoristas(false)
      hideLoading(loadingId)
    }
  }

  // Carregar bases ao montar
  useEffect(() => {
    carregarBases()
  }, [])

  // Carregar motoristas quando base selecionada mudar
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    
    if (baseSelecionada) {
      // Aguardar um pequeno delay para animação suave
      const timeoutId = setTimeout(() => {
        carregarMotoristasPorBase(baseSelecionada, '')
      }, 300)
      
      setBusca('') // Limpar busca ao mudar de base
      
      return () => clearTimeout(timeoutId)
    } else {
      setMotoristas([])
    }
  }, [baseSelecionada])

  // Carregar motoristas quando busca mudar (com debounce)
  useEffect(() => {
    if (baseSelecionada) {
      carregarMotoristasPorBase(baseSelecionada, buscaDebounced)
    }
  }, [buscaDebounced, baseSelecionada])

  return {
    bases,
    loadingBases,
    motoristas,
    loadingMotoristas,
    baseSelecionada,
    setBaseSelecionada,
    busca,
    setBusca,
    carregarBases,
    carregarMotoristasPorBase
  }
}

