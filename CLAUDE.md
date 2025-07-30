# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands

### Monorepo Commands (Root Level)
- Install all dependencies: `pnpm install`
- Build all apps: `pnpm run build`
- Lint all apps: `pnpm run lint`
- Type check all apps: `pnpm run type-check`
- Dev backend only: `pnpm run dev:backend`

### Individual App Commands
- **Next.js App**: `pnpm run dev:next` or `pnpm --filter=next-app run dev`
- **SvelteKit POC**: `pnpm run dev:sveltekit` or `pnpm --filter=sveltekit-poc run dev`
- **Shared Types**: `pnpm --filter=@rite/shared-types run build`

### Legacy Commands (for reference)
- Dev (both frontend & backend): `npm run dev` → now `pnpm run dev`
- Dev frontend only: `npm run dev:frontend` → now use individual app commands

## Authentication Setup
The application uses NextAuth v5 for authentication with a streamlined, direct approach. To set up authentication:

1. In `.env.local`, set the required environment variables:
   ```
   INSTAGRAM_CLIENT_ID=your_instagram_client_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
   INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.sehyunchung.workers.dev
   NEXTAUTH_URL=http://localhost:8000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXT_PUBLIC_CONVEX_URL=your_convex_url
   ```

**Current Status**: Authentication system is fully functional with NextAuth v5 integration and clean, simplified architecture.

### Social OAuth Providers
The application currently supports Instagram OAuth through NextAuth v5 with a custom proxy service.

#### Instagram OAuth (Custom Implementation)
Instagram login uses a custom OAuth proxy service for NextAuth compatibility.

**Important Update (2024)**: Instagram Basic Display API was deprecated on December 4, 2024. Now using Instagram API with Instagram Login.

1. **Requirements**:
   - Users must have Instagram Business or Creator accounts (not personal)
   - No Facebook Page connection required

2. **Create Instagram App**:
   - Go to Meta Developer Console (developers.facebook.com)
   - Add "Instagram API with Instagram Login" product
   - Configure OAuth redirect URIs for your proxy service
   - Request scopes: `instagram_business_basic`, `instagram_business_content_publish`

3. **Deploy Proxy Service** ✅ **COMPLETED**:
   - Cloudflare Worker deployed at `rite-instagram-oauth-proxy.sehyunchung.workers.dev`
   - Transforms Instagram OAuth to OIDC format for NextAuth compatibility
   - Handles both login and dashboard connection flows
   - Validates Business/Creator account requirement
   - Fetches complete profile data during token exchange
   - Maps user data (username, name, profile_picture_url, account_type, instagram_user_id)

4. **Configure in NextAuth** ✅ **COMPLETED**:
   - Custom OIDC provider configured with Instagram OAuth proxy
   - Discovery URL: `https://rite-instagram-oauth-proxy.sehyunchung.workers.dev/.well-known/openid-configuration`
   - Automatic profile mapping for Instagram fields
   - Resilient profile handling with fallback username generation

5. **Integration Status** ✅ **FULLY WORKING**:
   - Instagram login through NextAuth OAuth ✅
   - Complete profile data capture (username, display name, profile picture) ✅
   - Auto-connection during signup with direct Convex ID usage ✅
   - Connection data saved to Convex database with all profile fields ✅
   - Dashboard displays Instagram handle (@username format) ✅
   - Clean profile handling without fake email generation ✅
   - Simplified authentication flow with direct ID mapping ✅

**Key Improvements**:
- **Streamlined Architecture**: Direct Convex ID usage eliminates complex ID mapping and retry logic
- **Complete Profile Data**: Captures username, display name, and profile picture URL during OAuth
- **Smart Display Logic**: Dashboard prioritizes Instagram handle (@username) over email/name
- **Clean Authentication**: Simplified auth flow without temporary workarounds or band-aid solutions
- **Reliable Connection**: Auto-connection works seamlessly with direct user ID passing

**Note**: The Instagram API provides comprehensive profile data for Business/Creator accounts and enables reliable content publishing features.

## Project Architecture

This is Rite, a DJ event management platform with a **monorepo structure** containing multiple frontend applications and a shared Convex backend. The platform streamlines event management for DJ bookings with Instagram workflow integration.

