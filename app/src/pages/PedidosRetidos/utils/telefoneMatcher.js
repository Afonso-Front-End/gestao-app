/**
 * Utilitário para fazer cruzamento entre dados de Pedidos Retidos e Lista de Telefones
 */

export const fazerCruzamentoTelefones = (stats, listaTelefones) => {
  // Filtrar dados válidos
  const statsValidos = stats.filter(stat => stat && stat.Motorista && stat.Base)
  const listaValida = listaTelefones.filter(item => item && item.Motorista && item.HUB)
  
  const statsComTelefones = statsValidos.map(stat => {
    // Buscar na lista de telefones por base e motorista
    const telefoneEncontrado = listaValida.find(item => {
      // Normalizar nomes para comparação (remover espaços extras, converter para maiúscula)
      const nomeStat = stat.Motorista?.toString().trim().toUpperCase()
      const nomeLista = item.Motorista?.toString().trim().toUpperCase()
      
      // Normalizar bases para comparação
      const baseStat = stat.Base?.toString().trim().toUpperCase()
      const baseLista = item.HUB?.toString().trim().toUpperCase()
      
      // Estratégia 1: Match exato (base + motorista)
      const matchExato = baseStat === baseLista && nomeStat === nomeLista
      
      // Estratégia 2: Match apenas por motorista (ignorar base)
      const matchApenasMotorista = nomeStat === nomeLista && nomeStat && nomeLista
      
      // Estratégia 3: Match parcial por motorista (primeiro nome + sobrenome)
      const matchParcial = nomeStat && nomeLista && 
        (nomeStat.includes(nomeLista.split(' ')[0] || '') || nomeLista.includes(nomeStat.split(' ')[0] || ''))
      
      // Estratégia 4: Match por similaridade de nome (MANTENDO prefixos como TAC, ETC)
      const nomeStatLimpo = nomeStat ? nomeStat.trim() : ''
      const nomeListaLimpo = nomeLista ? nomeLista.trim() : ''
      const matchSimilaridade = nomeStatLimpo && nomeListaLimpo && 
        (nomeStatLimpo === nomeListaLimpo || 
         nomeStatLimpo.includes(nomeListaLimpo.split(' ')[0] || '') || 
         nomeListaLimpo.includes(nomeStatLimpo.split(' ')[0] || ''))
      
      // Estratégia 5: Match por status "aprovado" (verificação adicional de qualidade)
      const statusLista = item.Status?.toString().trim().toLowerCase()
      const matchComStatusAprovado = matchSimilaridade && statusLista && 
        (statusLista.includes('aprovado') || statusLista.includes('aprovada'))
      
      if (matchExato) {
        item.TIPO_MATCH = 'exato'
        return true
      }
      
      if (matchApenasMotorista) {
        item.TIPO_MATCH = 'motorista'
        return true
      }
      
      if (matchParcial) {
        item.TIPO_MATCH = 'parcial'
        return true
      }
      
      if (matchComStatusAprovado) {
        item.TIPO_MATCH = 'aprovado'
        return true
      }
      
      if (matchSimilaridade) {
        item.TIPO_MATCH = 'similaridade'
        return true
      }
      
      return false
    })
    
    // Se encontrou telefone, adicionar ao stat
    if (telefoneEncontrado) {
      const telefone = telefoneEncontrado.Contato || telefoneEncontrado.Telefone || ''
      return {
        ...stat,
        TELEFONE_MOTORISTA: telefone,
        TELEFONE_ENCONTRADO: true,
        TIPO_MATCH: telefoneEncontrado.TIPO_MATCH || 'desconhecido'
      }
    }
    
    // Se não encontrou, manter como está
    return {
      ...stat,
      TELEFONE_ENCONTRADO: false,
      TIPO_MATCH: null
    }
  })

  return statsComTelefones
}

export const logDadosCruzamento = (stats, listaTelefones) => {
  // Função vazia - logs removidos
}
