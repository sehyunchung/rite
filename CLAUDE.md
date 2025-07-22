# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands
- Install: `npm install`
- Dev (both frontend & backend): `npm run dev`
- Dev frontend only: `npm run dev:frontend`
- Dev backend only: `npm run dev:backend`
- Build: `npm run build`
- Lint: `npm run lint`
- Preview: `npm run preview`

## Authentication Setup
The application uses Clerk for authentication. To set up authentication:

1. Create a Clerk account at https://dashboard.clerk.com/
2. Create a new application 
3. Copy the Publishable Key from your Clerk dashboard
4. In `.env.local`, uncomment and set:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
   ```
5. Configure Clerk webhook for Convex user synchronization (optional for development)

**Current Status**: Authentication system is fully functional with Clerk integration, including complete Instagram OAuth support.

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
   - Transforms Instagram OAuth to OIDC format for Clerk compatibility
   - Handles both login and dashboard connection flows
   - Validates Business/Creator account requirement
   - Maps user data (username, user_id, account_type, profile_picture_url)

4. **Configure in Clerk** ✅ **COMPLETED**:
   - Custom OIDC provider configured with key: `instagram`
   - Strategy name: `oauth_custom_instagram`
   - Discovery URL: `https://rite-instagram-oauth-proxy.sehyunchung.workers.dev/.well-known/openid-configuration`
   - Attribute mapping configured for Instagram fields

5. **Integration Status** ✅ **FULLY WORKING**:
   - Instagram login through Clerk OAuth ✅
   - Instagram connection for content publishing ✅
   - Connection data saved to Convex database ✅
   - Dashboard displays connected account status ✅

**Note**: The new API provides better features for content publishing and requires Business/Creator accounts.

## Project Architecture

This is Rite, a DJ event management platform built with React (Vite) frontend and Convex backend. The application streamlines event management for DJ bookings with Instagram workflow integration.

### Tech Stack
- **Frontend**: React 19 with TypeScript, Vite, Tailwind CSS, TanStack Router
- **UI Libraries**: 
  - shadcn/ui - Base component library with Radix UI primitives
  - Kibo UI - Advanced components (Dropzone, QR Code, Code Block)
- **Backend**: Convex (real-time database and file storage)
- **Authentication**: Clerk with Instagram OAuth integration
- **Routing**: TanStack Router for type-safe, file-based routing
- **Validation**: ArkType (high-performance TypeScript schema validation)
- **File Handling**: Convex file storage for promo materials
- **AI Integration**: Model Context Protocol (MCP) for Kibo UI
- **Package Manager**: npm

### Core Architecture

**Frontend Structure:**
- `/src/` - Main application source code
- `/src/routes/` - TanStack Router file-based routes
  - `/src/routes/__root.tsx` - Root layout with navigation
  - `/src/routes/index.tsx` - Landing page
  - `/src/routes/dashboard.tsx` - Organizer dashboard
  - `/src/routes/events/create.tsx` - Event creation route
  - `/src/routes/dj-submission.tsx` - Public DJ submission with token params
  - `/src/routes/login.tsx` - Clerk authentication page
- `/src/components/` - React components
  - `/src/components/ui/` - shadcn/ui base components
  - `/src/components/ui/kibo-ui/` - Kibo UI advanced components
  - `/src/components/EventCreationForm.tsx` - Event creation form with validation
  - `/src/components/DJSubmissionForm.tsx` - Public DJ submission form with token access
  - `/src/components/Footer.tsx` - Development status footer
- `/src/lib/` - Utility functions and configuration
  - `/src/lib/utils.ts` - Utility functions for component styling
  - `/src/lib/validation.ts` - ArkType validation schemas and helpers
  - `/src/lib/router.ts` - TanStack Router configuration
- `/src/types/` - TypeScript type definitions matching Convex schema
- `/public/` - Static assets

**Backend Structure (Convex):**
- `/convex/` - Convex backend functions and schema
- `/convex/schema.ts` - Database schema definition with tables:
  - `events` - Event information with venue, deadlines, payment configuration
  - `timeslots` - DJ time slots with unique submission tokens and Instagram handles
  - `submissions` - DJ submissions with promo materials, guest lists, payment info
  - `users` - Organizer authentication
