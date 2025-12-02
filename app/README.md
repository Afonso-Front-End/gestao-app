# Torre de Controle - Aplicação Desktop 🖥️

Uma aplicação desktop moderna construída com **React + Vite + Tauri**, oferecendo performance nativa e menor consumo de recursos.

## 🎯 Versões Disponíveis

- **🖥️ Desktop (Tauri)** - Aplicação nativa para Windows/macOS/Linux
- **🌐 Web (Navegador)** - Versão web tradicional

## 🚀 Funcionalidades

- **Roteamento**: Navegação entre páginas com React Router
- **Layout Responsivo**: Sidebar e header adaptáveis
- **Notificações Globais**: Sistema de notificações com diferentes tipos
- **API Configurada**: Axios configurado com interceptors
- **Ícones**: FontAwesome integrado
- **Design Moderno**: Interface limpa e profissional

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── Layout/          # Layout principal
│   ├── Sidebar/         # Menu lateral
│   ├── Header/          # Cabeçalho
│   ├── Notification/    # Componente de notificação
│   └── NotificationContainer/ # Container de notificações
├── contexts/            # Contextos React
│   └── NotificationContext.jsx # Contexto de notificações
├── pages/               # Páginas da aplicação
│   ├── Dashboard/       # Página inicial
│   ├── Relatorios/      # Página de relatórios
│   ├── Documentos/      # Página de documentos
│   └── Configuracoes/   # Página de configurações
├── services/            # Serviços e APIs
│   ├── api.js          # Configuração do Axios
│   └── exampleService.js # Exemplo de serviço
└── App.jsx             # Componente principal
```

## 🛠️ Tecnologias Utilizadas

- **React 19.1.1** - Biblioteca principal
- **Vite 7.1.7** - Build tool e dev server
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **FontAwesome** - Ícones
- **CSS3** - Estilização

## 🚀 Como Executar

### 🖥️ Aplicação Desktop (Tauri) - RECOMENDADO

1. **Pré-requisitos**: Instale Rust e Visual Studio Build Tools
   - Consulte: `INSTALACAO_TAURI.md` para instruções detalhadas

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Executar aplicação desktop:**
   ```bash
   npm run tauri:dev
   ```

4. **Build para produção:**
   ```bash
   npm run tauri:build
   ```

### 🌐 Versão Web (Navegador)

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Build para produção:**
   ```bash
   npm run build
   ```

4. **Preview da build:**
   ```bash
   npm run preview
   ```

## 📱 Páginas Disponíveis

- **Dashboard** (`/`) - Visão geral do sistema
- **Relatórios** (`/relatorios`) - Gerenciamento de relatórios
- **Documentos** (`/documentos`) - Gerenciamento de arquivos
- **Configurações** (`/configuracoes`) - Configurações do sistema

## 🔧 Configuração da API

O arquivo `src/services/api.js` contém a configuração do Axios:

- **Base URL**: Configurável via `REACT_APP_API_URL`
- **Timeout**: 10 segundos
- **Interceptors**: Para requests e responses
- **Autenticação**: Token automático via localStorage
- **Logs**: Automáticos em desenvolvimento

### Exemplo de uso:

```javascript
import api from './services/api'

// GET request
const data = await api.get('/users')

// POST request
const newUser = await api.post('/users', { name: 'João' })
```

## 🔔 Sistema de Notificações

O sistema de notificações está disponível globalmente:

```javascript
import { useNotification } from './contexts/NotificationContext'

const { showSuccess, showError, showWarning, showInfo } = useNotification()

// Exemplos
showSuccess('Operação realizada com sucesso!')
showError('Erro ao processar solicitação')
showWarning('Atenção: dados podem estar desatualizados')
showInfo('Informação importante')
```

## 🎨 Personalização

### Cores Principais:
- **Primária**: #3b82f6 (azul)
- **Sucesso**: #10b981 (verde)
- **Erro**: #ef4444 (vermelho)
- **Aviso**: #f59e0b (amarelo)
- **Info**: #3b82f6 (azul)

### Responsividade:
- **Desktop**: Layout completo com sidebar
- **Mobile**: Menu hambúrguer e layout adaptado

## 📝 Próximos Passos

- [ ] Implementar autenticação
- [ ] Adicionar testes unitários
- [ ] Configurar PWA
- [ ] Implementar tema escuro
- [ ] Adicionar internacionalização
- [ ] Integrar com backend real

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.