import { beforeAll, vi } from 'vitest'

// Mock Convex environment
vi.mock('convex/server', () => ({
  query: vi.fn(),
  mutation: vi.fn(),
  action: vi.fn(),
  httpAction: vi.fn(),
}))

// Global test setup
beforeAll(() => {
  // Setup any global test configuration
})