### Monorepo Structure
```
rite/
├── apps/
│   ├── next-app/          # Main Next.js application (production)
│   └── sveltekit-poc/     # SvelteKit POC for framework evaluation
├── packages/
│   ├── backend/           # Shared Convex backend package (@rite/backend)
│   └── shared-types/      # Shared TypeScript types across apps
├── convex/               # Legacy Convex backend (now in packages/backend)
├── pnpm-workspace.yaml   # pnpm workspace configuration
└── turbo.json           # Turborepo build pipeline
```

### Tech Stack
- **Package Manager**: pnpm with workspaces
- **Build System**: Turborepo for optimized builds and caching
- **Frontend Apps**: 
  - Next.js 15 with React 18, TypeScript, Turbopack
  - SvelteKit with Cloudflare adapter (POC)
- **Typography**: SUIT Variable font with Korean/English support (weights 100-900)
- **Internationalization**: next-intl with locale-based routing ([locale] structure)
- **UI Libraries**: 
  - shadcn/ui - Base component library with Radix UI primitives
  - Kibo UI - Advanced components (Dropzone, QR Code, Code Block)
- **Backend**: Convex (real-time database and file storage, shared across apps)
- **Authentication**: NextAuth v5 with streamlined Instagram OAuth integration and direct Convex ID usage
- **Routing**: Next.js App Router with [locale] dynamic routing / SvelteKit file-based routing
- **Validation**: ArkType (high-performance TypeScript schema validation)
- **File Handling**: Convex file storage for promo materials
- **AI Integration**: Model Context Protocol (MCP) for Kibo UI

### Authentication Architecture

**Current Implementation (Simplified & Clean):**
- **NextAuth v5**: Primary authentication provider with direct configuration
- **Convex Integration**: Direct user ID usage eliminates complex mapping and retry logic
- **Instagram OAuth Proxy**: Custom Cloudflare Workers service for OIDC compatibility
- **Auto-Connection**: Seamless Instagram profile linking during signup without temporary workarounds

**Key Files:**
- `/apps/next-app/app/lib/auth.ts` - NextAuth configuration with Instagram provider and Convex adapter
- `/apps/next-app/app/providers/root-provider.tsx` - Main provider wrapper with proper SSR handling
- `/apps/next-app/app/providers/convex-provider-hydration-safe.tsx` - Client-side Convex initialization with hydration safety
- `/packages/backend/convex/auth.ts` - Convex authentication functions with direct ID handling
- `/packages/backend/convex/instagram.ts` - Instagram connection management

**Provider Setup & Hydration Handling:**
```typescript
// Root provider with proper SSR handling
export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConvexProviderHydrationSafe>{children}</ConvexProviderHydrationSafe>
    </AuthProvider>
  );
}

// Hydration-safe Convex provider with singleton pattern
export function ConvexProviderHydrationSafe({ 
  children, 
  fallback 
}: ConvexProviderHydrationSafeProps) {
  const [isClient, setIsClient] = useState(false)
  const clientRef = useRef<ConvexReactClient | null>(null)
  
  useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true)
    
    // Initialize Convex client using singleton pattern
    if (!clientRef.current) {
      clientRef.current = getConvexClient()
    }
  }, [])
  
  // Show consistent loading state during SSR and initial hydration
  if (!isClient) {
    return (
      fallback || (
        <div suppressHydrationWarning>
          <FullScreenLoading />
        </div>
      )
    )
  }
  
  // Client-side with Convex
  return clientRef.current ? (
    <ConvexReactProvider client={clientRef.current}>
      {children}
    </ConvexReactProvider>
  ) : (
    <>{children}</>
  )
}
```

**Build Configuration:**
- **Force Dynamic**: All NextAuth pages use `export const dynamic = 'force-dynamic'` to prevent prerender errors
- **SSR Disabled**: ConvexProvider uses dynamic imports with `ssr: false` to prevent hydration mismatches
- **Environment Handling**: Graceful fallbacks for missing `NEXT_PUBLIC_CONVEX_URL`
- **Error Boundaries**: Proper 404 handling with `/app/not-found.tsx`

### Core Architecture

