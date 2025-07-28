'use client'

import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from 'convex/react'
import { ReactNode } from 'react'

export function ConvexProviderSimple({ children }: { children: ReactNode }) {
  // Initialize client inside the component to avoid hydration issues
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  
  if (!convexUrl) {
    console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex functionality will be disabled.')
    // Wrap in div instead of Fragment to avoid JSX issues
    return <div style={{ display: 'contents' }}>{children}</div>
  }

  try {
    const convex = new ConvexReactClient(convexUrl)
    return <ConvexReactProvider client={convex}>{children}</ConvexReactProvider>
  } catch (error) {
    console.error('Failed to initialize ConvexReactClient:', error)
    // Fallback: wrap in div instead of Fragment
    return <div style={{ display: 'contents' }}>{children}</div>
  }
}