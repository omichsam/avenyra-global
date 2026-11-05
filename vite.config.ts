import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.API_PROXY_TARGET || 'https://avenyar-global-server.onrender.com'

  return {
    // Served from the domain root by default. scripts/build-pages.mjs sets
    // BASE_PATH (e.g. /avenyra-global/) for the GitHub Pages subfolder build.
    base: process.env.BASE_PATH || '/',
    plugins: [react()],
    server: {
      // The backend's CORS allow-list only covers the production domains, so in
      // dev the browser talks to /api on the Vite server and Vite forwards it.
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
