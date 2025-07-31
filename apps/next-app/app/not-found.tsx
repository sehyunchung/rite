import { Button, Typography } from '@rite/ui'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-800">
      <div className="max-w-md w-full p-8">
        <div className="text-center">
          <Typography variant="h2" className="mb-4">
            Page Not Found
          </Typography>
          <Typography variant="body-lg" color="secondary" className="mb-6">
            The page you're looking for doesn't exist.
          </Typography>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}