import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@rite/ui'
import { Button } from '@rite/ui'
import { Link } from '../../../../i18n/routing'
import { getTranslations } from 'next-intl/server'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ error?: string }>
}

export default async function AuthErrorPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { error } = await searchParams
  const t = await getTranslations('auth')

  const getErrorMessage = (error?: string) => {
    switch (error) {
      case 'Configuration':
        return t('errors.configuration')
      case 'AccessDenied':
        return t('errors.accessDenied')
      case 'Verification':
        return t('errors.verification')
      default:
        return t('errors.default')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-medium text-red-600">RITE</h1>
          <p className="text-lg text-gray-600 mt-4">{t('error.title')}</p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">{t('error.heading')}</CardTitle>
            <CardDescription>
              {getErrorMessage(error)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Link href={`/${locale}/auth/signin`}>
                <Button className="w-full">
                  {t('error.tryAgain')}
                </Button>
              </Link>
              <Link href={`/${locale}`}>
                <Button variant="outline" className="w-full">
                  {t('error.goHome')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}