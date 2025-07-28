'use client'

import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://placeholder.convex.cloud'

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Using placeholder URL.')
}

const convex = new ConvexReactClient(convexUrl)

export function ConvexProviderNoSSR({ children }: { children: ReactNode }) {
  return <ConvexReactProvider client={convex}>{children}</ConvexReactProvider>
}