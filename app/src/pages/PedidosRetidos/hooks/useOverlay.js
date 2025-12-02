import { useState, useRef, useEffect } from 'react'

/**
 * Hook para gerenciar estado do overlay de pedidos do motorista
 * @returns {Object} Estado e funções relacionadas ao overlay
 */
const useOverlay = () => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [overlayData, setOverlayData] = useState([])
  const [overlayTitle, setOverlayTitle] = useState('')
  const [overlaySubtitle, setOverlaySubtitle] = useState('')
  const [overlayStats, setOverlayStats] = useState({})
  const [isLoadingPedidos, setIsLoadingPedidos] = useState(false)
  const [isClosingOverlay, setIsClosingOverlay] = useState(false)
  const closeTimeoutRef = useRef(null)

  // Estados para WhatsApp e Copy
  const [showWhatsApp, setShowWhatsApp] = useState(false)
  const [motoristaNome, setMotoristaNome] = useState('')
  const [baseMotorista, setBaseMotorista] = useState('')
  const [telefoneMotorista, setTelefoneMotorista] = useState('')
  const [telefoneCarregado, setTelefoneCarregado] = useState(false)

  // Cleanup do timeout quando componente desmontar - CRÍTICO para evitar memory leaks
  useEffect(() => {
    return () => {
      // Apenas limpar timeout pendente
      // Não chamar setters aqui pois o componente está desmontando
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [])

  /**
   * Reseta todos os estados do overlay
   */
  const resetOverlay = () => {
    setOverlayData([])
    setOverlayTitle('')
    setOverlaySubtitle('')
    setOverlayStats({})
    setMotoristaNome('')
    setBaseMotorista('')
    setTelefoneMotorista('')
    setTelefoneCarregado(false)
    setShowWhatsApp(false)
    setIsLoadingPedidos(false)
  }

  /**
   * Fecha o overlay de forma controlada
   */
  const handleCloseOverlay = () => {
    // Previne múltiplas execuções
    if (isClosingOverlay) {
      console.warn('⚠️ useOverlay: Overlay já está fechando, ignorando chamada adicional')
      return
    }

    // Limpar timeout anterior se existir
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    setIsClosingOverlay(true)
    setIsOverlayOpen(false)

    // Resetar todos os estados após um delay (300ms para animação + 50ms de segurança)
    closeTimeoutRef.current = setTimeout(() => {
      // Verificar se o timeout não foi cancelado
      if (closeTimeoutRef.current) {
        resetOverlay()
        setIsClosingOverlay(false)
        closeTimeoutRef.current = null
      }
    }, 350) // 300ms animação + 50ms de segurança
  }

  /**
   * Abre o overlay
   */
  const abrirOverlay = () => {
    resetOverlay()
    setTimeout(() => {
      setIsOverlayOpen(true)
    }, 100)
  }

  return {
    // Estados
    isOverlayOpen,
    overlayData,
    overlayTitle,
    overlaySubtitle,
    overlayStats,
    isLoadingPedidos,
    isClosingOverlay,
    showWhatsApp,
    motoristaNome,
    baseMotorista,
    telefoneMotorista,
    telefoneCarregado,

    // Setters
    setOverlayData,
    setOverlayTitle,
    setOverlaySubtitle,
    setOverlayStats,
    setIsLoadingPedidos,
    setShowWhatsApp,
    setMotoristaNome,
    setBaseMotorista,
    setTelefoneMotorista,
    setTelefoneCarregado,

    // Funções
    handleCloseOverlay,
    abrirOverlay,
    resetOverlay
  }
}

export default useOverlay

