import '@testing-library/jest-dom'
import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Mock React Native for web testing
vi.mock('react-native', () => ({
  Platform: { OS: 'web' },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
}))

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Global test setup
beforeAll(() => {
  // Setup any global test configuration
})