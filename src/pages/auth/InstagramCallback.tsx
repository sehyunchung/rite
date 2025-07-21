import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, Instagram } from 'lucide-react'

export function InstagramCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const exchangeCode = useAction(api.instagram.exchangeCodeForToken)
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [username, setUsername] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      setStatus('error')
      setErrorMessage(errorDescription || 'Instagram authorization was denied')
      return
    }

    if (!code) {
      setStatus('error')
      setErrorMessage('No authorization code received from Instagram')
      return
    }

    // Exchange code for token
    exchangeCode({ code })
      .then((result) => {
        if (result.success) {
          setStatus('success')
          setUsername(result.username || '')
        } else {
          setStatus('error')
          setErrorMessage('Failed to connect Instagram account')
        }
      })
      .catch((error) => {
        setStatus('error')
        setErrorMessage(error.message || 'Failed to connect Instagram account')
      })
  }, [searchParams, exchangeCode])

  const handleContinue = () => {
    navigate('/dashboard')
  }

  const handleRetry = () => {
    navigate('/dashboard')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Connecting Instagram</CardTitle>
            <CardDescription>
              Setting up your Instagram connection...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              This may take a few seconds
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Instagram Connected!</CardTitle>
            <CardDescription>
              Your Instagram account has been successfully connected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Instagram className="h-5 w-5" />
              <span className="font-medium">@{username}</span>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ Account connected</p>
              <p>✅ Publishing permissions granted</p>
              <p>✅ Ready to generate Instagram posts</p>
            </div>
            
            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Connection Failed</CardTitle>
          <CardDescription>
            Unable to connect your Instagram account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Common issues:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Account is not a Business or Creator account</li>
              <li>Authorization was cancelled</li>
              <li>Network connection issues</li>
            </ul>
          </div>
          
          <Button onClick={handleRetry} variant="outline" className="w-full">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}