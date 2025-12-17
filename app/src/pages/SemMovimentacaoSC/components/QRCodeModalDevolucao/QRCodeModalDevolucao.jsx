import React, { memo, useMemo } from 'react'
import QRCodeModal from '../QRCodeModal/QRCodeModal'
import QRCodeDevolucaoHeader from '../QRCodeDevolucaoHeader/QRCodeDevolucaoHeader'

const QRCodeModalDevolucao = memo(({
  isOpen,
  onClose,
  remessasDevolucao,
  basesDevolucao,
  selectedBaseDevolucao,
  onBaseChange,
  loadingBasesDevolucao,
  loadingDevolucao,
  onDeleteAll,
  onDeleteBase,
  deletingDevolucao
}) => {
  // Memoizar remessas ordenadas para evitar re-sort desnecessário
  const remessasSorted = useMemo(() => {
    return [...remessasDevolucao].sort()
  }, [remessasDevolucao])

  // Memoizar header content para evitar re-renders
  const headerContent = useMemo(() => (
    <QRCodeDevolucaoHeader
      basesDevolucao={basesDevolucao}
      selectedBaseDevolucao={selectedBaseDevolucao}
      onBaseChange={onBaseChange}
      loadingBasesDevolucao={loadingBasesDevolucao}
      loadingDevolucao={loadingDevolucao}
      onDeleteAll={onDeleteAll}
      onDeleteBase={onDeleteBase}
      deletingDevolucao={deletingDevolucao}
    />
  ), [
    basesDevolucao,
    selectedBaseDevolucao,
    onBaseChange,
    loadingBasesDevolucao,
    loadingDevolucao,
    onDeleteAll,
    onDeleteBase,
    deletingDevolucao
  ])

  return (
    <QRCodeModal
      isOpen={isOpen}
      onClose={onClose}
      remessas={remessasSorted}
      customHeaderContent={headerContent}
    />
  )
})

QRCodeModalDevolucao.displayName = 'QRCodeModalDevolucao'

export default QRCodeModalDevolucao

