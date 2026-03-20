import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    // Proxy API calls through Vite so there's no mixed-content issue
    proxy: {
      '/api': {
        target: 'http://172.16.13.118:8000',
        changeOrigin: true,
      },
    },
  },
})
