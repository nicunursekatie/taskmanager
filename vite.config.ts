import { defineConfig } from 'vite'
// Add your framework plugin here if needed

export default defineConfig({
  base: '/taskmanager/',
  define: {
    // This provides a shim for the process.env variables
    'process.env': {},
    // This prevents "process is not defined" errors
    git pull origin main  'process': { env: {} }
  }
})