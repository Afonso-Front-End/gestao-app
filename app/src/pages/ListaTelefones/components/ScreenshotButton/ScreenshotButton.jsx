import React from 'react'
import { FaCameraRetro } from "react-icons/fa";
import html2canvas from 'html2canvas'
import './ScreenshotButton.css'

const ScreenshotButton = ({ 
  targetRef, 
  filename = 'screenshot', 
  onSuccess = null, 
  onError = null,
  className = '',
  title = 'Capturar screenshot',
  size = 'medium',
  excludeSelectors = [],
  openPrintDialog = false
}) => {
  const handleScreenshot = async () => {
    if (!targetRef?.current) {
      if (onError) onError('Elemento não encontrado para captura')
      return
    }

    try {
      const element = targetRef.current
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      
      const dataUrl = canvas.toDataURL('image/png')
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      if (onSuccess) {
        onSuccess('Screenshot salvo com sucesso!')
      }
      
    } catch (error) {
      console.error('Erro ao capturar screenshot:', error)
      if (onError) {
        onError(`Erro ao capturar screenshot: ${error.message}`)
      }
    }
  }

  return (
    <button
      className="screenshot-button"
      onClick={handleScreenshot}
      title={title}
    >
      <FaCameraRetro />
    </button>
  )
}

export default ScreenshotButton

