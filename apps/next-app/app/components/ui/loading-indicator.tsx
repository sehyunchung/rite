interface LoadingIndicatorProps {
  className?: string
}

export function LoadingIndicator({ 
  className = '' 
}: LoadingIndicatorProps) {
  return (
    <div className={`animate-pulse text-center ${className}`}>
      <div className="font-medium text-gray-300 text-4xl">
        RITE
      </div>
    </div>
  )
}

export function FullScreenLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingIndicator />
    </div>
  )
}