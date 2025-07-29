import { Suspense } from 'react';
import { DJSubmissionForm } from '@/components/DJSubmissionForm';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading submission form...</p>
            </div>
          </div>
        </div>
      }
    >
      <DJSubmissionContent token={params.token} />
    </Suspense>
  );
}