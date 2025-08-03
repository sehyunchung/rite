import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SubmissionsClient } from './SubmissionsClient';

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ eventId: string; locale: string }>;
}) {
  const resolvedParams = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(`/${resolvedParams.locale}/auth/signin`);
  }

  return (
    <SubmissionsClient
      eventId={resolvedParams.eventId}
      userId={session.user.id}
      locale={resolvedParams.locale}
    />
  );
}