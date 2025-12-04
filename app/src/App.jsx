import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { NotificationProvider } from './contexts/NotificationContext'
import { LoadingProvider } from './contexts/LoadingContext'
import { UploadProvider } from './contexts/UploadContext'
import { AuthProvider } from './contexts/AuthContext'
import { ConfigProvider } from './contexts/ConfigContext'
import Layout from './Layout/Layout'
import NotificationContainer from './components/NotificationContainer/NotificationContainer'
import UploadProgress from './components/UploadProgress/UploadProgress'
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import { ROUTES, ALL_ROUTES } from './config/routes'

// Importações dinâmicas dos componentes
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Home from './pages/Home/Home'
import PedidosRetidos from './pages/PedidosRetidos/PedidosRetidos'
import ListaTelefones from './pages/ListaTelefones/ListaTelefones'
import Reports from './pages/Reports/Reports'
import SLA from './pages/SLA/SLA'
import Analise from './pages/Analise/Analise'
import D1 from './pages/D1/D1'
import Configuracoes from './pages/Configuracoes/Configuracoes'
import './App.css'

// Mapeamento de componentes
const COMPONENT_MAP = {
  Home,
  PedidosRetidos,
  ListaTelefones,
  Reports,
  SLA,
  Analise,
  D1,
  Configuracoes
}

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <NotificationProvider>
          <AuthProvider>
            <ConfigProvider>
              <LoadingProvider>
                <UploadProvider>
                  <div className="app">
                    <Routes>
                      {/* Rotas públicas */}
                      <Route path={ROUTES.LOGIN} element={<Login />} />
                      <Route path={ROUTES.REGISTER} element={<Register />} />
                      
                      {/* Rotas protegidas */}
                      <Route path="/" element={
                        <PrivateRoute>
                          <Layout />
                        </PrivateRoute>
                      }>
                        <Route index element={<Home />} />
                        {ALL_ROUTES
                          .filter(route => route.path && route.path !== ROUTES.HOME) // Home já está como index
                          .map(route => (
                            <Route 
                              key={route.path} 
                              path={route.path.replace(/^\//, '')} // Remove apenas a primeira barra
                              element={
                                <ErrorBoundary>
                                  {React.createElement(COMPONENT_MAP[route.component])}
                                </ErrorBoundary>
                              } 
                            />
                          ))
                        }
                      </Route>
                    </Routes>
                    <NotificationContainer />
                  </div>
                </UploadProvider>
              </LoadingProvider>
            </ConfigProvider>
          </AuthProvider>
        </NotificationProvider>
      </ErrorBoundary>
    </Router>
  )
}

export default App
