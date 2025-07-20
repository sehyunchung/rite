import { createRootRoute, Outlet, useLocation, Link } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  const isDJSubmission = location.pathname === '/dj-submission'
  
  return (
    <>
      {!isDJSubmission && (
        <header className="sticky top-0 z-10 bg-slate-50 p-4 border-b-2 border-slate-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">DJ Event Booking System</h1>
            {location.pathname === '/events/create' && (
              <Link to="/">
                <Button variant="outline">
                  ← Back to Dashboard
                </Button>
              </Link>
            )}
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