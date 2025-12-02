import { useState, useEffect } from 'react'
import api from '../services/api'

const usePedidosRetidos = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/retidos/data')
      setData(response.data)
    } catch (fetchError) {
      const errorMessage = fetchError?.message || 'Erro ao buscar dados'
      setError(errorMessage)
      console.error('Erro ao buscar dados:', fetchError)
    } finally {
      setLoading(false)
    }
  }

  const getDataById = async (id) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get(`/retidos/data/${id}`)
      return response.data
    } catch (fetchError) {
      const errorMessage = fetchError?.message || 'Erro ao buscar dados por ID'
      setError(errorMessage)
      console.error('Erro ao buscar dados por ID:', fetchError)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    fetchData,
    getDataById
  }
}

export default usePedidosRetidos

