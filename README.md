# Rite - DJ Event Management Platform

A monorepo containing DJ event management platform implementations with [Next.js](https://nextjs.org/) and [SvelteKit](https://kit.svelte.dev/) frontends sharing a [Convex](https://convex.dev/) backend.

## Monorepo Structure

```
rite/
├── apps/
│   ├── next-app/          # Next.js 15 implementation (primary)
│   └── sveltekit-poc/     # SvelteKit implementation (POC)
├── packages/
│   ├── backend/           # Shared Convex backend (@rite/backend)
│   └── shared-types/      # Shared TypeScript types
└── package.json           # Root workspace configuration
```

## Tech Stack

- **Monorepo**: [pnpm workspaces](https://pnpm.io/workspaces) + [Turborepo](https://turbo.build/)
- **Frontend**: [Next.js 15](https://nextjs.org/) with React 18, TypeScript, and Turbopack
- **Alternative Frontend**: [SvelteKit](https://kit.svelte.dev/) with Cloudflare adapter
- **Backend**: [Convex](https://convex.dev/) for real-time database and file storage
- **Authentication**: [NextAuth v5](https://authjs.dev/) with Instagram OAuth integration
- **Typography**: [SUIT Variable](https://sunn.us/suit/) font with Korean/English support
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with shadcn/ui components
- **Validation**: [ArkType](https://arktype.io/) for high-performance schema validation
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
pnpm run dev:sveltekit   # SvelteKit app only
pnpm run dev:backend     # Convex backend only
```

## Development URLs

- **Next.js App**: http://localhost:3000
- **SvelteKit POC**: http://localhost:3001
- **Convex Dashboard**: Opens automatically when running backend

## Environment Setup

Create a `.env.local` file in `apps/next-app/` with the following variables:

```bash
# Required for full functionality
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_URL=your_convex_url
NEXTAUTH_URL=http://localhost:3000
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

**SvelteKit POC** (`apps/sveltekit-poc/`):
- Font file: `/static/fonts/SUIT-Variable.woff2`
- Configuration: `/src/routes/app.css` with `@font-face`
- Global Application: Applied to `body` element
- Usage: Direct CSS `font-family: 'SUIT'`

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

**SvelteKit with CSS:**
```svelte
<style>
  .heading {
    font-family: 'SUIT', sans-serif;
    font-weight: 700;
  }
</style>

<h1 class="heading">한국어 + English Heading</h1>
```

### Performance Benefits

- **Single File**: One variable font replaces multiple weight files
- **Smaller Bundle**: ~50KB vs ~200KB+ for traditional font stacks
- **Faster Loading**: `font-display: swap` prevents invisible text
- **Better UX**: Smooth weight transitions and custom intermediate weights

## Font Assets

The SUIT Variable font files are included in both applications:

- **Next.js**: `/apps/next-app/app/lib/SUIT-Variable.woff2`
- **SvelteKit**: `/apps/sveltekit-poc/static/fonts/SUIT-Variable.woff2`

Both files are identical and optimized for web performance with variable font technology.

## Learn more

To learn more about developing your project with Convex, check out:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex principles.
- The rest of [Convex docs](https://docs.convex.dev/) to learn about all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.

## Join the community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) to get help in real-time.
- Follow [Convex on GitHub](https://github.com/get-convex/), star and contribute to the open-source implementation of Convex.
