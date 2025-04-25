import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Keep this if you're using React

export default defineConfig({
  plugins: [react()], // Keep this if you're using React
  base: '/taskmanager/',
  define: {
    'process.env': {},
  },
  build: {
    outDir: 'dist',
    // You can uncomment this if you're getting chunk size warnings
    // chunkSizeWarningLimit: 1500,
  }
})