**Frontend Structure:**
- `/apps/next-app/app/` - Next.js App Router pages and layouts
  - `/apps/next-app/app/layout.tsx` - Root layout with providers
  - `/apps/next-app/app/[locale]/` - Internationalized routes with dynamic locale
    - `/apps/next-app/app/[locale]/layout.tsx` - Locale-specific layout with NextIntlClientProvider
    - `/apps/next-app/app/[locale]/page.tsx` - Localized landing page
    - `/apps/next-app/app/[locale]/dashboard/page.tsx` - Organizer dashboard
    - `/apps/next-app/app/[locale]/events/create/page.tsx` - Event creation page
    - `/apps/next-app/app/[locale]/dj-submission/page.tsx` - Public DJ submission with token params
    - `/apps/next-app/app/[locale]/auth/signin/page.tsx` - NextAuth authentication page
  - `/apps/next-app/app/api/auth/[...nextauth]/route.ts` - NextAuth API route
- `/apps/next-app/app/components/` - React components
  - `/apps/next-app/app/components/ui/` - shadcn/ui base components
  - `/apps/next-app/app/components/ui/kibo-ui/` - Kibo UI advanced components
  - `/apps/next-app/app/components/ui/loading-indicator.tsx` - Unified loading components
  - `/apps/next-app/app/components/EventCreationForm.tsx` - Event creation form with validation
  - `/apps/next-app/app/components/DJSubmissionForm.tsx` - Public DJ submission form with token access
  - `/apps/next-app/app/components/LanguageSwitcher.tsx` - Internationalization language switcher
  - `/apps/next-app/app/components/UserDisplay.tsx` - User profile display component
- `/apps/next-app/app/lib/` - Utility functions and configuration
  - `/apps/next-app/app/lib/utils.ts` - Utility functions for component styling
  - `/apps/next-app/app/lib/validation.ts` - ArkType validation schemas and helpers
  - `/apps/next-app/app/lib/auth.ts` - NextAuth configuration
  - `/apps/next-app/app/lib/convex.ts` - Convex client setup
  - `/apps/next-app/app/lib/fonts.ts` - SUIT Variable font configuration
- `/apps/next-app/i18n/` - Internationalization configuration
  - `/apps/next-app/i18n/routing.ts` - next-intl routing configuration
  - `/apps/next-app/i18n/request.ts` - Request locale handling
- `/apps/next-app/messages/` - Translation files
  - `/apps/next-app/messages/en.json` - English translations
  - `/apps/next-app/messages/ko.json` - Korean translations
- `/apps/next-app/app/providers/` - React context providers
- `/apps/next-app/public/` - Static assets

**Backend Structure (Convex):**
- `/packages/backend/convex/` - Shared Convex backend functions and schema
- `/packages/backend/convex/schema.ts` - Database schema definition with tables:
  - `events` - Event information with venue, deadlines, payment configuration
  - `timeslots` - DJ time slots with unique submission tokens and Instagram handles
  - `submissions` - DJ submissions with promo materials, guest lists, payment info
  - `users` - User authentication and profile data
  - `instagramConnections` - Instagram account connections with complete profile data
- `/packages/backend/convex/_generated/` - Auto-generated Convex API files
- `/packages/backend/convex/events.ts` - Event management API functions (create, list, get, update status)
- `/packages/backend/convex/timeslots.ts` - Timeslot management and token-based access functions
- `/packages/backend/convex/instagram.ts` - Instagram OAuth and connection management functions
- `/packages/backend/convex/auth.ts` - User authentication and NextAuth integration functions
- `/packages/backend/convex/submissions.ts` - DJ submission management functions

### Key Features

