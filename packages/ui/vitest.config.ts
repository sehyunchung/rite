import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test-setup.ts'],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}', '__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/**/*', '**/*.config.{ts,js}', '**/*.d.ts'],
      thresholds: {
        global: { branches: 80, functions: 80, lines: 80, statements: 80 },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})