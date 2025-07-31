# RITE Next.js Web Application

The main web application for the RITE DJ event management platform.

## Overview

This Next.js application serves as the primary web interface for RITE, featuring event creation, DJ submission management, and Instagram integration for seamless social media workflows.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript with strict mode
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS variables
- **UI Components**: [@rite/ui](../../packages/ui) shared component library
- **Backend**: [@rite/backend](../../packages/backend) Convex real-time database
- **Authentication**: [NextAuth v5](https://authjs.dev/) with Instagram OAuth
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) (Korean/English)
- **Validation**: [ArkType](https://arktype.io/) for schema validation
- **Typography**: SUIT Variable font (Korean/English support)
- **Dev Server**: Turbopack for fast HMR

## Key Features

- **Event Management**: Create and manage DJ events with timeslots
- **Instagram Integration**: OAuth login and auto-connection for social media workflows
- **DJ Submissions**: Token-based submission system with guest lists and payment info
- **Internationalization**: Full Korean and English support with locale-based routing
- **Real-time Updates**: Powered by Convex for instant data synchronization
- **Responsive Design**: Mobile-first approach with desktop optimizations

## Project Structure

```
apps/next-app/
├── app/
│   ├── [locale]/                # Internationalized routes
│   │   ├── layout.tsx          # Locale-specific layout
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Organizer dashboard
│   │   ├── events/           # Event management
│   │   ├── dj-submission/    # Public DJ submission
│   │   └── auth/            # Authentication pages
│   ├── api/
│   │   └── auth/[...nextauth]/ # NextAuth API routes
│   ├── components/            # React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                # Utilities and configs
│   └── providers/          # React context providers
├── i18n/                  # Internationalization config
├── messages/             # Translation files
│   ├── en.json          # English translations
│   └── ko.json         # Korean translations
└── public/            # Static assets
```

## Development

### Prerequisites

- Node.js 18+
- pnpm package manager
- Convex account (for backend)
- Instagram app credentials (for OAuth)

### Environment Variables

Create `.env.local` with:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_URL=your_convex_deployment_url

# NextAuth
NEXTAUTH_URL=http://localhost:8000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Instagram OAuth
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.sehyunchung.workers.dev

# Optional
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# Apple OAuth - TBD
# APPLE_ID=your_apple_id
# APPLE_SECRET=your_apple_secret
```

### Getting Started

From the monorepo root:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Or just the Next.js app
pnpm run dev:next
```

The app runs at http://localhost:8000

## Using Shared UI Components

All UI components are imported from the shared package:

```tsx
import { 
  Button, 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  Alert,
  AlertDialog,
  Dropzone,
  QRCode 
} from '@rite/ui';

// Components automatically use web implementations
<Card>
  <CardHeader>
    <CardTitle>Event Details</CardTitle>
  </CardHeader>
  <CardContent>
    <Button onClick={handleClick}>Create Event</Button>
  </CardContent>
</Card>
```

## Internationalization

The app supports Korean and English with automatic locale detection:

### URL Structure
- English: `http://localhost:8000/en/dashboard`
- Korean: `http://localhost:8000/ko/dashboard`

### Using Translations
```tsx
import { useTranslations } from 'next-intl';

function Dashboard() {
  const t = useTranslations('dashboard');
  
  return (
    <h1>{t('title')}</h1> // "Dashboard" or "대시보드"
  );
}
```

### Adding New Translations
1. Edit `/messages/en.json` and `/messages/ko.json`
2. Use nested keys for organization
3. Include placeholders for dynamic content: `{name}`, `{count}`

## Authentication

NextAuth v5 with multiple providers:

- **Instagram**: Primary provider with custom OAuth proxy
- **Google**: Optional secondary provider
- **Apple**: TBD - Planned for future implementation

### Instagram OAuth Flow
1. User clicks "Sign in with Instagram"
2. Redirected to Instagram for authorization
3. OAuth proxy transforms Instagram OAuth to OIDC
4. User profile saved to Convex database
5. Instagram handle auto-connected for dashboard display

## Typography

The app uses SUIT Variable font for optimal Korean/English rendering:

- **Location**: `/app/lib/SUIT-Variable.woff2`
- **Weights**: 100-900 (variable font)
- **Usage**: Applied globally via `font-suit` class
- **Fallbacks**: System fonts for fast initial render

## Performance Optimizations

- **Turbopack**: Fast bundling and HMR in development
- **Dynamic Imports**: Code splitting for optimal bundle sizes
- **Image Optimization**: Next.js Image component with lazy loading
- **Font Loading**: `font-display: swap` for fast text rendering
- **Static Generation**: Pre-rendered pages where possible

## Build & Deploy

### Development
```bash
pnpm run dev
```

### Production Build
```bash
pnpm run build
pnpm run start
```

### Deployment (Vercel)
```bash
vercel
```

Configure environment variables in Vercel dashboard.

## Testing

```bash
# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Build test
pnpm run build
```

## Known Issues & Solutions

1. **Hydration Mismatches**: Use `ConvexProviderHydrationSafe` wrapper
2. **Auth Pages Prerender**: Add `export const dynamic = 'force-dynamic'`
3. **Locale 404s**: Ensure all routes under `[locale]` directory
4. **Instagram Mobile OAuth**: Handled by OAuth proxy with force web params

## Contributing

1. Follow existing code patterns
2. Use shared UI components from `@rite/ui`
3. Add translations for new features
4. Test on multiple browsers
5. Ensure mobile responsiveness

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://authjs.dev/)
- [Convex Documentation](https://docs.convex.dev/)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)