import { useState, useEffect } from 'react'
import { buildApiUrl } from '../../../utils/api-utils'
import { getApiHeaders } from '../../../utils/api-headers'

const useSLAData = (baseName, selectedCities) => {
  const [slaData, setSlaData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (baseName) {
      fetchSLAData()
    } else {
      setSlaData([])
      setError(null)
    }
  }, [baseName, selectedCities])

  const fetchSLAData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(buildApiUrl(`sla/bases/data/${baseName}?limit=10000&skip=0`), {
        headers: getApiHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Filtrar por cidades se selecionadas usando a coluna "Cidade Destino"
      let filteredData = data.data.records || []
      
      
      if (selectedCities && selectedCities.length > 0) {
        
        // Verificar quantos registros têm a cidade selecionada
        const registrosComCidade = filteredData.filter(record => 
          record['Cidade Destino'] === selectedCities[0]
        )
        
        filteredData = filteredData.filter(record => 
          selectedCities.includes(record['Cidade Destino'])
        )
      }
      
      setSlaData(filteredData)
      
    } catch (err) {
      setError(err.message)
      setSlaData([])
    } finally {
      setLoading(false)
    }
  }

  return {
    slaData,
    loading,
    error,
    refetch: fetchSLAData
  }
}

export default useSLAData
