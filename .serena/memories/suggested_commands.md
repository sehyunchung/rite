# Suggested Commands

## Development Commands (From Root)

### Setup

```bash
# Install dependencies for all workspaces
pnpm install

# Build all packages (required before first run)
pnpm run build
```

### Development Servers

```bash
# Start all apps in development mode
pnpm run dev

# Start specific apps
pnpm run dev:next        # Next.js app only (localhost:8000)
pnpm run dev:mobile      # Mobile app only (Expo)
pnpm run dev:backend     # Convex backend only (opens dashboard)

# Pre-dev setup (starts backend and opens dashboard)
pnpm run predev
```

### Code Quality

```bash
# Lint all workspaces
pnpm run lint

# Type check all workspaces
pnpm run type-check

# Format with Prettier (handled by lint-staged)
prettier --write .
```

### Testing

```bash
# Run all tests
pnpm run test

# Watch mode for tests
pnpm run test:watch

# Coverage report
pnpm run test:coverage

# Interactive test UI
pnpm run test:ui

# Test specific workspace
pnpm --filter=next-app test:watch
pnpm --filter=@rite/ui test
```

### Visual Testing (Next.js App)

```bash
# Run visual regression tests
pnpm run test:visual

# Update baseline screenshots
pnpm run test:visual:update

# Debug with UI mode
pnpm run test:visual:ui
```

### Build

```bash
# Build all workspaces
pnpm run build

# Build specific workspace
pnpm --filter=next-app run build
pnpm --filter=mobile run build
```

## Workspace-Specific Commands

### Next.js App (`apps/next-app/`)

```bash
cd apps/next-app

# Development
npm run dev              # Start dev server (port 8000)
npm run build           # Production build
npm run start           # Start production server
npm run lint            # ESLint
npm run type-check      # TypeScript check

# Testing
npm run test            # Vitest unit tests
npm run test:watch      # Vitest watch mode
npm run test:coverage   # Coverage report
npm run test:e2e        # Playwright E2E tests
npm run test:e2e:ui     # Playwright UI mode
npm run test:visual     # Visual regression tests
```

### Mobile App (`apps/mobile/`)

```bash
cd apps/mobile

# Development
npm run start           # Start Expo dev server
npm run android         # Run on Android
npm run ios            # Run on iOS
npm run web            # Run on web

# Build
npm run build          # Build for web
npm run build:development  # EAS development build
npm run build:preview     # EAS preview build
npm run build:production  # EAS production build

# Testing
npm run test:visual    # Visual tests with Playwright
```

## System Commands (Darwin/macOS)

### File Operations

```bash
ls -la                 # List files with details
find . -name "*.tsx"   # Find TypeScript React files
grep -r "pattern" src/ # Search in source files (use ripgrep: rg)
rg "pattern" --type ts # Better search with ripgrep
```

### Git Operations

```bash
git status             # Check working tree status
git add .              # Stage all changes
git commit -m "msg"    # Commit with message
git push               # Push to remote
git pull               # Pull from remote
```

### Package Management

```bash
pnpm add package       # Add dependency
pnpm remove package    # Remove dependency
pnpm list             # List dependencies
pnpm outdated         # Check for updates
```

## Important Notes

1. **Always run from root**: Use `pnpm run` commands from the monorepo root
2. **TDD Required**: Write tests before implementation (see TDD-GUIDE.md)
3. **Pre-commit hooks**: Tests and linting run automatically before commits
4. **Environment**: Ensure Node.js >=22.18.0 and pnpm v10.14.0
5. **Platform**: Commands optimized for Darwin (macOS) system
