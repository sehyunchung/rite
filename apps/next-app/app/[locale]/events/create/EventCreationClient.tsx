'use client';

import { EventCreationForm } from '@/components/EventCreationForm';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Link } from '../../../../i18n/routing';
import { UserDisplay } from '@/components/UserDisplay';
import { signOut } from 'next-auth/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface EventCreationClientProps {
  userId: string;
  fallbackDisplayName: string;
  locale: string;
}

export function EventCreationClient({ userId, fallbackDisplayName, locale }: EventCreationClientProps) {
  const router = useRouter();
  const t = useTranslations('navigation');
  const tEvents = useTranslations('events.create');

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
          <div className="mb-8">
            <h1 className="text-3xl font-light text-gray-900">{tEvents('title')}</h1>
            <p className="text-gray-600 mt-2">{tEvents('subtitle')}</p>
          </div>
          
          <ErrorBoundary>
            <EventCreationForm 
              onEventCreated={() => router.push(`/${locale}/dashboard`)} 
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}