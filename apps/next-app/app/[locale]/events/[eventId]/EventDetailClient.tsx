'use client';

import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id, Doc } from '@rite/backend/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@rite/ui';
import { Badge } from '@rite/ui';
import { Button } from '@rite/ui';
import { FullScreenLoading } from '@rite/ui';
import { Link } from '../../../../i18n/routing';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SubmissionLinks } from '@/components/SubmissionLinks';
import { QRCode } from '@/components/ui/kibo-ui/qr-code';
import { useState } from 'react';
import { EditIcon, ClipboardListIcon, QrCodeIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EventDetailClientProps {
  eventId: string;
  userId: string;
  locale: string;
}

export function EventDetailClient({ eventId, userId, locale }: EventDetailClientProps) {
  const router = useRouter();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const [showQRCode, setShowQRCode] = useState(false);
  const t = useTranslations('events.detail');
  const tNav = useTranslations('navigation');
  const tStatus = useTranslations('status');
  
  const event = useQuery(
    api.events.getEvent,
    { 
      eventId: eventId as Id<"events">,
      userId: userId as Id<"users">
    }
  );

  if (event === undefined) {
    return (
      <FullScreenLoading />
    );
  }

  if (event === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{t('notFound')}</h1>
          <p className="text-gray-600 mb-4">{t('notFoundMessage')}</p>
          <Button onClick={() => router.push(`/${locale}/dashboard`)}>
            {t('backToDashboard')}
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
                  {tNav('dashboard')}
                </Link>
                <span className="text-sm font-medium text-gray-900">Event Details</span>
              </nav>
            </div>
            <Button variant="outline" onClick={() => router.push(`/${locale}/dashboard`)}>
              {t('backToDashboard')}
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
                    {tStatus(event.status)}
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
                  onClick={() => router.push(`/${locale}/events/${event._id}/submissions`)}
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
                  <CardTitle>{t('venueInformation')}</CardTitle>
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
                  <CardTitle>{t('djLineup', { count: event.timeslots?.length || 0 })}</CardTitle>
                </CardHeader>
                <CardContent>
                  {event.timeslots && event.timeslots.length > 0 ? (
                    <div className="space-y-4">
                      {event.timeslots.map((slot: Doc<"timeslots">) => (
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
                              {slot.submissionId ? t('status.submitted') : t('status.pending')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">{t('noDJsScheduled')}</p>
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
                  <CardTitle>{t('importantDates')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-sm">{t('eventDate')}</p>
                    <p className="text-gray-600">{event.date}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('guestListDeadline')}</p>
                    <p className="text-gray-600">{event.deadlines.guestList}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('promoMaterialsDeadline')}</p>
                    <p className="text-gray-600">{event.deadlines.promoMaterials}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('paymentDue')}</p>
                    <p className="text-gray-600">{event.payment.dueDate}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('paymentDetails')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-medium text-sm">{t('totalAmount')}</p>
                    <p className="text-gray-600">{event.payment.amount.toLocaleString()} {event.payment.currency}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('perDJ')}</p>
                    <p className="text-gray-600">{event.payment.perDJ.toLocaleString()} {event.payment.currency}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t('guestLimitPerDJ')}</p>
                    <p className="text-gray-600">{event.guestLimitPerDJ} {t('guests')}</p>
                  </div>
                </CardContent>
              </Card>


              {/* Instagram Hashtags */}
              {event.hashtags && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('instagramHashtags')}</CardTitle>
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
                  <CardTitle className="text-center">{t('qrCode.title')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="flex justify-center mb-4">
                    <QRCode
                      data={`${baseUrl}/${locale}/events/${event._id}`}
                      className="w-48 h-48 border rounded-lg p-4 bg-white"
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {t('qrCode.description')}
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