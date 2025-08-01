import type { Metadata } from 'next'
import './globals.css'
import { RootProvider } from './providers/root-provider'
import { suit } from './lib/fonts'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Suspense } from 'react'
import PostHogPageView from './components/PostHogPageView'
import ConsentBanner from './components/ConsentBanner'

export const metadata: Metadata = {
  title: 'Rite - DJ Event Management Platform',
  description: 'Streamline DJ event management with Instagram workflow integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={suit.variable}>
      <body className="font-sans">
        <ErrorBoundary>
          <RootProvider>
            <Suspense>
              <PostHogPageView />
            </Suspense>
            {children}
            <ConsentBanner />
          </RootProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