**✅ Implemented:**
- **Event Creation**: Complete form with venue, dates, payment details, and DJ timeslots
- **Enhanced Event Fields**: Instagram hashtags, payment per DJ, guest limits
- **Advanced Validation**: ArkType-powered validation with deadline ordering and duration limits
- **Timeslot Management**: Add/remove DJ slots with overlap detection and time validation
- **Instagram Handle Validation**: Enforces @username format with character validation
- **Database Integration**: Events and timeslots saved to Convex with atomic operations
- **Dynamic UI**: Responsive forms with loading states and error boundaries
- **Unique Submission Links**: Each DJ gets a unique 16-character token for material submission
- **DJ Submission Form**: Public form accessible via URL parameters (?token=ABC123)
- **Guest List Management**: Dynamic add/remove guest entries with name and phone fields
- **Payment Info Collection**: Secure form for DJ payment details with privacy notice
- **Token-based Access**: URL routing system for seamless DJ submission experience
- **Robust QR Code Generation**: Canvas validation and error handling for reliable QR codes
- **Professional Interface**: Clean dashboard with development status in footer
- **Backward Compatibility**: Schema updates work with existing database records
- **Instagram Authentication**: Streamlined OAuth login integration through NextAuth with direct ID mapping
- **Instagram Connection Management**: Seamless auto-connection during signup with simplified architecture
- **Instagram Profile Display**: Dashboard shows Instagram handles (@username format) with profile pictures
- **Instagram Data Storage**: Complete profile data saved to Convex (username, display name, profile picture, account type)
- **Clean Authentication Flow**: Direct Convex ID usage eliminates complex mapping and temporary workarounds
- **Hydration-Safe Providers**: ConvexProviderHydrationSafe with singleton pattern and proper SSR handling
- **Internationalization System**: Complete next-intl integration with [locale] routing, LanguageSwitcher, and Korean/English translations
- **Unified Loading System**: LoadingIndicator and FullScreenLoading components with consistent RITE branding

**📋 Planned:**
- **File Upload Integration**: Connect Dropzone to Convex file storage for actual uploads
- **Submission Data Storage**: Save guest lists and payment info to database with encryption
- **Submission Status Tracking**: Dashboard for organizers to monitor submission progress
- **Instagram Content Publishing**: Generate and publish Instagram posts automatically
- **Instagram Post Templates**: Copy-paste messages for Instagram announcements
- **Email Notifications**: Deadline reminders and submission confirmations

### Data Flow

**Current Implementation:**
1. Organizers create events through dashboard with form validation
2. Event data and timeslots are atomically saved to Convex database with unique submission tokens
3. Dashboard displays real-time event counts and status updates
4. Form provides immediate feedback with ArkType validation
5. DJs access personalized submission forms via unique token URLs (?token=ABC123)
6. Submission forms display event context, deadlines, and collect guest lists + payment info
7. Token-based routing ensures each DJ sees only their relevant timeslot information

**Planned Extensions:**
8. File uploads are processed and stored in Convex file storage
9. Submission data is encrypted and saved to database
10. Organizers track submission progress through dedicated dashboard
11. Instagram messages auto-generated for event promotion
12. Email notifications sent for deadlines and confirmations

### Available UI Components

**shadcn/ui Base Components:**
- Button, Card, Input, Label, Textarea, Select
- Styled with Tailwind CSS and Radix UI primitives

**Kibo UI Advanced Components:**
- `Dropzone` - Drag-and-drop file upload with multi-file support
- `QRCode` - QR code generation for event links and check-in (with robust canvas validation)
- `CodeBlock` - Syntax-highlighted code display with copy functionality

**Loading System Components:**
- `LoadingIndicator` - Branded loading component with RITE logo and pulse animation
- `FullScreenLoading` - Full-screen loading state with consistent styling

### Loading System

**Location:** `/apps/next-app/app/components/ui/loading-indicator.tsx`

The application uses a unified loading system with consistent RITE branding:

**Components:**
```typescript
interface LoadingIndicatorProps {
  className?: string
}

export function LoadingIndicator({ className = '' }: LoadingIndicatorProps) {
  return (
    <div className={`animate-pulse text-center ${className}`}>
      <div className="font-medium text-gray-300 text-4xl">
        RITE
      </div>
    </div>
  )
}

export function FullScreenLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingIndicator />
    </div>
  )
}
```

**Usage Patterns:**
- **Full Screen Loading:** Used during SSR/hydration in ConvexProviderHydrationSafe
- **Component Loading:** Used for specific loading states within components
- **Branded Experience:** Consistent RITE logo maintains brand identity during loading states
- **Hydration Safety:** `suppressHydrationWarning` prevents SSR/client mismatches

### MCP (Model Context Protocol) Integration

This project is configured with Kibo UI MCP server for AI-assisted development:
- **Configuration**: `.claude.json` in project root
- **Capabilities**: Claude Code can access Kibo UI component documentation
- **Benefits**: Real-time component recommendations and usage guidance

## Internationalization System

The application uses **next-intl** for comprehensive internationalization support with Korean and English languages.

### Locale-based Routing Structure

The application uses Next.js dynamic routing with `[locale]` segments for internationalization:

