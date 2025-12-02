import React from 'react'
import { MdScreenshot } from "react-icons/md"
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
  excludeSelectors = [], // Array de seletores CSS para elementos a excluir
  openPrintDialog = false // Se true, abre diálogo de impressão ao invés de baixar
}) => {
  const handleScreenshot = async () => {
    if (!targetRef?.current) {
      if (onError) onError('Elemento não encontrado para captura')
      return
    }

    try {
      const element = targetRef.current
      
      let canvas
      try {
        canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        onclone: (clonedDoc, clonedElement) => {
          // Garantir que o elemento clonado está visível e tem dimensões corretas
          clonedElement.style.visibility = 'visible'
          clonedElement.style.display = 'table'
          clonedElement.style.opacity = '1'
          
          // Remover apenas margin e padding desnecessários (preserva borders e cores)
          clonedElement.style.margin = '0'
          clonedElement.style.padding = '0'
          clonedElement.style.boxSizing = 'border-box'
          
          // Garantir que a tabela não tenha espaços extras
          if (clonedElement.tagName === 'TABLE') {
            clonedElement.style.boxSizing = 'border-box'
            clonedElement.style.margin = '0'
            clonedElement.style.padding = '0'
            clonedElement.style.borderCollapse = 'collapse'
            clonedElement.style.borderSpacing = '0'
            clonedElement.style.width = 'auto'
            clonedElement.style.tableLayout = 'auto'
            
            // Garantir que todas as células não tenham espaços extras
            clonedElement.querySelectorAll('th, td').forEach((cell) => {
              cell.style.boxSizing = 'border-box'
              cell.style.margin = '0'
            })
          }
          
          // Remover padding, margin e border de todos os elementos filhos que podem causar espaços em branco
          clonedDoc.querySelectorAll('*').forEach((el) => {
            if (el !== clonedElement) {
              // Forçar opacity 1 em todos os elementos (evita problemas com animações)
              el.style.opacity = '1'
              
              // Ajustar wrappers e containers (preserva borders e cores)
              if (el.classList && (
                el.classList.contains('table-overlay-pr-overlay-table-wrapper') ||
                el.classList.contains('d1-overlay-table-wrapper')
              )) {
                el.style.margin = '0'
                el.style.padding = '0'
                el.style.width = 'auto'
                el.style.height = 'auto'
                el.style.overflow = 'visible'
                el.style.display = 'inline-block'
              }
              
              // Ajustar pr-table-container (preserva tudo)
              if (el.classList && el.classList.contains('pr-table-container')) {
                el.style.margin = '0'
                el.style.overflow = 'visible'
                el.style.width = 'auto'
              }
              
              // Ajustar pr-table-header (preserva cores e estilos)
              if (el.classList && el.classList.contains('pr-table-header')) {
                el.style.margin = '0'
              }
              
              // Ajustar d1-table-header (preserva TODAS as cores e estilos)
              if (el.classList && el.classList.contains('d1-table-header')) {
                // Forçar reset de margins mas preservar TODOS os outros estilos
                el.style.margin = '0'
                el.style.marginTop = '0'
                el.style.marginBottom = '0'
                
                // Garantir que animações e transitions não afetem a captura
                el.style.animation = 'none'
                el.style.transition = 'none'
                el.style.transform = 'none'
                
                // Forçar opacity total
                el.style.opacity = '1'
                
                // Preservar position relative para ::before funcionar
                if (window.getComputedStyle(el).position === 'relative') {
                  el.style.position = 'relative'
                }
              }
              
              // Ajustar table-header de PedidosRetidos (preserva TODAS as cores e estilos)
              if (el.classList && el.classList.contains('table-header')) {
                // Forçar reset de margins mas preservar TODOS os outros estilos
                el.style.margin = '0'
                el.style.marginTop = '0'
                el.style.marginBottom = '0'
                
                // Garantir que animações e transitions não afetem a captura
                el.style.animation = 'none'
                el.style.transition = 'none'
                el.style.transform = 'none'
                
                // Forçar opacity total
                el.style.opacity = '1'
                
                // Preservar position relative para ::before funcionar
                if (window.getComputedStyle(el).position === 'relative') {
                  el.style.position = 'relative'
                }
              }
              
              // Desabilitar animações em elementos filhos do table-header (preserva cores)
              if (el.classList && (
                el.classList.contains('table-title') ||
                el.classList.contains('table-subtitle') ||
                el.classList.contains('table-info') ||
                el.classList.contains('info-item') ||
                el.classList.contains('info-label') ||
                el.classList.contains('info-value') ||
                el.classList.contains('d1-table-title') ||
                el.classList.contains('d1-table-subtitle') ||
                el.classList.contains('d1-table-info') ||
                el.classList.contains('d1-info-item') ||
                el.classList.contains('d1-info-label') ||
                el.classList.contains('d1-info-value')
              )) {
                el.style.animation = 'none'
                el.style.transition = 'none'
                el.style.transform = 'none'
                el.style.opacity = '1'
              }
              
              // Remover margin-right de elementos que podem criar espaços
              const computedStyle = window.getComputedStyle(el)
              if (computedStyle.marginRight && parseFloat(computedStyle.marginRight) > 0) {
                el.style.marginRight = '0'
              }
            }
          })
          
          // Remover elementos excluídos do clone
          if (excludeSelectors && excludeSelectors.length > 0) {
            excludeSelectors.forEach(selector => {
              try {
                const elementsToRemove = clonedDoc.querySelectorAll(selector)
                elementsToRemove.forEach(el => el.remove())
              } catch (e) {
                // Erro silencioso ao remover elementos
              }
            })
          }
        }
      })
      } catch (error) {
        // Se erro for createPattern (especialmente na base CCM), tentar novamente com configurações mais permissivas
        if (error.message && error.message.includes('createPattern')) {
          canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            imageTimeout: 15000,
            removeContainer: true,
            onclone: (clonedDoc, clonedElement) => {
              // Garantir que o elemento clonado está visível e tem dimensões corretas
              clonedElement.style.visibility = 'visible'
              clonedElement.style.display = 'table'
              clonedElement.style.opacity = '1'
              
              // Remover apenas margin e padding desnecessários (preserva borders e cores)
              clonedElement.style.margin = '0'
              clonedElement.style.padding = '0'
              clonedElement.style.boxSizing = 'border-box'
              
              // Garantir que a tabela não tenha espaços extras
              if (clonedElement.tagName === 'TABLE') {
                clonedElement.style.boxSizing = 'border-box'
                clonedElement.style.margin = '0'
                clonedElement.style.padding = '0'
                clonedElement.style.borderCollapse = 'collapse'
                clonedElement.style.borderSpacing = '0'
                clonedElement.style.width = 'auto'
                clonedElement.style.tableLayout = 'auto'
                
                // Garantir que todas as células não tenham espaços extras
                clonedElement.querySelectorAll('th, td').forEach((cell) => {
                  cell.style.boxSizing = 'border-box'
                  cell.style.margin = '0'
                })
              }
              
              // Remover padding, margin e border de todos os elementos filhos que podem causar espaços em branco
              clonedDoc.querySelectorAll('*').forEach((el) => {
                if (el !== clonedElement) {
                  // Forçar opacity 1 em todos os elementos (evita problemas com animações)
                  el.style.opacity = '1'
                  
                  // Ajustar wrappers e containers (preserva borders e cores)
                  if (el.classList && (
                    el.classList.contains('table-overlay-pr-overlay-table-wrapper') ||
                    el.classList.contains('d1-overlay-table-wrapper')
                  )) {
                    el.style.margin = '0'
                    el.style.padding = '0'
                    el.style.width = 'auto'
                    el.style.height = 'auto'
                    el.style.overflow = 'visible'
                    el.style.display = 'inline-block'
                  }
                  
                  // Ajustar pr-table-container (preserva tudo)
                  if (el.classList && el.classList.contains('pr-table-container')) {
                    el.style.margin = '0'
                    el.style.overflow = 'visible'
                    el.style.width = 'auto'
                  }
                  
                  // Ajustar pr-table-header (preserva cores e estilos)
                  if (el.classList && el.classList.contains('pr-table-header')) {
                    el.style.margin = '0'
                  }
                  
                  // Ajustar d1-table-header (preserva TODAS as cores e estilos)
                  if (el.classList && el.classList.contains('d1-table-header')) {
                    // Forçar reset de margins mas preservar TODOS os outros estilos
                    el.style.margin = '0'
                    el.style.marginTop = '0'
                    el.style.marginBottom = '0'
                    
                    // Garantir que animações e transitions não afetem a captura
                    el.style.animation = 'none'
                    el.style.transition = 'none'
                    el.style.transform = 'none'
                    
                    // Forçar opacity total
                    el.style.opacity = '1'
                    
                    // Preservar position relative para ::before funcionar
                    if (window.getComputedStyle(el).position === 'relative') {
                      el.style.position = 'relative'
                    }
                  }
                  
                  // Ajustar table-header de PedidosRetidos (preserva TODAS as cores e estilos)
                  if (el.classList && el.classList.contains('table-header')) {
                    // Forçar reset de margins mas preservar TODOS os outros estilos
                    el.style.margin = '0'
                    el.style.marginTop = '0'
                    el.style.marginBottom = '0'
                    
                    // Garantir que animações e transitions não afetem a captura
                    el.style.animation = 'none'
                    el.style.transition = 'none'
                    el.style.transform = 'none'
                    
                    // Forçar opacity total
                    el.style.opacity = '1'
                    
                    // Preservar position relative para ::before funcionar
                    if (window.getComputedStyle(el).position === 'relative') {
                      el.style.position = 'relative'
                    }
                  }
                  
                  // Desabilitar animações em elementos filhos do table-header (preserva cores)
                  if (el.classList && (
                    el.classList.contains('table-title') ||
                    el.classList.contains('table-subtitle') ||
                    el.classList.contains('table-info') ||
                    el.classList.contains('info-item') ||
                    el.classList.contains('info-label') ||
                    el.classList.contains('info-value') ||
                    el.classList.contains('d1-table-title') ||
                    el.classList.contains('d1-table-subtitle') ||
                    el.classList.contains('d1-table-info') ||
                    el.classList.contains('d1-info-item') ||
                    el.classList.contains('d1-info-label') ||
                    el.classList.contains('d1-info-value')
                  )) {
                    el.style.animation = 'none'
                    el.style.transition = 'none'
                    el.style.transform = 'none'
                    el.style.opacity = '1'
                  }
                  
                  // Remover margin-right de elementos que podem criar espaços
                  const computedStyle = window.getComputedStyle(el)
                  if (computedStyle.marginRight && parseFloat(computedStyle.marginRight) > 0) {
                    el.style.marginRight = '0'
                  }
                }
              })
              
              // Remover elementos excluídos do clone
              if (excludeSelectors && excludeSelectors.length > 0) {
                excludeSelectors.forEach(selector => {
                  try {
                    const elementsToRemove = clonedDoc.querySelectorAll(selector)
                    elementsToRemove.forEach(el => el.remove())
                  } catch (e) {
                    // Erro silencioso ao remover elementos
                  }
                })
              }
              
              // Remove apenas elementos problemáticos (canvases com dimensões 0)
              clonedDoc.querySelectorAll('*').forEach((el) => {
                try {
                  // Ocultar apenas canvases com dimensões 0 que causam erro createPattern
                  if (el.tagName === 'CANVAS') {
                    const canvas = el
                    if (canvas.width === 0 || canvas.height === 0) {
                      canvas.style.display = 'none'
                    }
                  }
                  
                  // Remover background APENAS de elementos com dimensões 0 (não afeta elementos visíveis)
                  const rect = el.getBoundingClientRect()
                  if (rect.width === 0 || rect.height === 0) {
                    const style = window.getComputedStyle(el)
                    // Só remove se tiver background-image problemático
                    if (style.backgroundImage && style.backgroundImage !== 'none') {
                      el.style.backgroundImage = 'none'
                    }
                  }
                } catch (e) {
                  // Ignora erros silenciosamente
                }
              })
            },
            ignoreElements: (el) => {
              try {
                // Ignorar APENAS canvases com dimensões 0 (causa erro createPattern)
                if (el.tagName === 'CANVAS') {
                  return el.width === 0 || el.height === 0
                }
                // Ignorar elementos completamente ocultos (display: none, visibility: hidden)
                const style = window.getComputedStyle(el)
                if (style.display === 'none' || style.visibility === 'hidden') {
                  return true
                }
              } catch (e) {
                return false
              }
              return false
            }
          })
        } else {
          throw error
        }
      }
      
      // Função para remover espaços em branco do canvas
      const trimCanvas = (c) => {
        const ctx = c.getContext('2d')
        const pixels = ctx.getImageData(0, 0, c.width, c.height)
        const data = pixels.data
        let bound = { top: null, left: null, right: null, bottom: null }
        let x, y
        
        // Encontrar bounds (top, left, right, bottom)
        for (y = 0; y < c.height; y++) {
          for (x = 0; x < c.width; x++) {
            const alpha = data[((y * c.width + x) * 4) + 3]
            const r = data[((y * c.width + x) * 4)]
            const g = data[((y * c.width + x) * 4) + 1]
            const b = data[((y * c.width + x) * 4) + 2]
            
            // Se não for branco quase puro ou transparente (tolerância de 5)
            const isWhite = (r >= 250 && g >= 250 && b >= 250)
            if (alpha > 0 && !isWhite) {
              if (bound.top === null) bound.top = y
              if (bound.left === null || x < bound.left) bound.left = x
              if (bound.right === null || x > bound.right) bound.right = x
              bound.bottom = y
            }
          }
        }
        
        // Se encontrou conteúdo, cropar
        if (bound.top !== null && bound.left !== null) {
          const trimHeight = bound.bottom - bound.top + 1
          const trimWidth = bound.right - bound.left + 1
          const trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight)
          
          const copy = document.createElement('canvas')
          copy.width = trimWidth
          copy.height = trimHeight
          copy.getContext('2d').putImageData(trimmed, 0, 0)
          
          return copy
        }
        
        return c
      }
      
      // Remover espaços em branco
      const trimmedCanvas = trimCanvas(canvas)
      
      // Garantir máxima qualidade de cores no PNG
      const dataUrl = trimmedCanvas.toDataURL('image/png', 1.0)
      
      if (openPrintDialog) {
        // Abrir diálogo de impressão
        const printWindow = window.open('', '_blank')
        
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Print - ${filename}</title>
                <style>
                  body {
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #f5f5f5;
                  }
                  img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                  }
                  @media print {
                    body {
                      background: white;
                    }
                    img {
                      width: 100%;
                    }
                  }
                </style>
              </head>
              <body>
                <img src="${dataUrl}" alt="Print ${filename}" />
                <script>
                  window.onload = function() {
                    window.print();
                  }
                </script>
              </body>
            </html>
          `)
          printWindow.document.close()
          
          if (onSuccess) {
            onSuccess('Print aberto com sucesso!')
          }
        } else {
          if (onError) {
            onError('Não foi possível abrir a janela de impressão')
          }
        }
      } else {
        // Converter dataUrl para blob e baixar
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
      }
      
    } catch (error) {
      // Erro ao capturar screenshot
      if (onError) {
        onError(`Erro ao capturar screenshot: ${error.message}`)
      }
    }
  }

  return (
    <button
      className={`pedidos-screenshot-button pedidos-screenshot-button--${size} ${className}`}
      onClick={handleScreenshot}
      title={title}
    >
      <FaCameraRetro />
    </button>
  )
}

export default ScreenshotButton
