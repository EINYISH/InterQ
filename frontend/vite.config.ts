import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// InterQ 프론트엔드 - Vite + React + Tailwind v4
// 백엔드(Spring Boot, localhost:8080)와는 CORS로 통신하므로 별도 proxy 설정은 필요 없음
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
})
