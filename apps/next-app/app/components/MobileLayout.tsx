'use client';

import { ReactNode, useEffect } from 'react';
import { BottomNavigation } from './BottomNavigation';
import { Button, Typography } from '@rite/ui';
import { signOut } from 'next-auth/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { UserDisplay } from './UserDisplay';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, usePathname } from '../../i18n/routing';

interface MobileLayoutProps {
  children: ReactNode;
  userId?: string;
  fallbackDisplayName?: string;
}

export function MobileLayout({ children, userId, fallbackDisplayName }: MobileLayoutProps) {
  const t = useTranslations('navigation');
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Reset menu state when pathname changes (navigation occurs)
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Mobile Header */}
      <header className="bg-bg-secondary border-b border-border md:hidden">
        <div className="flex justify-between items-center px-4 py-3">
          <Typography variant="h5" className="text-brand-primary">RITE</Typography>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-bg-secondary border-b border-border z-40 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-4 p-4">
              {userId && fallbackDisplayName && (
                <div className="flex items-center justify-between">
                  <UserDisplay userId={userId} fallbackName={fallbackDisplayName} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <LanguageSwitcher />
                  <ThemeSwitcher />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setIsMenuOpen(false);
                  }}
                >
                  {t('signOut')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Navigation (unchanged) */}
      <nav className="bg-bg-secondary border-b border-border hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <Typography variant="h5" className="ml-2 text-brand-primary">RITE</Typography>
              </div>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-sm font-medium text-text-primary hover:text-brand-primary transition-colors">
                  {t('dashboard')}
                </Link>
                <Link href="/events/create" className="text-sm font-medium text-text-primary hover:text-brand-primary transition-colors">
                  {t('createEvent')}
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {userId && fallbackDisplayName && (
                <UserDisplay userId={userId} fallbackName={fallbackDisplayName} />
              )}
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                {t('signOut')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </div>
  );
}