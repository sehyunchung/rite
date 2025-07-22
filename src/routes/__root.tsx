import { createRootRoute, Outlet, useLocation, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { useAuth, useUser, SignOutButton } from '@clerk/clerk-react'
import { Footer } from '@/components/Footer'

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
        <header className="sticky top-0 z-10 bg-white p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link to={isSignedIn ? "/dashboard" : "/"}>
              <h1 className="text-lg font-normal hover:opacity-60 transition-opacity">
                <span className="text-xl mr-1">Ⓡ</span>
                <span>RITE</span>
              </h1>
            </Link>
            
            <div className="flex items-center gap-4">
              {isSignedIn && !isPublicRoute && (
                <>
                  <span className="text-sm text-gray-500">
                    {user?.firstName || user?.fullName || 'Organizer'}
                  </span>
                  <SignOutButton>
                    <button className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                      Sign Out
                    </button>
                  </SignOutButton>
                </>
              )}
              
              {location.pathname === '/events/create' && (
                <Link to="/dashboard">
                  <button className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    ← Back
                  </button>
                </Link>
              )}
            </div>
          </div>
        </header>
      )}
      
      <main className={isDJSubmission ? '' : 'p-8 pb-20'}>
        <Outlet />
      </main>
      
      <Footer />
      <TanStackRouterDevtools />
    </>
  )
}