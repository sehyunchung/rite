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

Dual authentication system supporting both Next.js (NextAuth v5) and mobile platforms with modular architecture.

### Environment Configuration

**Next.js (.env.local):**
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

**Mobile (.env or Expo environment):**
```
EXPO_PUBLIC_CONVEX_URL=your_convex_url

# Google OAuth - Platform Specific Client IDs
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS=your_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET=your_web_client_secret
```

### Mobile Authentication Architecture

**Modular Structure** - AuthContext reduced from 365 lines to 88 lines with clean separation and error handling:

```
apps/mobile/
├── lib/auth/
│   ├── types.ts           # TypeScript interfaces & AuthError class
│   ├── oauth-config.ts    # Platform-specific OAuth configuration
│   ├── secure-storage.ts  # Cross-platform storage abstraction
│   ├── session-utils.ts   # Session management utilities
│   └── index.ts          # Centralized exports
├── hooks/auth/
│   ├── useGoogleAuth.ts   # Google OAuth flow handling
│   ├── useSession.ts      # Session state management
│   └── useOAuthFlow.ts    # Complete OAuth flow orchestration
├── contexts/
    └── AuthContext.tsx    # Clean, focused context (88 lines with error handling)
└── components/
    └── AuthErrorAlert.tsx # User-friendly error notifications
```

**Key Features:**
- **Cross-platform OAuth**: Works on web, iOS, Android, and Expo Go
- **Modular hooks**: Specialized hooks for different auth operations
- **Enhanced type safety**: Comprehensive TypeScript interfaces
- **Comprehensive error handling**: Custom AuthError class with user notifications
- **Secure storage**: Platform-specific secure storage abstraction
- **Security first**: No hardcoded credentials, PKCE and CSRF protection

### Google OAuth Configuration

**Google Cloud Console Setup:**
1. Create OAuth 2.0 Client IDs for each platform:
   - **Web application**: For Expo web and development
   - **iOS**: For iOS app and Expo Go
   - **Android**: For Android app

**Platform-specific Redirect URIs:**
- **Web**: `http://localhost:8081` (Expo web development)
- **iOS/Expo Go**: `com.googleusercontent.apps.[CLIENT-ID]://` (Google URL scheme)
- **Android**: `com.rite.mobile://` (custom scheme)

**Key Breakthrough**: Using simple Google URL scheme format (`com.googleusercontent.apps.[CLIENT-ID]://`) without additional paths for iOS/Expo Go compatibility.

### OAuth Flow Types

**Web Platform (Implicit Flow):**
- Uses `response_type=token` for direct access token
- Handles token from URL hash parameters
- Immediate authentication without server exchange

**Mobile Platform (Authorization Code Flow):**
- Uses `response_type=code` with `shouldAutoExchangeCode=true`
- Server-side token exchange for enhanced security
- Supports both Expo Go and standalone apps

### OAuth Providers
- **Google**: ✅ **Complete** - Cross-platform OAuth with web/iOS/Android support
- **Apple**: 📋 Planned but not implemented
- **Instagram**: ✅ Custom OAuth proxy (Cloudflare Worker) transforms to OIDC format
  - Requires Business/Creator accounts
  - Complete profile data capture
  - Auto-connection during signup

### App Configuration (app.config.js)

**Dynamic URL Schemes for OAuth Security:**
```javascript
{
  ios: {
    bundleIdentifier: "com.rite.mobile",
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLName: "google-oauth",
          CFBundleURLSchemes: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS
            ? [`com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS.split('-')[0]}-${process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS.split('-')[1]}`]
            : []
        },
        {
          CFBundleURLName: "expo-auth-session",
          CFBundleURLSchemes: ["mobile"]
        }
      ]
    }
  },
  android: {
    package: "com.rite.mobile",
    intentFilters: [
      {
        action: "VIEW",
        category: ["BROWSABLE", "DEFAULT"],
        data: { scheme: "mobile" }
      },
      {
        action: "VIEW",
        category: ["BROWSABLE", "DEFAULT"],
        data: { scheme: "com.rite.mobile" }
      }
    ]
  }
}
```

**Security Benefits:**
- No hardcoded OAuth client IDs in repository
- URL schemes generated dynamically from environment variables
- Fails gracefully when environment variables are missing

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
**Next.js Authentication:**
- Auth config: `/apps/next-app/app/lib/auth.ts`
- Providers: `/apps/next-app/app/providers/`

**Mobile Authentication:**
- AuthContext: `/apps/mobile/contexts/AuthContext.tsx`
- Auth utilities: `/apps/mobile/lib/auth/`
- Auth hooks: `/apps/mobile/hooks/auth/`
- OAuth config: `/apps/mobile/lib/auth/oauth-config.ts`
- App configuration: `/apps/mobile/app.config.js`
- Error handling: `/apps/mobile/components/AuthErrorAlert.tsx`

**Shared:**
- Convex functions: `/packages/backend/convex/`
- UI components: `/packages/ui/src/components/`
- Design tokens: `/packages/ui/src/design-tokens/`
- Theme system: `/packages/ui/src/design-tokens/themes.ts`
- Theme switcher: `/apps/next-app/app/components/ThemeSwitcher.tsx`

### Database Schema (Convex)
- `users` - Authentication and profiles
- `events` - Event information
- `timeslots` - DJ slots with submission tokens
- `submissions` - DJ submissions
- `instagramConnections` - Instagram profiles

## RITE Design System

Dynamic theme system with comprehensive token architecture and 2 curated themes:

### Dynamic Theme System
Built with CSS variables for real-time theme switching:

**Available Themes:**
- **Josh Comeau** (Dark): Sophisticated dark theme with atmospheric gradients and vibrant accents
- **Josh Comeau Light** (Light): Sophisticated light theme with atmospheric gradients and vibrant accents

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

