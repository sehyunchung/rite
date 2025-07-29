import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect(`/${locale}/auth/signin`)
  }

  // Display priority: user name > email > fallback
  // Instagram handle will be fetched client-side
  const displayName = session.user.name || session.user.email || 'User'

  return (
    <DashboardClient 
      userId={session.user.id} 
      fallbackDisplayName={displayName} 
    />
  )
}