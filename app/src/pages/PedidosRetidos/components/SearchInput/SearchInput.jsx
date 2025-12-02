import React from 'react'
import { IoSearch, IoClose } from "react-icons/io5"
import './SearchInput.css'

const SearchInput = ({
  value = '',
  onChange = () => {},
  placeholder = 'Pesquisar...',
  onClear = null
}) => {
  return (
    <div className="search-input-wrapper">
      <div className="search-input-icon">
        <IoSearch />
      </div>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="search-clear-btn"
          onClick={() => {
            onChange('')
            if (onClear) onClear()
          }}
          title="Limpar pesquisa"
        >
          <IoClose />
        </button>
      )}
    </div>
  )
}

// Memoizar o componente para evitar re-renders desnecessários
export default React.memo(SearchInput)

