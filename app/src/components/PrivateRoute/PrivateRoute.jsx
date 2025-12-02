import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingState from '../LoadingState/LoadingState'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingState />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default PrivateRoute

