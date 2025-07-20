import { createRootRoute, Outlet, useLocation, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAuth, useUser, SignOutButton } from '@clerk/clerk-react'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const isDJSubmission = location.pathname === '/dj-submission'
  const isPublicRoute = location.pathname === '/' || location.pathname === '/login'
  
  return (
    <>
      {!isDJSubmission && (
        <header className="sticky top-0 z-10 bg-slate-50 p-4 border-b-2 border-slate-200">
          <div className="flex items-center justify-between">
            <Link to={isSignedIn ? "/dashboard" : "/"}>
              <h1 className="text-xl font-bold hover:text-blue-600 transition-colors">
                DJ Event Booking System
              </h1>
            </Link>
            
            <div className="flex items-center gap-4">
              {isSignedIn && !isPublicRoute && (
                <>
                  <span className="text-sm text-gray-600">
                    {user?.firstName || user?.fullName || 'Organizer'}
                  </span>
                  <SignOutButton>
                    <Button variant="outline" size="sm">
                      Sign Out
                    </Button>
                  </SignOutButton>
                </>
              )}
              
              {location.pathname === '/events/create' && (
                <Link to="/dashboard">
                  <Button variant="outline">
                    ← Back to Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>
      )}
      
      <main className={isDJSubmission ? '' : 'p-8'}>
        <Outlet />
      </main>
      
      <Footer />
      <TanStackRouterDevtools />
    </>
  )
}