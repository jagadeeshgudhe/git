import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/QA': {
        target: 'https://hrqa-api-439963159684.us-central1.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/QA/, '/QA'),
        secure: false,
        headers: {
          'x-api-key': 'AIzaSyCR7AMuBCl2zj8wwX_xGxVGm6pWkA2vha'
        }
      }
    }
  }
}) 