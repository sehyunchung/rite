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

**Current Status**: Authentication system is implemented but requires Clerk configuration to be fully functional.

## Project Architecture

This is Rite, a DJ event management platform built with React (Vite) frontend and Convex backend. The application streamlines event management for DJ bookings with Instagram workflow integration.

### Tech Stack
- **Frontend**: React 19 with TypeScript, Vite, Tailwind CSS, React Router
- **UI Libraries**: 
  - shadcn/ui - Base component library with Radix UI primitives
  - Kibo UI - Advanced components (Dropzone, QR Code, Code Block)
- **Backend**: Convex (real-time database and file storage)
- **Authentication**: Organizer-only auth (magic link/OAuth) - *Planned*
- **Validation**: ArkType (high-performance TypeScript schema validation)
- **File Handling**: Convex file storage for promo materials
- **AI Integration**: Model Context Protocol (MCP) for Kibo UI
- **Package Manager**: npm

### Core Architecture

**Frontend Structure:**
- `/src/` - Main application source code
- `/src/components/` - React components
  - `/src/components/ui/` - shadcn/ui base components
  - `/src/components/ui/kibo-ui/` - Kibo UI advanced components
  - `/src/components/EventCreationForm.tsx` - Event creation form with validation
  - `/src/components/DJSubmissionForm.tsx` - Public DJ submission form with token access
- `/src/lib/` - Utility functions and configuration
  - `/src/lib/utils.ts` - Utility functions for component styling
  - `/src/lib/validation.ts` - ArkType validation schemas and helpers
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

**📋 Planned:**
- **File Upload Integration**: Connect Dropzone to Convex file storage for actual uploads
- **Submission Data Storage**: Save guest lists and payment info to database with encryption
- **Submission Status Tracking**: Dashboard for organizers to monitor submission progress
- **Instagram Integration**: Generates copy-paste messages for Instagram announcements
- **Authentication**: Organizer login and session management
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

// Convex integration
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"

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