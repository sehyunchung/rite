import { createFileRoute, Link } from '@tanstack/react-router'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { Button } from '@/components/ui/button'
import { useAuthState, useAuthSync } from '@/lib/auth'
import { InstagramConnect } from '@/components/instagram/InstagramConnect'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  )
}

function DashboardContent() {
  const { user } = useAuthState()
  useAuthSync() // Sync user data with Convex

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName || user?.fullName || 'Organizer'}!
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-16">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Rite</h2>
          <p className="text-lg text-slate-600">
            Streamline your DJ event management with Instagram integration
          </p>
        </div>
        
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          {/* Instagram Integration */}
          <div className="w-full max-w-2xl mx-auto">
            <InstagramConnect />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/events/create">
              <Button size="lg">
                🎪 Create New Event
              </Button>
            </Link>
            <Link to="/events">
              <Button 
                variant="outline" 
                size="lg"
              >
                📋 View All Events
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="lg"
              >
                📊 Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}