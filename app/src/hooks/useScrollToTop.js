import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Hook para rolar para o topo da página quando a rota mudar
 */
const useScrollToTop = () => {
  const location = useLocation()

  useEffect(() => {
    // Aguardar um tick para garantir que o DOM esteja atualizado
    const timeoutId = setTimeout(() => {
      const layoutContent = document.querySelector('.layout-content')
      
      if (layoutContent) {
        // Rolar o elemento de conteúdo para o topo
        layoutContent.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      } else {
        // Fallback para window se não encontrar o elemento
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        })
      }
    }, 100) // 100ms de delay

    return () => clearTimeout(timeoutId)
  }, [location.pathname])

  // Função para rolar para o topo manualmente
  const scrollToTop = () => {
    const layoutContent = document.querySelector('.layout-content')
    
    if (layoutContent) {
      layoutContent.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    } else {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }
  }

  return { scrollToTop }
}

export default useScrollToTop
