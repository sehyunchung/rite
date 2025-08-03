import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SubmissionsClient } from './SubmissionsClient';

export const dynamic = 'force-dynamic';

export default async function SubmissionsPage({
  params,
}: {
  params: { eventId: string; locale: string };
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect(`/${params.locale}/auth/signin`);
  }

  return (
    <SubmissionsClient
      eventId={params.eventId}
      userId={session.user.id}
      locale={params.locale}
    />
  );
}