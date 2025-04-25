import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or whatever framework you're using

export default defineConfig({
  plugins: [react()],
  base: '/taskmanager/', // Critical for GitHub Pages
  build: {
    chunkSizeWarningLimit: 1200, // Prevents the warning about large chunks
  }
})