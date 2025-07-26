import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConvexProviderClient } from './providers/convex-provider-client'
import { AuthProvider } from './providers/auth-provider'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <ConvexProviderClient>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConvexProviderClient>
      </body>
    </html>
  )
}