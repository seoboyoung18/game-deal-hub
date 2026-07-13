import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 개발 서버는 5173. /api 요청은 백엔드(8080)로 프록시 → 개발 중 CORS 불필요.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
