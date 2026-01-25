
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Usamos uma verificação para não injetar 'undefined' caso a chave não exista no ambiente de build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Garante que o build não falhe por avisos de variáveis
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000
  }
});
