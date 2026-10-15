import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dailyApi from './vite/dailyApi.js'
import journalApi from './vite/journalApi.js'

export default defineConfig({
  plugins: [
    react(),
    dailyApi(),
    journalApi(),
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
