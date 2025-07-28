'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ReactNode, useMemo } from 'react'

export function ConvexProviderClient({ children }: { children: ReactNode }) {
  // Create the client immediately using useMemo instead of useEffect
  // This prevents the "no provider" error during initial render
  const convexClient = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL
    if (!url || url === 'your_convex_url_here') {
      console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex features will be disabled.')
      return null
    }
    return new ConvexReactClient(url)
  }, [])

  if (!convexClient) {
    // Show a loading state or error message instead of rendering children without context
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Convex is not configured. Please set NEXT_PUBLIC_CONVEX_URL.</p>
        </div>
      </div>
    )
  }

  return (
    <ConvexProvider client={convexClient}>
      {children}
    </ConvexProvider>
  )
}