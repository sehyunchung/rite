import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSignIn } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/auth/instagram/success')({
  component: InstagramSuccess,
})

function InstagramSuccess() {
  const navigate = useNavigate()
  const { signIn } = useSignIn()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [instagramData, setInstagramData] = useState<{
    accessToken: string
    userId: string
    username?: string
  } | null>(null)

  useEffect(() => {
    // Extract Instagram data from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('access_token')
    const userId = urlParams.get('user_id')
    
    if (accessToken && userId) {
      setInstagramData({ accessToken, userId })
      // Fetch Instagram username
      fetchInstagramUsername(accessToken)
    } else {
      // Redirect to login if no valid data
      navigate({ to: '/login' })
    }
  }, [navigate])

  const fetchInstagramUsername = async (accessToken: string) => {
    try {
      const response = await fetch(`https://graph.instagram.com/me?fields=username&access_token=${accessToken}`)
      const data = await response.json()
      if (data.username) {
        setInstagramData(prev => prev ? { ...prev, username: data.username } : null)
      }
    } catch (error) {
      console.error('Failed to fetch Instagram username:', error)
    }
  }

  const handleCompleteSignup = async () => {
    if (!instagramData || !email) return

    setIsLoading(true)
    try {
      // Use Clerk's custom OAuth flow to complete authentication
      // This would integrate with your Instagram OAuth proxy
      await signIn?.authenticateWithRedirect({
        strategy: 'oauth_custom_instagram',
        redirectUrl: '/auth/instagram/callback',
        redirectUrlComplete: '/dashboard',
      })
    } catch (error) {
      console.error('Instagram authentication failed:', error)
      setIsLoading(false)
    }
  }

  if (!instagramData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Instagram Login</CardTitle>
            <p className="text-gray-600 mt-2">
              Welcome {instagramData.username ? `@${instagramData.username}` : 'Instagram user'}!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                ✓ Instagram account connected successfully
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-gray-600">
                Instagram doesn't share email addresses, so we need this to create your Rite account.
              </p>
            </div>

            <Button 
              onClick={handleCompleteSignup}
              disabled={!email || isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Account...' : 'Complete Setup'}
            </Button>

            <div className="text-center">
              <button
                onClick={() => navigate({ to: '/login' })}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Use a different login method
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}