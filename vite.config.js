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
        },
        timeout: 30000, // 30 seconds timeout
        proxyTimeout: 30000,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
    hmr: {
      timeout: 30000
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  }
}) 