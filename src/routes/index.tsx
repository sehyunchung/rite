import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
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
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-extralight mb-4">
          <span className="text-7xl">Ⓡ</span>
        </h1>
        <p className="text-sm text-gray-600">
          DJ event management
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
      <div className="text-center space-y-8">
        <div className="flex gap-6 justify-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Login
          </Link>
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}