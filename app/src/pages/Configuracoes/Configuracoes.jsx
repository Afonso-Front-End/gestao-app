import React, { useState, useEffect } from 'react'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faServer, faKey, faDatabase, faTrashAlt, faEraser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal'
import ConfirmModalWithPassword from '../../components/ConfirmModalWithPassword/ConfirmModalWithPassword'
import './Configuracoes.css'

const Configuracoes = () => {
  const { showSuccess, showError } = useNotification()
  const { user, logout } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showClearStorageModal, setShowClearStorageModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  
  // Configurações do sistema
  const [config, setConfig] = useState({
    apiPort: '',
    apiKey: '',
    apiSecret: '',
    apiBaseUrl: ''
  })

  // Carregar configurações do localStorage e variáveis de ambiente
  useEffect(() => {
    const loadConfig = () => {
      const apiKey = import.meta.env.VITE_API_KEY || localStorage.getItem('api_key') || ''
      const apiSecret = import.meta.env.VITE_API_SECRET || localStorage.getItem('api_secret') || ''
      const apiBaseUrl = localStorage.getItem('api_base_url') || ''

      setConfig({
        apiPort: '',
        apiKey,
        apiSecret,
        apiBaseUrl
      })
    }

    loadConfig()
  }, [])

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Salvar no localStorage (apenas se não estiver em variáveis de ambiente)
      if (config.apiBaseUrl) {
        localStorage.setItem('api_base_url', config.apiBaseUrl)
      } else {
        localStorage.removeItem('api_base_url')
      }

      // API Key e Secret só salvam se não estiverem em variáveis de ambiente
      if (!import.meta.env.VITE_API_KEY && config.apiKey) {
        localStorage.setItem('api_key', config.apiKey)
      } else if (!import.meta.env.VITE_API_KEY) {
        localStorage.removeItem('api_key')
      }

      if (!import.meta.env.VITE_API_SECRET && config.apiSecret) {
        localStorage.setItem('api_secret', config.apiSecret)
      } else if (!import.meta.env.VITE_API_SECRET) {
        localStorage.removeItem('api_secret')
      }

      showSuccess('Configurações salvas com sucesso! A página será recarregada para aplicar as mudanças.')
      
      // Recarregar página após 1 segundo
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      showError(`Erro ao salvar configurações: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearAllDataClick = () => {
    setShowDeleteModal(true)
  }

  const handleVerifyPassword = async (senha) => {
    if (!user) return false
    
    try {
      // Usar o endpoint de login para verificar a senha
      const response = await api.post('/auth/login', {
        nome: user.nome,
        senha: senha,
        lembrar: false
      })
      
      return response.data && response.data.access_token
    } catch (error) {
      return false
    }
  }

  const handleConfirmClearAllData = async (senha) => {
    setIsDeleting(true)
    setShowDeleteModal(false)
    
    try {
      const response = await api.delete('/admin/clear-all-data')
      const result = response.data
      
      if (result.success) {
        const summary = result.summary
        showSuccess(
          `✅ Limpeza concluída com sucesso!\n\n` +
          `• ${summary.total_deleted} registros deletados\n` +
          `• ${summary.collections_cleared} coleções limpas\n` +
          `• Coleção de TELEFONES preservada`
        )
      } else {
        showError('Houve erros durante a limpeza. Verifique o console para detalhes.')
      }
    } catch (error) {
      showError(`Erro ao limpar dados: ${error.response?.data?.detail || error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClearStorageClick = () => {
    setShowClearStorageModal(true)
  }

  const handleConfirmClearStorage = () => {
    try {
      // Limpar todo o localStorage exceto o token de autenticação
      const authToken = localStorage.getItem('authToken')
      const rememberMe = localStorage.getItem('rememberMe')
      
      localStorage.clear()
      
      // Restaurar token e rememberMe se existirem
      if (authToken) {
        localStorage.setItem('authToken', authToken)
      }
      if (rememberMe) {
        localStorage.setItem('rememberMe', rememberMe)
      }
      
      showSuccess('LocalStorage limpo com sucesso! A página será recarregada.')
      setShowClearStorageModal(false)
      
      // Recarregar página após 1 segundo
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      showError(`Erro ao limpar localStorage: ${error.message}`)
      setShowClearStorageModal(false)
    }
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    logout()
  }

  const sections = [
    {
      id: 'api',
      title: 'Configurações da API',
      icon: faServer,
      description: 'Configure a conexão com o servidor backend',
      fields: [
        {
          key: 'apiBaseUrl',
          label: 'URL Base da API (Opcional)',
          type: 'text',
          placeholder: 'http://localhost:8001/api',
          description: 'URL completa da API. Se não especificado, usa o proxy do Vite (/api)'
        }
      ]
    },
    {
      id: 'security',
      title: 'Autenticação API',
      icon: faKey,
      description: 'Chaves de autenticação para comunicação com o servidor',
      fields: [
        {
          key: 'apiKey',
          label: 'API Key',
          type: 'password',
          placeholder: 'Sua API Key',
          description: import.meta.env.VITE_API_KEY 
            ? 'Definida via variável de ambiente (VITE_API_KEY)' 
            : 'Chave de API para autenticação',
          disabled: !!import.meta.env.VITE_API_KEY
        },
        {
          key: 'apiSecret',
          label: 'API Secret',
          type: 'password',
          placeholder: 'Sua API Secret',
          description: import.meta.env.VITE_API_SECRET 
            ? 'Definida via variável de ambiente (VITE_API_SECRET)' 
            : 'Secret de API para autenticação',
          disabled: !!import.meta.env.VITE_API_SECRET
        }
      ]
    }
  ]

  return (
    <div className="configuracoes-page">
      <div className="configuracoes-header">
        <h1>Configurações</h1>
        <p>Gerencie as configurações do sistema</p>
      </div>

      <div className="configuracoes-content">
        {sections.map((section) => (
          <div key={section.id} className="config-section">
            <div className="section-header">
              <FontAwesomeIcon icon={section.icon} className="section-icon" />
              <div className="section-header-text">
                <h2>{section.title}</h2>
                {section.description && (
                  <p className="section-description">{section.description}</p>
                )}
              </div>
            </div>
            
            <div className="section-fields">
              {section.fields.map((field) => (
                <div key={field.key} className="field-group">
                  <label className="field-label">
                    {field.label}
                    {field.description && (
                      <span className="field-description">{field.description}</span>
                    )}
                  </label>
                  
                  <input
                    type={field.type}
                    className="field-input"
                    value={config[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={field.disabled || isSaving}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="config-actions">
          <button 
            className="btn-primary" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <FontAwesomeIcon icon={faSave} />
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          <button 
            className="btn-logout" 
            onClick={handleLogoutClick}
            title="Sair do sistema"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            Sair do Sistema
          </button>
        </div>

        {/* Seção de Administração */}
        <div className="config-section danger-section">
          <div className="section-header">
            <FontAwesomeIcon icon={faDatabase} className="section-icon danger-icon" />
            <div className="section-header-text">
              <h2>Administração do Banco de Dados</h2>
              <p className="section-description">Operações perigosas - use com cuidado</p>
            </div>
          </div>
          
          <div className="section-fields">
            <div className="field-group">
              <label className="field-label">Limpar Todas as Coleções</label>
              <div className="danger-warning">
                <p className="warning-text">
                  ⚠️ <strong>Operação Irreversível</strong><br />
                  Esta ação irá deletar TODOS os dados de TODAS as coleções, exceto a coleção de telefones.
                </p>
                <div className="warning-details">
                  <p>Serão deletados:</p>
                  <ul>
                    <li>Todos os dados SLA (bases, galpão, pedidos no galpão, arquivos, chunks)</li>
                    <li>Todos os pedidos parados (resumo, chunks, tabela, chunks da tabela)</li>
                  </ul>
                  <p><strong>Preservado:</strong> Coleção de telefones</p>
                </div>
              </div>
              <button 
                className="btn-danger" 
                onClick={handleClearAllDataClick}
                disabled={isDeleting}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
                {isDeleting ? 'Limpando...' : 'Limpar Todas as Coleções'}
              </button>
            </div>
            
            <div className="field-group">
              <label className="field-label">Limpar LocalStorage</label>
              <div className="danger-warning">
                <p className="warning-text">
                  ⚠️ <strong>Operação Irreversível</strong><br />
                  Esta ação irá limpar TODOS os dados armazenados localmente no navegador.
                </p>
                <div className="warning-details">
                  <p>Serão removidos:</p>
                  <ul>
                    <li>Todas as configurações locais (porta da API, chaves, etc.)</li>
                    <li>Todos os caches de dados</li>
                    <li>Todas as preferências do usuário</li>
                    <li>Configurações de tabelas e colunas</li>
                  </ul>
                  <p><strong>Preservado:</strong> Token de autenticação (você permanecerá logado)</p>
                </div>
              </div>
              <button 
                className="btn-danger" 
                onClick={handleClearStorageClick}
                title="Limpar todos os dados do localStorage"
              >
                <FontAwesomeIcon icon={faEraser} />
                Limpar LocalStorage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação para deletar dados do banco */}
      <ConfirmModalWithPassword
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmClearAllData}
        onVerifyPassword={handleVerifyPassword}
        title="⚠️ Deletar TODOS os Dados do Banco?"
        message="Esta ação irá deletar TODOS os dados de TODAS as coleções do banco de dados MongoDB."
        warningMessage="🔴 ATENÇÃO: Todos os dados SLA, pedidos parados, entradas do galpão e arquivos processados serão PERMANENTEMENTE deletados. Apenas a coleção de TELEFONES será preservada. Esta ação não pode ser desfeita!"
        confirmText="Sim, Deletar TUDO"
        cancelText="Cancelar"
        type="danger"
        loading={isDeleting}
      />

      {/* Modal de confirmação para limpar localStorage */}
      <ConfirmModal
        isOpen={showClearStorageModal}
        onClose={() => setShowClearStorageModal(false)}
        onConfirm={handleConfirmClearStorage}
        title="⚠️ Limpar LocalStorage?"
        message="Esta ação irá limpar TODOS os dados armazenados localmente no navegador."
        warningMessage="🔴 ATENÇÃO: Todas as configurações locais, caches, preferências e configurações de tabelas serão PERMANENTEMENTE removidas. O token de autenticação será preservado para que você permaneça logado. Esta ação não pode ser desfeita!"
        confirmText="Sim, Limpar TUDO"
        cancelText="Cancelar"
        type="warning"
        loading={false}
      />

      {/* Modal de confirmação para sair */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Sair do Sistema"
        message="Tem certeza que deseja sair?"
        confirmText="Sair"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  )
}

export default Configuracoes
