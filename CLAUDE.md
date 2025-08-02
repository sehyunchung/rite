# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Run Commands

### Monorepo Commands (Root)
- Install: `pnpm install`
- Build: `pnpm run build`
- Lint: `pnpm run lint`
- Type check: `pnpm run type-check`
- Dev backend: `pnpm run dev:backend`

### Individual Apps
- Next.js: `pnpm run dev:next` or `pnpm --filter=next-app run dev`
- Mobile: `pnpm run dev:mobile` or `pnpm --filter=mobile run start`
- Shared Types: `pnpm --filter=@rite/shared-types run build`

## Authentication Setup

NextAuth v5 with streamlined approach. Required `.env.local`:
```
NEXTAUTH_URL=http://localhost:8000
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Instagram OAuth (via proxy)
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.sehyunchung.workers.dev

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Apple OAuth (TBD)
APPLE_ID=your_apple_id
APPLE_SECRET=your_apple_secret
```

### OAuth Providers
- **Google**: Standard OAuth setup via Google Cloud Console
- **Apple**: Planned but not implemented
- **Instagram**: Custom OAuth proxy (Cloudflare Worker) transforms to OIDC format
  - Requires Business/Creator accounts
  - Complete profile data capture
  - Auto-connection during signup

## Project Architecture

DJ event management platform with monorepo structure:

```
rite/
├── apps/
│   ├── next-app/      # Next.js 15 production app
│   └── mobile/        # Expo React Native app
├── packages/
│   ├── backend/       # Shared Convex backend (@rite/backend)
│   ├── shared-types/  # Shared TypeScript types
│   └── ui/           # Cross-platform UI components (@rite/ui)
└── [config files]
```

