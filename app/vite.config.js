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
  
  // Configurações de build para Tauri
  build: {
    // Tauri usa Chromium, então podemos usar recursos modernos
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // Não usar relative base para Tauri em produção
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Produzir sourcemaps para debug
    sourcemap: !!process.env.TAURI_DEBUG,
    // Limpar diretório de saída antes de construir
    emptyOutDir: true,
  },
  
  // Desabilitar limpeza automática do cache para evitar erros no Windows
  clearScreen: false
})
