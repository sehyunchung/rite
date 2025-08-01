import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test-setup.ts'],
    globals: true,
    include: ['__tests__/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**/*', 'node_modules/**/*'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@rite/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@rite/backend': path.resolve(__dirname, '../../packages/backend'),
      '@rite/shared-types': path.resolve(__dirname, '../../packages/shared-types'),
    },
  },
})