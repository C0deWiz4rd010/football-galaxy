import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  base: '/football-galaxy/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            // Split heavy per-league mock data into separate chunks so the main
            // bundle stays lean. Each league file is ~85-105 kB of JSON-ish data.
            if (id.includes('/src/data/mock/')) {
              if (id.includes('premier-league')) return 'mock-premier-league'
              if (id.includes('bundesliga')) return 'mock-bundesliga'
              if (id.includes('la-liga')) return 'mock-la-liga'
              if (id.includes('serie-a')) return 'mock-serie-a'
              if (id.includes('ligue-1')) return 'mock-ligue-1'
            }
            return undefined
          }
          if (id.includes('react-router')) return 'router'
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('recharts') || id.includes('d3-')) return 'charts'
          if (id.includes('@radix-ui')) return 'radix'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('cmdk')) return 'cmdk'
          return 'vendor'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['node_modules/**', 'dist/**', 'src/app/**', 'src/features/**'],
  },
})
