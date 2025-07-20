import { createFileRoute } from '@tanstack/react-router'
import { DJSubmissionForm } from '@/components/DJSubmissionForm'
import { InvalidTokenError } from '@/components/errors/InvalidTokenError'

export const Route = createFileRoute('/dj-submission')({
  component: DJSubmission,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string,
    }
  },
  errorComponent: InvalidTokenError,
  pendingComponent: LoadingSpinner,
})

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

function DJSubmission() {
  const { token } = Route.useSearch()
  
  if (!token) {
    throw new Error('Submission token is required')
  }
  
  return <DJSubmissionForm submissionToken={token} />
}