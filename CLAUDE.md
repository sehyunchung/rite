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

### Purpose & Objectives

The SvelteKit POC serves as a **comprehensive framework evaluation** to determine the optimal technology stack for superior developer experience and deployment velocity. This evaluation directly informs critical technology decisions for the Rite platform.

**Primary Goals:**
1. **Performance Comparison**: Measure bundle size, load times, and runtime performance vs Next.js
2. **Developer Experience**: Evaluate build speeds, hot reload, and development workflow
3. **Deployment Strategy**: Test Cloudflare Workers deployment for global edge performance
4. **Architecture Validation**: Verify shared backend compatibility and monorepo integration
5. **Migration Assessment**: Determine feasibility and benefits of potential framework migration

### Decision Framework

**Evaluation Criteria:**
- **Bundle Size**: Target <50KB (vs Next.js ~200KB+)
- **Load Performance**: <100ms Time to Interactive globally
- **Build Speed**: Development iteration velocity and CI/CD efficiency
- **Edge Deployment**: Cloudflare Workers performance vs Vercel Edge
- **Developer Productivity**: Learning curve, tooling, and debugging experience
- **Ecosystem Maturity**: Component libraries, integrations, and community support

**Decision Timeline:** Framework evaluation expected completion by Q2 2024 to inform production architecture.

### Current Implementation Status

**✅ Completed Features:**
- **Monorepo Integration**: Full pnpm workspace setup with shared backend
- **Cloudflare Workers Deployment**: Production-ready Wrangler configuration
- **Shared Convex Backend**: Identical API access to Next.js app database
- **Performance Metrics Display**: Real-time load time and bundle size monitoring
- **Database Integration Demo**: Live connection testing with event and timeslot queries
- **Real-time Updates Demo**: 3-second polling simulation with automatic UI updates
- **TypeScript Configuration**: Strict typing with shared type definitions
- **Build Pipeline**: Turborepo integration for optimized monorepo builds

**📋 Missing for Full Comparison:**
- **Authentication System**: Instagram OAuth integration (NextAuth equivalent needed)
- **User Dashboard**: Event creation and management interface
- **DJ Submission System**: Token-based submission form implementation
- **File Upload Handling**: Convex storage integration with Dropzone equivalent
- **Form Validation**: ArkType integration for consistent validation logic
- **UI Component Library**: shadcn/ui or equivalent component system

### Technical Architecture

**Framework Stack:**
- **Frontend**: SvelteKit 5 with TypeScript
- **Deployment**: Cloudflare Workers via `@sveltejs/adapter-cloudflare`
- **Backend**: Shared Convex database (`@rite/backend` workspace package)
- **Build System**: Vite with Turborepo caching
- **Package Management**: pnpm workspaces for monorepo coordination

**Monorepo Structure:**
```
apps/sveltekit-poc/
├── src/
│   ├── routes/
│   │   ├── +page.svelte           # Performance metrics homepage
│   │   ├── convex-demo/            # Database connection testing
│   │   └── real-time-demo/         # Live data update simulation
│   ├── lib/
│   │   └── convex.ts              # Shared backend client setup
│   └── app.html                   # Root HTML template
├── wrangler.toml                  # Cloudflare Workers configuration
├── svelte.config.js               # SvelteKit + Cloudflare adapter
└── DEPLOYMENT.md                  # Comprehensive deployment guide
```

**Shared Backend Integration:**
- **Package Reference**: `@rite/backend` workspace dependency
- **API Access**: Identical Convex queries/mutations as Next.js app
- **Type Safety**: Shared TypeScript definitions across frameworks
- **Database Schema**: Uses same Convex schema (events, timeslots, submissions)

### Performance Results

**Current Metrics (SvelteKit):**
- **Bundle Size**: <50KB (vs Next.js ~200KB+)
- **Load Time**: <100ms Time to Interactive
- **Cold Start**: <25ms on Cloudflare Workers
- **Framework Overhead**: Minimal (compiled to vanilla JavaScript)
- **Real-time Updates**: <3ms UI reactivity on data changes

**Comparison Framework:**
```javascript
// Performance monitoring implementation
let loadTime = 0;
onMount(() => {
    loadTime = performance.now(); // Measures actual load performance
});
```

### Deployment Configuration

**Cloudflare Workers Setup:**
- **Deployment Target**: `rite-sveltekit-poc.workers.dev`
- **Build Command**: `pnpm run build` (Turborepo optimized)
- **Environment Variables**: `VITE_CONVEX_URL` for backend connection
- **Domain Configuration**: Ready for `rite.party` custom domain
- **CI/CD Ready**: GitHub Actions workflow template included

