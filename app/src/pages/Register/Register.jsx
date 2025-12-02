import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import './Register.css'

const Register = () => {
  const [nome, setNome] = useState('')
  const [base, setBase] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [lembrar, setLembrar] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, isAuthenticated } = useAuth()
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
    
    if (!nome.trim() || !base.trim() || !senha.trim()) {
      showError('Preencha todos os campos')
      return
    }

    if (senha !== confirmarSenha) {
      showError('As senhas não coincidem')
      return
    }

    if (senha.length < 4) {
      showError('A senha deve ter pelo menos 4 caracteres')
      return
    }

    setLoading(true)
    await register(nome, base, senha)
    setLoading(false)
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <div>
            <h1>Criar Conta</h1>
          </div>
        </div>

        <div className="register-content">
          <form onSubmit={handleSubmit} className="register-form">
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
            <label htmlFor="base">Base</label>
            <input
              type="text"
              id="base"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              placeholder="Digite sua base"
              disabled={loading}
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

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input
              type="password"
              id="confirmarSenha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              placeholder="Confirme sua senha"
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
            className="register-button"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
          </form>
        </div>

        <div className="register-footer">
          <p>
            Já tem uma conta?{' '}
            <Link to="/login" className="login-link">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

