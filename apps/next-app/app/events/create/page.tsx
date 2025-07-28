'use client';

import { EventCreationForm } from '@/components/EventCreationForm';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserDisplay } from '@/components/UserDisplay';
import { signOut } from 'next-auth/react';

export const dynamic = 'force-dynamic'

export default function CreateEventPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const displayName = session?.user?.name || session?.user?.email || 'User';

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
                <Link href="/dashboard" className="text-sm font-medium text-gray-900 hover:text-gray-700">
                  Dashboard
                </Link>
                <Link href="/events/create" className="text-sm font-medium text-gray-900 hover:text-gray-700">
                  Create Event
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <UserDisplay userId={session?.user?.id || ''} fallbackName={displayName} />
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-900">Create New Event</h1>
            <p className="text-gray-600 mt-2">Set up your DJ event with all the necessary details.</p>
          </div>
          
          <EventCreationForm 
            onEventCreated={() => router.push('/dashboard')} 
          />
        </div>
      </div>
    </div>
  );
}