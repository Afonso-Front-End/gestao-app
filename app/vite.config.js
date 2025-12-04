import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuração do servidor de desenvolvimento
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        // Porta do backend configurável via variável de ambiente
        // Padrão: 8001, mas pode ser alterado via VITE_API_PORT
        target: `http://localhost:${process.env.VITE_API_PORT || '8001'}`,
        changeOrigin: true,
        secure: false,
        // O backend já espera /api no prefixo das rotas, então não precisamos reescrever
        // Se houver duplicação /api/api, o proxy vai redirecionar corretamente
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Log para debug (pode remover depois)
            // console.log('Proxying:', req.url, 'to', options.target + req.url)
          })
        }
      }
    }
  },
  
  // Configurações para evitar erros de cache no Windows
  // Mudando o cache para uma pasta fora de node_modules para evitar problemas de permissão
  cacheDir: '.vite',
  optimizeDeps: {
    force: false, // Não força re-otimização a menos que necessário
    // Desabilitar cache de otimização se necessário
    // holdUntilCrawlEnd: false,
  },
  
  // Configurações de build
  build: {
    // Usar recursos modernos
    target: 'esnext',
    // Minificar em produção
    minify: 'esbuild',
    // Produzir sourcemaps em desenvolvimento
    sourcemap: process.env.NODE_ENV === 'development',
    // Limpar diretório de saída antes de construir
    emptyOutDir: true,
  },
  
  // Desabilitar limpeza automática do cache para evitar erros no Windows
  clearScreen: false
})
