import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@controllers': path.resolve(__dirname, './src/controllers'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@appTypes': path.resolve(__dirname, './src/types'),
      '@data': path.resolve(__dirname, './src/data'),
    }
  }
})