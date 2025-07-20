import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { EventCreationForm } from '@/components/EventCreationForm'
import { GeneralError } from '@/components/errors/GeneralError'

export const Route = createFileRoute('/events/create')({
  component: CreateEvent,
  errorComponent: ({ error, reset }) => <GeneralError error={error} retry={reset} />,
  pendingComponent: LoadingSpinner,
})

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}

function CreateEvent() {
  const navigate = useNavigate()
  
  const handleEventCreated = () => {
    void navigate({ to: '/' })
  }
  
  return <EventCreationForm onEventCreated={handleEventCreated} />
}