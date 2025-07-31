'use client';

import { Button } from '@rite/ui';
import { Link } from '../../../i18n/routing';
import { DashboardContent } from './DashboardContent';
import { UserDisplay } from '@/components/UserDisplay';
import { signOut } from 'next-auth/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface DashboardClientProps {
  userId: string;
  fallbackDisplayName: string;
}

export function DashboardClient({ userId, fallbackDisplayName }: DashboardClientProps) {
  const t = useTranslations('navigation');
  const tDashboard = useTranslations('dashboard');

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
                  {t('dashboard')}
                </Link>
                <Link href="/events/create" className="text-sm font-medium text-gray-900 hover:text-gray-700">
                  {t('createEvent')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ErrorBoundary fallback={<span className="text-gray-600">{fallbackDisplayName}</span>}>
                <UserDisplay userId={userId} fallbackName={fallbackDisplayName} />
              </ErrorBoundary>
              <LanguageSwitcher />
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                {t('signOut')}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-light text-gray-900">{tDashboard('title')}</h1>
              <p className="text-gray-600 mt-2">{tDashboard('welcome')}</p>
            </div>
            <Button asChild>
              <Link href="/events/create">{tDashboard('createNewEvent')}</Link>
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