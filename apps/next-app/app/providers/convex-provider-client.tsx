'use client'

import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from 'convex/react'
import { ReactNode, useState, useEffect } from 'react'

export function ConvexProviderClient({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const [convex, setConvex] = useState<ConvexReactClient | null>(null)

  useEffect(() => {
    // Only initialize ConvexReactClient on the client side
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    
    if (!convexUrl) {
      console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex functionality will be disabled.')
      setIsClient(true)
      return
    }

    try {
      const client = new ConvexReactClient(convexUrl)
      setConvex(client)
      setIsClient(true)
    } catch (error) {
      console.error('Failed to initialize ConvexReactClient:', error)
      setIsClient(true)
    }
  }, [])

  // Show loading state during hydration
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Loading...</div>
    </div>
  }

  // If no convex client, render children without provider
  if (!convex) {
    return <>{children}</>
  }

  return <ConvexReactProvider client={convex}>{children}</ConvexReactProvider>
}