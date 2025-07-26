import { auth, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Calendar, Users, Instagram, CheckCircle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  // TODO: Check Instagram connection status from Convex database
  const hasInstagramConnection = true

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-extralight">Ⓡ</h1>
              <span className="ml-2 text-xl font-medium">Rite</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session.user?.name || session.user?.email}
              </span>
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <Button variant="outline" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instagram Connection Status */}
        {hasInstagramConnection && (
          <div className="mb-8">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="flex items-center gap-3 pt-6">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    Instagram Connected Successfully! 🎉
                  </p>
                  <p className="text-sm text-green-700">
                    Your Instagram account was automatically connected during signup.
                    You can now publish posts directly from Rite.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your DJ events and submissions</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link href="/events/create">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Event
                </CardTitle>
                <CardDescription>
                  Set up a new DJ event with timeslots and submissions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/events">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  View Events
                </CardTitle>
                <CardDescription>
                  Manage your existing events and submissions
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Instagram
{hasInstagramConnection ? (
                  <Badge variant="secondary" className="ml-auto">
                    Connected
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription>
                {hasInstagramConnection 
                  ? 'Generate and publish Instagram posts for events'
                  : 'Connect your Instagram account for posting'
                }
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest events and submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No events yet. Create your first event to get started!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}