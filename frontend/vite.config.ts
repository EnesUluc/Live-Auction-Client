import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Spring Boot BFF runs on :8080 and speaks gRPC to the auction server on :9090.
// Everything under /api is proxied so the browser sees a same-origin app: no CORS
// config is needed on the backend, and the SSE bridges are piped through untouched.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
