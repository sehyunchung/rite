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

## Project Architecture

This is a DJ Event Booking System built with React (Vite) frontend and Convex backend. The application streamlines event management for DJ bookings with Instagram workflow integration.

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
- `/src/lib/` - Utility functions and configuration
  - `/src/lib/utils.ts` - Utility functions for component styling
  - `/src/lib/validation.ts` - ArkType validation schemas and helpers
- `/src/types/` - TypeScript type definitions matching Convex schema
- `/public/` - Static assets

**Backend Structure (Convex):**
- `/convex/` - Convex backend functions and schema
- `/convex/schema.ts` - Database schema definition with tables:
  - `events` - Event information with venue, deadlines, payment configuration
  - `timeslots` - DJ time slots linked to events with Instagram handles
  - `submissions` - DJ submissions with promo materials, guest lists, payment info
  - `users` - Organizer authentication
- `/convex/_generated/` - Auto-generated Convex API files
- `/convex/events.ts` - Event management API functions (create, list, get, update status)
- `/convex/timeslots.ts` - Timeslot management API functions

### Key Features

**✅ Implemented:**
- **Event Creation**: Complete form with venue, dates, payment details, and DJ timeslots
- **Real-time Validation**: ArkType-powered form validation with visual error feedback
- **Timeslot Management**: Add/remove DJ slots with overlap detection and time validation
- **Instagram Handle Validation**: Enforces @username format with character validation
- **Database Integration**: Events and timeslots saved to Convex with atomic operations
- **Dynamic UI**: Responsive forms with loading states and error boundaries

**📋 Planned:**
- **Unique Submission Links**: Each DJ gets a unique link for submitting materials
- **File Uploads**: Promo materials stored in Convex file storage
- **Instagram Integration**: Generates copy-paste messages for Instagram announcements
- **Encrypted Data**: Payment information (account numbers, resident registration) encrypted at rest
- **Authentication**: Organizer login and session management

### Data Flow

**Current Implementation:**
1. Organizers create events through dashboard with form validation
2. Event data and timeslots are atomically saved to Convex database
3. Dashboard displays real-time event counts and status updates
4. Form provides immediate feedback with ArkType validation

**Planned Extensions:**
5. System generates unique submission links for each DJ timeslot
6. DJs submit materials via public submission page (no auth required)
7. Organizers track submissions and export data through dashboard
8. Instagram messages auto-generated for event promotion

### Available UI Components

**shadcn/ui Base Components:**
- Button, Card, Input, Label, Textarea, Select
- Styled with Tailwind CSS and Radix UI primitives

**Kibo UI Advanced Components:**
- `Dropzone` - Drag-and-drop file upload with multi-file support
- `QRCode` - QR code generation for event links and check-in
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

### Phase 2: DJ Submission System - 📋 **PLANNED**
- [ ] Public DJ submission pages
- [ ] File upload integration with Convex storage
- [ ] Unique submission link generation
- [ ] Guest list management
- [ ] Payment information collection

### Phase 3: Advanced Features - 📋 **PLANNED**
- [ ] Instagram message generation
- [ ] Organizer authentication system
- [ ] Event dashboard with submission tracking
- [ ] Data export functionality
- [ ] Email notifications