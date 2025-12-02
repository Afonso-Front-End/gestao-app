import React from 'react'
import './WhatsAppButton.css'
import { FaWhatsapp } from "react-icons/fa";
import { useNotification } from '../../../../contexts/NotificationContext';

const WhatsAppButton = ({ 
  phoneNumber, 
  motorista, 
  quantidade,
  className = '',
  onError = null // Função para mostrar erro (opcional)
}) => {
  const { showError, showSuccess } = useNotification()
  
  // Função para formatar número de telefone (remove caracteres especiais)
  const formatPhoneNumber = (phone) => {
    if (!phone) return ''
    // Remove todos os caracteres não numéricos
    return phone.replace(/\D/g, '')
  }

  // Obter nome do usuário (com fallback para "Funcionário")
  const getUserName = () => {
    const userName = localStorage.getItem('userName') || 
                     localStorage.getItem('user_name') || 
                     localStorage.getItem('nome') ||
                     null
    
    return userName && userName.trim() !== '' ? userName.trim() : 'Funcionário'
  }

  // Função para gerar mensagem personalizada simplificada
  const getMessage = () => {
    // Buscar mensagem personalizada do localStorage
    const customMessageTemplate = localStorage.getItem('sla-custom-message-template')
    
    if (!customMessageTemplate) {
      // Se não houver mensagem personalizada, retornar mensagem vazia ou erro
      if (onError) {
        onError('Mensagem personalizada não configurada. Configure uma mensagem primeiro.')
      } else {
        showError('Mensagem personalizada não configurada. Configure uma mensagem primeiro.')
      }
      return ''
    }
    
    // Se existe mensagem personalizada, substituir variáveis
    const motoristaName = motorista ? motorista.toUpperCase() : 'MOTORISTA'
    let finalMessage = customMessageTemplate
    
    // Substituir "TAC MOTORISTA!" pelo nome real do motorista e remover as aspas
    // Primeiro, substituir "TAC MOTORISTA!" (com aspas) por TAC [NOME]! (sem aspas)
    finalMessage = finalMessage.replace(/"TAC\s+MOTORISTA!"/g, `TAC ${motoristaName}!`)
    
    // Também substituir TAC MOTORISTA! sem aspas (caso o usuário tenha removido manualmente)
    finalMessage = finalMessage.replace(/TAC\s+MOTORISTA!/g, `TAC ${motoristaName}!`)
    
    // Substituir outras ocorrências de "MOTORISTA" pelo nome real (se não estiver dentro de "TAC MOTORISTA!")
    finalMessage = finalMessage.replace(/\bMOTORISTA\b/g, motoristaName)
    
    // Substituir variáveis dinamicamente ${quantidade}
    finalMessage = finalMessage.replace(/\$\{quantidade\}/g, quantidade)
    
    return finalMessage
  }

  // Função para abrir WhatsApp
  const handleWhatsAppClick = async () => {
    const formattedPhone = formatPhoneNumber(phoneNumber)
    const finalMessage = getMessage()
    
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
