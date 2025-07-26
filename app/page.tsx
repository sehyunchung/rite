import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function HomePage() {
  const session = await auth()
  
  // Redirect authenticated users to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-extralight">Ⓡ</h1>
              <span className="ml-2 text-xl font-medium">Rite</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signin">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-extralight text-gray-900 mb-6">
            DJ Event Management
            <br />
            <span className="text-purple-600">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your DJ bookings with Instagram workflow integration. 
            Manage events, collect submissions, and automate social media promotion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signin">
              <Button size="lg" className="w-full sm:w-auto">
                Start Organizing
              </Button>
            </Link>
            <Link href="/dj-submission">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Submit Materials
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <Card>
            <CardHeader>
              <CardTitle>Event Creation</CardTitle>
              <CardDescription>
                Create professional DJ events with venues, timeslots, and payment details
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instagram Integration</CardTitle>
              <CardDescription>
                Automatic Instagram OAuth connection and content publishing capabilities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>DJ Submissions</CardTitle>
              <CardDescription>
                Unique submission links for DJs to upload materials and guest lists
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}