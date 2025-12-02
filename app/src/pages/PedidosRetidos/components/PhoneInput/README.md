# PhoneInput Component

Componente global para entrada de números de telefone com formatação automática e validação.

## 🚀 Funcionalidades

- ✅ **Apenas Números**: Aceita somente dígitos
- ✅ **Formatação Automática**: Máscara brasileira (XX) XXXXX-XXXX
- ✅ **Validação**: Limita tamanho e formato
- ✅ **Não Salva em Tempo Real**: Otimizado para performance
- ✅ **Responsivo**: Funciona bem em mobile
- ✅ **Acessível**: Suporte a teclado e screen readers

## 📋 Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `value` | string | '' | Valor atual do telefone |
| `onChange` | function | - | Função chamada quando o valor muda |
| `placeholder` | string | 'Digite o telefone' | Texto placeholder |
| `className` | string | '' | Classes CSS adicionais |
| `disabled` | boolean | false | Se o input está desabilitado |
| `maxLength` | number | 15 | Tamanho máximo do número |

## 🎯 Exemplos de Uso

### Uso Básico
```jsx
import PhoneInput from './components/PhoneInput/PhoneInput'

const [phone, setPhone] = useState('')

<PhoneInput
  value={phone}
  onChange={setPhone}
  placeholder="Digite seu telefone"
/>
```

### Em Formulários
```jsx
<PhoneInput
  value={formData.telefone}
  onChange={(value) => setFormData({...formData, telefone: value})}
  placeholder="Telefone de contato"
  className="large"
/>
```

### Com Validação
```jsx
<PhoneInput
  value={phone}
  onChange={setPhone}
  className={phone.length < 10 ? 'error' : 'success'}
  maxLength={11}
/>
```

## 📱 Comportamento

### Formatação Automática:
- **1-2 dígitos**: `11`
- **3-7 dígitos**: `(11) 9999`
- **8-11 dígitos**: `(11) 99999-9999`

### Validação:
- **Apenas números**: Bloqueia letras e caracteres especiais
- **Tamanho limitado**: Respeita maxLength
- **Paste inteligente**: Filtra apenas números do texto colado

### Teclas Permitidas:
- **Números**: 0-9
- **Navegação**: Backspace, Delete, Tab, Escape, Enter
- **Setas**: Home, End, Arrow keys
- **Atalhos**: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X

## 🎨 Variantes

### Tamanhos:
- **Small**: `className="small"` - Para tabelas
- **Medium**: Padrão - Para formulários
- **Large**: `className="large"` - Para destaque

### Estados:
- **Normal**: Borda cinza
- **Focus**: Borda verde WhatsApp
- **Hover**: Background cinza claro
- **Disabled**: Background cinza, cursor not-allowed
- **Error**: `className="error"` - Borda vermelha
- **Success**: `className="success"` - Borda verde

## 🔧 Integração

O componente é totalmente independente e pode ser usado em qualquer lugar:

```jsx
// Em formulários
<PhoneInput value={phone} onChange={setPhone} />

// Em tabelas editáveis
<PhoneInput value={row.telefone} onChange={(value) => updateRow(row.id, {telefone: value})} />

// Com validação
<PhoneInput 
  value={phone} 
  onChange={setPhone}
  className={isValid ? 'success' : 'error'}
/>
```

## 📊 Performance

- **Não salva em tempo real**: Evita requisições desnecessárias
- **Debounce interno**: Otimiza formatação
- **Event handling**: Previne propagação de eventos
- **Memory efficient**: Não mantém estado interno desnecessário

## 🎯 Casos de Uso

1. **Formulários de cadastro**
2. **Tabelas editáveis**
3. **Modais de edição**
4. **Configurações de perfil**
5. **Sistema de contatos**

## 🔒 Validação

- **Mínimo**: 10 dígitos (telefone fixo)
- **Máximo**: 11 dígitos (celular com DDD)
- **Formato**: Apenas números (formatação visual)
- **Paste**: Filtra automaticamente caracteres inválidos
