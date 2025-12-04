import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useConfig } from '../../contexts/ConfigContext'
import { FaTimes } from 'react-icons/fa'
import { RiFileExcel2Fill } from 'react-icons/ri'
import { IoHourglass, IoList } from 'react-icons/io5'
import { MdFolderDelete } from 'react-icons/md'
import FileImport from '../../pages/SLA/components/FileImport/FileImport'
import BaseSelector from '../../pages/SLA/components/BaseSelector/BaseSelector'
import CustomMessageButton from '../../pages/SLA/components/CustomMessageButton/CustomMessageButton'
import CustomMessageButtonD1 from '../../pages/D1/components/CustomMessageButton/CustomMessageButton'
import MultiSelect from '../../pages/PedidosRetidos/components/MultiSelect'
import FilterDropdown from '../../pages/PedidosRetidos/components/FilterDropdown/FilterDropdown'
import './ConfigModal.css'

const ConfigModal = ({ isOpen, onClose, triggerRef }) => {
  const location = useLocation()
  const { slaConfig, d1Config, pedidosRetidosConfig } = useConfig()
  const modalRef = useRef(null)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimeoutRef = useRef(null)

  const isSlaPage = location.pathname === '/sla' || location.pathname.startsWith('/sla/')
  const isD1Page = location.pathname === '/d1' || location.pathname.startsWith('/d1/')
  const isPedidosRetidosPage = location.pathname === '/pedidos-retidos' || location.pathname.startsWith('/pedidos-retidos/')

  useEffect(() => {
    if (isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsClosing(false)
    }
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }, [])

  const handleClose = useCallback(() => {
    if (isClosing) return

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    setIsClosing(true)

    closeTimeoutRef.current = setTimeout(() => {
      closeTimeoutRef.current = null
      setIsClosing(false)
      onClose()
    }, 300)
  }, [isClosing, onClose])

  if (!isOpen && !isClosing) return null

  return (
    <div 
      className={`config-modal-overlay ${isClosing ? 'fade-out' : 'fade-in'}`}
    >
      <div 
        ref={modalRef}
        className={`config-modal ${isClosing ? 'slide-down' : 'slide-up'}`}
      >
        <div className="config-modal-header">
          <div>
            <h2>Configurações</h2>
          </div>
          <button 
            className="config-modal-close" 
            onClick={handleClose}
            disabled={isClosing}
            title="Fechar"
          >
            <FaTimes />
          </button>
        </div>

        <div className="config-modal-content">
        {isSlaPage && slaConfig ? (
          <>
            {/* Primeira seção: Importar Dados SLA e Base Selector */}
            <div className="config-modal-section">
              <div className="config-modal-section-title">Importação e Processamento</div>
              <div className="config-modal-row">
                <div className="config-modal-item">
                  <p className="config-modal-import-description">
                    Importe a tabela de gestão de bases do sistema JMS.
                  </p>
                  <FileImport
                    endpoint="/sla/upload"
                    title="Importar Dados SLA"
                    onSuccess={slaConfig.onImportSuccess}
                    onError={slaConfig.onImportError}
                  />
                </div>
                <div className="config-modal-item">
                  <BaseSelector
                    selectedBases={slaConfig.selectedBases}
                    onBasesChange={slaConfig.onBasesChange}
                    onClearDataClick={slaConfig.onClearDataClick}
                    refreshTrigger={slaConfig.refreshTrigger}
                    triggerRefresh={slaConfig.triggerRefresh}
                  />
                </div>
              </div>
            </div>

            {/* Segunda seção: Upload Galpão e Custom Message */}
            <div className="config-modal-section">
              <div className="config-modal-section-title">Visualização e Ações</div>
              <div className="config-modal-row">
                {slaConfig.selectedProcessedBase ? (
                  <div className="config-modal-item">
                    <p className="config-modal-import-description">
                      Importe a tabela de entrada no galpão extraída do JMS - consulta das bipagens em tempo real.
                    </p>
                    <FileImport
                      endpoint={`/sla/galpao/upload/${encodeURIComponent(slaConfig.selectedProcessedBase)}`}
                      title="Upload Entradas Galpão"
                      onSuccess={(result) => {
                        slaConfig.triggerRefresh?.()
                        slaConfig.onImportSuccess?.(result)
                      }}
                      onError={slaConfig.onImportError}
                    />
                  </div>
                ) : (
                  <div className="config-modal-item config-modal-item-disabled">
                    <div className="sla-file-import disabled">
                      <div className="sla-import-container">
                        <div className="sla-file-input-wrapper">
                          <input
                            type="file"
                            disabled
                            className="sla-file-input"
                          />
                          <div className="sla-file-input-display">
                            <div className="sla-file-input-info">
                              <RiFileExcel2Fill className="sla-file-icon" />
                              <div className="sla-file-input-text">
                                <span className="sla-file-placeholder">
                                  Upload Entradas Galpão - Selecione uma base primeiro
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="config-modal-item">
                  <CustomMessageButton
                    onClick={() => {
                      handleClose()
                      slaConfig.onOpenCustomMessage?.()
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        ) : isD1Page && d1Config ? (
          <>
            {/* Seção Principal - Gestão de 1 Mês */}
            <div className="config-modal-section">
              <div className="config-modal-section-title">Gestão de 1 Mês</div>
              <div className="config-modal-row">
                <div className="config-modal-item">
                  <p className="config-modal-import-description">
                    Importe a tabela de gestão de 1 mês do sistema JMS.
                  </p>
                  <FileImport
                    endpoint={d1Config.gestaoEndpoint}
                    title="GESTÃO DE 1 MÊS"
                    acceptedFormats=".xlsx,.xls"
                    onSuccess={d1Config.onGestaoUploadSuccess}
                    onError={d1Config.onGestaoUploadError}
                  />
                </div>
                <div className="config-modal-item">
                  <FilterDropdown
                    label="Filtros de Busca"
                    badgeCount={d1Config.selectedBases?.length || 0}
                    closeOnOutsideClick={false}
                  >
                    <MultiSelect
                      selectedValues={d1Config.selectedBases || []}
                      setSelectedValues={d1Config.onBasesChange}
                      options={d1Config.availableBases || []}
                      placeholder="Todas as bases"
                      selectAllText="Selecionar Todas"
                      clearAllText="Limpar Todas"
                      allSelectedText="Todas as bases selecionadas"
                      showCount={true}
                      disabled={d1Config.basesLoading}
                      className="theme-green"
                    />
                    {d1Config.onDeleteD1Click && (
                      <div className="filter-dropdown-actions">
                        <button
                          onClick={d1Config.onDeleteD1Click}
                          className="filter-action-btn filter-action-btn--danger"
                          disabled={d1Config.deletingD1}
                          title="Deletar todos os dados de Gestão de 1 Mês"
                        >
                          {d1Config.deletingD1 ? (
                            <IoHourglass size={24} className="spinning" />
                          ) : (
                            <MdFolderDelete size={24} />
                          )}
                        </button>
                      </div>
                    )}
                  </FilterDropdown>
                </div>
              </div>
            </div>

            {/* Seção Secundária - Consulta em Tempo Real */}
            <div className="config-modal-section">
              <div className="config-modal-section-title">Consulta em Tempo Real</div>
              <div className="config-modal-row">
                <div className="config-modal-item">
                  <p className="config-modal-import-description">
                    Importe a tabela de bipagens consultadas em tempo real do sistema JMS.
                  </p>
                  <FileImport
                    endpoint={d1Config.bipagensEndpoint}
                    title="CONSULTADOS EM TEMPO REAL"
                    acceptedFormats=".xlsx,.xls"
                    onSuccess={d1Config.onBipagensUploadSuccess}
                    onError={d1Config.onBipagensUploadError}
                  />
                </div>
                <div className="config-modal-item">
                  <CustomMessageButtonD1
                    onClick={() => {
                      handleClose()
                      d1Config.onOpenCustomMessage?.()
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Seção de Lotes */}
            {d1Config.d1PedidosLotes && d1Config.d1PedidosLotes.length > 0 && (
              <div className="config-modal-section">
                <div className="config-modal-section-title">Lotes de Pedidos</div>
                <div className="config-modal-lotes-container">
                  <div className="config-modal-lotes-grid">
                    {d1Config.d1PedidosLotes.map((lote) => (
                      <div key={lote.numero_lote} className="config-modal-lote-card">
                        <button
                          className="config-modal-btn-copy-lote"
                          onClick={() => d1Config.copiarLoteD1?.(lote)}
                          title={`Copiar ${lote.total_pedidos} números de pedidos do lote ${lote.numero_lote}`}
                        >
                          <p>Copiar {lote.total_pedidos.toLocaleString('pt-BR')} pedidos</p>
                        </button>
                      </div>
                    ))}
                  </div>
                  {d1Config.setD1PedidosLotes && (
                    <button
                      className="config-modal-btn-close-lotes"
                      onClick={() => d1Config.setD1PedidosLotes?.([])}
                      title="Fechar lotes"
                    >
                      ✕ Fechar Lotes
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : isPedidosRetidosPage && pedidosRetidosConfig ? (
          <>
            {/* Seção Principal - Busca de Pedidos */}
            <div className="config-modal-section">
              <div className="config-modal-section-title">Busca de Pedidos</div>
              <div className="config-modal-row">
                <div className="config-modal-item">
                  <p className="config-modal-import-description">
                    Importe a tabela de pedidos retidos do sistema JMS.
                  </p>
                  <FileImport
                    endpoint={pedidosRetidosConfig.retidosEndpoint}
                    title="Retidos"
                    onSuccess={pedidosRetidosConfig.onRetidosSuccess}
                    onError={pedidosRetidosConfig.onRetidosError}
                  />
                </div>
                <div className="config-modal-item">
                  <FilterDropdown
                    label="Filtros de Busca"
                    badgeCount={(pedidosRetidosConfig.selectedBases?.length || 0) + 
                                 (pedidosRetidosConfig.selectedTipos?.length || 0) + 
                                 (pedidosRetidosConfig.selectedAging?.length || 0)}
                  >
                    <MultiSelect
                      selectedValues={pedidosRetidosConfig.selectedBases || []}
                      setSelectedValues={pedidosRetidosConfig.onBasesChange}
                      options={pedidosRetidosConfig.availableBases || []}
                      placeholder="Todas as bases"
                      selectAllText="Selecionar Todas"
                      clearAllText="Limpar Todas"
                      allSelectedText="Todas as bases selecionadas"
                      showCount={true}
                      disabled={pedidosRetidosConfig.basesLoading}
                      className="theme-blue"
                    />
                    <MultiSelect
                      selectedValues={pedidosRetidosConfig.selectedTipos || []}
                      setSelectedValues={pedidosRetidosConfig.onTiposChange}
                      options={pedidosRetidosConfig.availableTipos || []}
                      placeholder="Todos os tipos de operação"
                      selectAllText="Selecionar Todos"
                      clearAllText="Limpar Todos"
                      allSelectedText="Todos os tipos selecionados"
                      showCount={true}
                      disabled={pedidosRetidosConfig.tiposLoading}
                      className="theme-green"
                    />
                    <MultiSelect
                      selectedValues={pedidosRetidosConfig.selectedAging || []}
                      setSelectedValues={pedidosRetidosConfig.onAgingChange}
                      options={pedidosRetidosConfig.availableAging || []}
                      placeholder="Todos os aging"
                      selectAllText="Selecionar Todos"
                      clearAllText="Limpar Todos"
                      allSelectedText="Todos os aging selecionados"
                      showCount={true}
                      disabled={pedidosRetidosConfig.agingLoading}
                      className="theme-orange"
                    />
                    {pedidosRetidosConfig.onSearchPedidos && (
                      <div className="filter-dropdown-actions">
                        <button
                          className="filter-action-btn filter-action-btn--search"
                          onClick={pedidosRetidosConfig.onSearchPedidos}
                          disabled={pedidosRetidosConfig.pedidosLoading}
                        >
                          {pedidosRetidosConfig.pedidosLoading ? 'Buscando...' : 'Buscar Pedidos'}
                        </button>
                        {pedidosRetidosConfig.onDeleteLotes && (
                          <button
                            className="filter-action-btn filter-action-btn--delete"
                            onClick={pedidosRetidosConfig.onDeleteLotes}
                            disabled={pedidosRetidosConfig.deleteLotesLoading}
                            title="Excluir todos os lotes de pedidos buscados"
                          >
                            {pedidosRetidosConfig.deleteLotesLoading ? 'Excluindo...' : 'Excluir Lotes'}
                          </button>
                        )}
                      </div>
                    )}
                  </FilterDropdown>
                </div>
              </div>
            </div>

            {/* Seção Secundária - Processamento de Tabela */}
            <div className="config-modal-section">
              <div className="config-modal-section-title">Processamento de Tabela</div>
              <div className="config-modal-row">
                <div className="config-modal-item">
                  <p className="config-modal-import-description">
                    Importe a tabela de pedidos consultados do sistema JMS.
                  </p>
                  <FileImport
                    endpoint={pedidosRetidosConfig.consultadosEndpoint}
                    title="Consultados"
                    disabled={!pedidosRetidosConfig.hasPedidosData}
                    onSuccess={pedidosRetidosConfig.onConsultadosSuccess}
                    onError={pedidosRetidosConfig.onConsultadosError}
                  />
                </div>
              </div>
            </div>

            {/* Seção de Lotes */}
            {pedidosRetidosConfig.pedidosLotes && pedidosRetidosConfig.pedidosLotes.length > 0 && (
              <div className="config-modal-section">
                <div className="config-modal-section-title">Lotes de Pedidos</div>
                <div className="config-modal-lotes-container">
                  <div className="config-modal-lotes-grid">
                    {pedidosRetidosConfig.pedidosLotes.map((lote) => (
                      <div key={lote.numero_lote} className="config-modal-lote-card">
                        <button
                          className="config-modal-btn-copy-lote"
                          onClick={() => pedidosRetidosConfig.copiarLote?.(lote)}
                          title={`Copiar ${lote.total_pedidos} números de pedidos do lote ${lote.numero_lote}`}
                        >
                          <p>Copiar {lote.total_pedidos} pedidos</p>
                        </button>
                      </div>
                    ))}
                  </div>
                  {pedidosRetidosConfig.setPedidosLotes && (
                    <button
                      className="config-modal-btn-close-lotes"
                      onClick={() => pedidosRetidosConfig.setPedidosLotes?.([])}
                      title="Fechar lotes"
                    >
                      ✕ Fechar Lotes
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="config-modal-default">
            <p>Nenhuma configuração específica disponível para esta página.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default ConfigModal

