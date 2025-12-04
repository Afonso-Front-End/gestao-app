import React, { useEffect, useState } from 'react'
import { LiaPhoneSolid } from 'react-icons/lia'
import FileImport from './components/FileImport/FileImport'
import ListaTelefonesTable from './components/ListaTelefonesTable'
import PageHeader from './components/PageHeader'
import { PiPhoneListFill } from "react-icons/pi";
import { FaUserPlus } from "react-icons/fa";
import PaginationControls from './components/PaginationControls'
import TableOverlay from './components/TableOverlay/TableOverlay'
import CadastroMotoristaModal from './components/CadastroMotoristaModal/CadastroMotoristaModal'
import { useListaTelefones } from './hooks/useListaTelefones'
import { usePagination } from './hooks/usePagination'
import { useBasesMotoristas } from './hooks/useBasesMotoristas'
import { useNotification } from '../../contexts/NotificationContext'
import { buildApiUrl } from '../../utils/api-utils'
import './ListaTelefones.css'

const ListaTelefones = () => {
  const {
    listas,
    loading,
    hasLoaded,
    carregarListas,
    handleUploadSuccess,
    handleUploadError
  } = useListaTelefones()

  const {
    pagination,
    updatePagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious
  } = usePagination()

  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isCadastroModalOpen, setIsCadastroModalOpen] = useState(false)
  const { showSuccess, showError, showLoading, hideLoading } = useNotification()

  const {
    bases,
    loadingBases,
    motoristas,
    loadingMotoristas,
    baseSelecionada,
    setBaseSelecionada,
    busca,
    setBusca,
    carregarBases
  } = useBasesMotoristas()

  const handleOpenOverlay = async () => {
    // Abrir overlay primeiro (animação)
    setIsOverlayOpen(true)

    // Aguardar animação terminar antes de carregar dados
    // Animação do overlay: 0.4s + delay de 0.2s = 0.6s total
    await new Promise(resolve => setTimeout(resolve, 600))

    // Agora sim, carregar bases se necessário
    if (bases.length === 0) {
      carregarBases()
    }
  }

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false)
    setBaseSelecionada('')
    setBusca('')
  }

  const handleBaseChange = (base) => {
    setBaseSelecionada(base)
  }

  const handleBuscaChange = (valor) => {
    setBusca(valor)
  }

  const handleExportarBase = async (base, busca = '') => {
    const loadingId = showLoading('Gerando arquivo Excel...', 'Exportando')

    try {
      const url = busca
        ? buildApiUrl(`lista-telefones/exportar-base/${encodeURIComponent(base)}?busca=${encodeURIComponent(busca)}`)
        : buildApiUrl(`lista-telefones/exportar-base/${encodeURIComponent(base)}`)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `Lista_Telefones_${base.replace(/\s+/g, '_')}.xlsx`
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition)
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '')
        }
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      showSuccess(`✅ Arquivo Excel gerado e baixado com sucesso!\n\nArquivo: ${filename}`)
    } catch (error) {
      showError(`Erro ao exportar: ${error.message}`)
    } finally {
      hideLoading(loadingId)
    }
  }

  // Função para recarregar dados após upload
  const recarregarDados = async () => {
    const result = await carregarListas(1, false, pagination)
    if (result) {
      updatePagination(result.totalRegistros, 1)
    }
  }

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true
      carregarListas(1, true, pagination).then(result => {
        if (result) {
          updatePagination(result.totalRegistros, 1)
        }
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers para paginação
  const handlePageChange = async (page) => {
    goToPage(page)
    const result = await carregarListas(page, false, pagination)
    if (result) {
      updatePagination(result.totalRegistros, page)
    }
  }

  const handlePrevious = async () => {
    if (canGoPrevious) {
      const newPage = pagination.currentPage - 1
      await handlePageChange(newPage)
    }
  }

  const handleNext = async () => {
    if (canGoNext) {
      const newPage = pagination.currentPage + 1
      await handlePageChange(newPage)
    }
  }

  return (
    <div className="lista-telefones-page">
      <div className="lista-telefones-header-container">
        <div className="lista-telefones-header-content">
          <FileImport
            endpoint={buildApiUrl('lista-telefones/upload')}
            onSuccess={(result) => handleUploadSuccess(result, recarregarDados)}
            onError={handleUploadError}
          />
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="lista-telefones-buscar-base-button"
              onClick={handleOpenOverlay}
              title="Buscar motoristas por base"
            >
              <PiPhoneListFill size={20} />
            </button>
            <button
              className="lista-telefones-cadastrar-button"
              onClick={() => setIsCadastroModalOpen(true)}
              title="Cadastrar novo motorista"
            >
              <FaUserPlus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="lista-telefones-content">
        <ListaTelefonesTable
          data={listas}
          loading={loading}
          title="Lista de Telefones"
        />

        <PaginationControls
          pagination={pagination}
          loading={loading}
          onPageChange={handlePageChange}
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
        />
      </div>

      <TableOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        title={`Motoristas${baseSelecionada ? ` - ${baseSelecionada}` : ''}`}
        subtitle={baseSelecionada ? `Lista de motoristas da base ${baseSelecionada}` : 'Selecione uma base para ver os motoristas'}
        data={motoristas}
        emptyMessage="Nenhum motorista encontrado"
        filterColumns={false}
        bases={bases}
        loadingBases={loadingBases}
        baseSelecionada={baseSelecionada}
        onBaseChange={handleBaseChange}
        busca={busca}
        onBuscaChange={handleBuscaChange}
        loadingMotoristas={loadingMotoristas}
        onExportarBase={handleExportarBase}
      />

      <CadastroMotoristaModal
        isOpen={isCadastroModalOpen}
        onClose={() => setIsCadastroModalOpen(false)}
        onSuccess={recarregarDados}
      />
    </div>
  )
}

export default ListaTelefones