import React, { useState, memo, useEffect, useRef, useCallback } from 'react'
import QRCode from 'react-qr-code'
import './QRCodeModal.css'

// Componente de QR Code individual memoizado para otimização
const QRCodeItem = memo(({ remessa, index }) => {
  const qrRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Verificar se o QR code foi renderizado
    if (qrRef.current) {
      const timer = setTimeout(() => {
        setIsLoaded(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [])

  // Formatar ID com 3 dígitos (001, 002, 003...)
  const formattedId = String(index + 1).padStart(3, '0')

  return (
    <div className="sem-movimentacao-sc-qrcode-item">
      <div className="sem-movimentacao-sc-qrcode-id">{formattedId}</div>
      <div className="sem-movimentacao-sc-qrcode-wrapper">
        {!isLoaded && (
          <div className="sem-movimentacao-sc-qrcode-placeholder">
            <div className="sem-movimentacao-sc-qrcode-spinner"></div>
          </div>
        )}
        <div ref={qrRef} style={{ display: isLoaded ? 'block' : 'none' }}>
          <QRCode
            value={remessa}
            size={200}
            level="M"
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
          />
        </div>
      </div>
      <div className="sem-movimentacao-sc-qrcode-label">{remessa}</div>
    </div>
  )
})

QRCodeItem.displayName = 'QRCodeItem'

const QRCodeModal = ({ isOpen, onClose, remessas = [] }) => {
  const [isClosing, setIsClosing] = useState(false)
  
  // Chave para localStorage
  const STORAGE_KEY = 'sem_movimentacao_sc_qrcode_view_format'

  // Carregar formato salvo ou usar 'grid' como padrão
  const loadSavedFormat = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'list' ? 'list' : 'grid'
    } catch (error) {
      console.error('Erro ao carregar formato salvo:', error)
      return 'grid'
    }
  }

  // Salvar formato no localStorage
  const saveFormat = (format) => {
    try {
      localStorage.setItem(STORAGE_KEY, format)
    } catch (error) {
      console.error('Erro ao salvar formato:', error)
    }
  }

  const [viewFormat, setViewFormat] = useState(() => loadSavedFormat())
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1) // 1x, 2x, 3x, 4x
  const [isStopped, setIsStopped] = useState(true)
  const scrollContainerRef = useRef(null)
  const scrollIntervalRef = useRef(null)
  const scrollDirectionRef = useRef(1) // 1 = para baixo, -1 = para cima

  // Atualizar formato e salvar
  const handleFormatChange = (format) => {
    setViewFormat(format)
    saveFormat(format)
  }

  // Velocidades disponíveis
  const speeds = [1, 2, 3, 4, 5, 6, 8, 10]
  const speedLabels = ['1x', '2x', '3x', '4x', '5x', '6x', '8x', '10x']

  // Função de scroll automático com requestAnimationFrame para 120fps suave
  useEffect(() => {
    if (!isPlaying || !scrollContainerRef.current) {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current)
        scrollIntervalRef.current = null
      }
      return
    }

    const container = scrollContainerRef.current
    const baseScrollAmount = 0.5 // Quantidade base de scroll por frame (ajustado para suavidade)
    const scrollAmount = baseScrollAmount * speed // Multiplica pela velocidade

    let lastTime = performance.now()
    const targetFPS = 120
    const frameInterval = 1000 / targetFPS

    const animate = (currentTime) => {
      if (!container || !isPlaying) return

      const deltaTime = currentTime - lastTime
      
      // Controlar FPS para manter suavidade
      if (deltaTime >= frameInterval) {
        const { scrollTop, scrollHeight, clientHeight } = container
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5
        const isAtTop = scrollTop <= 5

        // Se chegou no final, inverter direção
        if (isAtBottom && scrollDirectionRef.current === 1) {
          scrollDirectionRef.current = -1
        }
        // Se chegou no início, inverter direção
        else if (isAtTop && scrollDirectionRef.current === -1) {
          scrollDirectionRef.current = 1
        }

        // Scroll suave baseado na direção e velocidade
        container.scrollTop += scrollAmount * scrollDirectionRef.current
        
        lastTime = currentTime - (deltaTime % frameInterval)
      }

      scrollIntervalRef.current = requestAnimationFrame(animate)
    }

    scrollIntervalRef.current = requestAnimationFrame(animate)

    return () => {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current)
        scrollIntervalRef.current = null
      }
    }
  }, [isPlaying, speed])

  // Parar quando fechar o modal
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false)
      setIsStopped(true)
      scrollDirectionRef.current = 1
    }
  }, [isOpen])

  // Handlers
  const handlePlayPause = () => {
    setIsPlaying(prev => !prev)
    setIsStopped(false)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setIsStopped(true)
    scrollDirectionRef.current = 1
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0
    }
  }

  const handleSpeedChange = () => {
    const currentIndex = speeds.indexOf(speed)
    const nextIndex = (currentIndex + 1) % speeds.length
    setSpeed(speeds[nextIndex])
  }

  // Função para fechar com animação
  const handleClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 250) // Tempo da animação
  }, [onClose])

  // Resetar estado de fechamento quando abrir
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false)
    }
  }, [isOpen])

  if (!isOpen && !isClosing) return null

  return (
    <div className={`sem-movimentacao-sc-qrcode-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="sem-movimentacao-sc-qrcode-modal">
        <div className="sem-movimentacao-sc-qrcode-modal-header">
          <h2>QR Codes das Remessas</h2>
          <div className="sem-movimentacao-sc-qrcode-modal-header-info">
            <span>{remessas.length.toLocaleString('pt-BR')} remessa(s)</span>
            <button
              className="sem-movimentacao-sc-qrcode-modal-close"
              onClick={handleClose}
              title="Fechar"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="sem-movimentacao-sc-qrcode-modal-content-wrapper">
          {/* Controles de reprodução - Fora do container de scroll para ficar fixo */}
          {remessas.length > 0 && (
            <div className="sem-movimentacao-sc-qrcode-controls-wrapper">
              <div className="sem-movimentacao-sc-qrcode-controls">
                <button
                  className="sem-movimentacao-sc-qrcode-control-btn play-pause"
                  onClick={handlePlayPause}
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                >
                  {isPlaying ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                  {isPlaying ? 'Pausar' : 'Reproduzir'}
                </button>
                <button
                  className="sem-movimentacao-sc-qrcode-control-btn speed"
                  onClick={handleSpeedChange}
                  title={`Velocidade: ${speedLabels[speeds.indexOf(speed)]}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {speedLabels[speeds.indexOf(speed)]}
                </button>
                <button
                  className="sem-movimentacao-sc-qrcode-control-btn stop"
                  onClick={handleStop}
                  title="Parar e voltar ao início"
                  disabled={isStopped}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                  Parar
                </button>
              </div>

              {/* Botões rápidos de velocidade */}
              <div className="sem-movimentacao-sc-qrcode-speed-buttons">
                {speeds.map((speedOption) => (
                  <button
                    key={speedOption}
                    className={`sem-movimentacao-sc-qrcode-speed-btn ${speed === speedOption ? 'active' : ''}`}
                    onClick={() => setSpeed(speedOption)}
                    title={`Velocidade ${speedLabels[speeds.indexOf(speedOption)]}`}
                  >
                    {speedLabels[speeds.indexOf(speedOption)]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sem-movimentacao-sc-qrcode-modal-content" ref={scrollContainerRef}>
            {remessas.length === 0 ? (
              <div className="sem-movimentacao-sc-qrcode-empty">
                <p>Nenhuma remessa selecionada</p>
              </div>
            ) : (
              <>
                {/* Seletor de formato centralizado */}
                <div className="sem-movimentacao-sc-qrcode-format-selector">
                  <button
                    className={`sem-movimentacao-sc-format-btn ${viewFormat === 'grid' ? 'active' : ''}`}
                    onClick={() => handleFormatChange('grid')}
                    title="Visualização em Grid"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    Grid
                  </button>
                  <button
                    className={`sem-movimentacao-sc-format-btn ${viewFormat === 'list' ? 'active' : ''}`}
                    onClick={() => handleFormatChange('list')}
                    title="Visualização em Lista"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    Lista
                  </button>
                </div>

                {/* Container dos QR codes com formato dinâmico */}
                <div className={`sem-movimentacao-sc-qrcode-container ${viewFormat === 'list' ? 'list-view' : 'grid-view'}`}>
                  {remessas.map((remessa, index) => (
                    <QRCodeItem
                      key={remessa}
                      remessa={remessa}
                      index={index}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeModal

