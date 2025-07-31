# Mobile App Environment Setup

## Required Environment Variables

Create a `.env` file in the `apps/mobile` directory with the following variables:

```bash
# Copy from apps/next-app/.env.local or your Convex dashboard
EXPO_PUBLIC_CONVEX_URL=your_convex_url_here

# Instagram OAuth Proxy (optional, for future auth implementation)
EXPO_PUBLIC_INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.sehyunchung.workers.dev
```

## Getting the Convex URL

1. Check your `apps/next-app/.env.local` file for `NEXT_PUBLIC_CONVEX_URL`
2. Or visit your [Convex Dashboard](https://dashboard.convex.dev/) to find your deployment URL
3. Copy this URL to `EXPO_PUBLIC_CONVEX_URL` in your mobile `.env` file

## Running the Mobile App

After setting up your environment variables:

```bash
# From the root directory
pnpm run dev:mobile

# Or from apps/mobile
pnpm start
```

## Troubleshooting

If you see "EXPO_PUBLIC_CONVEX_URL is required but not set":
1. Ensure your `.env` file exists in `apps/mobile`
2. Restart the Expo development server after adding the `.env` file
3. Clear the Expo cache: `npx expo start -c`