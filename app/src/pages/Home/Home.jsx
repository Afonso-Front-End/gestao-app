import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  IoCube,
  IoCall,
  IoAnalytics,
  IoCalendar,
  IoTrendingUp,
  IoTime,
  IoCheckmarkCircle,
  IoArrowForward
} from 'react-icons/io5'
import api from '../../services/api'
import { ROUTES } from '../../config/routes'
import './Home.css'

const Home = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    pedidosRetidos: { total: 0, bases: 0, loading: true },
    sla: { metricas: null, loading: true },
    d1: { total: 0, loading: true },
    telefones: { total: 0, loading: true }
  })

  // Buscar estatísticas ao carregar
  useEffect(() => {
    fetchAllStats()
  }, [])

  const fetchAllStats = async () => {
    // Pedidos Parados
    fetchPedidosRetidos()
    // SLA - pode não ter endpoint específico, então deixo como placeholder
    // D1 - pode não ter endpoint específico
    // Lista de Telefones
    fetchTelefones()
  }

  const fetchPedidosRetidos = async () => {
    try {
      const response = await api.get('/retidos/pedidos-parados')
      if (response.data.success) {
        setStats(prev => ({
          ...prev,
          pedidosRetidos: {
            total: response.data.total_pedidos || 0,
            bases: response.data.total_bases || 0,
            loading: false
          }
        }))
      }
    } catch (error) {
      // Erro silencioso - pode não ter dados ainda
      console.warn('⚠️ Pedidos parados não disponíveis:', error.message)
      setStats(prev => ({
        ...prev,
        pedidosRetidos: { 
          total: 0,
          bases: 0,
          loading: false,
          error: true
        }
      }))
    }
  }

  const fetchTelefones = async () => {
    try {
      const response = await api.get('/lista-telefones/listas')
      
      // Contar total de telefones únicos
      let totalTelefones = 0
      if (response.data.success && Array.isArray(response.data.data)) {
        totalTelefones = response.data.data.length
      }
      
      setStats(prev => ({
        ...prev,
        telefones: {
          total: totalTelefones,
          loading: false
        }
      }))
    } catch (error) {
      // Erro silencioso - não quebra a Home se endpoint não existir
      console.warn('⚠️ Endpoint de telefones não disponível:', error.message)
      setStats(prev => ({
        ...prev,
        telefones: { 
          total: 0,
          loading: false,
          error: true
        }
      }))
    }
  }

  const quickActions = [
    {
      title: 'Pedidos Parados',
      description: 'Gerencie pedidos que estão parados',
      icon: IoCube,
      color: '#0f766e',
      gradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
      path: ROUTES.PEDIDOS_RETIDOS,
      stat: stats.pedidosRetidos.total,
      statLabel: 'Pedidos',
      loading: stats.pedidosRetidos.loading
    },
    {
      title: 'Lista de Telefones',
      description: 'Cadastro de motoristas e telefones',
      icon: IoCall,
      color: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      path: ROUTES.LISTA_TELEFONES,
      stat: stats.telefones.total,
      statLabel: 'Motoristas',
      loading: stats.telefones.loading
    },
    {
      title: 'SLA',
      description: 'Análise e cálculo de SLA',
      icon: IoAnalytics,
      color: '#7c3aed',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      path: ROUTES.SLA,
      stat: null,
      statLabel: 'Análises',
      loading: stats.sla.loading
    },
    {
      title: 'Retidos +1 Mês',
      description: 'Pedidos parados há mais de 1 mês',
      icon: IoCalendar,
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      path: ROUTES.D1,
      stat: null,
      statLabel: 'Pedidos',
      loading: stats.d1.loading
    }
  ]

  const features = [
    {
      icon: IoTrendingUp,
      title: 'Análise em Tempo Real',
      description: 'Monitore seus pedidos e métricas instantaneamente'
    },
    {
      icon: IoTime,
      title: 'Gestão Eficiente',
      description: 'Otimize processos e reduza tempos de resposta'
    },
    {
      icon: IoCheckmarkCircle,
      title: 'Controle Total',
      description: 'Tenha visibilidade completa de suas operações'
    }
  ]

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Bem-vindo à <span className="highlight">Torre de Controle</span>
          </h1>
          <p className="hero-subtitle">
            Sistema integrado de gestão e controle de pedidos
          </p>
        </div>
        <div className="hero-decoration">
          <span className="hero-icon">🗼</span>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="section">
        <h2 className="section-title">Acesso Rápido</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="action-card"
              onClick={() => navigate(action.path)}
              style={{ '--card-gradient': action.gradient }}
            >
              <div className="action-card-header">
                <div className="action-icon" style={{ background: action.gradient }}>
                  <action.icon size={28} color="#fff" />
                </div>
                <div className="action-badge">
                  {action.loading ? (
                    <div className="badge-loading"></div>
                  ) : action.stat !== null ? (
                    <>
                      <span className="badge-number">{action.stat}</span>
                      <span className="badge-label">{action.statLabel}</span>
                    </>
                  ) : (
                    <span className="badge-label">{action.statLabel}</span>
                  )}
                </div>
              </div>
              <div className="action-card-body">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>
              <div className="action-card-footer">
                <span className="action-link">
                  Acessar <IoArrowForward className="arrow-icon" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="section">
        <h2 className="section-title">Recursos do Sistema</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                <feature.icon size={32} className="feature-icon" />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Info - Rodapé com informações do sistema */}
      <div className="system-info-footer">
        <div className="footer-left">
          <div className="footer-brand">
            <span className="brand-icon">🗼</span>
            <div className="brand-text">
              <span className="brand-name">Torre de Controle JMS</span>
              <span className="brand-version">v1.0.0</span>
            </div>
          </div>
        </div>
        
        <div className="footer-center">
          <div className="footer-stats">
            <div className="stat-item">
              <IoCheckmarkCircle className="stat-icon stat-icon-success" />
              <span className="stat-text">Sistema Operacional</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <IoTime className="stat-icon stat-icon-info" />
              <span className="stat-text">Última atualização: {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
        
        <div className="footer-right">
          <div className="status-badge status-badge-online">
            <span className="status-pulse"></span>
            <span className="status-text">Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home