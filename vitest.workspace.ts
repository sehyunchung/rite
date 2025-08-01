import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  './apps/next-app/vitest.config.ts',
  './packages/ui/vitest.config.ts',
  './packages/backend/vitest.config.ts',
  './packages/shared-types/vitest.config.ts'
])