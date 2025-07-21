import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Instagram, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'

export function InstagramConnect() {
  const { isSignedIn } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  
  const connection = useQuery(api.instagram.getConnection)
  const hasConnection = useQuery(api.instagram.hasActiveConnection)
  const disconnectAccount = useMutation(api.instagram.disconnectAccount)
  
  const handleConnect = () => {
    if (!isSignedIn) {
      alert('Please sign in first to connect Instagram')
      return
    }
    
    setIsConnecting(true)
    
    const authUrl = new URL('https://api.instagram.com/oauth/authorize')
    authUrl.searchParams.set('client_id', import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '735938226061336')
    authUrl.searchParams.set('redirect_uri', import.meta.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5173/auth/instagram/callback')
    authUrl.searchParams.set('scope', 'instagram_basic,instagram_content_publish')
    authUrl.searchParams.set('response_type', 'code')
    
    window.location.href = authUrl.toString()
  }
  
  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Instagram account?')) {
      await disconnectAccount()
    }
  }

  if (!isSignedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Connection
          </CardTitle>
          <CardDescription>
            Sign in to connect your Instagram account for post generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled variant="outline">
            <Instagram className="h-4 w-4 mr-2" />
            Connect Instagram
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (hasConnection && connection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Connected
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardTitle>
          <CardDescription>
            Your Instagram account is connected and ready for post generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">@{connection.username}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {connection.accountType === 'business' ? 'Business' : 'Personal'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Connected on {new Date(connection.connectedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDisconnect}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          Connect Instagram
        </CardTitle>
        <CardDescription>
          Connect your Instagram Business account to enable direct posting and scheduling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800">
              Instagram Business Account Required
            </p>
            <p className="text-sm text-amber-700">
              To publish posts directly, you'll need a Business or Creator account. 
              Personal accounts can only generate and download posts.
            </p>
          </div>
        </div>
        
        <Button onClick={handleConnect} disabled={isConnecting} className="w-full">
          <Instagram className="h-4 w-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Instagram Account'}
        </Button>
        
        <p className="text-xs text-muted-foreground">
          By connecting, you allow Rite to publish posts on your behalf. 
          You can disconnect at any time.
        </p>
      </CardContent>
    </Card>
  )
}