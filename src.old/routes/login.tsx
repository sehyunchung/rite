import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { LoginPage } from '@/components/auth/LoginPage'

export const Route = createFileRoute('/login')({
  component: Login,
})

function Login() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  // If already signed in, redirect to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      void router.navigate({ to: '/dashboard' })
    }
  }, [isLoaded, isSignedIn, router])

  if (isLoaded && isSignedIn) {
    return null
  }

  return <LoginPage />
}