import type { Metadata } from 'next'
import './globals.css'
import { RootProvider } from './providers/root-provider'
import { suit } from './lib/fonts'
import { ErrorBoundary } from './components/ErrorBoundary'

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
            {children}
          </RootProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
