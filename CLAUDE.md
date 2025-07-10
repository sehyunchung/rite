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
- **Authentication**: Organizer-only auth (magic link/OAuth)
- **Validation**: Zod schemas
- **File Handling**: Convex file storage for promo materials
- **AI Integration**: Model Context Protocol (MCP) for Kibo UI
- **Package Manager**: npm

### Core Architecture

**Frontend Structure:**
- `/src/` - Main application source code
- `/src/components/ui/` - shadcn/ui base components
- `/src/components/ui/kibo-ui/` - Kibo UI advanced components
- `/src/lib/utils.ts` - Utility functions for component styling
- `/src/types/` - TypeScript type definitions matching Convex schema
- `/public/` - Static assets

**Backend Structure (Convex):**
- `/convex/` - Convex backend functions and schema
- `/convex/schema.ts` - Database schema definition with tables:
  - `events` - Event information with venue, deadlines, payment details
  - `timeslots` - DJ time slots linked to events
  - `submissions` - DJ submissions with promo materials, guest lists, payment info
  - `users` - Organizer authentication
- `/convex/_generated/` - Auto-generated Convex API files
- `/convex/events.ts` - Event management API functions
- `/convex/timeslots.ts` - Timeslot management API functions

### Key Features
- **Event Creation**: Organizers create events with custom timeslots and DJ assignments
- **Unique Submission Links**: Each DJ gets a unique link for submitting materials
- **File Uploads**: Promo materials stored in Convex file storage
- **Instagram Integration**: Generates copy-paste messages for Instagram announcements
- **Encrypted Data**: Payment information (account numbers, resident registration) encrypted at rest
- **Mobile-First**: Responsive design optimized for DJ mobile submissions

### Data Flow
1. Organizers create events through authenticated dashboard
2. System generates unique submission links for each DJ timeslot
3. DJs submit materials via public submission page (no auth required)
4. Organizers track submissions and export data through dashboard
5. Instagram messages auto-generated for event promotion

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

// Kibo UI components  
import { Dropzone } from "@/components/ui/kibo-ui/dropzone"
import { QRCode } from "@/components/ui/kibo-ui/qr-code"
import { CodeBlock } from "@/components/ui/kibo-ui/code-block"
```