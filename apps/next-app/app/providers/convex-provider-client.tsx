'use client'

import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

// Use a fallback URL if NEXT_PUBLIC_CONVEX_URL is not set
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://placeholder.convex.cloud'

if (!process.env.NEXT_PUBLIC_CONVEX_URL && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Using placeholder URL.')
}

const convex = new ConvexReactClient(convexUrl)

export function ConvexProviderClient({ children }: { children: ReactNode }) {
  return <ConvexReactProvider client={convex}>{children}</ConvexReactProvider>
}