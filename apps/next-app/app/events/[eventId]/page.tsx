import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { EventDetailClient } from './EventDetailClient'

export const dynamic = 'force-dynamic'

interface EventDetailPageProps {
  params: Promise<{
    eventId: string
  }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <EventDetailClient 
      eventId={eventId}
      userId={session.user.id} 
    />
  )
}