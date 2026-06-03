import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/80_Birthday/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
})
