'use client'

import { ReactNode, Suspense } from 'react'
import { ErrorBoundary } from './ErrorBoundary'

interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

export function AsyncErrorBoundary({ 
  children, 
  fallback,
  loadingFallback 
}: AsyncErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={
        loadingFallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-gray-600">Loading...</div>
          </div>
        )
      }>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}