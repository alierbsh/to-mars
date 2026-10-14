import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// the site's address for the link-preview tags (they must be absolute): Vercel's production
// domain at build time, which follows a project rename; the current one otherwise
const SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'reach-to-mars.vercel.app'}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'site-url',
      transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', SITE_URL),
    },
  ],
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
