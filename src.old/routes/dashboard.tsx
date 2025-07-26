import { createFileRoute, Link } from '@tanstack/react-router'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { useAuthSync } from '@/lib/auth'
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
  useAuthSync() // Sync user data with Convex

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-12">
        
        <div className="flex flex-col gap-8 max-w-4xl mx-auto">
          {/* Instagram Integration */}
          <div className="w-full max-w-2xl mx-auto">
            <InstagramConnect />
          </div>

          {/* Action Links */}
          <div className="flex flex-col items-center space-y-3">
            <Link to="/events/create" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Create new event
            </Link>
            <Link to="/events" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              View all events
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}