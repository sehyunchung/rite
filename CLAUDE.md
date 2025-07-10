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
- **Backend**: Convex (real-time database and file storage)
- **Authentication**: Organizer-only auth (magic link/OAuth)
- **Validation**: Zod schemas
- **File Handling**: Convex file storage for promo materials
- **Package Manager**: npm

### Core Architecture

**Frontend Structure:**
- `/src/` - Main application source code
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
- `/convex/myFunctions.ts` - Sample function (to be replaced with actual functions)

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

### Development Setup
- Run `npm run predev` to initialize Convex development environment and open dashboard
- Use `npm run dev` to start both frontend (Vite) and backend (Convex) in parallel
- Convex dashboard automatically opens for database management
- Frontend serves at localhost with auto-reload

## Code Style Guidelines
- Formatting: Follow Prettier defaults, 2-space indentation
- Imports: Group and sort imports (React/Next, external, internal, types)
- Types: Use TypeScript strictly, avoid `any` types and non-null assertions
- Naming: Use PascalCase for components, camelCase for variables/functions
- Styling: Use Tailwind CSS for styling
- Error handling: Use try/catch with appropriate logging
- Components: Prefer functional components with hooks
- State management: Use React Context for global state, hooks for local state
- Comments: Document complex logic, avoid obvious comments