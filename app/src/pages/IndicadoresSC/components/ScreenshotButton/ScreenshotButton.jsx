import React from 'react'
import { FaCameraRetro } from "react-icons/fa"
import html2canvas from 'html2canvas'
import './ScreenshotButton.css'

const ScreenshotButton = ({ targetRef, filename = 'screenshot', onSuccess, onError }) => {
  const handleScreenshot = async () => {
    if (!targetRef?.current) {
      if (onError) onError('Elemento não encontrado')
      return
    }

    try {
      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        onclone: (clonedDoc, clonedElement) => {
          clonedElement.querySelectorAll('input').forEach(input => {
            input.style.overflow = 'visible'
            input.style.textOverflow = 'clip'
            input.style.whiteSpace = 'nowrap'
          })
        }
      })
      
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `${filename}.png`
      link.click()
      
      if (onSuccess) onSuccess('Screenshot salvo!')
    } catch (error) {
      if (onError) onError(`Erro: ${error.message}`)
    }
  }

  return (
    <button className="screenshot-button" onClick={handleScreenshot} title="Capturar screenshot">
      <FaCameraRetro />
    </button>
  )
}

export default ScreenshotButton

