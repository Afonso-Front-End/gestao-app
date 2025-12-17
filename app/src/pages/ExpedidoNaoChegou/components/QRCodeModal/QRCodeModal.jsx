import React from 'react'
import QRCodeModalBase from '../../../SemMovimentacaoSC/components/QRCodeModal/QRCodeModal'

const QRCodeModal = ({ isOpen, onClose, remessas = [] }) => {
  return (
    <QRCodeModalBase
      isOpen={isOpen}
      onClose={onClose}
      remessas={remessas}
    />
  )
}

export default QRCodeModal


