'use client';

import { EventEditForm } from '@/components/EventEditForm';
import { useRouter } from 'next/navigation';
import { Typography } from '@rite/ui';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useTranslations } from 'next-intl';
import { MobileLayout } from '@/components/MobileLayout';
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { FullScreenLoading } from '@rite/ui';
import { Button } from '@rite/ui';

interface EventEditClientProps {
  eventId: string;
  userId: string;
  locale: string;
}

export function EventEditClient({ eventId, userId, locale }: EventEditClientProps) {
  const router = useRouter();
  const tEvents = useTranslations('events.edit');
  const tCommon = useTranslations('common');

  const event = useQuery(
    api.events.getEvent,
    { 
      eventId: eventId as Id<"events">,
      userId: userId as Id<"users">
    }
  );

  if (event === undefined) {
    return <FullScreenLoading />;
  }

  if (event === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="mb-2">Event not found</Typography>
          <Typography variant="body" color="secondary" className="mb-4">
            The event you're trying to edit doesn't exist or you don't have permission to edit it.
          </Typography>
          <Button onClick={() => router.push(`/${locale}/dashboard`)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <MobileLayout userId={userId} fallbackDisplayName="User">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button - Desktop only */}
          <div className="hidden md:block mb-4">
            <Button variant="outline" onClick={() => router.push(`/${locale}/events/${eventId}`)}>
              ← Back to Event
            </Button>
          </div>

          <div className="mb-6 md:mb-8">
            <Typography variant="h1" className="text-2xl md:text-3xl">
              Edit Event: {event.name}
            </Typography>
            <Typography variant="body-lg" color="secondary" className="mt-2">
              Update your event details and DJ lineup
            </Typography>
          </div>
          
          <ErrorBoundary>
            <EventEditForm 
              event={event}
              onEventUpdated={() => router.push(`/${locale}/events/${eventId}`)} 
            />
          </ErrorBoundary>
        </div>
      </div>
    </MobileLayout>
  );
}