import { useMemo } from 'react'

/**
 * Hook para processar estatísticas dos dados filtrados
 */
export const useStatistics = (remessasUnicas) => {
  return useMemo(() => {
    if (remessasUnicas.length === 0) {
      return {
        total: 0,
        byAging: {},
        byTipoOperacao: {},
        byBaseEntrega: {},
        byUnidadeResponsavel: {},
        byOperador: {},
        agingDistribution: [],
        tipoOperacaoDistribution: [],
        baseEntregaDistribution: [],
        horarioDistribution: []
      }
    }

    const stats = {
      total: remessasUnicas.length,
      byAging: {},
      byTipoOperacao: {},
      byBaseEntrega: {},
      byUnidadeResponsavel: {},
      byOperador: {}
    }

    remessasUnicas.forEach(item => {
      // Contar por Aging
      const aging = item.aging || 'Não informado'
      stats.byAging[aging] = (stats.byAging[aging] || 0) + 1

      // Contar por Tipo de Operação
      const tipoOp = item.tipo_ultima_operacao || 'Não informado'
      stats.byTipoOperacao[tipoOp] = (stats.byTipoOperacao[tipoOp] || 0) + 1

      // Contar por Base de Entrega
      const baseEntrega = item.base_entrega || 'Não informado'
      stats.byBaseEntrega[baseEntrega] = (stats.byBaseEntrega[baseEntrega] || 0) + 1

      // Contar por Unidade Responsável
      const unidade = item.unidade_responsavel || 'Não informado'
      stats.byUnidadeResponsavel[unidade] = (stats.byUnidadeResponsavel[unidade] || 0) + 1

      // Contar por Operador
      const operador = item.operador_bipe_mais_recente || 'Não informado'
      stats.byOperador[operador] = (stats.byOperador[operador] || 0) + 1
    })

    // Converter para arrays ordenados
    stats.agingDistribution = Object.entries(stats.byAging)
      .map(([key, value]) => ({ label: key, count: value, percentage: ((value / stats.total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)

    stats.tipoOperacaoDistribution = Object.entries(stats.byTipoOperacao)
      .map(([key, value]) => ({ label: key, count: value, percentage: ((value / stats.total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)

    stats.baseEntregaDistribution = Object.entries(stats.byBaseEntrega)
      .map(([key, value]) => ({ label: key, count: value, percentage: ((value / stats.total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 bases

    // Distribuição por horário da última operação (agrupar por data)
    const horarioDistribution = {}
    remessasUnicas.forEach(item => {
      const horario = item.horario_ultima_operacao
      if (horario) {
        try {
          // Tentar extrair a data do horário (formato pode variar)
          // Exemplos: "2024-01-15 14:30:00" ou "15/01/2024 14:30" ou "14:30:00"
          let dataFormatada = 'Sem data'
          
          // Tentar formato ISO: 2024-01-15 ou 2024-01-15 14:30:00
          const isoMatch = horario.match(/(\d{4}-\d{2}-\d{2})/)
          if (isoMatch) {
            const data = new Date(isoMatch[1])
            dataFormatada = data.toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            })
          } else {
            // Tentar formato brasileiro: 15/01/2024
            const brMatch = horario.match(/(\d{2}\/\d{2}\/\d{4})/)
            if (brMatch) {
              dataFormatada = brMatch[1]
            } else {
              // Tentar extrair apenas a data de qualquer formato
              const qualquerDataMatch = horario.match(/(\d{2,4}[-\/]\d{2}[-\/]\d{2,4})/)
              if (qualquerDataMatch) {
                dataFormatada = qualquerDataMatch[1]
              } else {
                dataFormatada = horario.split(' ')[0] || horario
              }
            }
          }
          
          horarioDistribution[dataFormatada] = (horarioDistribution[dataFormatada] || 0) + 1
        } catch (e) {
          horarioDistribution['Data inválida'] = (horarioDistribution['Data inválida'] || 0) + 1
        }
      } else {
        horarioDistribution['Sem horário'] = (horarioDistribution['Sem horário'] || 0) + 1
      }
    })

    stats.horarioDistribution = Object.entries(horarioDistribution)
      .map(([key, value]) => ({ label: key, count: value, percentage: ((value / stats.total) * 100).toFixed(1) }))
      .sort((a, b) => {
        // Tentar ordenar por data (mais recente primeiro)
        try {
          const dataA = new Date(a.label.split(' ')[0].split('/').reverse().join('-'))
          const dataB = new Date(b.label.split(' ')[0].split('/').reverse().join('-'))
          if (!isNaN(dataA.getTime()) && !isNaN(dataB.getTime())) {
            return dataB - dataA // Mais recente primeiro
          }
        } catch (e) {
          // Se não conseguir ordenar por data, ordena por quantidade
        }
        return b.count - a.count
      })

    return stats
  }, [remessasUnicas])
}

