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
│   └── ui/                # Shared UI components (@rite/ui)
└── package.json           # Root workspace configuration
```

## Tech Stack

- **Monorepo**: [pnpm workspaces](https://pnpm.io/workspaces) + [Turborepo](https://turbo.build/)
- **Web App**: [Next.js 15](https://nextjs.org/) with React 19, TypeScript, and Turbopack
- **Mobile App**: [Expo](https://expo.dev/) with React Native and NativeWind
- **UI Components**: Shared [@rite/ui](./packages/ui) package with platform-specific implementations
- **Backend**: [Convex](https://convex.dev/) for real-time database and file storage
- **Authentication**: [NextAuth v5](https://authjs.dev/) with Instagram OAuth integration
- **Typography**: [SUIT Variable](https://sunn.us/suit/) font with Korean/English support
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with platform-specific implementations
- **Validation**: [ArkType](https://arktype.io/) for high-performance schema validation
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/) for internationalization (Korean/English)
- **Package Manager**: pnpm

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

## Development URLs

- **Next.js App**: http://localhost:8000
- **Mobile App**: Expo Go app or simulator
- **Convex Dashboard**: Opens automatically when running backend

## Environment Setup

Create a `.env.local` file in `apps/next-app/` with the following variables:

```bash
# Required for full functionality
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_URL=your_convex_url
NEXTAUTH_URL=http://localhost:8000
NEXTAUTH_SECRET=your_nextauth_secret
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.sehyunchung.workers.dev

# Optional
NODE_ENV=development
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
- System fonts with Korean/English support
- NativeWind for consistent styling with web

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

<Text className="text-2xl font-bold">
  한국어 + English Heading
</Text>
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
- **Basic**: Button, Input, Label, Textarea, Badge, Card
- **Layout**: Select, Alert, AlertDialog
- **Feedback**: LoadingIndicator, FullScreenLoading
- **Advanced**: Dropzone (file upload), QRCode

### Usage
```tsx
// Same import works for both web and mobile
import { Button, Card, LoadingIndicator } from '@rite/ui';

// Components automatically use platform-specific implementation
<Button variant="primary" onPress={handlePress}>
  Submit
</Button>
```

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
