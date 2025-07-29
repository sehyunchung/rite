import { Suspense } from 'react';
import { DJSubmissionClient } from './DJSubmissionClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getTranslations } from 'next-intl/server';
import { FullScreenLoading } from '@/components/ui/loading-indicator';

// Disable static generation for this page since it uses search params
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}

interface DJSubmissionContentProps {
  token?: string;
  locale: string;
}

async function DJSubmissionContent({ token, locale }: DJSubmissionContentProps) {
  const t = await getTranslations('djSubmission');
  
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('invalidLink')}</h1>
          <p className="text-gray-600">
            {t('invalidLinkMessage')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DJSubmissionClient submissionToken={token} locale={locale} />
    </ErrorBoundary>
  );
}

export default async function DJSubmissionPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const searchParamsData = await searchParams;
  
  return (
    <Suspense
      fallback={
        <FullScreenLoading />
      }
    >
      <DJSubmissionContent token={searchParamsData.token} locale={locale} />
    </Suspense>
  );
}