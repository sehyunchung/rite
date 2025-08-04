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
import { isValidConvexId } from '@/lib/utils';

interface EventEditClientProps {
  eventId: string;
  userId: string;
  locale: string;
}

export function EventEditClient({ eventId, userId, locale }: EventEditClientProps) {
  const router = useRouter();
  const t = useTranslations('events.edit');

  // Validate IDs before using them
  const isValidEventId = isValidConvexId(eventId);
  const isValidUserId = isValidConvexId(userId);

  const event = useQuery(
    api.events.getEvent,
    isValidEventId && isValidUserId ? { 
      eventId: eventId as Id<"events">,
      userId: userId as Id<"users">
    } : "skip"
  );

  // Handle invalid IDs
  if (!isValidEventId || !isValidUserId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="mb-2">{t('invalidRequest')}</Typography>
          <Typography variant="body" color="secondary" className="mb-4">
            {t('invalidRequestMessage') || 'The request contains invalid parameters'}
          </Typography>
          <Button onClick={() => router.push(`/${locale}/dashboard`)}>
            {t('backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  if (event === undefined) {
    return <FullScreenLoading />;
  }

  if (event === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="mb-2">{t('eventNotFound')}</Typography>
          <Typography variant="body" color="secondary" className="mb-4">
            {t('eventNotFoundMessage')}
          </Typography>
          <Button onClick={() => router.push(`/${locale}/dashboard`)}>
            {t('backToDashboard')}
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
              ← {t('backToEvent')}
            </Button>
          </div>

          <div className="mb-6 md:mb-8">
            <Typography variant="h1" className="text-2xl md:text-3xl">
              {t('title')}: {event.name}
            </Typography>
            <Typography variant="body-lg" color="secondary" className="mt-2">
              {t('subtitle')}
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