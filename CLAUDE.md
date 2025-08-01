# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands

### Monorepo Commands (Root)
- Install: `pnpm install`
- Build: `pnpm run build`
- Lint: `pnpm run lint`
- Type check: `pnpm run type-check`
- Dev backend: `pnpm run dev:backend`

### Individual Apps
- Next.js: `pnpm run dev:next` or `pnpm --filter=next-app run dev`
- Mobile: `pnpm run dev:mobile` or `pnpm --filter=mobile run start`
- Shared Types: `pnpm --filter=@rite/shared-types run build`

## Authentication Setup

NextAuth v5 with streamlined approach. Required `.env.local`:
```
NEXTAUTH_URL=http://localhost:8000
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Instagram OAuth (via proxy)
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.sehyunchung.workers.dev

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Apple OAuth (TBD)
APPLE_ID=your_apple_id
APPLE_SECRET=your_apple_secret
```

### OAuth Providers
- **Google**: Standard OAuth setup via Google Cloud Console
- **Apple**: Planned but not implemented
- **Instagram**: Custom OAuth proxy (Cloudflare Worker) transforms to OIDC format
  - Requires Business/Creator accounts
  - Complete profile data capture
  - Auto-connection during signup

## Project Architecture

DJ event management platform with monorepo structure:

```
rite/
├── apps/
│   ├── next-app/      # Next.js 15 production app
│   └── mobile/        # Expo React Native app
├── packages/
│   ├── backend/       # Shared Convex backend (@rite/backend)
│   ├── shared-types/  # Shared TypeScript types
│   └── ui/           # Cross-platform UI components (@rite/ui)
└── [config files]
```

### Tech Stack
- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 15, React 18, TypeScript, Turbopack
- **Mobile**: Expo SDK 53, React Native 0.79.5
- **Design System**: Dark-first (#E946FF primary), SUIT Variable font
- **Styling**: Tailwind CSS (ES modules)
- **Backend**: Convex real-time database
- **Auth**: NextAuth v5 + Instagram OAuth proxy
- **i18n**: next-intl with [locale] routing
- **Validation**: ArkType

### Key Files
- Auth config: `/apps/next-app/app/lib/auth.ts`
- Providers: `/apps/next-app/app/providers/`
- Convex functions: `/packages/backend/convex/`
- UI components: `/packages/ui/src/components/`
- Design tokens: `/packages/ui/src/design-tokens/`

### Database Schema (Convex)
- `users` - Authentication and profiles
- `events` - Event information
- `timeslots` - DJ slots with submission tokens
- `submissions` - DJ submissions
- `instagramConnections` - Instagram profiles

## RITE Design System

Dark-first design with comprehensive token system:

### Colors
- Brand Primary: `#E946FF`
- Background: `neutral-800` (#1A0F2F)
- Surface: `neutral-700` (#2A1F3F)
- Text: White primary, `neutral-400` secondary

### Typography
- Font: SUIT Variable (100-900 weights)
- Variants: h1-h6, body, button, label, caption

### Components (@rite/ui)
**Base**: Button, Input, Textarea, Select, Card, Label, Badge
**Advanced**: ActionCard, EventCard, Typography, Dropzone, QRCode
**Loading**: LoadingIndicator, FullScreenLoading

Platform-specific implementations:
```
button/
├── button.web.tsx    # Radix UI
├── button.native.tsx # NativeWind
└── index.tsx        # Platform exports
```

## Internationalization

next-intl with Korean/English support:

### Structure
```
/app/[locale]/
├── layout.tsx
├── page.tsx
├── dashboard/
├── events/
└── auth/
```

### Usage
```typescript
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';

const t = useTranslations('dashboard');
```

## Development Status

**✅ Complete:**
- Core platform with event creation, DJ submissions
- Instagram OAuth with mobile support
- Design system with cross-platform components
- i18n system with language switcher
- Hydration-safe providers

**🚧 In Progress:**
- File uploads with Convex
- Submission data encryption

**📋 Planned:**
- Submission dashboard
- Instagram content publishing
- Email notifications

## Troubleshooting

### Common Issues
1. **Hydration errors**: Use ConvexProviderHydrationSafe
2. **NextAuth prerender**: Add `export const dynamic = 'force-dynamic'`
3. **Missing env vars**: Check NEXT_PUBLIC_CONVEX_URL
4. **Mobile OAuth**: Check force web parameters in proxy logs

### Instagram OAuth Proxy
- Service: `rite-instagram-oauth-proxy.sehyunchung.workers.dev`
- Deploy: `cd instagram-oauth-proxy && npx wrangler deploy`
- Logs: `npx wrangler tail` or Cloudflare Dashboard

## Mobile App (Expo)

### Development
```bash
# From root
pnpm run dev:mobile

# Direct commands
cd apps/mobile
pnpm ios
pnpm android
```

### Configuration
- Metro configured for monorepo + NativeWind
- Shared Convex backend via `@rite/backend`
- Platform-specific UI components
- Design tokens fully integrated via Tailwind CSS

### Status
- ✅ Monorepo integration
- ✅ Convex backend access
- ✅ Design system integration (colors, typography, spacing)
- ✅ Navigation aligned with Next.js app (Dashboard, Create Event, Events)
- ✅ Tailwind configuration with @rite/ui tokens
- 🚧 Authentication pending
- 🚧 Full @rite/ui component integration

## Code Style
- TypeScript strict mode, no `any` or non-null assertions
- @rite/ui components exclusively
- Dark-first design tokens
- Tailwind with ES modules
- SUIT Variable font for all text
- Platform-specific implementations when needed