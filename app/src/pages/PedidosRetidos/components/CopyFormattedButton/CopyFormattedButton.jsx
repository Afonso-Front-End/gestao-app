import React from 'react'
import './CopyFormattedButton.css'
import { PiCopyThin } from "react-icons/pi";
import { useNotification } from '../../../../contexts/NotificationContext';

const CopyFormattedButton = ({ 
  data = [], 
  overlayTitle = '', 
  overlayType = '', 
  baseName = '',
  onError = null,
  className = '',
  size = 'medium',
  variant = 'primary'
}) => {
  const { showSuccess, showError, showInfo } = useNotification()
  
  // Função para copiar dados formatados para WhatsApp

  const handleCopyFormattedData = async () => {
    try {
      if (!data || data.length === 0) {
        if (onError) {
          onError('Nenhum dado para copiar')
        } else {
          showInfo('Nenhum dado para copiar')
        }
        return
      }

      // Extrair nome do motorista do título
      let motoristaNome = 'Motorista'
      
      if (overlayTitle.includes('Motorista:')) {
        // Formato: "Motorista: NOME"
        motoristaNome = overlayTitle.split('Motorista: ')[1]
      } else if (overlayTitle.includes(' - ')) {
        // Formato: "Pedidos Não Entregues - NOME (detalhes)"
        const parts = overlayTitle.split(' - ')
        if (parts.length >= 2) {
          motoristaNome = parts[1].split(' (')[0] // Remove os detalhes entre parênteses
        }
      }
      

      // Determinar tipo de pedidos
      let tipoPedidos = 'pedidos'
      if (overlayType === 'entregues') {
        tipoPedidos = 'pedidos entregues'
      } else if (overlayType === 'nao_entregues') {
        tipoPedidos = 'pedidos em aberto'
      } else if (overlayType === 'galpao') {
        tipoPedidos = 'pedidos no galpão'
      }

      // Criar mensagem formatada
      let mensagem = ``
      data.forEach((pedido, index) => {
        // Buscar valores com fallbacks múltiplos
        const numero = pedido['Número de pedido JMS'] || pedido['Remessa'] || pedido['Nº DO PEDIDO'] || pedido['NUMERO_PEDIDO'] || pedido['NUMERO_DO_PEDIDO'] || pedido['Pedido'] || pedido['PEDIDO'] || 'N/A'
        const base = pedido['Base de Entrega'] || pedido['Base de entrega'] || pedido['BASE'] || pedido['Base'] || baseName
        const cidade = pedido['Cidade Destino'] || pedido['Cidade destino'] || pedido['Cidade'] || 'N/A'
        const destinatario = pedido['Destinatário'] || pedido['DESTINATÁRIO'] || 'N/A'
        const cep = pedido['CEP destino'] || pedido['CEP'] || 'N/A'
        
        // Horário da Última Operação (com fallbacks)
        const horarioUltimaOperacao = pedido['Horário da última operação'] || 
                                      pedido['HORARIO_ULTIMA_OPERACAO'] || 
                                      pedido['Data da última operação'] || 
                                      pedido['Data última operação'] || 
                                      pedido['Data Operacao'] || 
                                      pedido['Horário de saída para entrega'] ||
                                      'N/A'
        
        // Aging (com fallbacks)
        const aging = pedido['Aging'] || 
                     pedido['AGING'] || 
                     pedido['TEMPO DE RETENÇÃO'] || 
                     pedido['Tempo de Retenção'] ||
                     pedido['Tempo retido'] ||
                     'N/A'
        
        // Complemento (com fallbacks múltiplos)
        const complemento = pedido['Complemento'] ||
                            pedido['Complemento do Endereço'] ||
                            pedido['Complemento do endereco'] ||
                            pedido['COMPLEMENTO'] ||
                            pedido['Compl.'] ||
                            pedido['Compl'] ||
                            pedido['Complemento Endereço'] ||
                            pedido['Complemento endereco'] ||
                            pedido['Complemento End.'] ||
                            pedido['COMPLEMENTO ENDERECO'] ||
                            'N/A'
        
        mensagem += `Pedido ${index + 1}:\n`
        mensagem += `• Número: ${numero}\n`
        mensagem += `• Base: ${base}\n`
        mensagem += `• Cidade Destino: ${cidade}\n`
        mensagem += `• Destinatário: ${destinatario}\n`
        mensagem += `• CEP: ${cep}\n`
        mensagem += `• Horário da Última Operação: ${horarioUltimaOperacao}\n`
        mensagem += `• Aging: ${aging}\n`
        mensagem += `• Complemento: ${complemento}\n\n`
      })

      // Copiar para clipboard
      await navigator.clipboard.writeText(mensagem)
      
      if (onError) {
        // Se tem callback de erro, usar como callback de sucesso também
        onError(`Dados formatados copiados! ${data.length} pedidos formatados.`)
      } else {
        showSuccess(`Dados formatados copiados! ${data.length} pedidos formatados.`)
      }
    } catch (error) {
      console.error('Erro ao copiar dados formatados:', error)
      if (onError) {
        onError('Erro ao copiar dados formatados: ' + error.message)
      } else {
        showError('Erro ao copiar dados formatados: ' + error.message)
      }
    }
  }

  return (
    <button
      className={`pr-copy-formatted-btn ${className} ${size} ${variant}`}
      onClick={handleCopyFormattedData}
      title="Copiar dados formatados para WhatsApp"
    >
      <PiCopyThin />
    </button>
  )
}

export default CopyFormattedButton
