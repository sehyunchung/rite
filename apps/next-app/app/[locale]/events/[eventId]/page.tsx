import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { EventDetailClient } from './EventDetailClient'

export const dynamic = 'force-dynamic'

interface EventDetailPageProps {
  params: Promise<{
    locale: string;
    eventId: string;
  }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { locale, eventId } = await params
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect(`/${locale}/auth/signin`)
  }

  return (
    <EventDetailClient 
      eventId={eventId}
      userId={session.user.id}
      locale={locale}
    />
  )
}