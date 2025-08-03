import React from 'react';

interface LoadingIndicatorProps {
  className?: string
}

export function LoadingIndicator({ 
  className = '' 
}: LoadingIndicatorProps) {
  return (
    <div className={`animate-pulse text-center ${className}`}>
      <div className="font-medium text-brand-primary text-4xl">
        RITE
      </div>
    </div>
  )
}

export function FullScreenLoading() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <LoadingIndicator />
    </div>
  )
}