import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test-setup.ts'],
    globals: true,
    include: ['convex/**/*.test.{ts,js}', '__tests__/**/*.test.{ts,js}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/**/*', '**/*.config.{ts,js}', '**/*.d.ts', 'convex/_generated/**/*'],
      thresholds: {
        global: { branches: 75, functions: 75, lines: 75, statements: 75 },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './convex'),
    },
  },
})