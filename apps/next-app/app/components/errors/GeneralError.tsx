import { Button } from '@rite/ui'

interface GeneralErrorProps {
  error: Error
  retry?: () => void
}

export function GeneralError({ error, retry }: GeneralErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-error">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">
          {error.message || 'An unexpected error occurred while loading this page.'}
        </p>
        <div className="space-y-2">
          {retry && (
            <Button onClick={retry} className="w-full">
              Try Again
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'} 
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}