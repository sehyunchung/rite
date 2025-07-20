import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RequireAuth } from '@/components/auth/RequireAuth'

export const Route = createFileRoute('/events/')({
  component: EventsList,
})

function EventsList() {
  return (
    <RequireAuth>
      <EventsListContent />
    </RequireAuth>
  )
}

function EventsListContent() {
  // Events are automatically filtered by authenticated user
  const events = useQuery(api.events.listEvents)
  
  if (events === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-gray-600">Manage your DJ events and submissions</p>
        </div>
        <Link to="/events/create">
          <Button>Create New Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No events yet</h3>
            <p className="text-gray-600 mb-4">Create your first DJ event to get started</p>
            <Link to="/events/create">
              <Button>Create Event</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{event.name}</CardTitle>
                    <CardDescription>
                      {event.venue.name} • {event.date}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={event.status} />
                    <Link to="/events/$eventId" params={{ eventId: event._id }}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Venue</p>
                    <p className="text-gray-600">{event.venue.address}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment</p>
                    <p className="text-gray-600">
                      {event.payment.perDJ?.toLocaleString()} {event.payment.currency} per DJ
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Guest List Deadline</p>
                    <p className="text-gray-600">{event.deadlines.guestList}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Promo Deadline</p>
                    <p className="text-gray-600">{event.deadlines.promoMaterials}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: 'draft' | 'active' | 'completed' }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}