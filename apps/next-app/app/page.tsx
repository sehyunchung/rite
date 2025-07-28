import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen bg-white font-mono">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-1">
              <h1 className="text-2xl font-extralight flex pb-[2px]">Ⓡ</h1>
              <span className="text-lg font-medium uppercase font-suit">RITE</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="font-suit" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button className="font-suit" asChild>
                <Link href="/auth/signin">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Font Test Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-suit font-bold text-gray-900 mb-4">SUIT Variable Font Test</h1>
          <p className="text-xl font-suit font-light text-gray-600 mb-8">가나다라마바사 ABCDEFG 한글과 영문이 모두 잘 보입니다</p>
          <div className="space-y-4">
            <p className="text-lg font-suit font-thin">Font Weight 100 - 매우 얇은 글꼴</p>
            <p className="text-lg font-suit font-light">Font Weight 300 - 얇은 글꼴</p>
            <p className="text-lg font-suit font-normal">Font Weight 400 - 보통 글꼴</p>
            <p className="text-lg font-suit font-medium">Font Weight 500 - 중간 글꼴</p>
            <p className="text-lg font-suit font-semibold">Font Weight 600 - 세미볼드 글꼴</p>
            <p className="text-lg font-suit font-bold">Font Weight 700 - 굵은 글꼴</p>
            <p className="text-lg font-suit font-extrabold">Font Weight 800 - 매우 굵은 글꼴</p>
            <p className="text-lg font-suit font-black">Font Weight 900 - 블랙 글꼴</p>
          </div>
        </div>
      </div>
    </div>
  )
}
