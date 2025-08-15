# EAS (Expo Application Services) Configuration

This document outlines the EAS configuration for the RITE mobile app.

## Project Setup

- **Project ID**: `379317da-ce13-44d9-a022-acdf0db9c403`
- **Project Name**: `RITE`
- **Slug**: `rite`
- **Owner**: `@sehyun_chung`

## Bundle Identifiers

- **iOS**: `com.rite.mobile`
- **Android**: `com.rite.mobile`

## Build Profiles

### Development

- **Purpose**: Development builds with debug capabilities
- **Distribution**: Internal only
- **Features**: Includes expo-dev-client for development features

### Preview

- **Purpose**: Preview builds for testing
- **Distribution**: Internal only
- **Use case**: Sharing with team members and testers

### Production

- **Purpose**: Production-ready builds
- **Distribution**: App stores
- **Use case**: Final release builds

## Available Scripts

```bash
# Development build
pnpm run build:development

# Preview build
pnpm run build:preview

# Production build
pnpm run build:production

# Submit to stores
pnpm run submit:production
```

## Environment Configuration

The app uses Convex as the backend service:

- **Convex URL**: Configured in `app.json` under `extra.convexUrl`
- **Current Environment**: `https://agreeable-crayfish-565.convex.cloud`

## Development Workflow

1. **Development Build**: Create a development build that includes development tools
2. **Preview Build**: Create internal builds for testing
3. **Production Build**: Create store-ready builds
4. **Submit**: Submit production builds to app stores

## Prerequisites

- EAS CLI installed globally: `npm install -g eas-cli`
- Logged into Expo account: `eas login`
- Project linked to EAS: Already configured with project ID

## Next Steps

1. Configure signing credentials for iOS/Android
2. Set up environment variables for different build profiles
3. Configure app store submission settings
4. Set up CI/CD integration with GitHub Actions (optional)
