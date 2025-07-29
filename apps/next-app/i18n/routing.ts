import { defineRouting } from 'next-intl/routing';
import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ko'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Optionally localize pathnames
  pathnames: {
    // If all locales use the same pathname, you can just
    // use a string for `pathname` or omit this entry.
    '/': '/',
    '/dashboard': '/dashboard',
    
    // If locales use different pathnames, you can
    // specify each one individually.
    '/events/create': {
      en: '/events/create',
      ko: '/events/create'
    },
    '/events/[eventId]': {
      en: '/events/[eventId]',
      ko: '/events/[eventId]'
    },
    '/dj-submission': {
      en: '/dj-submission',
      ko: '/dj-submission'
    }
  }
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation(routing);