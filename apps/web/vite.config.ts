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
    // os testes nunca falam com o Supabase, mesmo com um .env.local configurado
    env: { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // A cena 3D precisa de WebGL, que não existe no jsdom; os templates dela são testados à parte.
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/scenes/SceneView.tsx', 'src/lib/sync.ts'],
      reporter: ['text-summary', 'html'],
    },
  },
})
