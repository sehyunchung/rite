import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  let session = null
  try {
    session = await auth()
  } catch (error) {
    console.error('Auth error in HomePage:', error)
  }

  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard')
  }

  // Redirect unauthenticated users to login
  redirect('/auth/signin')
}
