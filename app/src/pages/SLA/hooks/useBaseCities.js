import { useState, useEffect } from 'react'
import { buildApiUrl } from '../../../utils/api-utils'
import { getApiHeaders } from '../../../utils/api-headers'

const useBaseCities = (baseName) => {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (baseName) {
      fetchCities(baseName)
    } else {
      setCities([])
      setError(null)
    }
  }, [baseName])

  const fetchCities = async (base) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(buildApiUrl(`sla/bases/data/${base}`), {
        headers: getApiHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Extrair cidades únicas dos dados usando a coluna "Cidade Destino"
      const uniqueCities = [...new Set(data.data.records.map(record => record['Cidade Destino']).filter(Boolean))]
      setCities(uniqueCities.sort())
      
    } catch (err) {
      setError(err.message)
      setCities([])
    } finally {
      setLoading(false)
    }
  }

  return {
    cities,
    loading,
    error,
    refetch: () => baseName && fetchCities(baseName)
  }
}

export default useBaseCities
