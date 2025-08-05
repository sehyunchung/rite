'use client';

import { Card, CardContent } from '@rite/ui';
import { Button } from '@rite/ui';
import { ActionCard } from '@rite/ui';
import { EventCard } from '@rite/ui';
import { Typography } from '@rite/ui';
import { Link } from '../../../i18n/routing';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { LoadingIndicator } from '@rite/ui';
import { useEffectEvents } from '@/hooks/useEffectEvents';

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const { status } = useSession();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const t = useTranslations('dashboard');
  
  // Use Effect-validated events hook - eliminates undefined pollution
  const { events, isLoading } = useEffectEvents(userId);
  
  // Show loading state while session or events are loading
  if (status === 'loading' || isLoading) {
    return (
      <div className="space-y-8">
        {/* Placeholder for action cards grid */}
        <div className="grid gap-4 md:grid-cols-3 mb-8 opacity-0">
          <div className="h-32"></div>
          <div className="h-32"></div>  
          <div className="h-32"></div>
        </div>
        
        {/* Loading indicator in center */}
        <div className="flex items-center justify-center py-16">
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Link href="/events/create">
          <ActionCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
            title={t('actions.createEvent')}
            subtitle={t('actions.createEventDescription')}
            variant="default"
          />
        </Link>
        
        <ActionCard
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
          title={t('actions.viewSubmissions')}
          subtitle={t('actions.viewSubmissionsDescription')}
          variant="primary"
        />
        
        <ActionCard
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title={t('actions.eventCalendar')}
          subtitle={t('actions.eventCalendarDescription')}
          variant="secondary"
        />
      </div>

      {/* Events List */}
      <div className="mb-6">
        <Typography variant="h3" className="mb-4">{t('yourEvents')}</Typography>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="text-center">
                <Typography variant="body" color="secondary" className="mb-4">
                  {t('noEvents')}
                </Typography>
                <Button variant="outline" asChild>
                  <Link href="/events/create">{t('actions.createEvent')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => (
            <EventCard
              key={event._id}
              eventName={event.name}
              venueName={event.venue.name}
              date={event.date}
              djCount={event.timeslots.length}
              dueDate={event.deadlines.guestList}
              status={event.status === 'active' ? 'published' : 'draft'}
              onViewDetails={() => {
                window.location.href = `/events/${event._id}`;
              }}
              onShare={() => {
                navigator.clipboard.writeText(`${baseUrl}/events/${event._id}`);
              }}
            />
          ))
        )}
      </div>
    </>
  );
}