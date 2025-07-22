import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export const Route = createFileRoute('/auth/instagram/success')({
  component: InstagramSuccess,
})

function InstagramSuccess() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [instagramData, setInstagramData] = useState<{
    accessToken: string
    userId: string
    username?: string
  } | null>(null)
  
  const saveConnection = useMutation(api.instagram.saveConnection)

  useEffect(() => {
    // Extract Instagram data from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('access_token')
    const userId = urlParams.get('user_id')
    const state = urlParams.get('state')
    
    if (accessToken && userId) {
      setInstagramData({ accessToken, userId })
      // Fetch Instagram username
      void fetchInstagramUsername(accessToken)
      
      // If this is a dashboard connection (not login), handle differently
      if (state && state.startsWith('dashboard-connect-')) {
        // This is an Instagram connection from dashboard, not a login attempt
        // TODO: Save Instagram connection to Convex and redirect back to dashboard
        console.log('Dashboard Instagram connection:', { accessToken, userId, state })
      }
    } else {
      // Redirect to login if no valid data
      void navigate({ to: '/login' })
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
      // Check if this is a dashboard connection or login attempt
      const urlParams = new URLSearchParams(window.location.search)
      const state = urlParams.get('state')
      
      if (state && state.startsWith('dashboard-connect-')) {
        // This is a dashboard Instagram connection - save to Convex and redirect back
        console.log('Saving Instagram connection for authenticated user:', instagramData)
        
        try {
          await saveConnection({
            instagramUserId: instagramData.userId,
            username: instagramData.username || instagramData.userId,
            accessToken: instagramData.accessToken,
            accountType: 'business', // Assume business account for now
          })
          
          alert(`Instagram account @${instagramData.username || instagramData.userId} connected successfully!`)
          void navigate({ to: '/dashboard' })
        } catch (error) {
          console.error('Failed to save Instagram connection:', error)
          alert('Failed to connect Instagram account. Please try again.')
          setIsLoading(false)
        }
      } else {
        // This is a login attempt - the old flow (should not happen anymore with working OAuth)
        console.log('Instagram login data:', instagramData)
        console.log('Email:', email)
        
        alert('Instagram login is now handled through the main login page. Please use the Instagram button on the login page.')
        void navigate({ to: '/login' })
      }
    } catch (error) {
      console.error('Instagram connection failed:', error)
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
              onClick={() => void handleCompleteSignup()}
              disabled={!email || isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating Account...' : 'Complete Setup'}
            </Button>

            <div className="text-center">
              <button
                onClick={() => void navigate({ to: '/login' })}
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