```
/apps/next-app/app/[locale]/
├── layout.tsx          # Locale-specific layout with NextIntlClientProvider  
├── page.tsx           # Localized landing page
├── dashboard/page.tsx # Localized dashboard
├── events/
│   ├── create/page.tsx
│   └── [eventId]/page.tsx
├── dj-submission/page.tsx
└── auth/signin/page.tsx
```

### Configuration Files

**Routing Configuration (`/apps/next-app/i18n/routing.ts`):**
```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ko'],    // Supported locales
  defaultLocale: 'en'       // Fallback locale
});

// Internationalized navigation functions
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

**Locale Layout (`/apps/next-app/app/[locale]/layout.tsx`):**
```typescript
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  
  // Locale validation
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Load locale-specific messages
  const messages = await getMessages();
  
  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
```

### Translation Files

**Structure:**
- `/apps/next-app/messages/en.json` - English translations
- `/apps/next-app/messages/ko.json` - Korean translations

**Example Usage:**
```typescript
// In components
import { useTranslations } from 'next-intl';

function Dashboard() {
  const t = useTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>
      <button>{t('actions.createEvent')}</button>
    </div>
  );
}
```

### Language Switcher Component

**Location:** `/apps/next-app/app/components/LanguageSwitcher.tsx`

**Features:**
- Globe icon with current language display
- Dropdown menu with flag indicators
- Preserves current route when switching languages
- Mobile-responsive design (shows flags on small screens)
- Click-outside-to-close functionality

**Usage:**
```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

// Add to navigation or header
<LanguageSwitcher />
```

### Navigation Patterns

**For internationalized routes:**
```typescript
import { Link, useRouter } from '@/i18n/routing';

// Links automatically include current locale
<Link href="/dashboard">Dashboard</Link>

// Router navigation preserves locale
const router = useRouter();
router.push('/events/create');
```

**For standard Next.js features:**
```typescript
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Use when locale handling isn't needed
```

### URL Structure

- **English (default):** `http://localhost:8000/en/dashboard`
- **Korean:** `http://localhost:8000/ko/dashboard`
- **Root redirect:** `http://localhost:8000/` → `http://localhost:8000/en/`

### Translation Management

**JSON Structure:**
```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back!",
    "actions": {
      "createEvent": "Create Event"
    }
  }
}
```

**Best Practices:**
- Use nested objects for logical grouping
- Keep keys descriptive and consistent
- Include pluralization for dynamic content
- Use interpolation for dynamic values: `{name}`, `{count}`

### Development Setup
- Run `npm run predev` to initialize Convex development environment and open dashboard
- Use `npm run dev` to start both frontend (Next.js with Turbopack) and backend (Convex) in parallel
- Convex dashboard automatically opens for database management
- Frontend serves at localhost:8000 with fast refresh
- Turbopack provides fast bundling and hot module replacement
- MCP integration provides AI-assisted component development

## SvelteKit POC - Framework Evaluation

**Purpose:** Evaluate SvelteKit vs Next.js for optimal developer experience and deployment velocity.

**Current Status:**
- ✅ Monorepo integration, Cloudflare Workers deployment, shared Convex backend
- ✅ Performance metrics: <50KB bundles vs Next.js ~200KB+, <100ms load time
- 📋 Missing: Instagram OAuth, dashboard, DJ submission system

**Framework Comparison:**
- **SvelteKit**: 4x smaller bundles, faster builds, Cloudflare Workers optimization
- **Next.js**: Mature ecosystem, rich component libraries, production-ready

**Development Commands:**
```bash
pnpm run dev:sveltekit  # Start SvelteKit POC
pnpm --filter=sveltekit-poc run deploy  # Deploy to Cloudflare Workers
```

## Typography Configuration

### SUIT Variable Font Setup

Both applications use the SUIT Variable font, a comprehensive Korean/English typeface optimized for digital interfaces:

**Font Features:**
- **Variable Weights**: 100-900 (Thin to Black)
- **Language Support**: Complete Korean Hangul + Latin character sets
- **Format**: WOFF2 variable font format for optimal performance
- **Fallbacks**: System fonts (-apple-system, BlinkMacSystemFont, sans-serif)
- **Display**: `font-display: swap` for improved loading performance

### Font Implementation

