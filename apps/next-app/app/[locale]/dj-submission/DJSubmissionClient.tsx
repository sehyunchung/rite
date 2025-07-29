'use client';

import { DJSubmissionForm } from '@/components/DJSubmissionForm';

interface DJSubmissionClientProps {
  submissionToken: string;
  locale: string;
}

export function DJSubmissionClient({ submissionToken, locale }: DJSubmissionClientProps) {
  return <DJSubmissionForm submissionToken={submissionToken} />;
}