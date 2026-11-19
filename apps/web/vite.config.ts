/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // O chunk do Three.js (~1 MB) só é baixado quando a explicação 3D abre (React.lazy).
  build: { chunkSizeWarningLimit: 1100 },
  test: {
    environment: 'node',
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // A cena 3D precisa de WebGL, que não existe no jsdom; os templates dela são testados à parte.
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/scenes/SceneView.tsx'],
      reporter: ['text-summary', 'html'],
    },
  },
})
