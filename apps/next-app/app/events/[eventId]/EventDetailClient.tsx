'use client';

import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SubmissionLinks } from '@/components/SubmissionLinks';
import { QRCode } from '@/components/ui/kibo-ui/qr-code';
import { useState } from 'react';
import { EditIcon, ClipboardListIcon, QrCodeIcon } from 'lucide-react';

interface EventDetailClientProps {
  eventId: string;
  userId: string;
}

export function EventDetailClient({ eventId, userId }: EventDetailClientProps) {
  const router = useRouter();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const [showQRCode, setShowQRCode] = useState(false);
  
  const event = useQuery(
    api.events.getEventPublic,
    { eventId: eventId as Id<"events"> }
  );

  if (event === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <span className="ml-2 text-xl font-medium">RITE</span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <span className="text-sm font-medium text-gray-900">Event Details</span>
              </nav>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Event Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-light text-gray-900">{event.name}</h1>
                  <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
                <p className="text-gray-600">{event.venue.name} • {event.date}</p>
              </div>
              <div className="flex items-center space-x-3">
                {/* Action Buttons */}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${event._id}/edit`}>
                    <EditIcon className="w-4 h-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push(`/events/${event._id}/submissions`)}
                >
                  <ClipboardListIcon className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowQRCode(!showQRCode)}
                >
                  <QrCodeIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {event.description && (
              <p className="text-gray-700 mb-4">{event.description}</p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Event Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Venue Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Venue Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{event.venue.name}</p>
                    <p className="text-gray-600">{event.venue.address}</p>
                  </div>
                </CardContent>
              </Card>

              {/* DJ Timeslots */}
              <Card>
                <CardHeader>
                  <CardTitle>DJ Lineup ({event.timeslots?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {event.timeslots && event.timeslots.length > 0 ? (
                    <div className="space-y-4">
                      {event.timeslots.map((slot: any, index: number) => (
                        <div key={slot._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium">{slot.djName}</span>
                              <span className="text-blue-600">{slot.djInstagram}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">
                              {slot.submissionId ? 'Submitted' : 'Pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No DJs scheduled yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* DJ Submission Links */}
              <ErrorBoundary>
                <SubmissionLinks events={[event]} />
              </ErrorBoundary>
            </div>

            {/* Event Sidebar */}
            <div className="space-y-6">
              {/* Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle>Important Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-sm">Event Date</p>
                    <p className="text-gray-600">{event.date}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Guest List Deadline</p>
                    <p className="text-gray-600">{event.deadlines.guestList}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Promo Materials Deadline</p>
                    <p className="text-gray-600">{event.deadlines.promoMaterials}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Payment Due</p>
                    <p className="text-gray-600">{event.payment.dueDate}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-sm">Total Amount</p>
                    <p className="text-gray-600">{event.payment.amount.toLocaleString()} {event.payment.currency}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Per DJ</p>
                    <p className="text-gray-600">{event.payment.perDJ.toLocaleString()} {event.payment.currency}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Guest Limit per DJ</p>
                    <p className="text-gray-600">{event.guestLimitPerDJ} guests</p>
                  </div>
                </CardContent>
              </Card>


              {/* Instagram Hashtags */}
              {event.hashtags && (
                <Card>
                  <CardHeader>
                    <CardTitle>Instagram Hashtags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded">
                      {event.hashtags}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* QR Code Section */}
          {showQRCode && (
            <div className="mt-8">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-center">Event QR Code</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex justify-center mb-4">
                    <QRCode
                      data={`${baseUrl}/events/${event._id}`}
                      className="w-48 h-48 border rounded-lg p-4 bg-white"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Scan to view event details
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}