**Next.js Setup:**
```typescript
// /apps/next-app/app/lib/fonts.ts
import localFont from 'next/font/local'
export const suit = localFont({
  src: './SUIT-Variable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-suit',
})

// Usage: className="font-suit" or style={{ fontFamily: 'var(--font-suit)' }}
```

**SvelteKit Setup:**
```css
/* /apps/sveltekit-poc/src/routes/app.css */
@font-face {
  font-family: 'SUIT';
  src: url('/fonts/SUIT-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
body { font-family: 'SUIT', -apple-system, BlinkMacSystemFont, sans-serif; }
```

### Font Benefits
- **Variable Font**: Single file, all weights (100-900), ~50KB vs ~200KB+ for multiple files
- **Performance**: `font-display: swap`, system font fallbacks
- **Loading**: Next.js auto-optimization, SvelteKit manual optimization

## Code Style Guidelines
- Formatting: Follow Prettier defaults, 2-space indentation
- Imports: Group and sort imports (React/Next, external, internal, types)
- Types: Use TypeScript strictly, avoid `any` types and non-null assertions
- Naming: Use PascalCase for components, camelCase for variables/functions
- Typography: SUIT Variable font with full Korean/English support and variable weights 100-900
- Styling: Use Tailwind CSS for styling with shadcn/ui design tokens
- Components: 
  - Prefer functional components with hooks
  - Use shadcn/ui components for basic UI elements
  - Use Kibo UI for advanced functionality (file uploads, QR codes, etc.)
- Error handling: Use try/catch with appropriate logging
- State management: Use React Context for global state, hooks for local state
- Comments: Document complex logic, avoid obvious comments

## Component Import Examples

### Next.js App Imports
```typescript
// shadcn/ui components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Kibo UI components  
import { Dropzone } from "@/components/ui/kibo-ui/dropzone"
import { QRCode } from "@/components/ui/kibo-ui/qr-code"
import { CodeBlock } from "@/components/ui/kibo-ui/code-block"

// Loading components
import { LoadingIndicator, FullScreenLoading } from "@/components/ui/loading-indicator"

// Next.js navigation (standard)
import Link from "next/link"
import { useRouter } from "next/navigation"

// Internationalized navigation (next-intl)
import { Link as IntlLink, useRouter as useIntlRouter, usePathname } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"

// Convex integration
import { useQuery, useMutation } from "convex/react"
import { api } from "@rite/backend/convex/_generated/api"

// NextAuth authentication
import { useSession } from "next-auth/react"
import { signIn, signOut } from "next-auth/react"

// Validation
import { validateEvent, validateTimeslot } from "@/lib/validation"

// Providers
import { ConvexProviderHydrationSafe } from "@/providers/convex-provider-hydration-safe"
```

### SvelteKit POC Imports
```typescript
// Svelte lifecycle and reactivity
import { onMount, onDestroy } from 'svelte'

// Shared Convex backend
import { convex } from '$lib/convex'
import { api } from '@rite/backend/convex/_generated/api'

// SvelteKit navigation
import { goto } from '$app/navigation'
import { page } from '$app/stores'

// Environment variables
import { env } from '$env/dynamic/public'

// Shared types (when available)
import type { Event, Timeslot } from '@rite/shared-types'
```

## Development Status

**✅ Core Platform Complete:**
- Event creation with validation, timeslot management, Instagram OAuth integration
- DJ submission system with token-based access, guest lists, payment collection
- NextAuth v5 with Instagram OAuth proxy, Convex integration, hydration fixes
- SUIT Variable font system, professional UI/UX
- Complete internationalization system with next-intl (Korean/English support)
- Unified loading system with consistent RITE branding
- ConvexProviderHydrationSafe with singleton pattern for SSR compatibility
- Language switcher with mobile-responsive design and route preservation
- **Mobile OAuth Support**: Fixed mobile browser redirects and consent page issues
- **Enhanced Debugging**: Comprehensive logging system with Cloudflare Workers observability
- **i18n Route Stability**: Resolved NextAuth conflicts and 404 errors on localized routes

**🚧 In Progress:**
- File upload integration with Convex storage
- Submission data storage with encryption

**📋 Planned:**
- Submission status dashboard, Instagram message templates
- Email notifications, form persistence
- Additional locale support expansion

## Troubleshooting

