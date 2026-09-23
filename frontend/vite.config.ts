import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// The Spring Boot BFF runs on :8080 and speaks gRPC to the auction server on :9090.
// Everything under /api is proxied so the browser sees a same-origin app: no CORS
// config is needed on the backend, and the SSE bridges are piped through untouched.
// The BFF address comes from VITE_API_PROXY_TARGET (see .env.example) so it can be
// pointed at another host without touching this file.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})
