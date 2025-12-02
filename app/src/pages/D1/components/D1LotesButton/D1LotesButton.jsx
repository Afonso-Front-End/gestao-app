import React from 'react'
import { IoList, IoHourglass } from 'react-icons/io5'
import D1LotesDropdown from '../D1LotesDropdown/D1LotesDropdown'

const D1LotesButton = ({
  loadingPedidosBipagens,
  selectedBasesBipagens,
  buscarPedidosBipagens,
  showLotesDropdown,
  numerosPedidosBipagens,
  selectedTemposParados,
  setShowLotesDropdown,
  showSuccess,
  showError
}) => {
  return (
    <div className="d1-lotes-dropdown-container">
      <button
        className="d1-btn-lotes"
        onClick={buscarPedidosBipagens}
        disabled={loadingPedidosBipagens || selectedBasesBipagens.length === 0}
        title="Buscar números de pedidos das bases selecionadas"
      >
        {loadingPedidosBipagens ? (
          <IoHourglass size={24} className="spinning" />
        ) : (
          <IoList size={24} />
        )}
      </button>
      <D1LotesDropdown
        showLotesDropdown={showLotesDropdown}
        numerosPedidosBipagens={numerosPedidosBipagens}
        selectedBasesBipagens={selectedBasesBipagens}
        selectedTemposParados={selectedTemposParados}
        setShowLotesDropdown={setShowLotesDropdown}
        showSuccess={showSuccess}
        showError={showError}
      />
    </div>
  )
}

export default D1LotesButton

