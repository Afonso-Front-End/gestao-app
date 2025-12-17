import { useState, useMemo, useCallback, useEffect } from 'react'

export const usePagination = (data, itemsPerPage = 1000) => {
  const [currentPage, setCurrentPage] = useState(1)

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(data.length / itemsPerPage)
  }, [data.length, itemsPerPage])

  // Resetar para página 1 quando os dados mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [data.length])

  // Dados da página atual
  const displayedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  // Funções de navegação
  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      const tableContainer = document.querySelector('.expedido-nao-chegou-table-container')
      if (tableContainer) {
        tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [totalPages])

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }, [currentPage, totalPages, goToPage])

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  return {
    currentPage,
    totalPages,
    displayedData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    itemsPerPage
  }
}


