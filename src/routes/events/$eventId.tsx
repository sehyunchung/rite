import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QRCode } from '@/components/ui/kibo-ui/qr-code'
import { Id } from '../../../convex/_generated/dataModel'

export const Route = createFileRoute('/events/$eventId')({
  component: EventDetails,
})

function EventDetails() {
  const { eventId } = Route.useParams()
  const event = useQuery(api.events.getEvent, { eventId: eventId as Id<"events"> })
  const submissionStatus = useQuery(api.submissions.getEventSubmissionStatus, { 
    eventId: eventId as Id<"events"> 
  })
  
  if (event === undefined || submissionStatus === undefined) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (event === null) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600">Event Not Found</h1>
        <p className="text-gray-600 mt-2">The event you're looking for doesn't exist.</p>
        <Link to="/events">
          <Button className="mt-4">Back to Events</Button>
        </Link>
      </div>
    )
  }

  const submissionCount = submissionStatus.filter(s => s.hasSubmitted).length
  const totalSlots = submissionStatus.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/events" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Back to Events
          </Link>
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-gray-600">{event.venue.name} • {event.date}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={event.status} />
          <Button variant="outline">Edit Event</Button>
        </div>
      </div>

      {/* Event Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Venue</h4>
              <p className="text-gray-600">{event.venue.name}</p>
              <p className="text-gray-600">{event.venue.address}</p>
            </div>
            <div>
              <h4 className="font-medium">Date</h4>
              <p className="text-gray-600">{event.date}</p>
            </div>
            {event.description && (
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-gray-600">{event.description}</p>
              </div>
            )}
            {event.hashtags && (
              <div>
                <h4 className="font-medium">Hashtags</h4>
                <p className="text-gray-600">{event.hashtags}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment & Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium">Payment per DJ</h4>
              <p className="text-gray-600">
                {event.payment.perDJ?.toLocaleString()} {event.payment.currency}
              </p>
            </div>
            <div>
              <h4 className="font-medium">Payment Due Date</h4>
              <p className="text-gray-600">{event.payment.dueDate}</p>
            </div>
            <div>
              <h4 className="font-medium">Guest List Deadline</h4>
              <p className="text-gray-600">{event.deadlines.guestList}</p>
            </div>
            <div>
              <h4 className="font-medium">Promo Materials Deadline</h4>
              <p className="text-gray-600">{event.deadlines.promoMaterials}</p>
            </div>
            <div>
              <h4 className="font-medium">Guest Limit per DJ</h4>
              <p className="text-gray-600">{event.guestLimitPerDJ} guests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submission Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>DJ Submissions</CardTitle>
              <CardDescription>
                {submissionCount} of {totalSlots} DJs have submitted their materials
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((submissionCount / totalSlots) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {submissionStatus.map((slot) => (
              <div key={slot.timeslotId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${slot.hasSubmitted ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <p className="font-medium">{slot.djName}</p>
                      <p className="text-sm text-gray-600">{slot.djInstagram}</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{slot.startTime} - {slot.endTime}</p>
                </div>
                <div className="text-center">
                  {slot.hasSubmitted ? (
                    <div className="text-sm">
                      <p className="text-green-600 font-medium">✓ Submitted</p>
                      <p className="text-gray-600">{slot.guestCount} guests • {slot.fileCount} files</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Pending</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submission Links */}
      <Card>
        <CardHeader>
          <CardTitle>DJ Submission Links</CardTitle>
          <CardDescription>
            Share these unique links with your DJs for material submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {event.timeslots.map((slot) => {
              const submissionUrl = `${window.location.origin}/dj-submission?token=${slot.submissionToken}`
              return (
                <div key={slot._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium">{slot.djName} ({slot.djInstagram})</h4>
                      <p className="text-sm text-gray-600 mb-2">{slot.startTime} - {slot.endTime}</p>
                      <div className="bg-gray-50 p-2 rounded text-sm font-mono break-all">
                        {submissionUrl}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => void navigator.clipboard.writeText(submissionUrl)}
                      >
                        Copy Link
                      </Button>
                      <div className="w-20 h-20">
                        <QRCode data={submissionUrl} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
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