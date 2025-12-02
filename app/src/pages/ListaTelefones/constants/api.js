// Configurações da API
// NOTA: Endpoints devem usar buildApiUrl() quando chamados, não hardcoded aqui
// Mantido apenas para referência/compatibilidade
export const API_ENDPOINTS = {
  UPLOAD: 'retidos/upload',
  ENVIAR_DADOS: 'lista-telefones/enviar'
}

export const API_CONFIG = {
  HEADERS: {
    'Content-Type': 'application/json'
  },
  TIMEOUT: 1000 // 1 segundo para aguardar processamento
}
