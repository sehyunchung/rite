import type { Metadata } from 'next'
import './globals.css'
import { ConvexProviderClient } from './providers/convex-provider-client'
import { AuthProvider } from './providers/auth-provider'
import { suit } from './lib/fonts'

// Force dynamic rendering for all pages to avoid SSG issues with providers
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Rite - DJ Event Management Platform',
  description: 'Streamline DJ event management with Instagram workflow integration',
  keywords: ['DJ', 'event management', 'Instagram', 'bookings', 'Korea'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={suit.variable}>
        <ConvexProviderClient>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConvexProviderClient>
      </body>
    </html>
  )
}
