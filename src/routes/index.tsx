import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  // If authenticated, redirect to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void router.navigate({ to: '/dashboard' })
    }
  }, [isLoaded, isSignedIn, router])

  // Show loading while auth state is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Public landing page for non-authenticated users
  return (
    <div className="flex flex-col gap-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Rite</h1>
        <p className="text-lg text-slate-600">
          Streamline your DJ event management with Instagram integration
        </p>
      </div>
      <PublicContent />
    </div>
  )
}

function PublicContent() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Landing page for non-authenticated users */}
      <div className="text-center space-y-6">
        <h2 className="text-2xl font-semibold">For Event Organizers</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Manage your DJ events, track submissions, and coordinate with DJs seamlessly. 
          Get started with professional event management tools.
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/login">
            <Button size="lg">
              🔐 Organizer Login
            </Button>
          </Link>
          <Link to="/login">
            <Button 
              variant="outline" 
              size="lg"
            >
              📋 Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}