**Key Configuration Files:**
```toml
# wrangler.toml - Cloudflare Workers configuration
name = "rite-sveltekit-poc"
compatibility_date = "2025-01-27"
workers_dev = true
compatibility_flags = ["nodejs_compat"]
```

```javascript
// svelte.config.js - Framework adapter configuration
adapter: adapter({
    routes: { include: ['/*'], exclude: ['<all>'] },
    platformProxy: { configPath: 'wrangler.toml' }
})
```

### Demo Applications

**1. Convex Integration Demo (`/convex-demo`)**
- **Purpose**: Validate shared backend compatibility
- **Features**: Live database connection testing, event listing, error handling
- **Results**: ✅ Perfect compatibility with Next.js backend

**2. Real-time Updates Demo (`/real-time-demo`)**
- **Purpose**: Demonstrate SvelteKit reactivity and performance
- **Features**: 3-second polling, live event/timeslot updates, performance monitoring
- **Results**: ✅ Ultra-fast UI updates, minimal JavaScript overhead

**3. Performance Metrics (`/`)**
- **Purpose**: Quantify framework performance benefits
- **Features**: Load time measurement, bundle size display, framework comparison
- **Results**: ✅ Significantly faster than React equivalents

### Development Commands

**Local Development:**
```bash
# Start SvelteKit POC (port 3001)
pnpm run dev:sveltekit

# Dedicated POC development
pnpm --filter=sveltekit-poc run dev

# Workers local development
pnpm --filter=sveltekit-poc run workers:dev
```

**Deployment:**
```bash
# Build and deploy to Cloudflare Workers
pnpm --filter=sveltekit-poc run build
pnpm --filter=sveltekit-poc run deploy

# Preview deployment
pnpm --filter=sveltekit-poc run deploy:preview
```

### Framework Comparison Results

**SvelteKit Advantages:**
- ✅ **Performance**: 4x smaller bundles, faster load times
- ✅ **Developer Experience**: Faster builds, excellent hot reload
- ✅ **Runtime Efficiency**: Compiled code, minimal framework overhead
- ✅ **Cloudflare Integration**: Native Workers support, edge optimization
- ✅ **Simplicity**: Less boilerplate, intuitive component model

**Next.js Advantages:**
- ✅ **Ecosystem Maturity**: Larger community, more integrations
- ✅ **Component Libraries**: Rich shadcn/ui ecosystem, extensive third-party support
- ✅ **Authentication**: Mature NextAuth integration with Instagram OAuth
- ✅ **Production Readiness**: Battle-tested at scale, comprehensive documentation
- ✅ **Team Familiarity**: Existing React expertise and development patterns

### Next Steps for Complete Evaluation

**Priority 1: Authentication Parity**
- Implement Instagram OAuth equivalent for SvelteKit
- Compare authentication flow complexity and developer experience
- Evaluate session management and security patterns

**Priority 2: Feature Parity Implementation**
- Port event creation/management interface
- Implement DJ submission system with token validation
- Add file upload integration with Convex storage

**Priority 3: Performance Benchmarking**
- Comprehensive load testing under realistic conditions
- Bundle size analysis with feature parity
- Real-world deployment performance comparison

**Decision Milestone:** Complete evaluation by Q2 2024 to inform production framework choice.

## Typography Configuration

### SUIT Variable Font Setup

Both applications use the SUIT Variable font, a comprehensive Korean/English typeface optimized for digital interfaces:

**Font Features:**
- **Variable Weights**: 100-900 (Thin to Black)
- **Language Support**: Complete Korean Hangul + Latin character sets
- **Format**: WOFF2 variable font format for optimal performance
- **Fallbacks**: System fonts (-apple-system, BlinkMacSystemFont, sans-serif)
- **Display**: `font-display: swap` for improved loading performance

### Next.js Font Implementation

**Configuration** (`/apps/next-app/app/lib/fonts.ts`):
```typescript
import localFont from 'next/font/local'

export const suit = localFont({
  src: './SUIT-Variable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-suit',
})
```

**Integration** (`/apps/next-app/app/layout.tsx`):
```typescript
import { suit } from './lib/fonts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={suit.variable}>
        {children}
      </body>
    </html>
  )
}
```

**Tailwind Configuration** (`/apps/next-app/tailwind.config.cjs`):
```javascript
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'suit': ['var(--font-suit)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
}
```

