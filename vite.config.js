import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/zuordnungen-uebung/'  // <-- ganz wichtig für GitHub Pages
})
