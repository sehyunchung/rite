# Rite - DJ Event Management Platform

A monorepo containing DJ event management platform with [Next.js](https://nextjs.org/) web app and [Expo](https://expo.dev/) mobile app, sharing a [Convex](https://convex.dev/) backend and UI components.

## Monorepo Structure

```
rite/
├── apps/
│   ├── next-app/          # Next.js 15 web application
│   └── mobile/            # Expo React Native mobile app
├── packages/
│   ├── backend/           # Shared Convex backend (@rite/backend)
│   ├── shared-types/      # Shared TypeScript types
│   ├── ui/                # Shared UI components (@rite/ui)
│   ├── test-utils/        # Shared testing utilities (@rite/test-utils)
│   └── posthog-config/    # Analytics configuration (@rite/posthog-config)
└── package.json           # Root workspace configuration
```

## Tech Stack

- **Monorepo**: [pnpm workspaces](https://pnpm.io/workspaces) v10.14.0 + [Turborepo](https://turbo.build/)
- **Web App**: [Next.js 15.2.0](https://nextjs.org/) with React 19.0.0, TypeScript, and Turbopack
- **Mobile App**: [Expo SDK 53](https://expo.dev/) with React Native 0.79.5 and NativeWind
- **UI Components**: Shared [@rite/ui](./packages/ui) package with cross-platform implementations
- **Backend**: [Convex](https://convex.dev/) for real-time database and file storage
- **Authentication**: [NextAuth v5](https://authjs.dev/) with Google and Instagram OAuth
- **Typography**: [SUIT Variable](https://sunn.us/suit/) font with Korean/English support
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with CSS variables and theme system
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/) for visual regression
- **Analytics**: [PostHog](https://posthog.com/) for product analytics
- **Validation**: [ArkType](https://arktype.io/) for high-performance schema validation
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/) for internationalization (Korean/English)
- **Package Manager**: pnpm (Node.js >=22.18.0 required)

## Get Started

If you just cloned this codebase, run:

```bash
# Install dependencies for all workspaces
pnpm install

# Start all apps in development mode
pnpm run dev

# Or start specific apps
pnpm run dev:next        # Next.js app only
pnpm run dev:mobile      # Mobile app only
pnpm run dev:backend     # Convex backend only
```

### Testing Commands

This project follows strict **Test-Driven Development (TDD)** practices:

```bash
# Run all tests
pnpm run test

# Watch mode for development
pnpm run test:watch

# Test coverage report
pnpm run test:coverage

# Interactive test UI
pnpm run test:ui

# Visual regression tests with Playwright
pnpm run test:visual
pnpm run test:visual:update    # Update visual baselines
pnpm run test:visual:ui        # Debug mode

# End-to-end tests
pnpm run test:e2e
pnpm run test:e2e:ui

# Test specific workspace
pnpm --filter=next-app test:watch
```

### Build and Quality Commands

```bash
# Build all applications
pnpm run build

# Lint and type checking
pnpm run lint
pnpm run type-check

# Build specific workspace
pnpm --filter=next-app run build
```

## Development URLs

- **Next.js App**: http://localhost:8000
- **Mobile App**: Expo Go app or simulator
- **Convex Dashboard**: Opens automatically when running backend

## Environment Setup

Create a `.env.local` file in `apps/next-app/` with the following variables:

```bash
# Required - Convex Backend
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_URL=your_convex_url

# Required - NextAuth Configuration
NEXTAUTH_URL=http://localhost:8000
NEXTAUTH_SECRET=your_nextauth_secret

# Instagram OAuth (via custom proxy)
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.sehyunchung.workers.dev

# Google OAuth - Production Ready
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Data Protection (Basic Obfuscation)
CONVEX_ENCRYPTION_KEY=your_32_character_encryption_key_here
CONVEX_HASH_SALT=your_hash_salt_here

# Analytics - PostHog
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Development
NODE_ENV=development
```

**Mobile App Environment** (`.env` in `apps/mobile/`):

```bash
# Convex
EXPO_PUBLIC_CONVEX_URL=your_convex_url

# Google OAuth - Platform Specific
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS=your_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET=your_web_client_secret

# Data Protection
CONVEX_ENCRYPTION_KEY=your_32_character_encryption_key_here
CONVEX_HASH_SALT=your_hash_salt_here
```

**Note**: The apps include graceful fallbacks and will run without environment variables for development/testing purposes.

## Typography Setup

### SUIT Variable Font

Both applications use the **SUIT Variable font**, a modern Korean/English typeface designed for digital interfaces:

- **Variable Weights**: 100-900 (Thin to Black)
- **Language Support**: Complete Korean Hangul + Latin characters
- **Format**: WOFF2 variable font for optimal performance
- **Size**: ~50KB (significantly smaller than multiple font files)

### Font Configuration

**Next.js App** (`apps/next-app/`):

- Font file: `/app/lib/SUIT-Variable.woff2`
- Configuration: `/app/lib/fonts.ts` with `next/font/local`
- CSS Variable: `--font-suit` available globally
- Tailwind Class: `font-suit` available in components

**Mobile App** (`apps/mobile/`):

- **Cross-platform Authentication**: Production-ready Google OAuth with web, iOS, Android, and Expo Go support
- **Modular Architecture**: Clean 88-line AuthContext with comprehensive error handling
- **Design System Integration**: 100% @rite/ui component usage, zero hardcoded colors
- **Security Features**: PKCE, CSRF protection, secure storage abstraction
- **"use dom" Support**: Enhanced web compatibility for advanced components
- **NativeWind Styling**: Consistent Tailwind CSS across platforms

### Usage Examples

**Next.js with Tailwind:**

```tsx
// Use Tailwind font class
<h1 className="font-suit font-bold text-2xl">
  한국어 + English Heading
</h1>

// Or use CSS variable directly
<div style={{ fontFamily: 'var(--font-suit)' }}>
  Content with SUIT font
</div>
```

**React Native with NativeWind:**

```tsx
import { Text } from 'react-native';

<Text className="text-2xl font-bold">한국어 + English Heading</Text>;
```

### Performance Benefits

- **Single File**: One variable font replaces multiple weight files
- **Smaller Bundle**: ~50KB vs ~200KB+ for traditional font stacks
- **Faster Loading**: `font-display: swap` prevents invisible text
- **Better UX**: Smooth weight transitions and custom intermediate weights

## Shared UI Components

The `@rite/ui` package provides cross-platform UI components with platform-specific implementations:

### Component Structure

```
packages/ui/src/components/
├── button/
│   ├── button.web.tsx      # Web implementation
│   ├── button.native.tsx   # Native implementation
│   └── index.ts           # Platform-specific exports
└── ... (other components)
```

### Available Components

- **Basic**: Button, Input, Label, Textarea, Badge, Card, Text
- **Layout**: Select, Alert, AlertDialog, ListItem
- **Feedback**: LoadingIndicator, FullScreenLoading
- **Advanced**: Dropzone (file upload), QRCode, ActionCard, EventCard
- **Typography**: Typography component with consistent styling
- **"use dom" Components**: Enhanced web compatibility for QRCode and Dropzone

### Usage

```tsx
// Same import works for both web and mobile
import { Button, Card, LoadingIndicator } from '@rite/ui';

// Components automatically use platform-specific implementation
<Button variant="primary" onPress={handlePress}>
  Submit
</Button>;
```

## Advanced Features

### Dynamic Theme System

The platform includes a sophisticated theme system with real-time switching:

- **5 Curated Themes**: Including Josh Comeau (Dark/Light) themes
- **CSS Variables**: Dynamic theme switching without page reload
- **Cross-platform**: Consistent theming across web and mobile
- **Theme Switcher**: Component for easy theme selection with persistence

### Data Protection

Basic data obfuscation system for sensitive information:

- **XOR-based Obfuscation**: Synchronous encryption within Convex V8 runtime
- **Searchable Encryption**: Deterministic hashing for encrypted data queries
- **DJ Submissions**: Automatic protection of account numbers, contact info, etc.
- **Environment-based**: Keys managed through environment variables

**⚠️ Note**: This is basic obfuscation, not cryptographic security. Suitable for development and basic compliance.

### Visual Testing

Comprehensive visual regression testing with Playwright:

- **Multi-theme Testing**: All components tested across all 5 themes
- **Responsive Testing**: Desktop, tablet, and mobile viewports
- **State Testing**: Hover, focus, active, disabled states
- **Visual Test Page**: `/visual-test` route for manual component inspection

### Analytics

PostHog integration for product analytics:

- **User Tracking**: Comprehensive user behavior analysis
- **Event Tracking**: Custom events for DJ submissions, OAuth flows
- **Privacy-focused**: Respects user preferences and GDPR compliance
- **Development Mode**: Automatic exclusion during development

## Font Assets

The SUIT Variable font is used in the Next.js web app:

- **Location**: `/apps/next-app/app/lib/SUIT-Variable.woff2`
- **Size**: ~50KB with variable weights (100-900)
- **Support**: Full Korean Hangul + Latin characters

## Learn more

To learn more about developing your project with Convex, check out:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex principles.
- The rest of [Convex docs](https://docs.convex.dev/) to learn about all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.

## Join the community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) to get help in real-time.
- Follow [Convex on GitHub](https://github.com/get-convex/), star and contribute to the open-source implementation of Convex.
