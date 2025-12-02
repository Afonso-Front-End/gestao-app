import React, { useState, useEffect } from 'react'
import { FaArrowUp } from 'react-icons/fa'
import './ScrollToTopButton.css'

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Mostrar/esconder botão baseado na posição do scroll
  useEffect(() => {
    const toggleVisibility = () => {
      const layoutContent = document.querySelector('.layout-content')
      
      if (layoutContent) {
        // Usar o scroll do elemento de conteúdo
        if (layoutContent.scrollTop > 300) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      } else {
        // Fallback para window
        if (window.pageYOffset > 300) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      }
    }

    // Adicionar listener no elemento correto
    const layoutContent = document.querySelector('.layout-content')
    if (layoutContent) {
      layoutContent.addEventListener('scroll', toggleVisibility)
      return () => layoutContent.removeEventListener('scroll', toggleVisibility)
    } else {
      window.addEventListener('scroll', toggleVisibility)
      return () => window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  // Função para rolar para o topo
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

  if (!isVisible) {
    return null
  }

  return (
    <button
      className="scroll-to-top-button"
      onClick={scrollToTop}
      title="Voltar ao topo"
      aria-label="Voltar ao topo"
    >
      <FaArrowUp />
    </button>
  )
}

export default ScrollToTopButton
