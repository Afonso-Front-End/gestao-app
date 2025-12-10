import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { BsCopy } from "react-icons/bs"
import { FaCheck, FaTimes, FaFileExcel } from 'react-icons/fa'
import ScreenshotButton from '../ScreenshotButton/ScreenshotButton'
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton'
import CopyFormattedButton from '../CopyFormattedButton/CopyFormattedButton'
import PhoneInput from '../PhoneInput/PhoneInput'
import TableConfigButton from '../TableConfigButton/TableConfigButton'
import TableConfigModal from '../TableConfigModal/TableConfigModal'
import { useTableConfig } from '../../hooks/useTableConfig'
import { useNotification } from '../../../../contexts/NotificationContext'
import { gerarExcelTabela } from '../../../PedidosRetidos/utils/excelUtils'
import './TableOverlay.css'

const TableOverlay = ({
  isOpen,
  onClose,
  title,
  subtitle,
  data,
  columns,
  emptyMessage = "Nenhum dado encontrado",
  isLoading = false, // Estado de carregamento
  onCopyPedido = null, // Função para copiar número do pedido
  onCopyAllPedidos = null, // Função para copiar todos os pedidos
  onCopyFormattedData = null, // Função para copiar dados formatados
  baseName = '', // Nome da base para WhatsApp
  motorista = '', // Nome do motorista para WhatsApp
  showWhatsApp = false, // Se deve mostrar o botão do WhatsApp
  showAddPhone = false, // Se deve mostrar o botão de adicionar telefone
  telefoneMotorista = '', // Telefone do motorista
  telefoneCarregado = false, // Se o telefone já foi carregado
  telefoneInicial = '', // Telefone inicial para preencher o input
  onTelefoneAdicionado = null, // Callback quando telefone for adicionado
  filterColumns = true, // Se deve filtrar colunas (false = mostrar todas)
  overlayType = '' // Tipo do overlay para formatação
}) => {
  const [isClosing, setIsClosing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoadingPhone, setIsLoadingPhone] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const tableWrapperRef = useRef(null)
  const tableRef = useRef(null)
  const closeTimeoutRef = useRef(null)
  const styleRef = useRef(null)
  const { showSuccess, showError, showInfo } = useNotification()
  const [extractedSubtitle, setExtractedSubtitle] = useState(null)

  // Extrair subtitle dos parênteses do título quando o título mudar
  useEffect(() => {
    if (!title) {
      setExtractedSubtitle(null)
      return
    }
    
    const titleStr = typeof title === 'string' ? title : String(title)
    const parantesesMatch = titleStr.match(/^(.+?)\s*\(([^)]+)\)\s*$/)
    
    if (parantesesMatch) {
      setExtractedSubtitle(parantesesMatch[2])
    } else {
      setExtractedSubtitle(null)
    }
  }, [title])

  // Resetar extractedSubtitle quando o overlay fechar
  useEffect(() => {
    if (!isOpen && !isClosing) {
      setExtractedSubtitle(null)
    }
  }, [isOpen, isClosing])

  // Função para extrair nome do motorista do título e torná-lo clicável
  const renderTitleWithCopyableMotorista = useCallback((titleText) => {
    if (!titleText) return titleText
    
    let titleStr = typeof titleText === 'string' ? titleText : String(titleText)
    
    // Remover conteúdo entre parênteses do título para processamento
    titleStr = titleStr.replace(/\s*\([^)]*\)\s*$/, '').trim()
    
    // Extrair nome do motorista do título (remover prefixos como "Total de Pedidos -", "Pedidos Entregues -", etc)
    const nomeMatch = titleStr.match(/(?:Total\s+de\s+Pedidos\s*-\s*|Pedidos\s+(?:Entregues|Não\s+Entregues|no\s+Galpão)\s*-\s*|Pedidos\s+(?:de|do)\s+)(.+)/i)
    let motoristaNome = null
    let prefixo = ''
    
    if (nomeMatch && nomeMatch[1]) {
      motoristaNome = nomeMatch[1].trim()
      prefixo = titleStr.substring(0, nomeMatch.index).trim()
    } else {
      motoristaNome = titleStr.trim()
    }
    
    if (!motoristaNome) {
      return titleText
    }
    
    const handleCopyMotorista = async () => {
      try {
        await navigator.clipboard.writeText(motoristaNome)
        showSuccess(`✅ Nome do motorista "${motoristaNome}" copiado!`)
      } catch (error) {
        showError('Erro ao copiar nome do motorista')
      }
    }
    
    // Renderizar: prefixo + nome clicável (SEM parênteses no título)
    return (
      <>
        {prefixo && prefixo !== '' && <>{prefixo} </>}
        <span
          className="sla-overlay-motorista-copyable"
          onClick={handleCopyMotorista}
          title="Clique para copiar o nome do motorista"
        >
          {motoristaNome}
        </span>
      </>
    )
  }, [showSuccess, showError])

  // Gerar ID único para a tabela (memoizado)
  // Usar IDs fixos baseados no tipo de overlay, não no nome do motorista
  const tableId = useMemo(() => {
    if (!title) return 'sla-default-table'
    
    const titleStr = typeof title === 'string' ? title : String(title)
    const titleLower = titleStr.toLowerCase()
    
    // Remover conteúdo entre parênteses e nome do motorista para identificar o tipo
    const cleanTitle = titleStr.replace(/\s*\([^)]*\)\s*$/, '').trim()
    
    // Identificar tipo de overlay baseado no prefixo do título
    if (cleanTitle.toLowerCase().startsWith('total de pedidos')) {
      return 'sla-total-pedidos'
    } else if (cleanTitle.toLowerCase().startsWith('pedidos entregues')) {
      return 'sla-pedidos-entregues'
    } else if (cleanTitle.toLowerCase().startsWith('pedidos não entregues')) {
      return 'sla-pedidos-nao-entregues'
    } else if (cleanTitle.toLowerCase().startsWith('pedidos no galpão')) {
      return 'sla-pedidos-galpao'
    }
    
    // Fallback: usar título normalizado (mas isso não deve acontecer)
    return cleanTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }, [title])
  
  // Gerar colunas automaticamente se não forem fornecidas (memoizado)
  const tableColumns = useMemo(() => {
    return data && data.length > 0 && data[0] ? Object.keys(data[0]) : []
  }, [data])
  
  // Preparar colunas para configuração (incluir coluna de copiar se necessário)
  const columnsForConfig = useMemo(() => {
    let baseCols = columns || []
    
    // Se não foram passadas colunas, usar as chaves do primeiro item dos dados
    if (baseCols.length === 0 && tableColumns.length > 0) {
      baseCols = tableColumns
    }
    
    if (onCopyPedido) {
      // Adicionar coluna de copiar como primeira coluna
      return [{ key: 'copy', header: 'Copiar' }, ...baseCols]
    }
    return baseCols
  }, [columns, tableColumns, onCopyPedido])
  
  // Hook de configuração da tabela - SÓ usar quando tiver colunas
  const hasColumns = columnsForConfig.length > 0
  const {
    columns: configColumns = [],
    visibleColumns = [],
    updateColumnOrder,
    toggleColumnVisibility,
    updateColumnStyles,
    updateFixedColumns,
    resetConfig,
    resetColumns,
    resetStyles
  } = hasColumns ? useTableConfig(tableId, columnsForConfig) : {
    columns: [],
    visibleColumns: [],
    updateColumnOrder: () => {},
    toggleColumnVisibility: () => {},
    updateColumnStyles: () => {},
    updateFixedColumns: () => {},
    resetConfig: () => {},
    resetColumns: () => {},
    resetStyles: () => {}
  }
  
  // Criar tag <style> dinâmica para injetar estilos com !important
  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      styleRef.current.setAttribute('data-dynamic-styles', tableId)
      document.head.appendChild(styleRef.current)
    }

    // Gerar CSS dinâmico para cada coluna com estilos configurados
    let cssRules = ''
    configColumns.forEach(col => {
      if (col.styles && (col.styles.backgroundColor || col.styles.textColor || col.styles.fontWeight || col.styles.fontStyle)) {
        const colId = col.id
        const bgColor = col.styles.backgroundColor && col.styles.backgroundColor.trim() !== '' 
          ? col.styles.backgroundColor 
          : null
        const textColor = col.styles.textColor && col.styles.textColor.trim() !== '' 
          ? col.styles.textColor 
          : null
        const fontWeight = col.styles.fontWeight && col.styles.fontWeight !== 'normal'
          ? col.styles.fontWeight 
          : null
        const fontStyle = col.styles.fontStyle && col.styles.fontStyle !== 'normal'
          ? col.styles.fontStyle 
          : null

        if (bgColor || textColor || fontWeight || fontStyle) {
          cssRules += `.sla-overlay-table td[data-column] > div.sla-dynamic-styled-${colId} {\n`
          if (bgColor) cssRules += `  background-color: ${bgColor} !important;\n`
          if (textColor) cssRules += `  color: ${textColor} !important;\n`
          if (fontWeight) cssRules += `  font-weight: ${fontWeight} !important;\n`
          if (fontStyle) cssRules += `  font-style: ${fontStyle} !important;\n`
          cssRules += `}\n`
        }
      }
    })

    if (styleRef.current) {
      styleRef.current.textContent = cssRules
    }

    return () => {
      // Cleanup: remover tag style quando componente desmontar
      if (styleRef.current && styleRef.current.parentNode) {
        styleRef.current.parentNode.removeChild(styleRef.current)
        styleRef.current = null
      }
    }
  }, [configColumns, tableId])
  
  // Usar colunas configuradas ou padrão (memoizado)
  const finalColumns = useMemo(() => {
    // Preparar colunas base
    let baseColumns = columns || []
    if (baseColumns.length === 0 && tableColumns.length > 0) {
      baseColumns = tableColumns
    }
    
    // Se não há colunas, retornar vazio
    if (baseColumns.length === 0) {
      return []
    }
    
    // Se temos colunas configuradas e visíveis, usar essas
    if (visibleColumns && visibleColumns.length > 0) {
      return visibleColumns.map(col => {
        const normalizedName = (col.name || '').toLowerCase().trim()
        if (normalizedName === 'copiar' || normalizedName === 'copy') {
          return { key: 'copy', header: 'Copiar' }
        }
        return col.name
      })
    }
    
    // Fallback: usar colunas base
    if (onCopyPedido) {
      return [{ key: 'copy', header: 'Copiar' }, ...baseColumns]
    }
    return baseColumns
  }, [visibleColumns, columns, tableColumns, onCopyPedido])
  
  // Cache para informações de fixação de colunas (memoizado)
  const fixedColumnsCache = useMemo(() => {
    const cache = new Map()
    const normalizeName = (name) => {
      if (typeof name === 'string') return name.toLowerCase().trim()
      if (name && name.key) return name.key.toLowerCase().trim()
      if (name && name.header) return name.header.toLowerCase().trim()
      return ''
    }
    
    const sortedColumns = [...configColumns].sort((a, b) => a.order - b.order)
    
    configColumns.forEach(column => {
      if (column.isFixed && column.visible) {
        let left = 0
        for (let i = 0; i < sortedColumns.length; i++) {
          if (sortedColumns[i].id === column.id) {
            break
          }
          if (sortedColumns[i].isFixed && sortedColumns[i].visible) {
            left += 150 // Largura aproximada de cada coluna fixa
          }
        }
        cache.set(column.id, { isFixed: true, left })
        cache.set(normalizeName(column.name), { isFixed: true, left })
      }
    })
    
    return cache
  }, [configColumns])
  
  // Função para obter informações de fixação de uma coluna (otimizada)
  const getColumnFixedInfo = useCallback((columnName, index) => {
    const normalizeName = (name) => {
      if (typeof name === 'string') return name.toLowerCase().trim()
      if (name && name.key) return name.key.toLowerCase().trim()
      if (name && name.header) return name.header.toLowerCase().trim()
      return ''
    }
    
    const normalizedName = normalizeName(columnName)
    const cached = fixedColumnsCache.get(normalizedName)
    if (cached) return cached
    
    return { isFixed: false, left: 0 }
  }, [fixedColumnsCache])
  
  // Função otimizada para determinar classes CSS (memoizada)
  const getCellClasses = useCallback((key, value) => {
                        const classes = []

                        // Validação para "marca_assinatura" - Entregues = Verde, Não Entregues = Vermelho
                        if (key === 'marca_assinatura' || key === 'Marca de assinatura' || key === 'MARCA DE ASSINATURA') {
                          const valueStr = String(value).toLowerCase()
                          if (valueStr.includes('assinatura de devolução') ||
                            valueStr.includes('recebimento com assinatura normal')) {
                            classes.push('status-entregue')
                          } else if (valueStr.includes('não entregue') ||
                            valueStr.includes('nao entregue')) {
                            classes.push('status-nao-entregue')
                          }
                        }

                        // Validação para BASE - cores diferentes para cada base
                        if (key === 'base' || key === 'BASE' || key === 'Base de entrega') {
                          const valueStr = String(value).toUpperCase()
                          if (valueStr.includes('CCM -SC')) {
                            classes.push('base-ccm')
                          } else if (valueStr.includes('ITJ -SC')) {
                            classes.push('base-itj')
                          } else if (valueStr.includes('ITP -SC')) {
                            classes.push('base-itp')
                          } else if (valueStr.includes('RDS -SC')) {
                            classes.push('base-rds')
                          } else if (valueStr.includes('BNU -SC')) {
                            classes.push('base-bnu')
                          } else if (valueStr.includes('JOI -SC')) {
                            classes.push('base-joi')
                          }
                        }

                        // Validação para tempo_entrega - cor especial para datas
                        if (key === 'tempo_entrega' || key === 'DATA DE EXPEDIÇÃO' || key === 'DATA DE EXPEDICAO') {
                          classes.push('data-expedicao')
                        }

                        // Validação para numero_pedido - destaque especial
    if (key === 'numero_pedido' || key === 'Nº DO PEDIDO' || key === 'NUMERO_PEDIDO' || key === 'Número de pedido JMS' || key === 'Remessa' || key === 'remessa') {
                          classes.push('numero-pedido')
                        }

                        // Validação para destinatario - destaque
                        if (key === 'destinatario' || key === 'DESTINATÁRIO' || key === 'Destinatário') {
                          classes.push('destinatario')
                        }

                        // Validação para cidade_destino - estilo especial
                        if (key === 'cidade_destino' || key === 'Cidade Destino') {
                          classes.push('cidade-destino')
                        }

    // Validação para aging - estilo especial
    if (key === 'aging' || key === 'Aging' || key === 'AGING') {
      classes.push('aging')
                        }

                        return classes.join(' ')
  }, [])

  // Resetar estado quando overlay abrir novamente
  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsClosing(false)
    }
  }, [isOpen])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsClosing(false)
      setShowTable(false)
      setPhoneNumber('')
      setIsLoadingPhone(false)
    }
  }, [])

  // Preencher input quando telefone inicial mudar OU quando telefoneMotorista mudar
  useEffect(() => {
    const telefoneParaUsar = telefoneMotorista || telefoneInicial

    if (isOpen && telefoneParaUsar && telefoneParaUsar.trim() !== '') {
      // Se o telefone já está formatado, usar diretamente; senão, formatar
      const telefoneFormatado = telefoneParaUsar.includes('(') 
        ? telefoneParaUsar.trim() 
        : telefoneParaUsar.trim()
      
      if (telefoneFormatado !== phoneNumber) {
        setPhoneNumber(telefoneFormatado)
      }
    } else if (isOpen && phoneNumber && !telefoneParaUsar) {
      // Não limpar se o usuário já digitou algo
      // setPhoneNumber('')
    }
  }, [telefoneInicial, telefoneMotorista, isOpen])

  // Resetar phoneNumber e estados quando overlay fechar completamente
  useEffect(() => {
    if (!isOpen && !isClosing) {
      setPhoneNumber('')
      setIsLoadingPhone(false)
      setShowTable(false)
    }
  }, [isOpen, isClosing])

  // Controlar quando mostrar a tabela (apenas após carregar)
  useEffect(() => {
    if (isClosing) {
      return
    }

    if (!isOpen) {
      setShowTable(false)
      return
    }

    if (isLoading) {
      setShowTable(false)
      return
    }

    if (data && data.length > 0) {
      const timer = setTimeout(() => {
        setShowTable(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowTable(false)
    }
  }, [isOpen, isLoading, data, isClosing])

  const handleClose = useCallback(() => {
    if (isClosing) {
      return
    }

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    setPhoneNumber('')
    setIsLoadingPhone(false)
    
    setIsClosing(true)
    setShowTable(false)
    
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null
      setIsClosing(false)
      
      if (onClose) {
        onClose()
      }
    }, 300)
  }, [isClosing, onClose])

  // Função para adicionar telefone (Confirmar)
  const handleAddPhone = async (e) => {
    e.preventDefault()

    // Tentar pegar o valor numérico do input (pode ter classe sla-overlay-phone-input ou pedidos-retidos-phone-input)
    // Buscar dentro do container para evitar conflitos
    const container = document.querySelector('.sla-phone-input-container')
    const inputElement = container?.querySelector('input[type="text"]') || 
                         document.querySelector('.sla-overlay-phone-input') || 
                         document.querySelector('.pedidos-retidos-phone-input')
    
    let numericValue = ''
    
    // Primeiro, tentar pegar do data attribute
    if (inputElement) {
      numericValue = inputElement.getAttribute('data-numeric-value') || ''
    }
    
    // Se não encontrou no data attribute, extrair números do phoneNumber state
    if (!numericValue && phoneNumber) {
      numericValue = phoneNumber.replace(/\D/g, '')
    }
    
    // Se ainda não tem valor, tentar pegar do value do input
    if (!numericValue && inputElement) {
      numericValue = inputElement.value?.replace(/\D/g, '') || ''
    }
    
    if (!numericValue || numericValue.trim() === '') {
      showError('Por favor, digite um número de telefone')
      return
    }

    if (numericValue.length < 10) {
      showError('Telefone deve ter pelo menos 10 dígitos')
      return
    }

    setIsLoadingPhone(true)

    try {
      const { getApiHeaders } = await import('../../../../utils/api-headers')
      const headers = {
        'Content-Type': 'application/json',
        ...getApiHeaders()
      }
      
      const response = await fetch(`/api/lista-telefones/motorista/${encodeURIComponent(motorista)}/telefone?base_name=${encodeURIComponent(baseName)}&telefone=${encodeURIComponent(numericValue)}`, {
        method: 'POST',
        headers
      })

      const data = await response.json()

      if (data.success) {
        showSuccess('Telefone adicionado com sucesso!')
        setPhoneNumber('')

        if (onTelefoneAdicionado) {
          onTelefoneAdicionado(numericValue)
        }
      } else {
        showError('Erro ao adicionar telefone: ' + (data.detail || 'Erro desconhecido'))
      }
    } catch (error) {
      showError('Erro de conexão: ' + error.message)
    } finally {
      setIsLoadingPhone(false)
    }
  }

  // Função para cancelar (Limpar input)
  const handleCancelPhone = () => {
    setPhoneNumber('')
  }

  // Função auxiliar para extrair texto de elemento React
  const extractTextFromReactElement = (element) => {
    if (!element) return ''
    if (typeof element === 'string') return element
    if (typeof element === 'number') return String(element)
    
    if (element && typeof element === 'object' && element.props) {
      if (element.props.children) {
        if (Array.isArray(element.props.children)) {
          return element.props.children
            .map(child => extractTextFromReactElement(child))
            .join(' ')
        } else {
          return extractTextFromReactElement(element.props.children)
        }
      }
    }
    
    return ''
  }

  // Função para gerar Excel (memoizada)
  const handleGerarExcel = useCallback(() => {
    if (!data || data.length === 0) {
      showError('Não há dados para exportar')
      return
    }

    let nomeMotoristaLimpo = ''
    let nomeMotorista = motorista
    
    if (!nomeMotorista || nomeMotorista.trim() === '') {
      let titleText = ''
      if (typeof title === 'string') {
        titleText = title
      } else if (title && typeof title === 'object') {
        titleText = extractTextFromReactElement(title)
      }
      
      if (titleText) {
        const match = titleText.match(/(?:Motorista:\s*|-\s*)([^-|:]+)/i)
        if (match && match[1]) {
          nomeMotorista = match[1].trim()
        }
      }
    }
    
    if (!nomeMotorista || nomeMotorista.trim() === '') {
      const primeiroPedido = data[0]
      if (primeiroPedido) {
        nomeMotorista = primeiroPedido.Motorista || primeiroPedido.motorista || primeiroPedido.responsavel || primeiroPedido.RESPONSÁVEL || primeiroPedido['Motorista'] || ''
      }
    }
    
    if (nomeMotorista && nomeMotorista.trim() !== '') {
      nomeMotoristaLimpo = nomeMotorista
        .trim()
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50)
    }

    const dateStr = new Date().toISOString().split('T')[0]
    const filename = nomeMotoristaLimpo ? `${nomeMotoristaLimpo}-${dateStr}` : `pedidos-${dateStr}`
    
    gerarExcelTabela(data, finalColumns, filename, showSuccess, showError)
  }, [data, finalColumns, motorista, title, showSuccess, showError])

  if (!isOpen && !isClosing) {
    return null
  }


  return (
    <div 
      className={`sla-overlay-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`} 
      onClick={handleClose}
      style={{ pointerEvents: isClosing ? 'none' : 'auto' }}
    >
      <div 
        className={`sla-overlay-container ${isClosing ? 'slide-down' : 'slide-up'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sla-overlay-header">
          <div className="sla-overlay-title-section">
            <h2>
              {renderTitleWithCopyableMotorista(
                subtitle && typeof subtitle === 'object' && subtitle.props && subtitle.props.children && subtitle.props.children[0] 
                  ? subtitle.props.children[0] 
                  : title
              )}
            </h2>
            {(extractedSubtitle || subtitle) && (
              <div className="sla-overlay-subtitle">
                {extractedSubtitle ? `(${extractedSubtitle})` : subtitle}
              </div>
            )}
          </div>
          {showAddPhone && (
            <div className="sla-phone-input-container">
              <PhoneInput
                value={phoneNumber}
                onChange={() => {}}
                placeholder="Digite o telefone"
                disabled={isLoadingPhone}
                maxLength={11}
                className="sla-overlay-phone-input"
              />
              <button
                className="sla-overlay-add-phone-button"
                onClick={handleAddPhone}
                disabled={isLoadingPhone}
                title="Confirmar e adicionar telefone"
              >
                {isLoadingPhone ? (
                  <div className="sla-phone-spinner"></div>
                ) : (
                  <FaCheck size={20} />
                )}
              </button>
              <button
                className="sla-overlay-clear-phone-button"
                onClick={handleCancelPhone}
                disabled={isLoadingPhone}
                title="Cancelar e limpar telefone"
              >
                <FaTimes size={20} />
              </button>
            </div>
          )}
          <div className="sla-overlay-actions">
            {onCopyAllPedidos && (
              <button
                className="sla-overlay-copy-all-button"
                onClick={onCopyAllPedidos}
                title="Copiar todos os números de pedidos desta tabela"
              >
                <BsCopy />
              </button>
            )}
            {onCopyFormattedData && (
              <CopyFormattedButton
                data={data}
                overlayTitle={title}
                overlayType={overlayType}
                baseName={baseName}
                onError={(message) => {
                  if (message.includes('Erro')) {
                    showError(message)
                  } else {
                    showInfo(message)
                  }
                }}
                className="sla-overlay-copy-formatted-button"
                size="medium"
                variant="primary"
              />
            )}

            {showWhatsApp && (
              <WhatsAppButton
                phoneNumber={telefoneMotorista || ""}
                motorista={motorista}
                quantidade={data?.length || 0}
                className="sla-overlay-whatsapp-button"
                onError={(error) => {
                  showError(`Erro: ${error}`)
                }}
              />
            )}
            <button
              className="sla-overlay-excel-button"
              onClick={handleGerarExcel}
              title="Gerar e baixar arquivo Excel com os dados da tabela"
              disabled={!data || data.length === 0}
            >
              <FaFileExcel />
            </button>
            <ScreenshotButton
              targetRef={tableRef}
              filename={`pedidos-motorista-${motorista || 'overlay'}`}
              onSuccess={(message) => showSuccess(message)}
              onError={(error) => showError(error)}
              title="Capturar screenshot da tabela"
              size="medium"
            />
            <TableConfigButton onClick={() => setShowConfigModal(true)} />
            <button className="sla-overlay-close-btn" onClick={handleClose}>✕</button>
          </div>
        </div>

        <div className="sla-overlay-table-wrapper" ref={tableWrapperRef}>
          {isLoading || !showTable ? (
            <div className="sla-overlay-loading">
              <div className="sla-overlay-spinner"></div>
              <p>Carregando pedidos...</p>
            </div>
          ) : (!data || data.length === 0) ? (
            <div className="sla-overlay-empty-message">
              <p>{emptyMessage}</p>
            </div>
          ) : finalColumns.length === 0 ? (
            <div className="sla-overlay-empty-message">
              <p>Nenhuma coluna disponível para exibir</p>
            </div>
          ) : (
            <table className={`sla-overlay-table ${showTable ? 'sla-table-fade-in' : ''}`} ref={tableRef}>
              <thead>
                <tr>
                  {finalColumns.map((column, index) => {
                    const columnName = typeof column === 'string' ? column : (column.header || column.key || '')
                    const fixedInfo = getColumnFixedInfo(columnName, index)
                    return (
                      <th 
                        key={index}
                        style={fixedInfo.isFixed ? {
                          position: 'sticky',
                          left: `${fixedInfo.left}px`,
                          zIndex: 10,
                          backgroundColor: '#ffffff',
                          boxShadow: fixedInfo.left > 0 ? '2px 0 4px rgba(0,0,0,0.1)' : 'none'
                        } : {}}
                      >
                        {columnName}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {finalColumns.map((column, colIndex) => {
                      const key = typeof column === 'string' ? column : column.key
                      const columnName = typeof column === 'string' ? column : (column.header || column.key || '')
                      const fixedInfo = getColumnFixedInfo(columnName, colIndex)
                      
                      // Se for a coluna de copiar (pode vir como 'copy', 'Copiar' ou objeto)
                      const isCopyColumn = key === 'copy' || 
                                         columnName === 'Copiar' || 
                                         columnName === 'copy' ||
                                         (typeof column === 'string' && (column.toLowerCase() === 'copiar' || column.toLowerCase() === 'copy'))
                      
                      if (isCopyColumn) {
                        return (
                          <td 
                            key={colIndex} 
                            className="sla-copy-cell"
                            style={fixedInfo.isFixed ? {
                              position: 'sticky',
                              left: `${fixedInfo.left}px`,
                              zIndex: 9,
                              backgroundColor: '#ffffff',
                              boxShadow: fixedInfo.left > 0 ? '2px 0 4px rgba(0,0,0,0.1)' : 'none'
                            } : {}}
                          >
                            <span>
                              <button
                                className="sla-overlay-copy-button"
                                onClick={() => onCopyPedido(row)}
                                title="Copiar número do pedido"
                              >
                                <BsCopy />
                              </button>
                            </span>
                          </td>
                        )
                      }

                      // Buscar valor com fallbacks múltiplos
                      let value = row[key]

                      // Se o valor é null, undefined, ou string vazia, usar N/A
                      if (value === null || value === undefined || value === '') {
                        // Fallback especial para campo Remessa/Número de pedido
                        if (key === 'Remessa') {
                          value = row['Número de pedido JMS'] || row['Nº DO PEDIDO'] || row['NUMERO_PEDIDO'] || 'N/A'
                        } else {
                          value = 'N/A'
                        }
                      }

                      // Converter para string e garantir que não seja apenas espaços
                      value = String(value || '').trim() || 'N/A'
                      
                      // Obter estilos da coluna configurada
                      const columnConfig = configColumns.find(col => {
                        const colName = typeof column === 'string' ? column : (column.header || column.key || '')
                        return col.name === colName || col.name === key
                      })
                      
                      const columnId = columnConfig ? columnConfig.id : null
                      const hasDynamicStyles = columnConfig && columnConfig.styles && (
                        columnConfig.styles.backgroundColor || 
                        columnConfig.styles.textColor || 
                        columnConfig.styles.fontWeight || 
                        columnConfig.styles.fontStyle
                      )

                      const cellClasses = getCellClasses(key, value)
                      const dynamicStyleClass = hasDynamicStyles && columnId ? `sla-dynamic-styled-${columnId}` : ''

                      return (
                        <td 
                          key={colIndex} 
                          data-column={key}
                          style={fixedInfo.isFixed ? {
                            position: 'sticky',
                            left: `${fixedInfo.left}px`,
                            zIndex: 9,
                            backgroundColor: '#ffffff',
                            boxShadow: fixedInfo.left > 0 ? '2px 0 4px rgba(0,0,0,0.1)' : 'none'
                          } : {}}
                        >
                          <div className={`${cellClasses} ${dynamicStyleClass}`}>
                            {value}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Modal de Configuração */}
        <TableConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          columns={configColumns}
          onUpdateOrder={updateColumnOrder}
          onToggleVisibility={toggleColumnVisibility}
          onUpdateStyles={updateColumnStyles}
          onUpdateFixedColumns={updateFixedColumns}
          onReset={() => {
            resetConfig()
            showSuccess('Configurações resetadas!')
          }}
          onResetColumns={() => {
            resetColumns()
            showSuccess('Colunas resetadas!')
          }}
          onResetStyles={() => {
            resetStyles()
            showSuccess('Estilos resetados!')
          }}
        />
      </div>

    </div>
  )
}

export default TableOverlay

