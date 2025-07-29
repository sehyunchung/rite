'use client';

import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CopyButton } from './CopyButton';

interface DashboardContentProps {
  userId: string;
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const { status } = useSession();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Use the public query for now until we implement proper Convex auth
  const events = useQuery(api.events.listEventsPublic) || [];
  const instagramConnection = useQuery(
    api.instagram.getInstagramConnection, 
    userId ? { userId: userId as Id<"users"> } : "skip"
  );
  
  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <Link href="/events/create">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900">Create Event</h3>
                <p className="text-sm text-gray-600 mt-1">Set up a new DJ event</p>
              </div>
            </CardContent>
          </Link>
        </Card>
        
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">View Submissions</h3>
              <p className="text-sm text-gray-600 mt-1">Check DJ submissions</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900">Event Calendar</h3>
              <p className="text-sm text-gray-600 mt-1">View upcoming events</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Events</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <p className="mb-4">No events yet. Create your first event to get started!</p>
                <Button variant="outline" asChild>
                  <Link href="/events/create">Create Event</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          events.map((event: any) => (
            <Card key={event._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{event.name}</CardTitle>
                  {event.status && (
                    <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.venue.name}</p>
                  <p className="text-sm text-gray-600">{event.venue.address}</p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{event.date}</span>
                  <span className="font-medium text-blue-600">
                    {event.timeslots?.length || 0} DJ{event.timeslots?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {event.deadlines && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Guest list due: {event.deadlines.guestList}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 space-x-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/events/${event._id}`}>
                    View Details
                  </Link>
                </Button>
                <CopyButton 
                  text={`${baseUrl}/events/${event._id}`}
                  iconOnly={true}
                  className="px-3"
                />
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </>
  );
}