### Common Issues
1. **"Objects are not valid as a React child"** - Use ConvexProviderHydrationSafe with proper client-side initialization
2. **NextAuth Prerender Errors** - Add `export const dynamic = 'force-dynamic'` to pages using auth()
3. **Hydration Mismatches** - ConvexProviderHydrationSafe uses `suppressHydrationWarning` and singleton pattern
4. **Missing Environment Variables** - Check NEXT_PUBLIC_CONVEX_URL is set, ConvexProviderHydrationSafe includes graceful fallbacks
5. **Locale Route Issues** - Ensure [locale] dynamic segment is properly configured in routing structure
6. **Translation Missing Errors** - Verify translation keys exist in both en.json and ko.json files
7. **Mobile OAuth Redirects to Instagram App** - Fixed with force web parameters in OAuth proxy
8. **Users Stuck on Instagram Consent Page** - Fixed with enhanced state handling and error recovery

### Authentication Debugging
- **Environment Variables**: Verify Instagram OAuth proxy, client ID/secret, and NextAuth configuration
- **Convex Connection**: Check Convex deployment is active and schema matches
- **OAuth Proxy Health**: Test endpoints at `https://rite-instagram-oauth-proxy.sehyunchung.workers.dev`
- **Mobile OAuth Issues**: Check Cloudflare Workers logs for mobile user-agent detection and parameter handling
- **Logs Access**: 
  - Cloudflare Dashboard: Workers & Pages → rite-instagram-oauth-proxy → Logs
  - CLI: `npx wrangler tail` from instagram-oauth-proxy directory
- **Common Log Events**: `OAUTH_AUTHORIZE`, `MOBILE_PARAMS_ADDED`, `TOKEN_ENDPOINT`, `USER_DATA_FETCHED`

### Mobile OAuth Troubleshooting
1. **Instagram App Redirect**: Look for `MOBILE_PARAMS_ADDED` logs showing force web parameters
2. **Consent Page Stuck**: Check `STATE_DECODE_ERROR` or `OAUTH_ERROR` logs for state handling issues
3. **Token Exchange Failures**: Monitor `INSTAGRAM_TOKEN_ERROR` logs for Instagram API responses
4. **User Profile Issues**: Check `USER_INFO_ERROR` logs for Business/Creator account validation

## Deployment

### Recommended: Vercel
- Zero-config Next.js deployment with Asia/Pacific edge network
- Automatic GitHub deployments, simple environment variable management

### Required Environment Variables:
- `NEXT_PUBLIC_CONVEX_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`, `INSTAGRAM_OAUTH_PROXY_URL`

### Deploy Settings:
- Build Command: `pnpm run build`
- Node.js: 18.x+
- Add `export const dynamic = 'force-dynamic'` to NextAuth pages

## Instagram OAuth Proxy

**Service:** `rite-instagram-oauth-proxy.sehyunchung.workers.dev` (Hono.js on Cloudflare Workers)
**Purpose:** Transform Instagram OAuth to OIDC format for NextAuth compatibility

**Features:** 
- Dual flow support (login/dashboard connection)
- JWT token generation with complete Instagram profile data
- Business/Creator account validation
- Auto-connection during signup with direct Convex ID usage
- **Mobile OAuth Support**: Force web authentication on mobile browsers
- **Enhanced Logging**: Comprehensive debugging with structured logs

**Key Endpoints:**
- `/.well-known/openid-configuration` - OIDC discovery
- `/oauth/authorize` - Instagram authorization with mobile detection
- `/oauth/callback` - OAuth callback with enhanced error handling
- `/oauth/token` - Token exchange with detailed logging
- `/oauth/userinfo` - User info for NextAuth

**Mobile OAuth Fixes:**
- **User-Agent Detection**: Automatically detects mobile browsers
- **Force Web Parameters**: `display=web`, `platform=web`, `force_authentication=true`
- **State Handling**: Enhanced state encoding/decoding with fallback support
- **Error Recovery**: Comprehensive error logging for debugging mobile flows

**Logging & Debugging:**
- **Structured Logging**: Timestamped JSON logs for all OAuth events
- **Cloudflare Dashboard**: Logs visible in Workers dashboard with `[observability.logs] enabled = true`
- **Real-time Monitoring**: `npx wrangler tail` for live debugging
- **Mobile Flow Tracking**: Detailed logs for mobile-specific parameters and redirects

**Deploy:** `cd instagram-oauth-proxy && npx wrangler deploy`