import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // CORREÇÃO: Deve ser apenas o nome do repositório entre barras.
  base: '/chatbot-reactjs/'
})