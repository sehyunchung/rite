# Task Completion Checklist

## Required Steps After Implementation

### 1. Code Quality Checks

```bash
# Always run these commands after making changes
pnpm run lint           # Check linting issues
pnpm run type-check     # Verify TypeScript types
```

### 2. Testing Requirements (TDD - MANDATORY)

```bash
# Tests MUST be written before implementation
pnpm run test           # Run all tests
pnpm run test:coverage  # Ensure 80%+ coverage (90%+ for new code)

# For specific workspaces
pnpm --filter=next-app test
pnpm --filter=@rite/ui test
```

### 3. Visual Testing (if UI changes)

```bash
# For Next.js app changes
pnpm run test:visual           # Run visual regression tests
pnpm run test:visual:update    # Update baselines if needed

# For mobile changes
cd apps/mobile && npm run test:visual
```

### 4. Build Verification

```bash
# Ensure builds succeed
pnpm run build

# For specific apps
pnpm --filter=next-app run build
pnpm --filter=mobile run build
```

### 5. Documentation Updates

- **Check if CLAUDE.md needs updates** after any architectural changes
- Update README.md if new features or setup steps are added
- Verify that component documentation is accurate

## TDD Workflow (MANDATORY)

### Before Writing Any Code

1. **RED**: Write failing tests first
2. **GREEN**: Write minimal code to pass tests
3. **REFACTOR**: Improve code while keeping tests green

### Test Commands During Development

```bash
# Use watch mode during TDD
pnpm run test:watch

# For specific workspace
pnpm --filter=next-app test:watch
```

### Coverage Requirements

- **Minimum**: 80% overall coverage
- **New Code**: 90%+ coverage required
- **Pre-commit**: Tests must pass before commits

## Pre-Commit Checklist

The following are automatically enforced by pre-commit hooks:

### Automatic Checks

- Prettier formatting for JSON, MD, CSS files
- Test execution (must pass)
- Basic linting

### Manual Verification

- [ ] All TypeScript types are correct
- [ ] No `any` types or non-null assertions used
- [ ] Components use @rite/ui design system
- [ ] CSS variables used instead of hardcoded colors
- [ ] React imports use namespace import (`import * as React`)
- [ ] Platform-specific implementations when needed

## Cross-Platform Considerations

### For UI Component Changes

- [ ] Test on both web and mobile platforms
- [ ] Ensure design tokens are used consistently
- [ ] Verify Tailwind classes are React Native compatible
- [ ] No `space-x-` or `space-y-` classes (use `flex` and `gap`)

### For Authentication Changes

- [ ] Test OAuth flows on all platforms (web, iOS, Android, Expo Go)
- [ ] Verify secure storage works correctly
- [ ] Check error handling and user feedback
- [ ] Validate environment variable requirements

## Performance Checks

### Bundle Analysis

```bash
# Check bundle sizes after significant changes
cd apps/next-app && npm run build
# Review build output for bundle size warnings
```

### Mobile Performance

```bash
# Test mobile app performance
cd apps/mobile && npm run start
# Test on physical devices when possible
```

## Environment Verification

### Required Environment Variables

- Ensure all required env vars are documented
- Test graceful fallbacks for development
- Verify production environment setup

### Database/Backend

```bash
# Ensure Convex backend is working
pnpm run dev:backend
# Verify database schema changes if applicable
```

## Final Verification

### Before Marking Task Complete

- [ ] All tests pass with adequate coverage
- [ ] Linting and type checking pass
- [ ] Builds succeed for all affected workspaces
- [ ] Visual tests pass (if UI changes)
- [ ] Documentation is updated where necessary
- [ ] Cross-platform compatibility verified
- [ ] Performance impact assessed

### Git Best Practices

- [ ] Commit messages are descriptive
- [ ] Changes are logically grouped
- [ ] No sensitive information in commits
- [ ] Branch is up to date with main

## Emergency Rollback

### If Issues Are Found

```bash
# Quickly rollback changes
git status
git checkout -- [modified-files]
# or
git reset --hard HEAD~1  # if committed
```

### Recovery Commands

```bash
# Clean build artifacts
pnpm run build
rm -rf node_modules && pnpm install  # Nuclear option
```
