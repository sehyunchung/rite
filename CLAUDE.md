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
To enable social login options:

#### Quick Setup (Clerk Dashboard Only)
1. **Google OAuth**:
   - Go to Clerk Dashboard → SSO Connections
   - Enable Google provider
   - Configure OAuth credentials from Google Cloud Console

2. **Facebook OAuth**:
   - Go to Clerk Dashboard → SSO Connections  
   - Enable Facebook provider
   - Configure OAuth credentials from Facebook Developer Console

#### Instagram OAuth (Custom Implementation)
Instagram login requires a custom OAuth proxy service since Instagram is not natively supported by Clerk.

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
- **UI Libraries**: 
  - shadcn/ui - Base component library with Radix UI primitives
  - Kibo UI - Advanced components (Dropzone, QR Code, Code Block)
- **Backend**: Convex (real-time database and file storage, shared across apps)
- **Authentication**: NextAuth v5 with streamlined Instagram OAuth integration and direct Convex ID usage
- **Routing**: Next.js App Router / SvelteKit file-based routing
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
- `/app/lib/auth.ts` - NextAuth configuration with Instagram provider and Convex adapter
- `/app/providers/root-provider.tsx` - Main provider wrapper with proper SSR handling
- `/app/providers/convex-provider-client.tsx` - Client-side Convex initialization with hydration safety
- `/packages/backend/convex/auth.ts` - Convex authentication functions with direct ID handling
- `/packages/backend/convex/instagram.ts` - Instagram connection management

**Provider Setup & Hydration Handling:**
```typescript
// Root provider with proper SSR handling
export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ConvexProviderClient>{children}</ConvexProviderClient>
    </AuthProvider>
  );
}

// Client-side Convex provider with hydration safety
export function ConvexProviderClient({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)
  const [convex, setConvex] = useState<ConvexReactClient | null>(null)

  useEffect(() => {
    // Client-side only initialization prevents hydration mismatches
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
    if (convexUrl) {
      const client = new ConvexReactClient(convexUrl)
      setConvex(client)
    }
    setIsClient(true)
  }, [])

  // Proper loading states prevent "Objects are not valid as a React child" errors
  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Loading...</div>
    </div>
  }

  return convex ? 
    <ConvexReactProvider client={convex}>{children}</ConvexReactProvider> : 
    <>{children}</>
}
```

**Build Configuration:**
- **Force Dynamic**: All NextAuth pages use `export const dynamic = 'force-dynamic'` to prevent prerender errors
- **SSR Disabled**: ConvexProvider uses dynamic imports with `ssr: false` to prevent hydration mismatches
- **Environment Handling**: Graceful fallbacks for missing `NEXT_PUBLIC_CONVEX_URL`
- **Error Boundaries**: Proper 404 handling with `/app/not-found.tsx`

### Core Architecture

**Frontend Structure:**
- `/app/` - Next.js App Router pages and layouts
  - `/app/layout.tsx` - Root layout with providers
  - `/app/page.tsx` - Landing page
  - `/app/dashboard/page.tsx` - Organizer dashboard
  - `/app/events/create/page.tsx` - Event creation page
  - `/app/dj-submission/page.tsx` - Public DJ submission with token params
  - `/app/auth/signin/page.tsx` - NextAuth authentication page
- `/app/components/` - React components
  - `/app/components/ui/` - shadcn/ui base components
  - `/app/components/ui/kibo-ui/` - Kibo UI advanced components
  - `/app/components/EventCreationForm.tsx` - Event creation form with validation
  - `/app/components/DJSubmissionForm.tsx` - Public DJ submission form with token access
  - `/app/components/Footer.tsx` - Development status footer
- `/app/lib/` - Utility functions and configuration
  - `/app/lib/utils.ts` - Utility functions for component styling
  - `/app/lib/validation.ts` - ArkType validation schemas and helpers
  - `/app/lib/auth.ts` - NextAuth configuration
  - `/app/lib/convex.ts` - Convex client setup
- `/app/types/` - TypeScript type definitions matching Convex schema
- `/public/` - Static assets

**Backend Structure (Convex):**
- `/convex/` - Convex backend functions and schema
- `/convex/schema.ts` - Database schema definition with tables:
  - `events` - Event information with venue, deadlines, payment configuration
  - `timeslots` - DJ time slots with unique submission tokens and Instagram handles
  - `submissions` - DJ submissions with promo materials, guest lists, payment info
  - `users` - User authentication and profile data
  - `instagramConnections` - Instagram account connections with complete profile data
- `/convex/_generated/` - Auto-generated Convex API files
- `/convex/events.ts` - Event management API functions (create, list, get, update status)
- `/convex/timeslots.ts` - Timeslot management and token-based access functions
- `/convex/instagram.ts` - Instagram OAuth and connection management functions
- `/convex/auth.ts` - User authentication and NextAuth integration functions

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
- **Hydration-Safe Providers**: ConvexProvider with proper SSR handling and client-side initialization

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

### MCP (Model Context Protocol) Integration

This project is configured with Kibo UI MCP server for AI-assisted development:
- **Configuration**: `.claude.json` in project root
- **Capabilities**: Claude Code can access Kibo UI component documentation
- **Benefits**: Real-time component recommendations and usage guidance

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

// Next.js navigation
import Link from "next/link"
import { useRouter } from "next/navigation"

// Convex integration
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"

// NextAuth authentication
import { useSession } from "next-auth/react"
import { signIn, signOut } from "next-auth/react"

// Validation
import { validateEvent, validateTimeslot } from "@/lib/validation"
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

**🚧 In Progress:**
- File upload integration with Convex storage
- Submission data storage with encryption

**📋 Planned:**
- Submission status dashboard, Instagram message templates
- Email notifications, form persistence

## Troubleshooting

### Common Issues
1. **"Objects are not valid as a React child"** - Use client-side ConvexProvider initialization with useEffect
2. **NextAuth Prerender Errors** - Add `export const dynamic = 'force-dynamic'` to pages using auth()
3. **Hydration Mismatches** - Use dynamic imports with `{ ssr: false }` for providers
4. **Missing Environment Variables** - Check NEXT_PUBLIC_CONVEX_URL is set, add graceful fallbacks

### Authentication Debugging
- Verify all environment variables (Instagram OAuth proxy, client ID/secret)
- Check Convex deployment is active and schema matches
- Test Instagram OAuth proxy endpoints independently

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

**Features:** Dual flow support (login/dashboard), JWT token generation, complete profile fetching, Business/Creator account validation, auto-connection during signup

**Key Endpoints:**
- `/.well-known/openid-configuration` - OIDC discovery
- `/oauth/authorize` - Instagram authorization
- `/oauth/callback` - OAuth callback with profile data
- `/oauth/token` - Token exchange
- `/oauth/userinfo` - User info for NextAuth

**Deploy:** `cd instagram-oauth-proxy && npx wrangler deploy`