import { Suspense } from 'react';
import { DJSubmissionForm } from '@/components/DJSubmissionForm';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { FullScreenLoading } from '@/components/ui/loading-indicator';

// Disable static generation for this page since it uses search params
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

function DJSubmissionContent({ token }: { token?: string }) {
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h1>
          <p className="text-gray-600">
            No submission token provided. Please use the link sent to you by the event organizer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <DJSubmissionForm submissionToken={token} />
    </ErrorBoundary>
  );
}

export default async function DJSubmissionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  return (
    <Suspense
      fallback={
        <FullScreenLoading />
      }
    >
      <DJSubmissionContent token={params.token} />
    </Suspense>
  );
}