import React, { useState, useEffect, useRef } from 'react'
import { BsCopy } from "react-icons/bs"
import { FaCheck, FaTimes } from 'react-icons/fa'
import { FaFileExcel } from 'react-icons/fa'
import WhatsAppButton from '../../components/WhatsAppButton/WhatsAppButton'
import CopyFormattedButton from '../CopyFormattedButton/CopyFormattedButton'
import PhoneInput from '../PhoneInput/PhoneInput'
import ScreenshotButton from '../ScreenshotButton/ScreenshotButton'
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
  isLoading = false // Se está carregando dados
}) => {
  const [isClosing, setIsClosing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoadingPhone, setIsLoadingPhone] = useState(false)
  const [phoneMessage, setPhoneMessage] = useState('')
  const [showTable, setShowTable] = useState(false)
  const tableWrapperRef = useRef(null) // Ref para o wrapper (usado para outras funcionalidades)
  const tableRef = useRef(null) // Ref para capturar diretamente a tabela
  const closeTimeoutRef = useRef(null) // Ref para armazenar timeout de fechamento
  const { showSuccess, showError, showInfo } = useNotification()

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

  // Cleanup ao desmontar - CRÍTICO para evitar memory leaks
  useEffect(() => {
    return () => {
      // Limpar todos os timeouts pendentes
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      
      // Limpar estados se componente desmontar durante fechamento
      setIsClosing(false)
      setShowTable(false)
      setPhoneNumber('')
      setPhoneMessage('')
      setIsLoadingPhone(false)
    }
  }, [])

  // Preencher input quando telefone inicial mudar OU quando telefoneMotorista mudar
  useEffect(() => {
    const telefoneParaUsar = telefoneMotorista || telefoneInicial

    if (isOpen && telefoneParaUsar && telefoneParaUsar.trim() !== '') {
      // Só atualiza se for diferente do valor atual
      if (telefoneParaUsar.trim() !== phoneNumber.trim()) {
        setPhoneNumber(telefoneParaUsar.trim())
      }
    } else if (isOpen && phoneNumber && !telefoneParaUsar) {
      // Se telefone foi limpo e overlay está aberto, limpar input também
      setPhoneNumber('')
    }
  }, [telefoneInicial, telefoneMotorista, isOpen])

  // Resetar phoneNumber e estados quando overlay fechar completamente
  useEffect(() => {
    if (!isOpen && !isClosing) {
      setPhoneNumber('')
      setPhoneMessage('')
      setIsLoadingPhone(false)
      setShowTable(false)
    }
  }, [isOpen, isClosing])

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

    if (data && data.length > 0) {
      // Delay para mostrar loading primeiro, depois mostrar dados
      const timer = setTimeout(() => {
        setShowTable(true)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShowTable(false)
    }
  }, [isOpen, isLoading, data, isClosing])


  const handleClose = () => {
    // Previne múltiplas execuções
    if (isClosing) {
      console.warn('⚠️ Overlay já está fechando, ignorando clique adicional')
      return
    }

    // Limpar timeout anterior se houver
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    // Limpar estados de telefone imediatamente
    setPhoneNumber('')
    setPhoneMessage('')
    setIsLoadingPhone(false)
    
    setIsClosing(true)
    setShowTable(false) // Esconder tabela imediatamente ao fechar
    
    // Aguardar a animação terminar antes de chamar onClose (300ms da animação slideDown)
    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null
      setIsClosing(false)
      
      // Chamar onClose apenas se ainda não foi chamado
      if (onClose) {
        onClose()
      }
    }, 300)
  }

  // Função para adicionar telefone (Confirmar)
  const handleAddPhone = async (e) => {
    e.preventDefault()

    // Extrair valor numérico do input (sem formatação)
    // Primeiro tenta pegar do atributo data-numeric-value do DOM
    const inputElement = document.querySelector('.table-overlay-pr-overlay-phone-input')
    let numericValue = inputElement?.getAttribute('data-numeric-value') || ''
    
    // Se não encontrou no DOM, extrai números do phoneNumber (estado)
    if (!numericValue || numericValue.trim() === '') {
      // Remove todos os caracteres não numéricos do phoneNumber
      numericValue = phoneNumber.replace(/\D/g, '')
    }
    
    // Validação: verifica se há números
    if (!numericValue || numericValue.trim() === '' || numericValue.length === 0) {
      showError('Por favor, digite um número de telefone')
      return
    }

    // Validação: verifica tamanho mínimo
    if (numericValue.length < 10) {
      showError('Telefone deve ter pelo menos 10 dígitos')
      return
    }

    // Validação: verifica se motorista está definido
    if (!motorista || motorista.trim() === '') {
      showError('Nome do motorista não foi informado. Não é possível adicionar telefone.')
      return
    }

    // Validação: verifica se baseName está definido
    if (!baseName || baseName.trim() === '') {
      showError('Base não foi informada. Não é possível adicionar telefone.')
      return
    }

    setIsLoadingPhone(true)

    try {
      const { getApiHeaders } = await import('../../../../utils/api-headers')
      const headers = {
        'Content-Type': 'application/json',
        ...getApiHeaders()
      }
      
      // Construir URL com validação
      const motoristaEncoded = encodeURIComponent(motorista.trim())
      const baseNameEncoded = encodeURIComponent(baseName.trim())
      const telefoneEncoded = encodeURIComponent(numericValue)
      
      const url = `/api/lista-telefones/motorista/${motoristaEncoded}/telefone?base_name=${baseNameEncoded}&telefone=${telefoneEncoded}`
      
      // Debug em desenvolvimento
      if (import.meta.env.DEV) {
        console.log('🔍 Adicionando telefone:', {
          motorista: motorista.trim(),
          baseName: baseName.trim(),
          telefone: numericValue,
          url
        })
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers
      })

      // Verificar se a resposta foi bem-sucedida
      if (!response.ok) {
        let errorMessage = `Erro HTTP ${response.status}`
        
        // Tentar obter mensagem de erro do backend
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // Se não conseguir parsear JSON, usar statusText
          errorMessage = response.statusText || errorMessage
        }
        
        if (response.status === 404) {
          showError(`Endpoint não encontrado (404). URL: ${url}\nVerifique se o backend está rodando e a rota está configurada corretamente.`)
        } else if (response.status === 400) {
          showError('Dados inválidos: ' + errorMessage)
        } else {
          showError('Erro ao adicionar telefone: ' + errorMessage)
        }
        return
      }

      const data = await response.json()

      if (data.success) {
        showSuccess('Telefone adicionado com sucesso!')
        setPhoneNumber('')

        // Chamar callback se fornecido
        if (onTelefoneAdicionado) {
          onTelefoneAdicionado(numericValue)
        }
      } else {
        showError('Erro ao adicionar telefone: ' + (data.detail || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Erro ao adicionar telefone:', error)
      if (error.message.includes('404')) {
        showError('Endpoint não encontrado. Verifique se o backend está rodando.')
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        showError('Erro de conexão. Verifique se o backend está acessível.')
      } else {
        showError('Erro ao adicionar telefone: ' + error.message)
      }
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
    
    // Se for um elemento React, tentar extrair texto dos children
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

  // Função para gerar Excel
  const handleGerarExcel = () => {
    if (!data || data.length === 0) {
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
        // Tentar extrair do título: "Pedidos do Motorista: NOME" ou "Pedidos NÃO ENTREGUES - NOME"
        const match = titleText.match(/(?:Motorista:\s*|-\s*)([^-|:]+)/i)
        if (match && match[1]) {
          nomeMotorista = match[1].trim()
        }
      }
    }
    
    // Se ainda não tiver, tentar extrair dos dados (campo Motorista ou responsavel)
    if (!nomeMotorista || nomeMotorista.trim() === '') {
      const primeiroPedido = data[0]
      if (primeiroPedido) {
        nomeMotorista = primeiroPedido.Motorista || primeiroPedido.motorista || primeiroPedido.responsavel || primeiroPedido.RESPONSÁVEL || primeiroPedido['Motorista'] || ''
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
    
    gerarExcelTabela(data, finalColumns, filename, showSuccess, showError)
  }

  // Se não foram definidas colunas, usar as chaves do primeiro item
  const tableColumns = data && data.length > 0 && data[0] ? Object.keys(data[0]) : []


  // Filtrar colunas desnecessárias - mostrar apenas as essenciais
  const filteredColumns = (() => {
    // Se foram passadas colunas específicas, usar apenas essas
    if (columns && columns.length > 0) {
      return columns
    }

    // Se não deve filtrar colunas, mostrar todas
    if (!filterColumns) {
      return tableColumns
    }

    // Filtrar colunas essenciais (padrão)
    return tableColumns.filter(col => {
      const key = typeof col === 'string' ? col : col.key
      // Colunas essenciais para SLA
      return key === 'Número de pedido JMS' ||
        key === 'Remessa' ||
        key === 'Destinatário' ||
        key === 'Cidade Destino' ||
        key === 'Tempo de entrega' ||
        key === 'Marca de assinatura' ||
        key === 'CEP destino' ||
        // Colunas para Pedidos Retidos
        key === 'Nº DO PEDIDO' ||
        key === 'NUMERO_PEDIDO' ||
        key === 'DESTINATÁRIO' ||
        key === 'BASE' ||
        key === 'Base de entrega' ||
        key === 'Base de Entrega' ||
        key === 'TEMPO DE RETENÇÃO' ||
        key === 'Tempo de Retenção' ||
        key === 'DATA DE EXPEDIÇÃO' ||
        key === 'Data de Expedição' ||
        key === 'CEP' ||
        key === 'Motorista' ||
        key === 'Unidade responsável' ||
        key === 'Base'
    })
  })()

  // Adicionar coluna de copiar logo após "Número do Pedido" se a função for fornecida
  const finalColumns = onCopyPedido ? (() => {
    const pedidoIndex = filteredColumns.findIndex(col => {
      const key = typeof col === 'string' ? col : col.key
      return key === 'numero_pedido' ||
        key === 'Nº DO PEDIDO' ||
        key === 'NUMERO_PEDIDO' ||
        key === 'Número de pedido JMS' ||
        key === 'Remessa' ||
        key === 'Número do Pedido'
    })

    if (pedidoIndex !== -1) {
      // Inserir coluna de copiar após a coluna do pedido
      const newColumns = [...filteredColumns]
      newColumns.splice(pedidoIndex + 1, 0, { key: 'copy', header: 'Copiar' })
      return newColumns
    } else {
      // Se não encontrar a coluna do pedido, adicionar no final
      return [...filteredColumns, { key: 'copy', header: 'Copiar' }]
    }
    })() : filteredColumns

  if (!isOpen && !isClosing) {
    return null
  }

  return (
    <div 
      className={`table-overlay-pr-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`} 
      onClick={handleClose}
      style={{ pointerEvents: isClosing ? 'none' : 'auto' }} // Desabilita cliques durante fechamento
    >
      <div 
        className={`table-overlay-pr-overlay-container ${isClosing ? 'slide-down' : 'slide-up'}`} 
        onClick={(e) => e.stopPropagation()}
        >
          <div className="table-overlay-pr-overlay-header">
            <div className="table-overlay-pr-overlay-title-section">
              <h2>
                {title && title.trim() !== '' 
                  ? title 
                  : motorista && motorista.trim() !== ''
                    ? `Pedidos do Motorista: ${motorista}`
                    : 'Pedidos'}
              </h2>
              {subtitle && <div className="table-overlay-pr-overlay-subtitle">{subtitle}</div>}
            </div>
            {showAddPhone && (
              <div className="table-overlay-pr-phone-input-container">
                <PhoneInput
                  value={phoneNumber}
                  onChange={(e) => {
                    // Atualizar o estado phoneNumber quando o usuário digitar
                    const inputValue = e.target.value
                    // Extrair apenas números para armazenar no estado
                    const numericOnly = inputValue.replace(/\D/g, '')
                    // Atualizar com o valor formatado (o PhoneInput já formata)
                    setPhoneNumber(inputValue)
                  }}
                  placeholder="Digite o telefone"
                  disabled={isLoadingPhone}
                  maxLength={11}
                  className="table-overlay-pr-overlay-phone-input"
                />
                <button
                  className="table-overlay-pr-overlay-add-phone-button"
                  onClick={handleAddPhone}
                  disabled={isLoadingPhone}
                  title="Confirmar e adicionar telefone"
                >
                  {isLoadingPhone ? (
                    <div className="table-overlay-pr-phone-spinner"></div>
                  ) : (
                    <FaCheck size={20} />
                  )}
                </button>
                <button
                  className="table-overlay-pr-overlay-clear-phone-button"
                  onClick={handleCancelPhone}
                  disabled={isLoadingPhone}
                  title="Cancelar e limpar telefone"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            )}
            <div className="table-overlay-pr-overlay-actions">
              {onCopyAllPedidos && (
                <button
                  className="table-overlay-pr-overlay-copy-all-button"
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
                  className="table-overlay-pr-overlay-copy-formatted-button"
                  size="medium"
                  variant="primary"
                />
              )}

              {showWhatsApp && (
                <WhatsAppButton
                  phoneNumber={telefoneMotorista || ""}
                  message=""
                  motorista={motorista}
                  base={baseName}
                  quantidade={data?.length || 0}
                  pedidosData={data || []}
                  messageType="presentation"
                  className="table-overlay-pr-overlay-whatsapp-button"
                  size="medium"
                  variant="primary"
                  onError={(error) => {
                    showError(`Erro: ${error}`)
                  }}
                />
              )}
              <button
                className="table-overlay-pr-overlay-excel-button"
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
              <button className="table-overlay-pr-overlay-close-btn" onClick={handleClose}>✕</button>
            </div>
          </div>

          <div className="table-overlay-pr-overlay-table-wrapper" ref={tableWrapperRef}>
            {isLoading || !showTable ? (
              <div className="table-overlay-pr-overlay-loading">
                <div className="table-overlay-pr-overlay-spinner"></div>
                <p>Carregando pedidos...</p>
              </div>
            ) : (!data || data.length === 0) ? (
              <div className="table-overlay-pr-overlay-empty-message">
                <p>{emptyMessage}</p>
              </div>
            ) : (
              <table className={`table-overlay-pr-overlay-table ${showTable ? 'table-overlay-pr-table-fade-in' : ''}`} ref={tableRef}>
                <thead>
                  <tr>
                    {finalColumns.map((column, index) => (
                      <th key={index}>
                        {typeof column === 'string' ? column : column.header || column.key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {finalColumns.map((column, colIndex) => {
                        const key = typeof column === 'string' ? column : column.key
                        // Se for a coluna de copiar
                        if (key === 'copy') {
                          return (
                            <td key={colIndex} className="table-overlay-pr-copy-cell">
                              <span>
                                <button
                                  className="table-overlay-pr-overlay-copy-button"
                                  onClick={() => onCopyPedido(row)}
                                  title="Copiar número do pedido"
                                >
                                  < BsCopy />
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

                        // Debug específico para campo Remessa


                        // Função para determinar classes CSS baseadas no conteúdo
                        const getCellClasses = (key, value) => {
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
                        }

                        const cellClasses = getCellClasses(key, value)

                        return (
                          <td key={colIndex} data-column={key}>
                            <div className={cellClasses}>
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
        <div className={`table-overlay-pr-phone-message-overlay ${phoneMessage.includes('✅') ? 'success' : 'error'}`}>
          {phoneMessage}
        </div>
      )}
    </div>
  )
}

export default TableOverlay

