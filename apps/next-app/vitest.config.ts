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
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/**/*',
        'e2e/**/*',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        'coverage/**/*',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
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