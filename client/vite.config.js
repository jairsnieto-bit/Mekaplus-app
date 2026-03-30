/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  preview: {
    port: 4173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})*/
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    host: true // 👈 recomendado también
  },

  preview: {
    port: 4173,
    host: true,
    allowedHosts: [
      'mekaplus-frontend.up.railway.app'
    ]
  },

  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
