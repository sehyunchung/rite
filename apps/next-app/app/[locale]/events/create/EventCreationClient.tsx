'use client';

import { EventCreationForm } from '@/components/EventCreationForm';
import { useRouter } from 'next/navigation';
import { Button, Typography } from '@rite/ui';
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
    <div className="min-h-screen bg-neutral-800">
      {/* Navigation */}
      <nav className="bg-neutral-700 border-b border-neutral-600">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4 sm:space-x-8">
              <div className="flex items-center">
                <Typography variant="h5" className="text-brand-primary">RITE</Typography>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-sm font-medium text-white hover:text-brand-primary transition-colors">
                  {t('dashboard')}
                </Link>
                <Link href="/events/create" className="text-sm font-medium text-white hover:text-brand-primary transition-colors">
                  {t('createEvent')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden sm:block">
                <ErrorBoundary fallback={<span className="text-gray-600">{fallbackDisplayName}</span>}>
                  <UserDisplay userId={userId} fallbackName={fallbackDisplayName} />
                </ErrorBoundary>
              </div>
              <LanguageSwitcher />
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                {t('signOut')}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <div className="p-3 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-8">
            <Typography variant="h1" className="text-2xl sm:text-3xl">{tEvents('title')}</Typography>
            <Typography variant="body-lg" color="secondary" className="mt-1 sm:mt-2">{tEvents('subtitle')}</Typography>
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