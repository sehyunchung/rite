import { auth, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  const displayName = session.user?.email || 'User'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-extralight">Ⓡ</h1>
              <span className="ml-2 text-xl font-medium">Rite</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {displayName}
              </span>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <Button variant="outline" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <div className="p-8">
        <h1 className="text-3xl font-light text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Your DJ event management platform is ready.</p>
      </div>
    </div>
  )
}