1. **Define Theme Object** in `/packages/ui/src/design-tokens/themes.ts`:
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
import { themes, generateThemeCSS } from '@rite/ui/design-tokens';
// Note: alternativeThemes is still available for backward compatibility
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
- **Google OAuth with production-ready security** (web, iOS, Android, Expo Go)
- **Modular mobile authentication architecture** (AuthContext: 365→88 lines with error handling)
- **Comprehensive OAuth security implementation** (no hardcoded credentials, PKCE, CSRF protection)
- **User-friendly error handling** (AuthErrorAlert component with specific error codes)
- Design system with cross-platform components
- **Dynamic theme system with 2 curated themes**
- **ThemeSwitcher component with persistence**
- **CSS variables integration for real-time theme switching**
- **Mobile styling consistency migration** (100% @rite/ui integration, zero hardcoded colors)
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

### Mobile OAuth Troubleshooting

**Google OAuth Setup Issues:**

1. **Missing Client IDs**
   - Ensure all platform-specific client IDs are configured in environment
   - Check `EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS`, `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

2. **Redirect URI Mismatch**
   - **iOS/Expo Go**: Use Google URL scheme format: `com.googleusercontent.apps.[CLIENT-ID]://`
   - **Android**: Use custom scheme: `com.rite.mobile://`
   - **Web**: Use localhost: `http://localhost:8081`

3. **URL Scheme Configuration**
   - Verify `app.json` contains correct URL schemes for both platforms
   - iOS bundle identifier must match Google Cloud Console configuration
   - Android package name must match Google Cloud Console and `app.json`

4. **Platform Detection Issues**
   - Check `getPlatformInfo()` function returns correct platform/environment
   - Expo Go vs standalone app detection affects OAuth flow selection

5. **Token Exchange Failures**
   - Verify `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET` is configured for code flow
   - Check network connectivity for token exchange requests
   - Validate client ID matches between authorization request and token exchange

**Common Error Codes:**
- `MISSING_ACCESS_TOKEN`: No access token in OAuth response
- `GOOGLE_API_ERROR`: Failed to fetch user info from Google
- `TOKEN_EXCHANGE_ERROR`: Authorization code to token exchange failed
- `USER_CREATION_ERROR`: Failed to create user in Convex
- `WEB_REDIRECT_ERROR`: Failed to handle web platform redirect

**Debug Steps:**
1. Enable verbose logging in OAuth config functions
2. Check browser network tab for failed requests (web platform)
3. Verify Google Cloud Console OAuth client configuration
4. Test with different platforms (web, iOS simulator, Android emulator)
5. Check Convex dashboard for user creation logs

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

### Authentication Development Workflow

**Using the Modular Auth System:**

1. **Adding New OAuth Providers**
   ```typescript
   // Add provider config to oauth-config.ts
   export const getProviderConfig = (provider: 'google' | 'apple') => {
     // Platform-specific configuration logic
   };

   // Create provider-specific hook in hooks/auth/
   export const useAppleAuth = (convex: ConvexReactClient) => {
     // Provider-specific authentication logic
   };

   // Integrate in useOAuthFlow.ts
   const { signInWithApple } = useAppleAuth(convex);
   ```

2. **Extending Authentication Types**
   ```typescript
   // Add to lib/auth/types.ts
   export interface NewAuthConfig {
     // Provider-specific configuration
   }

   export interface AuthContextType {
     // Add new auth methods
     signInWithApple: () => Promise<void>;
   }
   ```

3. **Adding Custom Auth Hooks**
   ```typescript
   // Create new hook in hooks/auth/
   export const useCustomAuth = () => {
     // Custom authentication logic
     // Follows same pattern as existing hooks
   };
   ```

**Architecture Benefits:**
- **Clean separation**: Context only orchestrates, hooks handle logic
- **Testable modules**: Each utility can be tested independently
- **Type safety**: Comprehensive interfaces prevent runtime errors
- **Cross-platform**: Same auth logic works across all platforms
- **Error handling**: Structured error reporting with codes
- **Secure storage**: Platform-appropriate storage abstraction

### Status
- ✅ Monorepo integration
- ✅ Convex backend access
- ✅ Basic event listing
- ✅ Design system integration (colors, typography, spacing)
- ✅ Navigation aligned with Next.js app (Dashboard, Create Event, Events)
- ✅ Tailwind configuration with @rite/ui tokens
- ✅ Static theme tokens integration (Josh themes available)
- ✅ "use dom" demo with QR Code and Dropzone examples
- ✅ **Google OAuth authentication with production security** (web, iOS, Android, Expo Go)
- ✅ **Modular authentication architecture** (88-line AuthContext with error handling)
- ✅ **Cross-platform secure storage**
- ✅ **Comprehensive error handling** (AuthErrorAlert, structured error codes)
- ✅ **Full @rite/ui component integration** (all screens use design system)
- ✅ **Styling consistency migration** (zero hardcoded colors, Tailwind throughout)
- 📋 Dynamic theme switching (planned)

## Code Style

### Mandatory Rules
1. **Use namespace import for React**: `import * as React from 'react'` (never default import)
2. **Never use `any` or `!` (non-null assertion)** in TypeScript
3. **Use design system exclusively**: All components must use @rite/ui design tokens and components
4. **After commit**: Always check if relevant documentation needs updating

### Additional Guidelines
- TypeScript strict mode, no `any` or non-null assertions
- @rite/ui components exclusively
- **Use CSS variables for colors** (`var(--brand-primary)` not hardcoded hex)
- **Theme-agnostic component design** (works across both themes)
- Tailwind with ES modules and CSS variable integration
- SUIT Variable font for all text
- Platform-specific implementations when needed
- HSL color format for all new themes (better manipulation)