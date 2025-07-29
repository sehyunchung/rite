'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DashboardContent } from '@/components/DashboardContent';
import { UserDisplay } from '@/components/UserDisplay';
import { signOut } from 'next-auth/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface DashboardClientProps {
  userId: string;
  fallbackDisplayName: string;
}

export function DashboardClient({ userId, fallbackDisplayName }: DashboardClientProps) {
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
              <ErrorBoundary fallback={<span className="text-gray-600">{fallbackDisplayName}</span>}>
                <UserDisplay userId={userId} fallbackName={fallbackDisplayName} />
              </ErrorBoundary>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back!</p>
            </div>
            <Button asChild>
              <Link href="/events/create">Create New Event</Link>
            </Button>
          </div>

          <ErrorBoundary>
            <DashboardContent userId={userId} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}