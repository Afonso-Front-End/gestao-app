/**
 * Reducer para gerenciar estados de múltiplos modais e seus estados de loading
 * Consolida 8 estados em um único objeto
 */

// Estado inicial
export const initialModalState = {
  deleteLotes: { show: false, loading: false },
  deleteCollections: { show: false, loading: false },
  deleteChunks: { show: false, loading: false },
  deleteTabela: { show: false, loading: false },
}

// Action types
export const MODAL_ACTIONS = {
  // Delete Lotes
  OPEN_DELETE_LOTES: 'OPEN_DELETE_LOTES',
  CLOSE_DELETE_LOTES: 'CLOSE_DELETE_LOTES',
  SET_LOADING_LOTES: 'SET_LOADING_LOTES',
  
  // Delete Collections
  OPEN_DELETE_COLLECTIONS: 'OPEN_DELETE_COLLECTIONS',
  CLOSE_DELETE_COLLECTIONS: 'CLOSE_DELETE_COLLECTIONS',
  SET_LOADING_COLLECTIONS: 'SET_LOADING_COLLECTIONS',
  
  // Delete Chunks
  OPEN_DELETE_CHUNKS: 'OPEN_DELETE_CHUNKS',
  CLOSE_DELETE_CHUNKS: 'CLOSE_DELETE_CHUNKS',
  SET_LOADING_CHUNKS: 'SET_LOADING_CHUNKS',
  
  // Delete Tabela
  OPEN_DELETE_TABELA: 'OPEN_DELETE_TABELA',
  CLOSE_DELETE_TABELA: 'CLOSE_DELETE_TABELA',
  SET_LOADING_TABELA: 'SET_LOADING_TABELA',
  
  // Reset all
  RESET_ALL: 'RESET_ALL',
}

// Reducer
export const modalReducer = (state, action) => {
  switch (action.type) {
    // Delete Lotes
    case MODAL_ACTIONS.OPEN_DELETE_LOTES:
      return { ...state, deleteLotes: { show: true, loading: false } }
    case MODAL_ACTIONS.CLOSE_DELETE_LOTES:
      return { ...state, deleteLotes: { show: false, loading: false } }
    case MODAL_ACTIONS.SET_LOADING_LOTES:
      return { ...state, deleteLotes: { ...state.deleteLotes, loading: action.payload } }
    
    // Delete Collections
    case MODAL_ACTIONS.OPEN_DELETE_COLLECTIONS:
      return { ...state, deleteCollections: { show: true, loading: false } }
    case MODAL_ACTIONS.CLOSE_DELETE_COLLECTIONS:
      return { ...state, deleteCollections: { show: false, loading: false } }
    case MODAL_ACTIONS.SET_LOADING_COLLECTIONS:
      return { ...state, deleteCollections: { ...state.deleteCollections, loading: action.payload } }
    
    // Delete Chunks
    case MODAL_ACTIONS.OPEN_DELETE_CHUNKS:
      return { ...state, deleteChunks: { show: true, loading: false } }
    case MODAL_ACTIONS.CLOSE_DELETE_CHUNKS:
      return { ...state, deleteChunks: { show: false, loading: false } }
    case MODAL_ACTIONS.SET_LOADING_CHUNKS:
      return { ...state, deleteChunks: { ...state.deleteChunks, loading: action.payload } }
    
    // Delete Tabela
    case MODAL_ACTIONS.OPEN_DELETE_TABELA:
      return { ...state, deleteTabela: { show: true, loading: false } }
    case MODAL_ACTIONS.CLOSE_DELETE_TABELA:
      return { ...state, deleteTabela: { show: false, loading: false } }
    case MODAL_ACTIONS.SET_LOADING_TABELA:
      return { ...state, deleteTabela: { ...state.deleteTabela, loading: action.payload } }
    
    // Reset all
    case MODAL_ACTIONS.RESET_ALL:
      return initialModalState
    
    default:
      return state
  }
}

export default modalReducer
