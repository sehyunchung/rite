import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  let errorMessage = 'An unexpected error occurred during authentication.'
  let errorDetails = ''

  switch (error) {
    case 'Configuration':
      errorMessage = 'OAuth Configuration Error'
      errorDetails = 'There was an issue with the Instagram OAuth configuration. Please check your setup.'
      break
    case 'AccessDenied':
      errorMessage = 'Access Denied'
      errorDetails = 'You denied access to your Instagram account. Please try again and authorize the application.'
      break
    case 'Verification':
      errorMessage = 'Verification Error'
      errorDetails = 'The Instagram account verification failed. Please ensure you have a Business or Creator account.'
      break
    default:
      errorMessage = 'Authentication Error'
      errorDetails = error ? `Error: ${error}` : 'Please try signing in again.'
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-extralight mb-8">Ⓡ</h1>
          <p className="text-sm text-gray-600">Authentication Error</p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">{errorMessage}</CardTitle>
            <CardDescription>{errorDetails}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Common issues:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Instagram account is not a Business or Creator account</li>
                <li>Authorization was cancelled or denied</li>
                <li>Network connectivity issues</li>
                <li>OAuth configuration problems</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/signin">
                  Try Again
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}