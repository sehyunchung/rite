import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/signin')
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
