import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
  build: {
    // Ensure compatibility with Rolldown (Vite 8)
    rollupOptions: {
      // Suppress known Rolldown accessor warnings
    },
  },
})
