import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">{t('welcome')}</h1>
        <p className="text-gray-600 mb-8">{t('title')}</p>
        <div className="space-x-4">
          <Link 
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {t('createNewEvent')}
          </Link>
        </div>
      </div>
    </div>
  );
}