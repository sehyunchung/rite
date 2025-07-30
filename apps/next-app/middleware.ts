import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // More precise matcher to avoid conflicts with NextAuth
  matcher: [
    // Match root path for locale detection
    '/',
    // Match localized paths (dashboard, events, etc.)
    '/(ko|en)/:path*',
    // Match non-localized paths but exclude NextAuth, API, and static files
    '/((?!api|auth|_next|_vercel|favicon.ico|.*\\..*).*)'
  ]
};