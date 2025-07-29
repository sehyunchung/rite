'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CopyButton } from './CopyButton';
import { useTranslations } from 'next-intl';

interface SubmissionLinksProps {
  events: any[];
}

export function SubmissionLinks({ events }: SubmissionLinksProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const t = useTranslations('events.detail.submissionLinks');

  if (!events.some((event: any) => event.timeslots?.length > 0)) {
    return null;
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('title')}</h2>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 mb-4">
            {t('description')}
          </p>
          <div className="space-y-4">
            {events.flatMap((event: any) => 
              (event.timeslots || []).map((slot: any) => {
                const submissionUrl = `${baseUrl}/dj-submission?token=${slot.submissionToken}`;
                
                return (
                  <div key={slot._id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{event.name}</h4>
                        <p className="text-sm text-gray-600">
                          {slot.djName} ({slot.djInstagram}) - {slot.startTime} to {slot.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-3">
                      <input
                        type="text"
                        readOnly
                        value={submissionUrl}
                        className="flex-1 px-3 py-2 text-sm border rounded-md bg-white"
                      />
                      <CopyButton text={submissionUrl} iconOnly={true} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}