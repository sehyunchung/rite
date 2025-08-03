import { notFound } from 'next/navigation';
import { EventEditClient } from './EventEditClient';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface EventEditPageProps {
  params: Promise<{
    eventId: string;
    locale: string;
  }>;
}

export default async function EventEditPage({ params }: EventEditPageProps) {
  const { eventId, locale } = await params;
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  return (
    <EventEditClient
      eventId={eventId}
      userId={session.user.id!}
      locale={locale}
    />
  );
}