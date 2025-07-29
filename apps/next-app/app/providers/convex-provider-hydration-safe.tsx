'use client'

import { ConvexProvider as ConvexReactProvider, ConvexReactClient } from 'convex/react'
import { ReactNode, useRef, useSyncExternalStore } from 'react'

// Singleton pattern for Convex client instance
let convexClient: ConvexReactClient | null = null

function getConvexClient(): ConvexReactClient | null {
  // Only create client on browser
  if (typeof window === 'undefined') return null
  
  // Return existing client if already created
  if (convexClient) return convexClient
  
  // Create new client
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) {
    console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex functionality will be disabled.')
    return null
  }
  
  try {
    convexClient = new ConvexReactClient(convexUrl)
    return convexClient
  } catch (error) {
    console.error('Failed to initialize ConvexReactClient:', error)
    return null
  }
}

// Hydration-safe hooks for client detection
const subscribe = () => () => {}
const getSnapshot = () => typeof window !== 'undefined'
const getServerSnapshot = () => false

interface ConvexProviderHydrationSafeProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ConvexProviderHydrationSafe({ 
  children, 
  fallback 
}: ConvexProviderHydrationSafeProps) {
  // Use useSyncExternalStore for hydration-safe client detection
  const isClient = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  
  // Use ref to maintain stable client reference
  const clientRef = useRef<ConvexReactClient | null>(null)
  
  // Only get client on browser
  if (isClient && !clientRef.current) {
    clientRef.current = getConvexClient()
  }
  
  // Server-side or initial client render
  if (!isClient) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-gray-600">⏳</div>
        </div>
      )
    )
  }
  
  // Client-side without Convex URL
  if (!clientRef.current) {
    return <>{children}</>
  }
  
  // Client-side with Convex
  return (
    <ConvexReactProvider client={clientRef.current}>
      {children}
    </ConvexReactProvider>
  )
}