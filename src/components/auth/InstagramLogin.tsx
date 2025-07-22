import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useSignIn } from '@clerk/clerk-react'

interface InstagramLoginProps {
  onStartLogin?: () => void
}

export function InstagramLogin({ onStartLogin }: InstagramLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useSignIn()

  const handleInstagramLogin = async () => {
    setIsLoading(true)
    onStartLogin?.()
    
    try {
      // Use Clerk's OAuth flow with the custom Instagram provider
      await signIn?.authenticateWithRedirect({
        strategy: 'oauth_custom_instagram',
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard',
      })
    } catch (error) {
      console.error('Instagram login failed:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <Button
        variant="outline"
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
        onClick={handleInstagramLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Connecting...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Continue with Instagram
          </div>
        )}
      </Button>

      <p className="text-xs text-center text-gray-600">
        Requires Instagram Business or Creator account
      </p>
      <p className="text-xs text-center text-gray-500">
        Personal accounts need to <a href="https://help.instagram.com/502981923235522" target="_blank" rel="noopener noreferrer" className="underline">switch to professional</a>
      </p>
    </div>
  )
}