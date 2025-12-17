import { useCallback } from 'react'

/**
 * Hook para ações relacionadas a remessas (copiar, etc)
 */
export const useRemessaActions = (showSuccess, showError) => {
  const handleCopyRemessas = useCallback(async (remessasUnicas) => {
    try {
      if (remessasUnicas.length === 0) {
        showError('Nenhuma remessa disponível para copiar')
        return
      }
      
      const remessas = remessasUnicas.map(item => item.remessa).filter(Boolean)
      
      if (remessas.length === 0) {
        showError('Nenhuma remessa válida encontrada')
        return
      }
      
      await navigator.clipboard.writeText(remessas.join('\n'))
      showSuccess(`📋 ${remessas.length.toLocaleString('pt-BR')} remessa(s) copiada(s)!`)
    } catch (error) {
      showError('Erro ao copiar remessas. Tente novamente.')
    }
  }, [showSuccess, showError])

  const handleCopyRemessasFiltradas = useCallback(async (dadosFiltradosColunas) => {
    try {
      if (dadosFiltradosColunas.length === 0) {
        showError('Nenhuma remessa disponível para copiar')
        return
      }
      
      const remessas = dadosFiltradosColunas.map(item => item.remessa).filter(Boolean)
      
      if (remessas.length === 0) {
        showError('Nenhuma remessa válida encontrada')
        return
      }
      
      await navigator.clipboard.writeText(remessas.join('\n'))
      showSuccess(`📋 ${remessas.length.toLocaleString('pt-BR')} remessa(s) copiada(s)!`)
    } catch (error) {
      showError('Erro ao copiar remessas. Tente novamente.')
    }
  }, [showSuccess, showError])

  const handleCopyLote = useCallback(async (lote) => {
    try {
      if (lote.remessas.length === 0) {
        showError('Nenhuma remessa válida encontrada neste lote')
        return
      }
      
      await navigator.clipboard.writeText(lote.remessas.join('\n'))
      showSuccess(`📋 Lote ${lote.numero_lote} copiado! ${lote.total_remessas.toLocaleString('pt-BR')} remessa(s) copiada(s)`)
    } catch (error) {
      showError('Erro ao copiar lote. Tente novamente.')
    }
  }, [showSuccess, showError])

  return {
    handleCopyRemessas,
    handleCopyRemessasFiltradas,
    handleCopyLote
  }
}

