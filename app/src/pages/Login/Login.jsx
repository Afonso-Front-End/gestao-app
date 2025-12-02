import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import './Login.css'

const Login = () => {
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { showError } = useNotification()

  useEffect(() => {
    // Se já estiver autenticado, redirecionar
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!nome.trim() || !senha.trim()) {
      showError('Preencha todos os campos')
      return
    }

    setLoading(true)
    const result = await login(nome, senha, lembrar)
    setLoading(false)

    if (result.success) {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div>
            <h1>Login</h1>
          </div>
        </div>

        <div className="login-content">
          <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite sua senha"
              disabled={loading}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={lembrar}
                onChange={(e) => setLembrar(e.target.checked)}
                disabled={loading}
              />
              <span>Lembrar senha</span>
            </label>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          </form>
        </div>

        <div className="login-footer">
          <p>
            Não tem uma conta?{' '}
            <Link to="/register" className="register-link">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

