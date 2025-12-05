import React, { useState, useEffect, useRef, useMemo } from 'react'
import { BsCopy } from "react-icons/bs"
import { FaCheck, FaTimes, FaFileExcel } from 'react-icons/fa'
import ScreenshotButton from '../ScreenshotButton/ScreenshotButton'
import WhatsAppButton from '../WhatsAppButton/WhatsAppButton'
import CopyFormattedButton from '../CopyFormattedButton/CopyFormattedButton'
import PhoneInput from '../PhoneInput/PhoneInput'
import TableConfigButton from '../TableConfigButton/TableConfigButton'
import TableConfigModal from '../TableConfigModal/TableConfigModal'
import TableFilterBar from './TableFilterBar/TableFilterBar'
import { useTableConfig } from '../../hooks/useTableConfig'
import api from '../../../../services/api'
import { useNotification } from '../../../../contexts/NotificationContext'
import { gerarExcelTabela } from '../../utils/excelUtils'
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
  overlayType = '', // Tipo do overlay para formatação
  totalPedidos = null // Total original de pedidos (para WhatsApp)
}) => {
  const [isClosing, setIsClosing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoadingPhone, setIsLoadingPhone] = useState(false)
  const [phoneMessage, setPhoneMessage] = useState('')
  const [showTable, setShowTable] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [filteredData, setFilteredData] = useState(data || [])
  const tableRef = useRef(null)
  const closeTimeoutRef = useRef(null)
  const styleRef = useRef(null)
  const columnWidthsRef = useRef({})
  const { showSuccess, showError, showInfo } = useNotification()
  
  // Gerar ID único para a tabela
  // Para pedidos de motoristas, usar ID fixo para toda a tabela
  // Para outros casos, usar baseado no título
  const getTableId = () => {
    // Se for overlay de pedidos de motoristas (detectado pelo título começando com "Pedidos de")
    if (title && typeof title === 'string' && title.toLowerCase().startsWith('pedidos de')) {
      return 'd1-motorista-pedidos'
    }
    // Para outros casos, usar baseado no título
    if (title) {
      const titleStr = typeof title === 'string' ? title : String(title)
      return titleStr
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }
    return 'default-table'
  }
  
  const tableId = getTableId()
  
  // Preparar colunas para configuração (incluir coluna de copiar se necessário)
  const columnsForConfig = useMemo(() => {
    const baseCols = columns || []
    if (onCopyPedido) {
      // Adicionar coluna de copiar como primeira coluna
      return [{ key: 'copy', header: 'Copiar' }, ...baseCols]
    }
    return baseCols
  }, [columns, onCopyPedido])
  
  // Hook de configuração da tabela
  const {
    columns: configColumns,
    visibleColumns,
    updateColumnOrder,
    toggleColumnVisibility,
    updateColumnStyles,
    updateFixedColumns,
    resetConfig,
    resetColumns,
    resetStyles
  } = useTableConfig(tableId, columnsForConfig)

  // Criar tag <style> dinâmica para injetar estilos com !important
  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      styleRef.current.setAttribute('data-dynamic-styles', tableId)
      // Adicionar no final do head para garantir prioridade sobre CSS estático
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
          // Seletor base para estilos dinâmicos
          cssRules += `.d1-overlay-table td[data-column] > div.d1-dynamic-styled-${colId} {\n`
          if (bgColor) cssRules += `  background-color: ${bgColor} !important;\n`
          if (textColor) cssRules += `  color: ${textColor} !important;\n`
          if (fontWeight) cssRules += `  font-weight: ${fontWeight} !important;\n`
          if (fontStyle) cssRules += `  font-style: ${fontStyle} !important;\n`
          cssRules += `}\n`
          
          // Seletor com maior especificidade para sobrescrever classes existentes e regras do td
          // Combinando a classe dinâmica com qualquer outra classe que possa existir
          cssRules += `.d1-overlay-table td[data-column] > div.d1-dynamic-styled-${colId}.d1-dynamic-styled-${colId} {\n`
          if (fontWeight) cssRules += `  font-weight: ${fontWeight} !important;\n`
          if (fontStyle) cssRules += `  font-style: ${fontStyle} !important;\n`
          cssRules += `}\n`
          
          // Seletor ainda mais específico incluindo o elemento table para garantir prioridade máxima
          cssRules += `table.d1-overlay-table tbody tr td[data-column] > div.d1-dynamic-styled-${colId} {\n`
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

  // Preencher input quando telefone inicial mudar OU quando telefoneMotorista mudar
  useEffect(() => {
    const telefoneParaUsar = telefoneMotorista || telefoneInicial
    
    if (isOpen) {
      if (telefoneParaUsar && telefoneParaUsar.trim() !== '') {
        // Limpar formatação e atualizar apenas números
        const telefoneLimpo = telefoneParaUsar.trim().replace(/\D/g, '')
        setPhoneNumber(telefoneLimpo)
      } else if (!telefoneParaUsar) {
        // Se telefone foi limpo e overlay está aberto, limpar input também
        setPhoneNumber('')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telefoneInicial, telefoneMotorista, isOpen])
  
  // Resetar estado quando overlay abrir novamente
  useEffect(() => {
    if (isOpen) {
      // Limpar timeout se houver algum pendente
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      // Resetar estado de fechamento se overlay foi reaberto
      setIsClosing(false)
    }
  }, [isOpen])

  // Resetar phoneNumber e estados quando overlay fechar completamente
  useEffect(() => {
    if (!isOpen && !isClosing) {
      setPhoneNumber('')
      setPhoneMessage('')
      setIsLoadingPhone(false)
      setShowTable(false)
    }
  }, [isOpen, isClosing])

  // Bloquear scroll do body quando overlay estiver aberto
  useEffect(() => {
    if (isOpen && !isClosing) {
      // Salvar o valor atual do overflow e position do body e html
      const originalBodyOverflow = document.body.style.overflow
      const originalBodyPosition = document.body.style.position
      const originalBodyTop = document.body.style.top
      const originalBodyWidth = document.body.style.width
      const originalHtmlOverflow = document.documentElement.style.overflow
      
      // Calcular a posição atual do scroll
      const scrollY = window.scrollY
      
      // Bloquear scroll do body e html
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.documentElement.style.overflow = 'hidden'
      
      // Cleanup: restaurar o overflow quando fechar
      return () => {
        document.body.style.overflow = originalBodyOverflow
        document.body.style.position = originalBodyPosition
        document.body.style.top = originalBodyTop
        document.body.style.width = originalBodyWidth
        document.documentElement.style.overflow = originalHtmlOverflow
        
        // Restaurar a posição do scroll
        window.scrollTo(0, scrollY)
      }
    } else {
      // Restaurar scroll quando fechar
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen, isClosing])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      // Garantir que o overflow seja restaurado ao desmontar
      document.body.style.overflow = ''
    }
  }, [])

  // Atualizar dados filtrados quando data mudar
  // O TableFilterBar vai atualizar via onFilterChange, mas precisamos inicializar
  useEffect(() => {
    if (data && data.length > 0) {
      // Só atualizar se filteredData estiver vazio ou se data mudou
      setFilteredData(prev => {
        if (prev.length === 0 || prev.length !== data.length) {
          return data
        }
        return prev
      })
    } else {
      setFilteredData([])
    }
  }, [data])

  // Controlar quando mostrar a tabela (apenas após carregar)
  useEffect(() => {
    // Não fazer nada durante o fechamento
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

    // Usar data diretamente se filteredData estiver vazio mas data tiver conteúdo
    const dataToShow = (filteredData && filteredData.length > 0) ? filteredData : (data || [])
    
    if (dataToShow && dataToShow.length > 0) {
      // Delay para mostrar loading primeiro, depois mostrar dados
      const timer = setTimeout(() => {
        setShowTable(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowTable(false)
    }
  }, [isOpen, isLoading, filteredData, data, isClosing])

  const handleClose = () => {
    if (isClosing) return // Previne múltiplas execuções

    // Limpar timeout anterior se houver
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    setIsClosing(true)
    setShowTable(false) // Esconder tabela imediatamente ao fechar
    
    // Aguardar a animação terminar antes de chamar onClose (300ms da animação slideDown)
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null
      setIsClosing(false)
      onClose()
    }, 300)
  }

  // Função para adicionar telefone
  const handleAddPhone = async (e) => {
    e.preventDefault()

    if (!phoneNumber.trim()) {
      setPhoneMessage('Por favor, digite um número de telefone')
      return
    }

    if (phoneNumber.length < 10) {
      setPhoneMessage('Telefone deve ter pelo menos 10 dígitos')
      return
    }

    setIsLoadingPhone(true)
    setPhoneMessage('')

    try {
      const response = await api.post(`/lista-telefones/motorista/${encodeURIComponent(motorista)}/telefone?base_name=${encodeURIComponent(baseName)}&telefone=${encodeURIComponent(phoneNumber)}`)

      const data = response.data

      if (data.success) {
        setPhoneMessage('✅ Telefone adicionado com sucesso!')
        setPhoneNumber('')

        // Chamar callback se fornecido
        if (onTelefoneAdicionado) {
          onTelefoneAdicionado(phoneNumber)
        }

        // Esconder mensagem após 3 segundos
        setTimeout(() => {
          setPhoneMessage('')
        }, 3000)
      } else {
        setPhoneMessage('❌ Erro ao adicionar telefone: ' + (data.detail || 'Erro desconhecido'))
        // Esconder mensagem de erro após 5 segundos
        setTimeout(() => {
          setPhoneMessage('')
        }, 5000)
      }
    } catch (error) {
      setPhoneMessage('❌ Erro de conexão: ' + error.message)
    } finally {
      setIsLoadingPhone(false)
    }
  }

  const handleClearPhone = () => {
    setPhoneNumber('')
    setPhoneMessage('')
  }

  // Função auxiliar para extrair texto de elementos React
  const extractTextFromReactElement = (element) => {
    if (typeof element === 'string') {
      return element
    }
    if (element && element.props && element.props.children) {
      if (typeof element.props.children === 'string') {
        return element.props.children
      }
      if (Array.isArray(element.props.children)) {
        return element.props.children
          .map(child => extractTextFromReactElement(child))
          .join(' ')
      }
      return extractTextFromReactElement(element.props.children)
    }
    return ''
  }



  // Usar colunas configuradas ou padrão
  const getFinalColumns = () => {
    // Se temos colunas configuradas e visíveis, usar essas
    // visibleColumns já inclui a coluna de copiar se necessário
    if (visibleColumns && visibleColumns.length > 0) {
      return visibleColumns.map(col => col.name)
    }
    
    // Fallback para lógica antiga
    const tableColumns = data && data.length > 0 && data[0] ? Object.keys(data[0]) : []
    
    let baseCols = []
    if (columns && columns.length > 0) {
      baseCols = columns.map(col => typeof col === 'string' ? col : (col.header || col.key))
    } else if (!filterColumns) {
      baseCols = tableColumns
    } else {
      baseCols = tableColumns.filter(col => {
        return col === 'Número de pedido JMS' ||
          col === 'Destinatário' ||
          col === 'Cidade Destino' ||
          col === 'Marca de assinatura' ||
          col === 'Nº DO PEDIDO' ||
          col === 'NUMERO_PEDIDO' ||
          col === 'DESTINATÁRIO' ||
          col === 'BASE' ||
          col === 'Base de Entrega'
      })
    }
    
    // Se não temos visibleColumns mas temos onCopyPedido, adicionar coluna de copiar
    // Mas só se ela não estiver já presente
    if (onCopyPedido && !baseCols.some(col => {
      const colName = typeof col === 'string' ? col : (col.key || col.header || '')
      return colName.toLowerCase() === 'copiar' || colName.toLowerCase() === 'copy'
    })) {
      return [{ key: 'copy', header: 'Copiar' }, ...baseCols]
    }
    
    return baseCols
  }

  const finalColumns = getFinalColumns()

  // Função para obter informações de fixação de uma coluna
  const getColumnFixedInfo = (columnName, index) => {
    const normalizeName = (name) => {
      if (typeof name === 'string') return name.toLowerCase().trim()
      if (name && name.key) return name.key.toLowerCase().trim()
      if (name && name.header) return name.header.toLowerCase().trim()
      return ''
    }
    
    if (!configColumns || configColumns.length === 0) {
      return { isFixed: false, left: 0 }
    }
    
    const normalizedColumnName = normalizeName(columnName)
    
    // Encontrar configuração da coluna
    const columnConfig = configColumns.find(col => {
      const normalizedConfigName = col.name.toLowerCase().trim()
      return normalizedConfigName === normalizedColumnName
    })
    
    if (!columnConfig || !columnConfig.isFixed) {
      return { isFixed: false, left: 0 }
    }
    
    // Calcular left offset: somar largura de todas as colunas fixas anteriores
    // Ignorar a coluna de copiar no cálculo
    let leftOffset = 0
    const sortedConfigColumns = [...configColumns].sort((a, b) => a.order - b.order)
    
    for (let i = 0; i < index; i++) {
      const colName = typeof finalColumns[i] === 'string' 
        ? finalColumns[i] 
        : (finalColumns[i]?.key || finalColumns[i]?.header || '')
      const normalizedColName = normalizeName(colName)
      
      const prevColConfig = sortedConfigColumns.find(col => {
        const normalizedConfigName = col.name.toLowerCase().trim()
        return normalizedConfigName === normalizedColName
      })
      
      if (prevColConfig && prevColConfig.isFixed) {
        // Usar largura real se disponível, senão usar aproximação
        const width = columnWidthsRef.current[i] || 150
        leftOffset += width
      }
    }
    
    return { isFixed: true, left: leftOffset }
  }

  // Calcular larguras reais das colunas fixas após render
  useEffect(() => {
    if (!tableRef.current || !showTable || !configColumns || !finalColumns) return
    
    // Aguardar um frame para garantir que o DOM está renderizado
    const timer = setTimeout(() => {
      const table = tableRef.current
      if (!table) return
      
      const thead = table.querySelector('thead')
      if (!thead) return
      
      const thElements = thead.querySelectorAll('th')
      const widths = {}
      
      thElements.forEach((th, index) => {
        if (index >= finalColumns.length) return
        
        const columnName = finalColumns[index]
        const colName = typeof columnName === 'string' ? columnName : (columnName?.header || columnName?.key || '')
        
        // Verificar se é fixa diretamente
        const normalizeName = (name) => {
          if (typeof name === 'string') return name.toLowerCase().trim()
          if (name && name.key) return name.key.toLowerCase().trim()
          if (name && name.header) return name.header.toLowerCase().trim()
          return ''
        }
        
        const normalizedColumnName = normalizeName(colName)
        
        const sortedConfigColumns = [...configColumns].sort((a, b) => a.order - b.order)
        const columnConfig = sortedConfigColumns.find(col => {
          const normalizedConfigName = col.name.toLowerCase().trim()
          return normalizedConfigName === normalizedColumnName
        })
        
        if (columnConfig && columnConfig.isFixed) {
          widths[index] = th.offsetWidth
        }
      })
      
      columnWidthsRef.current = widths
    }, 100)
    
    return () => clearTimeout(timer)
  }, [showTable, configColumns, finalColumns])

  // Função para gerar Excel
  const handleGerarExcel = () => {
    const dataToExport = filteredData && filteredData.length > 0 ? filteredData : data
    if (!dataToExport || dataToExport.length === 0) {
      showError('Não há dados para exportar')
      return
    }

    // Limpar e formatar nome do motorista para nome de arquivo
    let nomeMotoristaLimpo = ''
    
    // Tentar obter nome do motorista de várias fontes
    let nomeMotorista = motorista
    
    // Se não tiver motorista, tentar extrair do título
    if (!nomeMotorista || nomeMotorista.trim() === '') {
      let titleText = ''
      if (typeof title === 'string') {
        titleText = title
      } else if (title && typeof title === 'object') {
        titleText = extractTextFromReactElement(title)
      }
      
      if (titleText) {
        // Tentar extrair do título: "Pedidos de NOME" ou similar
        const match = titleText.match(/(?:de\s+|do\s+)([^-|:]+)/i)
        if (match && match[1]) {
          nomeMotorista = match[1].trim()
        } else {
          // Tentar pegar o último segmento após espaços
          const parts = titleText.split(/\s+/)
          if (parts.length > 0) {
            nomeMotorista = parts[parts.length - 1]
          }
        }
      }
    }
    
    // Se ainda não tiver, tentar extrair dos dados (campo Motorista)
    if (!nomeMotorista || nomeMotorista.trim() === '') {
      const primeiroPedido = dataToExport[0]
      if (primeiroPedido) {
        nomeMotorista = primeiroPedido.Motorista || primeiroPedido.motorista || ''
      }
    }
    
    if (nomeMotorista && nomeMotorista.trim() !== '') {
      nomeMotoristaLimpo = nomeMotorista
        .trim()
        .replace(/[<>:"/\\|?*]/g, '') // Remover caracteres inválidos para nome de arquivo
        .replace(/\s+/g, '_') // Substituir espaços por underscore
        .substring(0, 50) // Limitar tamanho
    }

    const dateStr = new Date().toISOString().split('T')[0]
    // Usar nome do motorista se disponível, senão usar 'pedidos'
    const filename = nomeMotoristaLimpo ? `${nomeMotoristaLimpo}-${dateStr}` : `pedidos-${dateStr}`
    
    gerarExcelTabela(dataToExport, finalColumns, filename, showSuccess, showError)
  }

  if (!isOpen && !isClosing) {
    return null
  }

  return (
    <div className={`d1-overlay-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`}>
      <div className={`d1-overlay-container ${isClosing ? 'slide-down' : 'slide-up'}`}>
        <div className="d1-overlay-header">
          <div className="d1-overlay-header-top-row">
            <div className="d1-overlay-title-section">
              <h2>{title}</h2>
              {subtitle && <p className="d1-overlay-subtitle">{subtitle}</p>}
            </div>
            {showAddPhone && (
              <div className="d1-phone-input-container">
                <PhoneInput
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  placeholder="Digite o telefone"
                  disabled={isLoadingPhone}
                  maxLength={11}
                  className="d1-overlay-phone-input"
                />
                <button
                  className="d1-overlay-add-phone-button"
                  onClick={handleAddPhone}
                  disabled={isLoadingPhone || !phoneNumber.trim()}
                  title="Adicionar telefone"
                >
                  {isLoadingPhone ? (
                    <div className="d1-phone-spinner"></div>
                  ) : (
                    <FaCheck />
                  )}
                </button>
                {phoneNumber && (
                  <button
                    className="d1-overlay-clear-phone-button"
                    onClick={handleClearPhone}
                    title="Limpar telefone"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            )}
            <div className="d1-overlay-actions">
            {onCopyAllPedidos && (
              <button
                className="d1-overlay-copy-all-button"
                onClick={onCopyAllPedidos}
                title="Copiar todos os números de pedidos desta tabela"
              >
                <BsCopy size={20} />
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
                className="d1-overlay-copy-formatted-button"
                size="medium"
                variant="primary"
              />
            )}
            <button
              className="d1-overlay-excel-button"
              onClick={handleGerarExcel}
              title="Gerar e baixar arquivo Excel com os dados da tabela"
              disabled={!data || data.length === 0}
            >
              <FaFileExcel />
            </button>
            {showWhatsApp && (() => {
              const quantidadeFinal = data && Array.isArray(data) && data.length > 0 ? data.length : (totalPedidos !== null && totalPedidos !== undefined && totalPedidos > 0 ? totalPedidos : 0)
              return (
                <WhatsAppButton
                  phoneNumber={telefoneMotorista || phoneNumber || ""}
                  motorista={motorista}
                  quantidade={quantidadeFinal}
                  className="d1-overlay-whatsapp-button"
                  onError={(error) => {
                    showError(`Erro: ${error}`)
                  }}
                />
              )
            })()}
            <ScreenshotButton
              targetRef={tableRef}
              filename={`tabela-${title.replace(/\s+/g, '-').toLowerCase()}`}
              onSuccess={(message) => {}}
              onError={(message) => {}}
              title="Capturar screenshot da tabela"
              size="medium"
            />
            <TableConfigButton onClick={() => setShowConfigModal(true)} />
            <button className="d1-overlay-close-btn" onClick={handleClose}>✕</button>
            </div>
          </div>
          {/* Barra de Filtros */}
          {data && data.length > 0 && !isLoading && (
            <div className="d1-overlay-filter-section">
              <TableFilterBar
                columns={finalColumns}
                data={data}
                onFilterChange={setFilteredData}
              />
            </div>
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

        <div className="d1-overlay-table-wrapper">

          {isLoading || !showTable ? (
            <div className="d1-overlay-loading">
              <div className="d1-overlay-spinner"></div>
              <p>Carregando...</p>
            </div>
          ) : (!filteredData || filteredData.length === 0) ? (
            <div className="d1-overlay-empty-message">
              <p>{data && data.length > 0 ? 'Nenhum registro encontrado com os filtros aplicados.' : emptyMessage}</p>
            </div>
          ) : (
            <table className={`d1-overlay-table ${showTable ? 'd1-table-fade-in' : ''}`} ref={tableRef}>
              <thead>
                <tr>
                  {finalColumns.map((column, index) => {
                    const columnName = typeof column === 'string' ? column : (column.header || column.key)
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
                {(filteredData && filteredData.length > 0 ? filteredData : data || []).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {finalColumns.map((column, colIndex) => {
                      const key = typeof column === 'string' ? column : column.key
                      const columnName = typeof column === 'string' ? column : (column.header || column.key)
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
                            className="d1-copy-cell"
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
                                className="d1-overlay-copy-button"
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
                      
                      // Se o valor é null, undefined, ou string vazia, usar N/A (exceto para strings vazias intencionais)
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

                      // Normalizar exibição da marca de assinatura
                      if (key === 'marca_assinatura' || key === 'Marca de assinatura' || key === 'MARCA DE ASSINATURA') {
                        const valueStr = String(value).toLowerCase()
                        if (valueStr.includes('recebimento com assinatura normal') ||
                            valueStr.includes('assinatura de devolução') ||
                            valueStr === 'entregue') {
                          value = 'Entregue'
                        } else if (valueStr.includes('não entregue') ||
                                   valueStr.includes('nao entregue')) {
                          value = 'Não Entregue'
                        }
                      }

                      // Função para determinar classes CSS baseadas no conteúdo
                      const getCellClasses = (key, value) => {
                        const classes = []

                        // Validação para "marca_assinatura" - Entregues = Verde, Não Entregues = Vermelho
                        if (key === 'marca_assinatura' || key === 'Marca de assinatura' || key === 'MARCA DE ASSINATURA') {
                          const valueStr = String(value).toLowerCase()
                          if (valueStr.includes('entregue') && !valueStr.includes('não') && !valueStr.includes('nao')) {
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
                        if (key === 'numero_pedido' || key === 'Nº DO PEDIDO' || key === 'NUMERO_PEDIDO' || key === 'Número de pedido JMS' || key === 'Remessa') {
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

                        return classes.join(' ')
                      }

                      const cellClasses = getCellClasses(key, value)
                      
                      // Buscar configuração de estilo da coluna usando o nome da coluna
                      const columnConfig = configColumns.find(col => {
                        // Comparar tanto o nome quanto normalizar para garantir match
                        const colNameNormalized = col.name.toLowerCase().trim()
                        const keyNormalized = key.toLowerCase().trim()
                        return colNameNormalized === keyNormalized || col.name === key
                      })
                      
                      // Aplicar estilos dinâmicos se existir configuração
                      // Criar objeto de estilos apenas com propriedades definidas
                      const dynamicStyles = {}
                      
                      if (columnConfig && columnConfig.styles) {
                        const styles = columnConfig.styles
                        
                        // Aplicar backgroundColor apenas se estiver definido e não vazio
                        if (styles.backgroundColor && styles.backgroundColor.trim() !== '') {
                          dynamicStyles.backgroundColor = styles.backgroundColor
                        }
                        
                        // Aplicar color apenas se estiver definido e não vazio
                        if (styles.textColor && styles.textColor.trim() !== '') {
                          dynamicStyles.color = styles.textColor
                        }
                        
                        // Aplicar fontWeight apenas se não for 'normal'
                        if (styles.fontWeight && styles.fontWeight !== 'normal') {
                          dynamicStyles.fontWeight = styles.fontWeight
                        }
                        
                        // Aplicar fontStyle apenas se não for 'normal'
                        if (styles.fontStyle && styles.fontStyle !== 'normal') {
                          dynamicStyles.fontStyle = styles.fontStyle
                        }
                      }

                      // Criar uma classe adicional para estilos dinâmicos se necessário
                      // Usar o ID da coluna para aplicar estilos via CSS dinâmico
                      const hasDynamicStyles = columnConfig && columnConfig.styles && (
                        (columnConfig.styles.backgroundColor && columnConfig.styles.backgroundColor.trim() !== '') ||
                        (columnConfig.styles.textColor && columnConfig.styles.textColor.trim() !== '') ||
                        (columnConfig.styles.fontWeight && columnConfig.styles.fontWeight !== 'normal') ||
                        (columnConfig.styles.fontStyle && columnConfig.styles.fontStyle !== 'normal')
                      )
                      const dynamicClass = hasDynamicStyles && columnConfig ? `d1-dynamic-styled-${columnConfig.id}` : ''

                      const tdStyle = fixedInfo.isFixed ? {
                        position: 'sticky',
                        left: `${fixedInfo.left}px`,
                        zIndex: 9,
                        backgroundColor: '#ffffff',
                        boxShadow: fixedInfo.left > 0 ? '2px 0 4px rgba(0,0,0,0.1)' : 'none'
                      } : {}
                      
                      return (
                        <td 
                          key={colIndex} 
                          data-column={key}
                          style={tdStyle}
                        >
                          <div 
                            className={`${cellClasses} ${dynamicClass}`.trim()} 
                            style={Object.keys(dynamicStyles).length > 0 ? dynamicStyles : undefined}
                          >
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
      </div>

      {/* Mensagem de telefone */}
      {phoneMessage && (
        <div className={`d1-phone-message-overlay ${phoneMessage.includes('✅') ? 'success' : 'error'}`}>
          {phoneMessage}
        </div>
      )}
    </div>
  )
}

export default TableOverlay

