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
      let mensagem = `Olá ${motoristaNome}! Segue ${tipoPedidos}:\n\n`

      data.forEach((pedido, index) => {
        mensagem += `Pedido ${index + 1}:\n`
        mensagem += `• Número: ${pedido['Número de pedido JMS'] || pedido['Nº DO PEDIDO'] || pedido['NUMERO_PEDIDO'] || 'N/A'}\n`
        mensagem += `• Base: ${pedido['Base de Entrega'] || pedido['BASE'] || pedido['Base'] || baseName}\n`
        mensagem += `• Cidade Destino: ${pedido['Cidade Destino'] || pedido['Destinatário'] || 'N/A'}\n`
        mensagem += `• Destinatário: ${pedido['Destinatário'] || pedido['DESTINATÁRIO'] || 'N/A'}\n`
        mensagem += `• CEP: ${pedido['CEP destino'] || pedido['CEP'] || 'N/A'}\n`
        mensagem += `• Data Expedição: ${pedido['Data de Expedição'] || pedido['DATA DE EXPEDIÇÃO'] || pedido['Tempo de entrega'] || 'N/A'}\n\n`
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
      if (onError) {
        onError('Erro ao copiar dados formatados: ' + error.message)
      } else {
        showError('Erro ao copiar dados formatados: ' + error.message)
      }
    }
  }

  return (
    <button
      className={`copy-formatted-button ${className} ${size} ${variant}`}
      onClick={handleCopyFormattedData}
      title="Copiar dados formatados para WhatsApp"
    >
      <span><PiCopyThin size={23} /></span>
    </button>
  )
}

export default CopyFormattedButton
