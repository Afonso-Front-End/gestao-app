import { useMemo } from 'react'

const useSLACalculations = (slaData) => {
  const calculations = useMemo(() => {
    if (!slaData || slaData.length === 0) {
      return {
        totalPedidos: 0,
        entregasNoPrazo: 0,
        entregasAtrasadas: 0,
        percentualSLA: 0,
        statusBreakdown: {},
        cidadesBreakdown: {},
        motoristasBreakdown: {},
        tempoMedioEntrega: 0,
        pedidosPorStatus: {}
      }
    }

    // Calcular métricas básicas
    const totalPedidos = slaData.length
    
    // Analisar status de entrega
    const statusBreakdown = {}
    const cidadesBreakdown = {}
    const motoristasBreakdown = {}
    const pedidosPorStatus = {}
    
    let entregasNoPrazo = 0
    let entregasAtrasadas = 0
    let tempoTotalEntrega = 0
    let contadorTempo = 0

    slaData.forEach(record => {
      const status = record['Marca de assinatura'] || 'Não informado'
      const cidade = record['Cidade Destino'] || 'Não informado'
      const motorista = record['Responsável pela entrega'] || 'Não informado'
      const tempoEntrega = record['Tempo de entrega']
      
      // Contar por status
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1
      
      // Contar por cidade
      cidadesBreakdown[cidade] = (cidadesBreakdown[cidade] || 0) + 1
      
      // Contar por motorista
      motoristasBreakdown[motorista] = (motoristasBreakdown[motorista] || 0) + 1
      
      // Analisar SLA baseado no status
      if (status.toLowerCase().includes('entregue') || status.toLowerCase().includes('delivered')) {
        entregasNoPrazo++
      } else if (status.toLowerCase().includes('atrasado') || status.toLowerCase().includes('late')) {
        entregasAtrasadas++
      }
      
      // Calcular tempo de entrega (se disponível)
      if (tempoEntrega) {
        try {
          const dataEntrega = new Date(tempoEntrega)
          if (!isNaN(dataEntrega.getTime())) {
            tempoTotalEntrega += dataEntrega.getTime()
            contadorTempo++
          }
        } catch (e) {
          // Ignorar datas inválidas
        }
      }
    })

    // Calcular percentual de SLA
    const percentualSLA = totalPedidos > 0 ? (entregasNoPrazo / totalPedidos) * 100 : 0
    
    // Calcular tempo médio de entrega
    const tempoMedioEntrega = contadorTempo > 0 ? tempoTotalEntrega / contadorTempo : 0
    
    // Ordenar breakdowns por quantidade
    const sortByCount = (obj) => 
      Object.entries(obj)
        .sort(([,a], [,b]) => b - a)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

    return {
      totalPedidos,
      entregasNoPrazo,
      entregasAtrasadas,
      percentualSLA: Math.round(percentualSLA * 100) / 100,
      statusBreakdown: sortByCount(statusBreakdown),
      cidadesBreakdown: sortByCount(cidadesBreakdown),
      motoristasBreakdown: sortByCount(motoristasBreakdown),
      tempoMedioEntrega: tempoMedioEntrega > 0 ? new Date(tempoMedioEntrega).toLocaleDateString() : 'N/A',
      pedidosPorStatus: sortByCount(pedidosPorStatus),
      // Métricas adicionais
      entregasPendentes: totalPedidos - entregasNoPrazo - entregasAtrasadas,
      eficienciaMotoristas: Object.keys(motoristasBreakdown).length > 0 ? 
        Math.round((entregasNoPrazo / Object.keys(motoristasBreakdown).length) * 100) / 100 : 0,
      coberturaCidades: Object.keys(cidadesBreakdown).length
    }
  }, [slaData])

  return calculations
}

export default useSLACalculations
