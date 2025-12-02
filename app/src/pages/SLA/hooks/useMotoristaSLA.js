import { useMemo } from 'react'

const useMotoristaSLA = (slaData) => {
  const motoristaData = useMemo(() => {
    if (!slaData || slaData.length === 0) {
      return {
        motoristas: [],
        totais: {
          totalPedidos: 0,
          entregues: 0,
          naoEntregues: 0,
          taxaEntrega: 0,
          slaMedio: 0,
          motoristasExcelentes: 0,
          totalMotoristas: 0
        }
      }
    }

    // Agrupar dados por motorista
    const motoristaMap = new Map()

    slaData.forEach((record, index) => {
      const motorista = record['Responsável pela entrega'] || 'Não informado'
      const status = record['Marca de assinatura'] || 'Não informado'
      
      if (!motoristaMap.has(motorista)) {
        motoristaMap.set(motorista, {
          motorista,
          total: 0,
          entregues: 0,
          naoEntregues: 0,
          sla: 0
        })
      }

      const motoristaData = motoristaMap.get(motorista)
      motoristaData.total++
      
      // Analisar status de entrega
      if (status.toLowerCase().includes('entregue') || status.toLowerCase().includes('delivered')) {
        motoristaData.entregues++
      } else {
        motoristaData.naoEntregues++
      }
    })

    // Calcular SLA para cada motorista
    const motoristas = Array.from(motoristaMap.values()).map(motorista => {
      const sla = motorista.total > 0 ? (motorista.entregues / motorista.total) * 100 : 0
      const participacao = slaData.length > 0 ? (motorista.total / slaData.length) * 100 : 0
      
      return {
        ...motorista,
        sla: Math.round(sla * 10) / 10, // Arredondar para 1 casa decimal
        participacao: Math.round(participacao * 10) / 10,
        slaStatus: sla >= 80 ? 'ALTO' : 'BAIXO'
      }
    })

    // Ordenar por total de pedidos (maior primeiro)
    motoristas.sort((a, b) => b.total - a.total)

    // Calcular totais
    const totalPedidos = slaData.length
    const totalEntregues = motoristas.reduce((sum, m) => sum + m.entregues, 0)
    const totalNaoEntregues = motoristas.reduce((sum, m) => sum + m.naoEntregues, 0)
    const taxaEntrega = totalPedidos > 0 ? (totalEntregues / totalPedidos) * 100 : 0
    const slaMedio = motoristas.length > 0 ? 
      motoristas.reduce((sum, m) => sum + m.sla, 0) / motoristas.length : 0
    const motoristasExcelentes = motoristas.filter(m => m.sla >= 80).length


    return {
      motoristas,
      totais: {
        totalPedidos,
        entregues: totalEntregues,
        naoEntregues: totalNaoEntregues,
        taxaEntrega: Math.round(taxaEntrega * 10) / 10,
        slaMedio: Math.round(slaMedio * 10) / 10,
        motoristasExcelentes,
        totalMotoristas: motoristas.length
      }
    }
  }, [slaData])

  return motoristaData
}

export default useMotoristaSLA
