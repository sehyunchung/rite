import { signIn, auth } from '@/lib/auth'
import { Button, Typography } from '@rite/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@rite/ui'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function SignInPage({ params }: Props) {
  const { locale } = await params
  const session = await auth()
  const t = await getTranslations('auth')
  
  // Redirect if already authenticated
  if (session) {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-neutral-800 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center">
          <Typography variant="h1" className="text-5xl text-brand-primary">RITE</Typography>
          <Typography variant="body-lg" color="secondary" className="mt-4">{t('tagline')}</Typography>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle>{t('signIn')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Sign In */}
            <form
              action={async () => {
                'use server'
                await signIn('google', { redirectTo: `/${locale}/dashboard` })
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="w-full"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('continueWithGoogle')}
                </span>
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-neutral-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-neutral-700 px-2 text-neutral-400">{t('or')}</span>
              </div>
            </div>

            {/* Instagram Sign In */}
            <form
              action={async () => {
                'use server'
                await signIn('instagram', { redirectTo: `/${locale}/dashboard` })
              }}
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                  </svg>
                  {t('continueWithInstagram')}
                </span>
              </Button>
            </form>

            {/* Mobile OAuth guidance - only show for Instagram */}
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Typography variant="body-sm" className="text-blue-400 font-medium mb-1">{t('mobileGuidance.title')}</Typography>
              <Typography variant="body-sm" className="text-blue-400">{t('mobileGuidance.message')}</Typography>
              <Typography variant="body-xs" color="secondary" className="mt-2">
                {t('accountRequirement')}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}