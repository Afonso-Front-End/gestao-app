import React from 'react'
import './WhatsAppButton.css'
import { FaWhatsapp } from "react-icons/fa";
import { useNotification } from '../../../../contexts/NotificationContext';

const WhatsAppButton = ({ 
  phoneNumber, 
  message, 
  motorista, 
  base, 
  quantidade,
  pedidosData = [], // Dados dos pedidos retidos
  messageType = 'detailed', // 'presentation', 'detailed' ou 'followup'
  className = '',
  size = 'medium',
  variant = 'primary',
  onError = null // Função para mostrar erro (opcional)
}) => {
  const { showError, showSuccess } = useNotification()
  // Função para formatar número de telefone (remove caracteres especiais)
  const formatPhoneNumber = (phone) => {
    if (!phone) return ''
    // Remove todos os caracteres não numéricos
    return phone.replace(/\D/g, '')
  }
  // Helper para encontrar "Complemento" em diferentes variações de chave
  const findComplemento = (pedido) => {
    if (!pedido || typeof pedido !== 'object') return ''
    const direct = (
      pedido['Complemento'] ||
      pedido['Complemento do Endereço'] ||
      pedido['Complemento do endereco'] ||
      pedido['COMPLEMENTO'] ||
      pedido['Compl.'] ||
      pedido['Compl'] ||
      pedido['Complemento Endereço'] ||
      pedido['Complemento endereco'] ||
      pedido['Complemento End.'] ||
      pedido['COMPLEMENTO ENDERECO'] ||
      ''
    )
    if (direct) return direct
    // Busca por qualquer chave que contenha 'complement' (case-insensitive)
    try {
      const entry = Object.keys(pedido).find(k => k && k.toString().toLowerCase().includes('complement'))
      if (entry) return pedido[entry]
    } catch {}
    return ''
  }

  // Função para formatar mensagem de apresentação
  const getPresentationMessage = () => {
    let message = `Olá ${motorista || ''}! 👋

Meu nome é Afonso e sou da *Torre de Controle J&T Express*.
Estarei te enviando pedidos parados em seu nome na base ${base || ''} com todas as informações necessárias para facilitar o atendimento.

`

    // Adicionar dados dos pedidos se disponíveis
    if (pedidosData && pedidosData.length > 0) {
      message += `Aqui estão os ${(quantidade ?? pedidosData.length)} pedido(s) que precisam da sua atenção:

`
      
      pedidosData.forEach((pedido, index) => {
        const numero =
          pedido['Remessa'] || pedido['Número de pedido JMS'] || pedido['Nº DO PEDIDO'] ||
          pedido['NUMERO_PEDIDO'] || pedido['NUMERO_DO_PEDIDO'] || pedido['Pedido'] || pedido['PEDIDO'] || 'N/A'
        const cidade = pedido['Cidade Destino'] || pedido['Cidade destino'] || pedido['Cidade'] || 'N/A'
        const destinatario = pedido['Destinatário'] || pedido['DESTINATÁRIO'] || 'N/A'
        const cep = pedido['CEP destino'] || pedido['CEP'] || 'N/A'
        const status = pedido['Marca de assinatura'] || pedido['Status'] || pedido['Situacao'] || 'N/A'
        const tempo = pedido['Aging'] || pedido['AGING'] || 'N/A'
        const horario = pedido['Horário da última operação'] || pedido['HORARIO_ULTIMA_OPERACAO'] || pedido['Data da última operação'] || 'N/A'
        const complemento = findComplemento(pedido) || 'N/A'
        message += `📦 Pedido ${index + 1}:
• Número: ${numero}
• Tempo retido: ${tempo}
• Horário de saída para entrega: ${horario}
• Cidade Destino: ${cidade}
• Destinatário: ${destinatario}
• CEP: ${cep}
• Status: ${status}
• Complemento: ${complemento}

`
      })
    }

    message += `Atenciosamente,
Afonso
Torre de controle J&T Express`

    return message
  }

  // Função para formatar mensagem de acompanhamento (quando já tem relacionamento)
  const getFollowUpMessage = () => {
    if (motorista && base && quantidade) {
      let message = ` 

Esses são os pedidos retidos que precisam da sua atenção:

`

      // Adicionar detalhes de cada pedido
      if (pedidosData && pedidosData.length > 0) {
        pedidosData.forEach((pedido, index) => {
          const numero =
            pedido['Remessa'] || pedido['Número de pedido JMS'] || pedido['Nº DO PEDIDO'] ||
            pedido['NUMERO_PEDIDO'] || pedido['NUMERO_DO_PEDIDO'] || pedido['Pedido'] || pedido['PEDIDO'] || 'N/A'
          const baseEntrega = pedido['Base de Entrega'] || pedido['Base de entrega'] || pedido['BASE'] || base
          const cidade = pedido['Cidade Destino'] || pedido['Cidade destino'] || pedido['Cidade'] || 'N/A'
          const destinatario = pedido['DESTINATÁRIO'] || pedido['Destinatário'] || 'N/A'
          const cep = pedido['CEP'] || pedido['CEP destino'] || 'N/A'
          const tempo = pedido['TEMPO DE RETENÇÃO'] || pedido['Tempo de Retenção'] || 'N/A'
          const dataExp = pedido['DATA DE EXPEDIÇÃO'] || pedido['Data de Expedição'] || 'N/A'
          const aging = pedido['Aging'] || pedido['AGING'] || tempo
          const horario = pedido['Horário da última operação'] || pedido['HORARIO_ULTIMA_OPERACAO'] || pedido['Data da última operação'] || 'N/A'
          const complemento = findComplemento(pedido) || 'N/A'
          message += `📦 Pedido ${index + 1}:
• Número: ${numero}
• Base: ${baseEntrega}
• Tempo retido: ${aging}
• Horário de saída para entrega: ${horario}
• Cidade Destino: ${cidade}
• Destinatário: ${destinatario}
• CEP: ${cep}
• Tempo de Retenção: ${tempo}
• Data Expedição: ${dataExp}
• Complemento: ${complemento}

`
        })
      } else {
        message += `📦 Detalhes dos pedidos serão enviados em breve.

`
      }

      message += `Pode verificar quando der? 

Valeu! 👍`

      return message
    }
    return message || 'Oi! Temos alguns pedidos para você verificar.'
  }

  // Função para formatar mensagem detalhada (primeira vez com detalhes)
  const getDetailedMessage = () => {
    if (motorista && base && quantidade) {
      let message = `Olá ${motorista}! 

Temos ${quantidade} pedido(s) retido(s) que precisam da sua atenção:

`

      // Adicionar detalhes de cada pedido
      if (pedidosData && pedidosData.length > 0) {
        pedidosData.forEach((pedido, index) => {
          const numero =
            pedido['Remessa'] || pedido['Número de pedido JMS'] || pedido['Nº DO PEDIDO'] ||
            pedido['NUMERO_PEDIDO'] || pedido['NUMERO_DO_PEDIDO'] || pedido['Pedido'] || pedido['PEDIDO'] || 'N/A'
          const baseEntrega = pedido['Base de Entrega'] || pedido['Base de entrega'] || pedido['BASE'] || base
          const cidade = pedido['Cidade Destino'] || pedido['Cidade destino'] || pedido['Cidade'] || 'N/A'
          const destinatario = pedido['DESTINATÁRIO'] || pedido['Destinatário'] || 'N/A'
          const cep = pedido['CEP'] || pedido['CEP destino'] || 'N/A'
          const tempo = pedido['TEMPO DE RETENÇÃO'] || pedido['Tempo de Retenção'] || 'N/A'
          const dataExp = pedido['DATA DE EXPEDIÇÃO'] || pedido['Data de Expedição'] || 'N/A'
          const aging = pedido['Aging'] || pedido['AGING'] || tempo
          const horario = pedido['Horário da última operação'] || pedido['HORARIO_ULTIMA_OPERACAO'] || pedido['Data da última operação'] || 'N/A'
          const complemento = findComplemento(pedido) || 'N/A'
          message += `📦 Pedido ${index + 1}:
• Número: ${numero}
• Base: ${baseEntrega}
• Tempo retido: ${aging}
• Horário de saída para entrega: ${horario}
• Cidade Destino: ${cidade}
• Destinatário: ${destinatario}
• CEP: ${cep}
• Tempo de Retenção: ${tempo}
• Data Expedição: ${dataExp}
• Complemento: ${complemento}

`
        })
      } else {
        message += `📦 Detalhes dos pedidos serão enviados em breve.

`
      }

      message += `Por favor, verifique os pedidos retidos...

Atenciosamente,
Afonso
Torre de controle J&T Express`

      return message
    }
    return message || 'Olá! Gostaria de falar sobre os pedidos retidos.'
  }

  // Função para formatar mensagem padrão se não for fornecida
  const getDefaultMessage = () => {
    if (messageType === 'presentation') {
      return getPresentationMessage()
    } else if (messageType === 'followup') {
      return getFollowUpMessage()
    } else {
      return getDetailedMessage()
    }
  }

  // Função para abrir WhatsApp
  const handleWhatsAppClick = async () => {
    const formattedPhone = formatPhoneNumber(phoneNumber)
    const finalMessage = getDefaultMessage()
    
    if (!formattedPhone) {
      if (onError) {
        onError('Número de telefone não informado!')
      } else {
        showError('Número de telefone não informado!')
      }
      return
    }

    // Primeiro, copia a mensagem para a área de transferência
    try {
      await navigator.clipboard.writeText(finalMessage)
      showSuccess('📋 Mensagem copiada! Cole no WhatsApp quando abrir.')
    } catch (err) {
      if (onError) {
        onError('Erro ao copiar mensagem. Tente novamente.')
      } else {
        showError('Erro ao copiar mensagem. Tente novamente.')
      }
      return
    }

    // URL para abrir diretamente no aplicativo WhatsApp Desktop
    const whatsappAppUrl = `whatsapp://send?phone=55${formattedPhone}&text=${encodeURIComponent(finalMessage)}`
    
    // Criar link temporário para abrir WhatsApp Desktop (mais confiável que window.location)
    const link = document.createElement('a')
    link.href = whatsappAppUrl
    link.style.display = 'none'
    document.body.appendChild(link)
    
    // Tentar abrir WhatsApp Desktop (apenas Desktop, sem fallback para Web)
    try {
      link.click()
      
      // Remover o link após um tempo
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
      }, 100)
    } catch (err) {
      // Se houver erro, apenas remover o link (não abre Web)
      if (document.body.contains(link)) {
        document.body.removeChild(link)
      }
      if (onError) {
        onError('Erro ao abrir WhatsApp Desktop. Verifique se o aplicativo está instalado.')
      } else {
        showError('Erro ao abrir WhatsApp Desktop. Verifique se o aplicativo está instalado.')
      }
    }
  }

  return (
    <button
      className={`whatsapp-button-sla`}
      onClick={handleWhatsAppClick}
      title={`Enviar mensagem para ${motorista || 'motorista'} via WhatsApp`}
    >
      <span><FaWhatsapp size={23} /></span>
    </button>
  )
}

export default WhatsAppButton
