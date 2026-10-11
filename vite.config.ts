import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500, // three.js is big; we split it below
    rollupOptions: {
      output: {
        // Vite 8 / rolldown: group the 3D libs into their own long-cached chunks
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'r3f', test: /node_modules[\\/]@react-three[\\/]/ },
          ],
        },
      },
    },
  },
})
