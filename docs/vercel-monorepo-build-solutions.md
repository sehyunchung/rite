# Vercel Monorepo TypeScript Build Solutions

## Problem Summary

When deploying Expo web apps in a pnpm monorepo to Vercel, the build fails with:

```
Error: While trying to resolve module `@rite/shared-types`...
The resolution for dist/index.js, however this file does not exist
```

## Root Causes

1. **Vercel bypasses npm lifecycle hooks**: Vercel may directly run `npx expo export -p web` without triggering `prebuild` scripts
2. **Build command ignored**: Recent reports show Vercel sometimes ignores custom `buildCommand` in monorepos
3. **Workspace dependency timing**: Shared packages aren't built before the main app needs them
4. **Turbo cache limitations**: Compiled outputs (`dist/`) aren't properly cached or transferred

## Solutions (Ranked by Effectiveness)

### 1. ✅ **Commit dist/ Files (Current Temporary Fix)**

**Status**: Implemented
**Pros**: Immediate fix, guaranteed to work
**Cons**: Not ideal for version control, requires manual rebuilds

### 2. 🎯 **Use Turbo Pipeline with Explicit Dependencies**

Configure `turbo.json` to ensure proper build order:

```json
{
  "pipeline": {
    "@rite/shared-types#build": {
      "outputs": ["dist/**"],
      "cache": true
    },
    "mobile#build": {
      "dependsOn": ["@rite/shared-types#build"],
      "outputs": ["dist/**"]
    }
  }
}
```

### 3. 🔧 **Add postinstall Script**

Add to root `package.json`:

```json
{
  "scripts": {
    "postinstall": "turbo run build --filter=@rite/shared-types"
  }
}
```

This runs after `pnpm install` on Vercel.

### 4. 📦 **Point to Source Files Instead of dist/**

Change `packages/shared-types/package.json`:

```json
{
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts",
      "require": "./src/index.ts"
    }
  }
}
```

This lets Metro/Webpack compile TypeScript directly.

### 5. 🏗️ **Custom Vercel Build Command**

In Vercel dashboard or `vercel.json`:

```json
{
  "buildCommand": "pnpm --filter=@rite/shared-types build && pnpm --filter=mobile build",
  "outputDirectory": "apps/mobile/dist"
}
```

### 6. 🔄 **Use next-transpile-modules Pattern**

For Expo web, configure Metro to transpile workspace packages:

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add workspace packages to watchFolders
config.watchFolders = [path.resolve(__dirname, '../../packages/shared-types/src')];

// Ensure Metro can resolve workspace packages
config.resolver.nodeModulesPaths = [path.resolve(__dirname, '../../node_modules')];

module.exports = config;
```

## Known Issues (2024-2025)

### Recent Community Reports

- **2 days ago**: Vercel completely ignores `buildCommand` for pnpm monorepos
- **March 2025**: Next.js 15.2.3 issues with pnpm standalone builds
- **Ongoing**: Module resolution failures specific to Vercel environment

### Expo SDK 52+ Changes

- Automatic monorepo support (less manual Metro config needed)
- Changed build output: `dist/` instead of `web-build/`
- New command: `npx expo export --platform web` (not `expo build:web`)

## Recommended Long-term Solution

1. **Keep dist/ files committed** until Vercel fixes the build command issue
2. **Implement postinstall script** as backup
3. **Monitor Vercel/Turbo updates** for official fixes
4. **Consider using source files** if TypeScript compilation in bundler is acceptable

## Testing Solutions Locally

```bash
# Simulate Vercel build
rm -rf node_modules packages/*/node_modules
pnpm install --frozen-lockfile
pnpm --filter=mobile build

# If successful, the issue is Vercel-specific
```

## References

- [Vercel Monorepo Docs](https://vercel.com/docs/monorepos)
- [Expo Monorepo Guide](https://docs.expo.dev/guides/monorepos/)
- [Turborepo TypeScript Discussion](https://github.com/vercel/turborepo/discussions/620)
- [Recent Build Command Issue](https://community.vercel.com/t/buildcommand-ignored-in-pnpm-monorepo-with-turborepo/18299)

## Current Status

✅ Temporary fix applied: dist/ files committed to repository
⏳ Monitoring for Vercel platform fixes
📝 Document updated: 2025-08-13
