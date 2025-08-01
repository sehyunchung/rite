'use client';

import { Link, usePathname } from '../../i18n/routing';
import { useTranslations } from 'next-intl';
import { Home, CalendarPlus, Calendar } from 'lucide-react';

export function BottomNavigation() {
  const t = useTranslations('navigation');
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: t('dashboard'),
      icon: Home,
      isActive: pathname === '/dashboard',
    },
    {
      href: '/events/create',
      label: t('createEvent'),
      icon: CalendarPlus,
      isActive: pathname === '/events/create',
    },
    {
      href: '/events',
      label: t('events'),
      icon: Calendar,
      isActive: pathname === '/events' || (pathname.startsWith('/events/') && !pathname.startsWith('/events/create')),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-700 border-t border-neutral-600 md:hidden z-50">
      <div className="flex justify-around items-center px-4 py-2 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                item.isActive
                  ? 'text-brand-primary'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}