'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { ReactNode, useState, useEffect } from 'react'

export function ConvexProviderClient({ children }: { children: ReactNode }) {
  const [convexClient, setConvexClient] = useState<ConvexReactClient | null>(null)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL
    if (url) {
      setConvexClient(new ConvexReactClient(url))
    }
  }, [])

  if (!convexClient) {
    return <>{children}</>
  }

  return (
    <ConvexProvider client={convexClient}>
      {children}
    </ConvexProvider>
  )
}