- `/convex/_generated/` - Auto-generated Convex API files
- `/convex/events.ts` - Event management API functions (create, list, get, update status)
- `/convex/timeslots.ts` - Timeslot management and token-based access functions

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
- **Instagram Authentication**: Full OAuth login integration through Clerk
- **Instagram Connection Management**: Connect/disconnect Instagram for content publishing
- **Instagram Data Storage**: Connection details saved to Convex with account validation

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
- Use `npm run dev` to start both frontend (Vite) and backend (Convex) in parallel
- Convex dashboard automatically opens for database management
- Frontend serves at localhost with auto-reload
- MCP integration provides AI-assisted component development

## Code Style Guidelines
- Formatting: Follow Prettier defaults, 2-space indentation
- Imports: Group and sort imports (React/Next, external, internal, types)
- Types: Use TypeScript strictly, avoid `any` types and non-null assertions
- Naming: Use PascalCase for components, camelCase for variables/functions
- Styling: Use Tailwind CSS for styling with shadcn/ui design tokens
- Components: 
  - Prefer functional components with hooks
  - Use shadcn/ui components for basic UI elements
  - Use Kibo UI for advanced functionality (file uploads, QR codes, etc.)
- Error handling: Use try/catch with appropriate logging
- State management: Use React Context for global state, hooks for local state
- Comments: Document complex logic, avoid obvious comments

## Component Import Examples
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

// TanStack Router
import { Link, useNavigate, useRouter } from "@tanstack/react-router"
import { createFileRoute, createRootRoute } from "@tanstack/react-router"

// Convex integration
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"

// Clerk authentication
import { useAuth, useUser, SignInButton, SignOutButton } from "@clerk/clerk-react"

// Validation
import { validateEvent, validateTimeslot } from "@/lib/validation"
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
- [x] Custom OAuth proxy deployed on Cloudflare Workers
- [x] Instagram OAuth integration with Clerk authentication
- [x] Support for both login and dashboard connection flows
- [x] Instagram connection data storage in Convex database
- [x] Dashboard UI for connected account management
- [x] Business/Creator account validation and display

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

## Deployment Recommendations

### Recommended Platform: Vercel
**Why Vercel:**
- Zero-config deployment for Vite + TanStack Router
- Excellent Asia/Pacific edge network (critical for Korean users)
- Automatic GitHub deployments on push to main
- Simple environment variable management for Clerk/Convex keys
- Generous free tier (100GB bandwidth, perfect for MVP phase)

### Alternative Options:
1. **Netlify** - Similar features, slightly slower in Asia
2. **Cloudflare Pages** - Fast globally, more complex setup
3. **Railway** - Good for full-stack apps, overkill for frontend

### Deployment Setup:
1. Connect GitHub repository to Vercel
2. Add custom domain: rite.party
3. Set environment variables:
   - `VITE_CONVEX_URL`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_CLERK_FRONTEND_API_URL`
   - `VITE_INSTAGRAM_CLIENT_ID`
   - `VITE_INSTAGRAM_OAUTH_PROXY_URL`
4. Deploy settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Enable automatic deployments for main branch

### Performance Optimization:
- Vercel automatically handles:
  - Client-side routing for TanStack Router
  - Asset optimization and CDN distribution
  - HTTPS certificates
  - Compression (gzip/brotli)
- Consider adding Korean CDN endpoints when scaling

## Instagram OAuth Proxy

The Instagram OAuth integration uses a custom Cloudflare Workers proxy to bridge Instagram's OAuth 2.0 with Clerk's OIDC requirements.

### Architecture
- **Proxy Service**: Deployed at `rite-instagram-oauth-proxy.sehyunchung.workers.dev`
- **Framework**: Hono.js on Cloudflare Workers
- **Purpose**: Transform Instagram OAuth to OIDC format for Clerk compatibility

### Key Features
- ✅ **Dual Flow Support**: Handles both login (via Clerk) and dashboard connection flows
- ✅ **JWT Token Generation**: Creates proper OIDC-compatible ID tokens
- ✅ **State Management**: Preserves OAuth state for security and flow routing
- ✅ **Business Account Validation**: Ensures only Business/Creator accounts can connect
- ✅ **Convex Integration**: Saves connection data to database with proper authentication

### API Endpoints
- `GET /.well-known/openid-configuration` - OIDC discovery for Clerk
- `GET /oauth/authorize` - Instagram authorization initiation
- `GET /oauth/callback` - Instagram OAuth callback handler
- `POST /oauth/token` - Token exchange for OIDC compatibility
- `GET /oauth/userinfo` - User information endpoint for Clerk

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