import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dailyApi from './vite/dailyApi.js'

export default defineConfig({
  plugins: [
    react(),
    dailyApi(),
  ],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
