'use client'

import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex functionality will be disabled.')
}

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export function ConvexProviderClient({ children }: { children: ReactNode }) {
  if (!convex) {
    // Return children without Convex provider if URL is not configured
    return <>{children}</>
  }
  return <ConvexReactProvider client={convex}>{children}</ConvexReactProvider>
}