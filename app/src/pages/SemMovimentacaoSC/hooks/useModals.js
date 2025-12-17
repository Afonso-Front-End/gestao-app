import { useState, useCallback } from 'react'

/**
 * Hook para gerenciar estados dos modais
 */
export const useModals = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showLotesModal1000, setShowLotesModal1000] = useState(false)
  const [showLotesModal500, setShowLotesModal500] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFiltrosColunasModal, setShowFiltrosColunasModal] = useState(false)
  const [isClosingFiltrosColunas, setIsClosingFiltrosColunas] = useState(false)
  const [showQRCodeModal, setShowQRCodeModal] = useState(false)
  const [showQRCodeDevolucaoModal, setShowQRCodeDevolucaoModal] = useState(false)
  const [showMoveRemessaModal, setShowMoveRemessaModal] = useState(false)
  const [remessaToMove, setRemessaToMove] = useState(null)
  const [movingRemessa, setMovingRemessa] = useState(false)
  const [showLotesModal1000Filtros, setShowLotesModal1000Filtros] = useState(false)

  const handleCloseFiltrosColunas = useCallback(() => {
    setIsClosingFiltrosColunas(true)
    setTimeout(() => {
      setIsClosingFiltrosColunas(false)
      setShowFiltrosColunasModal(false)
    }, 250)
  }, [])

  const handleCloseMoveRemessa = useCallback(() => {
    if (!movingRemessa) {
      setShowMoveRemessaModal(false)
      setRemessaToMove(null)
    }
  }, [movingRemessa])

  return {
    showDeleteModal,
    setShowDeleteModal,
    showLotesModal1000,
    setShowLotesModal1000,
    showLotesModal500,
    setShowLotesModal500,
    showDetailsModal,
    setShowDetailsModal,
    showFiltrosColunasModal,
    setShowFiltrosColunasModal,
    isClosingFiltrosColunas,
    handleCloseFiltrosColunas,
    showQRCodeModal,
    setShowQRCodeModal,
    showQRCodeDevolucaoModal,
    setShowQRCodeDevolucaoModal,
    showMoveRemessaModal,
    setShowMoveRemessaModal,
    remessaToMove,
    setRemessaToMove,
    movingRemessa,
    setMovingRemessa,
    handleCloseMoveRemessa,
    showLotesModal1000Filtros,
    setShowLotesModal1000Filtros
  }
}

