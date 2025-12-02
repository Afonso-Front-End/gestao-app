import React, { useState, useEffect, useRef } from 'react'
import { IoCopySharp } from "react-icons/io5"
import { BsCopy } from "react-icons/bs"
import { FaPlus, FaCheck, FaTimes } from 'react-icons/fa'
import ScreenshotButton from '../ScreenshotButton/ScreenshotButton'
import WhatsAppButton from '../../../SLA/components/WhatsAppButton/WhatsAppButton'
import CopyFormattedButton from '../../../SLA/components/CopyFormattedButton/CopyFormattedButton'
import PhoneInput from '../PhoneInput/PhoneInput'
import { useNotification } from '../../../../contexts/NotificationContext'
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
  onScreenshot = null, // Função para capturar screenshot
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
  // Props para busca por base
  bases = [],
  loadingBases = false,
  baseSelecionada = '',
  onBaseChange = null,
  busca = '',
  onBuscaChange = null,
  loadingMotoristas = false,
  onExportarBase = null
}) => {
  const [isClosing, setIsClosing] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoadingPhone, setIsLoadingPhone] = useState(false)
  const [phoneMessage, setPhoneMessage] = useState('')
  const [exportando, setExportando] = useState(false)
  const tableRef = useRef(null)
  const { showSuccess, showError, showInfo } = useNotification()

  const handleExportar = async () => {
    if (!baseSelecionada || exportando) return
    
    setExportando(true)
    try {
      if (onExportarBase) {
        await onExportarBase(baseSelecionada, busca)
      }
    } catch (error) {
    } finally {
      setExportando(false)
    }
  }


  // Preencher input quando telefone inicial mudar
  useEffect(() => {
    if (telefoneInicial && telefoneInicial !== phoneNumber) {
      setPhoneNumber(telefoneInicial)
    }
  }, [telefoneInicial])

  const handleClose = () => {
    if (isClosing) return // Previne múltiplas execuções

    setIsClosing(true)
    // Aguardar a animação terminar antes de chamar onClose
    setTimeout(() => {
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
      const { getApiHeaders } = await import('../../../../utils/api-headers')
      const headers = {
        'Content-Type': 'application/json',
        ...getApiHeaders()
      }
      
      const response = await fetch(`/api/lista-telefones/motorista/${encodeURIComponent(motorista)}/telefone?base_name=${encodeURIComponent(baseName)}&telefone=${encodeURIComponent(phoneNumber)}`, {
        method: 'POST',
        headers
      })

      const data = await response.json()

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

  if (!isOpen) return null

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
        key === 'Base de Entrega' ||
        key === 'TEMPO DE RETENÇÃO' ||
        key === 'Tempo de Retenção' ||
        key === 'DATA DE EXPEDIÇÃO' ||
        key === 'Data de Expedição' ||
        key === 'CEP' ||
        key === 'Motorista' ||
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


  return (
    <div className={`lista-telefones-overlay-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`} onClick={handleClose}>
      <div className={`lista-telefones-overlay-container ${isClosing ? 'slide-down' : 'slide-up'}`} onClick={(e) => e.stopPropagation()}>
        <div className="lista-telefones-overlay-header">
          <div className="lista-telefones-overlay-title-section">
            <h2>{title}</h2>
            {subtitle && <p className="lista-telefones-overlay-subtitle">{subtitle}</p>}
            
            {/* Seção de busca por base - abaixo dos títulos */}
            {(bases.length > 0 || loadingBases || onBaseChange) && (
              <div className="lista-telefones-overlay-base-search-container">
                <div className="lista-telefones-overlay-base-select-wrapper">
                  <label htmlFor="base-select" className="lista-telefones-overlay-base-label">Base:</label>
                  <select
                    id="base-select"
                    className="lista-telefones-overlay-base-select"
                    value={baseSelecionada}
                    onChange={(e) => onBaseChange && onBaseChange(e.target.value)}
                    disabled={loadingBases}
                  >
                    <option value="">
                      {loadingBases ? 'Carregando bases...' : 'Selecione uma base'}
                    </option>
                    {bases.map((base, index) => (
                      <option key={index} value={base}>
                        {base}
                      </option>
                    ))}
                  </select>
                </div>
                
                {baseSelecionada && (
                  <div className="lista-telefones-overlay-search-input-wrapper">
                    <label htmlFor="busca-input" className="lista-telefones-overlay-search-label">Buscar:</label>
                    <input
                      id="busca-input"
                      type="text"
                      className="lista-telefones-overlay-search-input"
                      placeholder="Nome do motorista ou telefone..."
                      value={busca}
                      onChange={(e) => onBuscaChange && onBuscaChange(e.target.value)}
                      disabled={loadingMotoristas}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          {showAddPhone && (
            <div className="lista-telefones-phone-input-container">
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                placeholder="Digite o telefone"
                disabled={isLoadingPhone}
                maxLength={11}
                className="lista-telefones-overlay-phone-input"
              />
              <button
                className="lista-telefones-overlay-add-phone-button"
                onClick={handleAddPhone}
                disabled={isLoadingPhone || !phoneNumber.trim()}
                title="Adicionar telefone"
              >
                {isLoadingPhone ? (
                  <div className="lista-telefones-phone-spinner"></div>
                ) : (
                  <FaCheck />
                )}
              </button>
              {phoneNumber && (
                <button
                  className="lista-telefones-overlay-clear-phone-button"
                  onClick={handleClearPhone}
                  title="Limpar telefone"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          )}
          <div className="lista-telefones-overlay-actions">
            {onCopyAllPedidos && (
              <button
                className="lista-telefones-overlay-copy-all-button"
                onClick={onCopyAllPedidos}
                title="Copiar todos os números de pedidos desta tabela"
              >
                Copy All Numbers JMS
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
                className="lista-telefones-overlay-copy-formatted-button"
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
                className="lista-telefones-overlay-whatsapp-button"
                size="medium"
                variant="primary"
                onError={(error) => {
                  showError(`Erro: ${error}`)
                }}
              />
            )}
            {baseSelecionada && data && data.length > 0 && onExportarBase && (
              <button
                className="lista-telefones-overlay-export-button"
                onClick={handleExportar}
                disabled={exportando || loadingMotoristas}
                title="Exportar tabela para Excel"
              >
                {exportando ? '⏳ Exportando...' : '📥 Exportar Excel'}
              </button>
            )}
            <ScreenshotButton
              targetRef={tableRef}
              filename={`tabela-${title.replace(/\s+/g, '-').toLowerCase()}`}
              onSuccess={(message) => onScreenshot && onScreenshot(true, message)}
              onError={(message) => onScreenshot && onScreenshot(false, message)}
              title="Capturar screenshot da tabela"
              size="medium"
            />
            <button className="lista-telefones-overlay-close-btn" onClick={handleClose}>✕</button>
          </div>
        </div>

        <div className="lista-telefones-overlay-table-wrapper">
          {loadingMotoristas ? (
            <div className="lista-telefones-overlay-loading">
              <div className="lista-telefones-overlay-spinner"></div>
              <p>Carregando motoristas...</p>
            </div>
          ) : (!data || data.length === 0) ? (
            <div className="lista-telefones-overlay-empty-message">
              <p>
                {baseSelecionada 
                  ? (busca ? `Nenhum motorista encontrado para "${busca}" na base ${baseSelecionada}` : `Nenhum motorista encontrado para a base ${baseSelecionada}`)
                  : emptyMessage}
              </p>
            </div>
          ) : (
            <table className="lista-telefones-overlay-table" ref={tableRef}>
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
                          <td key={colIndex} className="lista-telefones-copy-cell">
                            <span>
                              <button
                                className="lista-telefones-overlay-copy-button"
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

                      return (
                        <td key={colIndex} data-column={key}>
                          <div className={cellClasses} style={{ 
                            display: 'block',
                            width: '100%',
                            minHeight: '20px',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap'
                          }}>
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
        <div className={`lista-telefones-phone-message-overlay ${phoneMessage.includes('✅') ? 'success' : 'error'}`}>
          {phoneMessage}
        </div>
      )}
    </div>
  )
}

export default TableOverlay

