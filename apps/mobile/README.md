# RITE Mobile App

React Native mobile application for the RITE DJ event management platform, built with Expo.

## Overview

This is the mobile companion app for RITE, sharing the same Convex backend and UI components with the web application through the monorepo structure.

## Tech Stack

- **Framework**: [Expo SDK 53](https://expo.dev/) with React Native 0.79.5
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **UI Components**: [@rite/ui](../../packages/ui) shared component library
- **Backend**: [@rite/backend](../../packages/backend) Convex real-time database
- **State Management**: React hooks + Convex reactive queries
- **Types**: [@rite/shared-types](../../packages/shared-types) shared TypeScript definitions

## Development

### Prerequisites

- Node.js 18+
- pnpm package manager
- iOS Simulator (Mac only) or Android Emulator
- Expo Go app on your physical device (optional)

### Getting Started

From the monorepo root:

```bash
# Install all dependencies
pnpm install

# Start the mobile app
pnpm run dev:mobile

# Or navigate to this directory and run
cd apps/mobile && pnpm start
```

### Available Scripts

- `pnpm start` - Start the Expo development server
- `pnpm ios` - Run on iOS simulator
- `pnpm android` - Run on Android emulator
- `pnpm test` - Run tests
- `pnpm lint` - Lint the codebase

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home/Events tab
│   │   └── explore.tsx    # Explore tab
│   ├── _layout.tsx        # Root layout with providers
│   └── +not-found.tsx     # 404 screen
├── components/            # Mobile-specific components
├── constants/            # App constants
├── hooks/               # Custom React hooks
├── assets/             # Images, fonts, etc.
└── app.json           # Expo configuration
```

## Using Shared UI Components

The app uses components from `@rite/ui` which automatically resolve to native implementations:

```tsx
import { Button, Card, LoadingIndicator } from '@rite/ui';

// These components use React Native implementations
<Card>
  <Button onPress={handlePress} variant="primary">
    Submit
  </Button>
</Card>
```

## Styling with NativeWind

NativeWind enables Tailwind CSS classes in React Native:

```tsx
import { View, Text } from 'react-native';

<View className="flex-1 items-center justify-center p-4">
  <Text className="text-2xl font-bold text-gray-900">
    Welcome to RITE
  </Text>
</View>
```

## Backend Integration

The app connects to the same Convex backend as the web app:

```tsx
import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';

function EventsList() {
  const events = useQuery(api.events.list);
  
  return (
    <FlatList
      data={events}
      renderItem={({ item }) => <EventCard event={item} />}
    />
  );
}
```

## Authentication

⚠️ **Note**: Authentication is not yet implemented for mobile. Options being considered:
- Convex Auth (Beta) - Native mobile support
- Clerk - Easy integration with Expo
- Custom implementation with magic links

## Environment Variables

For production builds, configure in `app.json` or `app.config.js`:

```javascript
export default {
  expo: {
    extra: {
      convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL
    }
  }
};
```

## Building for Production

### iOS
```bash
npx expo build:ios
```

### Android
```bash
npx expo build:android
```

### EAS Build (Recommended)
```bash
npx eas-cli build --platform all
```

## Known Limitations

1. **QR Code**: Currently shows placeholder on mobile (no native QR generation)
2. **File Upload**: Dropzone component needs integration with expo-document-picker
3. **Authentication**: Not yet implemented, pending architecture decision
4. **Instagram Integration**: Requires native OAuth implementation

## Troubleshooting

### Metro Configuration
The `metro.config.js` is configured for monorepo support. If you encounter module resolution issues:

1. Clear Metro cache: `npx expo start --clear`
2. Reset Metro bundler: `watchman watch-del-all`
3. Reinstall dependencies: `pnpm install`

### NativeWind Issues
If Tailwind classes aren't working:

1. Check `tailwind.config.js` includes all source paths
2. Restart Metro bundler with `--clear` flag
3. Verify `babel.config.js` includes NativeWind plugin

## Contributing

When adding mobile-specific features:

1. Use shared components from `@rite/ui` when possible
2. Follow React Native best practices
3. Test on both iOS and Android
4. Consider tablet layouts
5. Ensure offline functionality where appropriate

## Web Deployment

The mobile app can be deployed as a Progressive Web App (PWA) using Expo's web export.

### Build for Web

```bash
# Build static web files
pnpm run build:web

# Preview locally
pnpm run preview:web
```

This creates a static build in the `dist` directory.

### Deploy to Vercel

#### Vercel Dashboard Configuration (Recommended for Monorepo)

1. Import your GitHub repository on [vercel.com](https://vercel.com)
2. Configure the following settings:
   - **Root Directory**: `apps/mobile`
   - **Build Command**: `pnpm expo export -p web`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install` (auto-detected for monorepo)

3. Add environment variables:
   - `EXPO_PUBLIC_CONVEX_URL`
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - Any other `EXPO_PUBLIC_*` variables

4. Deploy!

The `vercel.json` file contains SPA routing configuration for Expo Router.

#### Vercel CLI Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Build the app first
pnpm run build:web

# Deploy from the mobile directory
cd apps/mobile
vercel --prod
```

### Environment Variables for Web

For web deployment, ensure these are set:

```bash
EXPO_PUBLIC_CONVEX_URL=your_convex_url
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_google_client_id
# Add other EXPO_PUBLIC_ variables as needed
```

### Web-Specific Configuration

The app uses:
- Static output for better performance
- Metro bundler for web compatibility
- Responsive design with `@rite/ui` components
- PWA capabilities (can be installed as an app)

### Web Limitations

Some features may not work on web:
- Native device APIs (camera, biometrics)
- Push notifications (use web push instead)
- Deep linking (use standard web URLs)

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Convex React Native Guide](https://docs.convex.dev/client/react-native)