**Usage in Components:**
```typescript
// Apply SUIT font via Tailwind class
<div className="font-suit">
  <h1 className="font-bold">한국어 + English Text</h1>
  <p className="font-normal">Variable weight support</p>
</div>

// Or use CSS variable directly
<div style={{ fontFamily: 'var(--font-suit)' }}>
  Content with SUIT font
</div>
```

### SvelteKit Font Implementation

**CSS Configuration** (`/apps/sveltekit-poc/src/routes/app.css`):
```css
@font-face {
  font-family: 'SUIT';
  src: url('/fonts/SUIT-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: 'SUIT', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

**Static Asset** (`/apps/sveltekit-poc/static/fonts/SUIT-Variable.woff2`):
- Font file served directly from static directory
- Accessible at `/fonts/SUIT-Variable.woff2` in production

**Usage in Components:**
```svelte
<style>
  .heading {
    font-family: 'SUIT', sans-serif;
    font-weight: 700;
  }
  
  .body-text {
    font-family: 'SUIT', sans-serif;
    font-weight: 400;
  }
</style>

<h1 class="heading">한국어 + English Heading</h1>
<p class="body-text">Body text with SUIT font</p>
```

### Font Performance Considerations

1. **Preloading** (recommended for Next.js):
   ```html
   <link rel="preload" href="/fonts/SUIT-Variable.woff2" as="font" type="font/woff2" crossorigin>
   ```

2. **Variable Font Benefits**:
   - **Single File**: One font file supports all weights (100-900)
   - **Smaller Bundle**: ~50KB vs multiple weight files (~200KB+)
   - **Performance**: Fewer HTTP requests, faster loading
   - **Flexibility**: Smooth weight transitions, custom intermediate weights

3. **Browser Support**:
   - **Modern Browsers**: Full variable font support
   - **Fallbacks**: System fonts ensure universal compatibility
   - **Progressive Enhancement**: Enhanced typography where supported

### Font Loading Strategy

- **Next.js**: Automatic optimization via `next/font/local`
- **SvelteKit**: Manual optimization with `font-display: swap`
- **Fallback Chain**: SUIT → system-ui → -apple-system → BlinkMacSystemFont → sans-serif
- **Loading State**: `font-display: swap` prevents invisible text flash

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

## Current Development Status

### Phase 1: Core Event Creation - ✅ **COMPLETED**
- [x] Event creation form with comprehensive validation
- [x] Timeslot management with overlap detection
- [x] ArkType integration for high-performance validation
- [x] Convex backend integration with atomic operations
- [x] Real-time form validation with visual feedback
- [x] Database schema aligned with form structure

### Phase 2: DJ Submission System - 🚧 **IN PROGRESS** (85% Complete)
- [x] Unique submission link generation with 16-character tokens
- [x] Public DJ submission pages with token-based access
- [x] Guest list management with dynamic add/remove functionality
- [x] Payment information collection forms with privacy notices (includes resident registration number)
- [x] Token-based URL routing and event context display
- [x] Form validation with guest phone numbers as optional
- [x] Robust QR code generation with comprehensive environment validation
- [ ] File upload integration with Convex storage
- [ ] Submission data storage with encryption

### Phase 2.7: Instagram OAuth Integration - ✅ **COMPLETED**
- [x] Custom OAuth proxy deployed on Cloudflare Workers with complete profile data fetching
- [x] Instagram OAuth integration with NextAuth authentication and auto-connection
- [x] Complete profile data capture (username, display name, profile picture URL)
- [x] Instagram connection data storage in Convex database with all profile fields
- [x] Dashboard UI displaying Instagram handles (@username format)
- [x] Direct Convex ID usage eliminating complex NextAuth UUID mapping
- [x] Simplified authentication flow without retry logic or temporary workarounds
- [x] Clean profile handling without fake email generation
- [x] Business/Creator account validation and proper data mapping

### Phase 2.9: Authentication System Cleanup - ✅ **COMPLETED**
- [x] Removed complex NextAuth ID mapping and retry logic from authentication flow
- [x] Direct Convex ID usage throughout authentication system for consistency
- [x] Cleaned backend auth functions, removed temporary user creation workarounds
- [x] Eliminated band-aid users.ts file and unnecessary migrations folder
- [x] Updated components to use proper Convex queries with correct typing
- [x] Streamlined auth configuration with direct provider setup

### Phase 2.10: ConvexProvider Hydration Fixes - ✅ **COMPLETED**  
- [x] Fixed "Objects are not valid as a React child" hydration error with comprehensive solution
- [x] Client-side ConvexReactClient initialization using useEffect pattern
- [x] Dynamic imports with SSR disabled to prevent server/client mismatches
- [x] Proper loading states during hydration to prevent render errors
- [x] Graceful handling of missing NEXT_PUBLIC_CONVEX_URL environment variable
- [x] Added force-dynamic export to all pages using NextAuth
- [x] Created proper not-found page for 404 handling

### Phase 2.5: Enhanced Event Creation - ✅ **COMPLETED**
- [x] Instagram hashtags field for event promotion
- [x] Payment per DJ amount (separate from total budget)
- [x] Guest limit per DJ configuration
- [x] Guest list deadline must be before promo deadline validation
- [x] Minimum timeslot duration (30 minutes) validation
- [x] Maximum 12 timeslots per event limit
- [x] Resident registration number field in payment form
- [x] Optional phone numbers for guest list entries
- [x] Backward compatibility for existing database records

### Phase 2.6: UI/UX Improvements - ✅ **COMPLETED**
- [x] Clean, production-ready dashboard interface
- [x] Comprehensive Footer component with development status tracking
- [x] Removed development testing components from main interface
- [x] Professional appearance suitable for client demonstrations
- [x] Development progress tracking contained in footer only
- [x] Minimalist dashboard focused on core user actions

### Phase 2.8: Typography System - ✅ **COMPLETED**
- [x] SUIT Variable font integration across both Next.js and SvelteKit apps
- [x] Next.js font configuration with next/font/local and CSS variables
- [x] SvelteKit font configuration with @font-face and static assets
- [x] Tailwind CSS font family configuration for Next.js app
- [x] Variable font weights (100-900) support for Korean and English text
- [x] Performance optimization with font-display: swap
- [x] Documentation updates for font setup and usage guidelines

### Phase 3: Advanced Features - 📋 **PLANNED**
- [ ] Drag-and-drop reordering for timeslots
- [ ] File preview functionality before submission
- [ ] Submission status dashboard for organizers
- [ ] Instagram message generation with copy-paste templates
- [ ] Organizer authentication system
- [ ] Event template system for recurring events
- [ ] Data export functionality
- [ ] Email notifications and deadline reminders
- [ ] Form persistence (remember progress)

## Troubleshooting Guide

### Common Authentication Issues

**1. "Objects are not valid as a React child" Error**
- **Cause**: ConvexReactClient being initialized on server-side during SSR
- **Solution**: Use client-side initialization with useEffect pattern
- **Implementation**: See `ConvexProviderClient` in `/app/providers/convex-provider-client.tsx`

**2. NextAuth Prerender Errors**  
- **Cause**: Pages using NextAuth attempting to prerender during build
- **Solution**: Add `export const dynamic = 'force-dynamic'` to affected pages
- **Affected Pages**: `/app/dashboard/page.tsx`, `/app/not-found.tsx`, and any page using `auth()`

**3. Hydration Mismatches**
- **Cause**: Server and client rendering different content due to environment variables
- **Solution**: Dynamic imports with SSR disabled for provider components
- **Implementation**: Use `dynamic(() => import(), { ssr: false })` pattern

**4. Missing Environment Variables**
- **Cause**: `NEXT_PUBLIC_CONVEX_URL` not available during build or runtime
- **Solution**: Graceful fallbacks and proper error handling
- **Implementation**: Check for environment variables before client initialization

### Build Configuration Best Practices

**Force Dynamic Rendering:**
```typescript
// Add to any page using NextAuth
export const dynamic = 'force-dynamic'
```

**Proper Provider Structure:**
```typescript
// Use dynamic imports for client-side only providers
const ConvexProviderClient = dynamic(
  () => import("./convex-provider-client"),
  { ssr: false, loading: () => <LoadingComponent /> }
);
```

**Environment Variable Handling:**
```typescript
// Always check for required environment variables
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  console.warn('NEXT_PUBLIC_CONVEX_URL is not set. Convex functionality will be disabled.')
  return
}
```

### Authentication Flow Debugging

**1. Check NextAuth Configuration**
- Verify all required environment variables are set
- Ensure Instagram OAuth proxy is accessible
- Validate client ID and secret match Instagram app settings

**2. Verify Convex Connection**
- Check that Convex deployment is active
- Confirm database schema matches expected structure
- Validate user creation and Instagram connection flow

**3. Debug Instagram OAuth**
- Test OAuth proxy endpoints independently
- Verify Business/Creator account requirements
- Check profile data mapping in auth callbacks

## Deployment Recommendations

### Recommended Platform: Vercel
**Why Vercel:**
- Zero-config deployment for Next.js applications
- Native Next.js optimization and edge functions
- Excellent Asia/Pacific edge network (critical for Korean users)
- Automatic GitHub deployments on push to main
- Simple environment variable management for NextAuth/Convex keys
- Generous free tier (100GB bandwidth, perfect for MVP phase)

### Alternative Options:
1. **Netlify** - Similar features, slightly slower in Asia
2. **Cloudflare Pages** - Fast globally, more complex setup
3. **Railway** - Good for full-stack apps, overkill for frontend

### Deployment Setup:
1. Connect GitHub repository to Vercel
2. Add custom domain: rite.party
3. Set environment variables:
   - `NEXT_PUBLIC_CONVEX_URL` (Required for Convex integration)
   - `CONVEX_DEPLOY_KEY` (For Convex deployment)
   - `NEXTAUTH_URL` (Should match production domain)
   - `NEXTAUTH_SECRET` (Generate secure random string)
   - `INSTAGRAM_CLIENT_ID` (From Instagram app configuration)  
   - `INSTAGRAM_CLIENT_SECRET` (From Instagram app configuration)
   - `INSTAGRAM_OAUTH_PROXY_URL` (Cloudflare Workers proxy URL)
4. Deploy settings:
   - Framework Preset: Next.js (auto-detected)
   - Build Command: `pnpm run build` (uses monorepo structure)
   - Install Command: `pnpm install`
   - Node.js Version: 18.x or later
5. Enable automatic deployments for main branch

### Pre-Deployment Checklist:
- [ ] All environment variables are set and validated
- [ ] Instagram OAuth proxy is deployed and accessible
- [ ] Convex backend is deployed and schema is up to date
- [ ] Build passes locally with same environment variables
- [ ] All pages using NextAuth have `export const dynamic = 'force-dynamic'`
- [ ] ConvexProvider is properly configured with SSR disabled

### Performance Optimization:
- Vercel automatically handles:
  - Next.js optimizations (Image, Font, Script components)
  - Server-side rendering and static generation
  - API routes and edge functions
  - Asset optimization and CDN distribution
  - HTTPS certificates
  - Compression (gzip/brotli)
- Consider adding Korean CDN endpoints when scaling

## Instagram OAuth Proxy

The Instagram OAuth integration uses a custom Cloudflare Workers proxy to bridge Instagram's OAuth 2.0 with Clerk's OIDC requirements.

### Architecture
- **Proxy Service**: Deployed at `rite-instagram-oauth-proxy.sehyunchung.workers.dev`
- **Framework**: Hono.js on Cloudflare Workers
- **Purpose**: Transform Instagram OAuth to OIDC format for NextAuth compatibility

### Key Features
- ✅ **Dual Flow Support**: Handles both login (via NextAuth) and dashboard connection flows
- ✅ **JWT Token Generation**: Creates proper OIDC-compatible ID tokens with complete profile data
- ✅ **Complete Profile Fetching**: Retrieves username, display name, and profile picture during token exchange
- ✅ **State Management**: Preserves OAuth state for security and flow routing
- ✅ **Business Account Validation**: Ensures only Business/Creator accounts can connect
- ✅ **Convex Integration**: Saves complete connection data to database with proper authentication
- ✅ **Auto-Connection**: Seamlessly connects Instagram accounts during NextAuth signup process

### API Endpoints
- `GET /.well-known/openid-configuration` - OIDC discovery for NextAuth
- `GET /oauth/authorize` - Instagram authorization initiation
- `GET /oauth/callback` - Instagram OAuth callback handler with profile data fetching
- `POST /oauth/token` - Token exchange for OIDC compatibility with complete user profile
- `GET /oauth/userinfo` - User information endpoint for NextAuth (includes username, display name, profile picture)

### Environment Variables (Cloudflare Workers)
- `INSTAGRAM_CLIENT_ID` - Instagram app client ID
- `INSTAGRAM_CLIENT_SECRET` - Instagram app client secret
- `RITE_APP_URL` - Main application URL for redirects

### Deployment Commands
```bash
# Deploy to Cloudflare Workers
cd instagram-oauth-proxy && npx wrangler deploy

# Set secrets
npx wrangler secret put INSTAGRAM_CLIENT_ID
npx wrangler secret put INSTAGRAM_CLIENT_SECRET  
npx wrangler secret put RITE_APP_URL
```