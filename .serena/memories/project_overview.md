# Rite - DJ Event Management Platform

## Project Purpose

Rite is a DJ event management platform built as a monorepo containing:

- **Next.js 15 web application** for event organizers and DJs
- **Expo React Native mobile app** for mobile users
- **Shared Convex backend** for real-time database and file storage
- **Cross-platform UI components** shared between web and mobile

The platform handles DJ event creation, DJ information collection, guest list management, Instagram OAuth integration, and various export features.

## Core Features

- Event creation and management
- DJ submission system (for confirmed DJs to provide guest lists, contact info, promo materials)
- Instagram OAuth with mobile support
- Google OAuth with production-ready security (web, iOS, Android, Expo Go)
- Guest list export (CSV, Excel, PDF, Google Sheets)
- Dynamic theme system with 2 curated themes
- Internationalization (Korean/English)
- Cross-platform design system

## Monorepo Structure

```
rite/
├── apps/
│   ├── next-app/          # Next.js 15 web application (port 8000)
│   └── mobile/            # Expo React Native mobile app
├── packages/
│   ├── backend/           # Shared Convex backend (@rite/backend)
│   ├── shared-types/      # Shared TypeScript types
│   ├── ui/               # Cross-platform UI components (@rite/ui)
│   ├── test-utils/       # Shared testing utilities
│   └── posthog-config/   # Analytics configuration
└── instagram-oauth-proxy/ # Cloudflare Worker for Instagram OAuth
```

## Development Status

✅ **Complete:**

- Core platform with event creation and DJ information collection
- DJ submission system with basic data obfuscation
- Instagram OAuth with mobile support
- Google OAuth with production-ready security
- Modular mobile authentication architecture
- Cross-platform design system with dynamic themes
- i18n system with language switcher
- Basic data obfuscation for sensitive information

🚧 **In Progress:**

- File uploads with Convex

📋 **Planned:**

- Submission dashboard
- Instagram content publishing
- Email notifications
