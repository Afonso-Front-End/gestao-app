import { useState } from 'react'

export const usePagination = (initialLimit = 50) => {
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: initialLimit
  })

  const updatePagination = (totalRecords, currentPage = 1) => {
    setPagination(prev => ({
      ...prev,
      currentPage,
      totalRecords,
      totalPages: Math.ceil(totalRecords / prev.limit)
    }))
  }

  const goToPage = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }))
  }

  const goToNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      goToPage(pagination.currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (pagination.currentPage > 1) {
      goToPage(pagination.currentPage - 1)
    }
  }

  const canGoNext = pagination.currentPage < pagination.totalPages
  const canGoPrevious = pagination.currentPage > 1

  return {
    pagination,
    updatePagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious
  }
}
