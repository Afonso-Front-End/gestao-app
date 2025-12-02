import { useState } from 'react'
import api from '../../../services/api'

/**
 * Hook para gerenciar busca de telefone do motorista
 */
export const useD1Telefone = (cacheRef, gerarChaveCache) => {
  const [telefoneMotorista, setTelefoneMotorista] = useState('')
  const [showWhatsApp, setShowWhatsApp] = useState(false)

  const buscarTelefoneMotorista = async (motorista, base) => {
    const chaveCache = gerarChaveCache('telefone', { motorista, base })
    
    // Verificar cache
    if (cacheRef.current.telefones[chaveCache]) {
      return cacheRef.current.telefones[chaveCache]
    }

    try {
      const url = `/lista-telefones/motorista/${encodeURIComponent(motorista)}?base_name=${encodeURIComponent(base)}`
      const response = await api.get(url)
      const data = response.data

      if (data.success && data.tem_telefone && data.match_exato) {
        // Armazenar no cache
        cacheRef.current.telefones[chaveCache] = data.telefone
        return data.telefone
      } else {
        // Armazenar null no cache para evitar requisições repetidas
        cacheRef.current.telefones[chaveCache] = null
      }
      return null
    } catch (error) {
      return null
    }
  }

  const handleTelefoneAdicionado = (telefone) => {
    setTelefoneMotorista(telefone)
    setShowWhatsApp(true)
  }

  const resetTelefone = () => {
    setTelefoneMotorista('')
    setShowWhatsApp(false)
  }

  return {
    telefoneMotorista,
    setTelefoneMotorista,
    showWhatsApp,
    setShowWhatsApp,
    buscarTelefoneMotorista,
    handleTelefoneAdicionado,
    resetTelefone
  }
}

