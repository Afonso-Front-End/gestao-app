import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para mostrar a UI de fallback
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  handleReload = () => {
    // Recarregar a página
    window.location.reload()
  }

  handleReset = () => {
    // Reset do error boundary
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // UI de fallback
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
          color: '#d63031'
        }}>
          <h2 style={{ color: '#d63031', marginBottom: '16px' }}>
            ⚠️ Algo deu errado!
          </h2>
          
          <p style={{ marginBottom: '16px' }}>
            Ocorreu um erro inesperado na aplicação. Isso pode ter sido causado por:
          </p>
          
          <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
            <li>Problemas de conexão com o servidor</li>
            <li>Dados corrompidos ou inválidos</li>
            <li>Erro interno da aplicação</li>
          </ul>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#00b894',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Tentar Novamente
            </button>
            
            <button
              onClick={this.handleReload}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0984e3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Recarregar Página
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                🔍 Detalhes do Erro (Desenvolvimento)
              </summary>
              <pre style={{ 
                marginTop: '10px', 
                fontSize: '12px', 
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      )
    }

    // Se não há erro, renderiza os children normalmente
    return this.props.children
  }
}

export default ErrorBoundary
