import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // or whatever framework you use

export default defineConfig({
  plugins: [react()],
  base: '/taskmanager/' // Must match your repo name
})