### Tech Stack
- **Monorepo**: pnpm workspaces + Turborepo
- **Frontend**: Next.js 15, React 18, TypeScript, Turbopack
- **Mobile**: Expo SDK 53, React Native 0.79.5
- **Design System**: Dark-first (#E946FF primary), SUIT Variable font
- **Styling**: Tailwind CSS (ES modules)
- **Backend**: Convex real-time database
- **Auth**: NextAuth v5 + Instagram OAuth proxy
- **i18n**: next-intl with [locale] routing
- **Validation**: ArkType

### Key Files
- Auth config: `/apps/next-app/app/lib/auth.ts`
- Providers: `/apps/next-app/app/providers/`
- Convex functions: `/packages/backend/convex/`
- UI components: `/packages/ui/src/components/`
- Design tokens: `/packages/ui/src/design-tokens/`
- Theme system: `/packages/ui/src/design-tokens/alternative-themes.ts`
- Theme switcher: `/apps/next-app/app/components/ThemeSwitcher.tsx`

### Database Schema (Convex)
- `users` - Authentication and profiles
- `events` - Event information
- `timeslots` - DJ slots with submission tokens
- `submissions` - DJ submissions
- `instagramConnections` - Instagram profiles

## RITE Design System

Dynamic theme system with comprehensive token architecture and 5 curated themes:

### Dynamic Theme System
Built with CSS variables for real-time theme switching:

**Available Themes:**
- **RITE Refined** (Dark): Enhanced readability version with purple brand colors
- **Deep Ocean** (Dark): Mysterious deep sea palette with bioluminescent accents  
- **Josh Comeau Inspired** (Dark): Sophisticated theme with atmospheric gradients
- **Pure Monochrome Light** (Light): Clean minimal light grayscale theme
- **Pure Monochrome Dark** (Dark): Clean minimal dark grayscale theme

**Theme Structure:**
```typescript
{
  name: string;
  description: string;
  type: 'light' | 'dark';
  brand: { primary, primaryDark, primaryLight };
  neutral: { 0-900 scale };
  semantic: { success, warning, error, info };
  functional: { textPrimary, border, background, etc. };
  interactive: { hover, active, focus, disabled };
  accent: string;
}
```

### CSS Variables Integration
All themes generate CSS variables for seamless switching:
```css
:root {
  --brand-primary: hsl(293deg 100% 66%);
  --bg-primary: hsl(254deg 35% 15%);
  --text-primary: hsl(0deg 0% 100%);
  --button-primary-text: white;
  /* ... all theme tokens as CSS variables */
}
```

### Theme Switching
**ThemeSwitcher Component**: `/apps/next-app/app/components/ThemeSwitcher.tsx`
- Positioned next to language selector in header
- Persists selection in localStorage
- Real-time CSS variable updates
- Cross-platform compatible

**Usage:**
```typescript
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

// Theme switcher automatically handles:
// - Loading saved theme from localStorage
// - Applying CSS variables dynamically
// - Theme persistence across sessions
```

### Tailwind Configuration
**Next.js**: Uses CSS variables with fallbacks for dynamic theming
```javascript
colors: {
  'brand-primary': 'var(--brand-primary, #E946FF)',
  neutral: {
    800: 'var(--neutral-800, #1A0F2F)',
    // ... all scales use CSS variables
  }
}
```

**Mobile**: Static design tokens (dynamic theming planned)
```javascript
colors: {
  'brand-primary': tokens.colors.brand.primary,
  neutral: tokens.colors.neutral,
}
```

### Typography
- Font: SUIT Variable (100-900 weights)
- Variants: h1-h6, body, button, label, caption
- Consistent across all themes

### Components (@rite/ui)
**Base**: Button, Input, Textarea, Select, Card, Label, Badge
**Advanced**: ActionCard, EventCard, Typography, Dropzone, QRCode, ThemeSwitcher
**Loading**: LoadingIndicator, FullScreenLoading

**Platform-specific implementations:**
```
button/
├── button.web.tsx    # Radix UI with CSS variable support
├── button.native.tsx # NativeWind
└── index.tsx        # Platform exports
```

**Theme-Aware Components:**
- Button text adapts automatically (white/black based on theme)
- All components use CSS variables for dynamic theming
- Cross-platform compatibility maintained

### "use dom" Components
Select components support Expo's "use dom" directive for maximum web compatibility:

```
qr-code/
├── qr-code.dom.tsx   # DOM-native with "use dom"
├── qr-code.web.tsx   # Standard web component
├── qr-code.native.tsx # React Native fallback
├── index.dom.ts      # DOM exports
└── index.ts         # Platform exports

dropzone/
├── dropzone.dom.tsx  # HTML5 drag-and-drop with "use dom"
├── dropzone.web.tsx  # Standard web component
├── dropzone.native.tsx # React Native fallback
├── index.dom.ts     # DOM exports
└── index.ts        # Platform exports
```

**Benefits:**
- Direct access to Web APIs (Canvas, File API, DOM manipulation)
- Better performance than WebView approach
- Reduced platform-specific code duplication
- Access to mature web libraries (qrcode, file validation, etc.)

**Security Features:**
- Safe SVG rendering using DOMParser (prevents XSS)
- Dual-layer file validation (MIME type + extension)
- Input sanitization and validation

## Internationalization

next-intl with Korean/English support:

### Structure
```
/app/[locale]/
├── layout.tsx
├── page.tsx
├── dashboard/
├── events/
└── auth/
```

### Usage
```typescript
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';

const t = useTranslations('dashboard');
```

## Theme Development

### Adding New Themes
To add a new theme to the system:

1. **Define Theme Object** in `/packages/ui/src/design-tokens/alternative-themes.ts`:
```typescript
newTheme: {
  name: 'Theme Name',
  description: 'Theme description',
  type: 'light' | 'dark',
  brand: {
    primary: 'hsl(...)',
    primaryDark: 'hsl(...)',
    primaryLight: 'hsl(...)',
  },
  // ... complete theme structure
}
```

2. **Add to ThemeSwitcher** in `/apps/next-app/app/components/ThemeSwitcher.tsx`:
```typescript
const themes = [
  // ... existing themes
  { key: 'newTheme', name: 'Theme Name', description: 'Description', icon: '🎨' },
] as const;
```

3. **Export Theme** for external use:
```typescript
// From @rite/ui/design-tokens
import { alternativeThemes, generateThemeCSS } from '@rite/ui/design-tokens';
```

### CSS Variable Generation
The `generateThemeCSS()` function automatically creates all necessary CSS variables:
- Brand colors (`--brand-primary`, `--brand-primary-dark`, etc.)
- Background scales (`--bg-primary`, `--bg-secondary`, etc.)
- Text colors (`--text-primary`, `--text-secondary`, etc.)
- Interactive states (`--interactive-hover`, `--interactive-active`, etc.)
- Semantic colors (`--color-success`, `--color-warning`, etc.)
- Button text adaptation (`--button-primary-text`)

### Platform Considerations
- **Next.js**: Full dynamic theming with CSS variables
- **Mobile**: Static tokens (mobile dynamic theming is planned)
- **Cross-platform components**: Use design tokens for compatibility

### Theme Testing
Test themes across:
- Light/dark variants
- Color contrast ratios (WCAG compliance)
- Button text readability
- Interactive state visibility
- Component compatibility

## Development Status

**✅ Complete:**
- Core platform with event creation, DJ submissions
- Instagram OAuth with mobile support
- Design system with cross-platform components
- **Dynamic theme system with 5 curated themes**
- **ThemeSwitcher component with persistence**
- **CSS variables integration for real-time theme switching**
- i18n system with language switcher
- Hydration-safe providers
- "use dom" example implementations (QR Code, Dropzone)

**🚧 In Progress:**
- File uploads with Convex
- Submission data encryption

**📋 Planned:**
- Submission dashboard
- Instagram content publishing
- Email notifications

## Troubleshooting

### Common Issues
1. **Hydration errors**: Use ConvexProviderHydrationSafe
2. **NextAuth prerender**: Add `export const dynamic = 'force-dynamic'`
3. **Missing env vars**: Check NEXT_PUBLIC_CONVEX_URL
4. **Mobile OAuth**: Check force web parameters in proxy logs

### Instagram OAuth Proxy
- Service: `rite-instagram-oauth-proxy.sehyunchung.workers.dev`
- Deploy: `cd instagram-oauth-proxy && npx wrangler deploy`
- Logs: `npx wrangler tail` or Cloudflare Dashboard

## Mobile App (Expo)

### Development
```bash
# From root
pnpm run dev:mobile

# Direct commands
cd apps/mobile
pnpm ios
pnpm android
```

### Configuration
- Metro configured for monorepo + NativeWind
- Shared Convex backend via `@rite/backend`
- Platform-specific UI components
- Design tokens fully integrated via Tailwind CSS

### Status
- ✅ Monorepo integration
- ✅ Convex backend access
- ✅ Basic event listing
- ✅ Design system integration (colors, typography, spacing)
- ✅ Navigation aligned with Next.js app (Dashboard, Create Event, Events)
- ✅ Tailwind configuration with @rite/ui tokens
- ✅ Static theme tokens integration (5 themes available)
- ✅ "use dom" demo with QR Code and Dropzone examples
- 🚧 Authentication pending
- 🚧 Full @rite/ui component integration
- 📋 Dynamic theme switching (planned)

## Code Style
- TypeScript strict mode, no `any` or non-null assertions
- @rite/ui components exclusively
- **Use CSS variables for colors** (`var(--brand-primary)` not hardcoded hex)
- **Theme-agnostic component design** (works across all 5 themes)
- Tailwind with ES modules and CSS variable integration
- SUIT Variable font for all text
- Platform-specific implementations when needed
- HSL color format for all new themes (better manipulation)