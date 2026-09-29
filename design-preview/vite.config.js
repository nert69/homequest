import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// A visual preview, not an installable replacement for the live PWA.
export default defineConfig({ plugins: [react()] })
