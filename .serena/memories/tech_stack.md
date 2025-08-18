# Tech Stack

## Core Technologies

- **Package Manager**: pnpm (v10.14.0)
- **Node.js**: >=22.18.0
- **Monorepo**: pnpm workspaces + Turborepo
- **TypeScript**: Strict mode with v5.7.2+

## Frontend Stack

### Next.js Web App

- **Framework**: Next.js 15 with React 19
- **Build Tool**: Turbopack (development), Next.js build (production)
- **Styling**: Tailwind CSS with ES modules
- **Authentication**: NextAuth v5 + Instagram OAuth proxy
- **i18n**: next-intl for Korean/English support
- **Validation**: ArkType for schema validation
- **Analytics**: PostHog
- **Testing**: Vitest + Playwright (E2E + Visual)

### Mobile App (Expo)

- **Framework**: Expo SDK 53 with React Native 0.79.5
- **Router**: Expo Router v5
- **Styling**: NativeWind (Tailwind for React Native)
- **Authentication**: Expo AuthSession + secure storage
- **Testing**: Playwright for visual testing

## Backend Stack

- **Database**: Convex (real-time database)
- **File Storage**: Convex file storage
- **Functions**: Convex mutations/queries/actions
- **Authentication**: @convex-dev/auth integration
- **Data Protection**: Basic obfuscation system with XOR + Base64

## UI/Design System

- **Component Library**: @rite/ui (cross-platform)
- **Base Components**: Radix UI (web) + React Native primitives
- **Typography**: SUIT Variable font (Korean/English)
- **Theme System**: CSS variables with 2 curated themes
- **Icons**: Lucide React + Expo Vector Icons

## Development Tools

- **Linting**: ESLint v9 with TypeScript support
- **Formatting**: Prettier with tabs, 100 char width
- **Testing**: Vitest workspace + Playwright
- **Pre-commit**: Husky + lint-staged
- **CI/CD**: Turborepo for build orchestration

## Key Libraries

### Shared Dependencies

- **Effect**: v3.17.6 (functional programming)
- **Convex**: v1.23.0+ (database/backend)
- **React**: v19.0.0 (UI framework)

### Next.js Specific

- **next-auth**: v5.0.0-beta.29 (authentication)
- **next-intl**: v4.3.4 (internationalization)
- **qrcode**: v1.5.4 (QR code generation)
- **react-dropzone**: v14.3.8 (file uploads)
- **shiki**: v3.7.0 (syntax highlighting)
- **zod**: v4.0.2 (validation)

### Mobile Specific

- **expo-auth-session**: v6.2.1 (OAuth flows)
- **expo-secure-store**: v14.2.3 (secure storage)
- **expo-image-picker**: v16.1.4 (file uploads)
- **nativewind**: v4.1.23 (Tailwind for RN)
