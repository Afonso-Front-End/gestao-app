import React, { lazy, Suspense, memo, useMemo } from 'react'

const ConfirmModal = lazy(() => import('../../../../components/ConfirmModal/ConfirmModal'))

const DeleteDevolucaoModal = memo(({
  isOpen,
  onClose,
  deleteDevolucaoType,
  deletingDevolucao,
  onConfirm
}) => {
  const title = useMemo(() => {
    return deleteDevolucaoType === 'all' 
      ? '⚠️ Deletar TODAS as Devoluções?' 
      : `⚠️ Deletar Devoluções da Base "${deleteDevolucaoType}"?`
  }, [deleteDevolucaoType])

  const message = useMemo(() => {
    return deleteDevolucaoType === 'all'
      ? 'Tem certeza que deseja deletar TODAS as remessas em devolução?'
      : `Tem certeza que deseja deletar todas as remessas em devolução da base "${deleteDevolucaoType}"?`
  }, [deleteDevolucaoType])

  if (!isOpen || !deleteDevolucaoType) return null

  return (
    <Suspense fallback={null}>
      <ConfirmModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        title={title}
        message={message}
        warningMessage="⚠️ ATENÇÃO: Esta ação não pode ser desfeita! Todas as devoluções selecionadas serão permanentemente deletadas."
        confirmText="Sim, Deletar"
        cancelText="Cancelar"
        type="danger"
        loading={deletingDevolucao}
      />
    </Suspense>
  )
})

DeleteDevolucaoModal.displayName = 'DeleteDevolucaoModal'

export default DeleteDevolucaoModal

