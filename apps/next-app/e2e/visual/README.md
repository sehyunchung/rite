# Visual Testing Guide

This directory contains visual regression tests for the RITE platform's UI components using Playwright.

## Overview

Visual testing captures screenshots of UI components and pages, comparing them against baseline images to detect unintended visual changes. This is especially important for RITE with its:

- 5 dynamic themes
- Cross-platform components
- Responsive design requirements

## Running Visual Tests

### Run tests and compare against baselines:

```bash
pnpm run test:visual
```

### Update baseline screenshots:

```bash
pnpm run test:visual:update
```

### Run tests in UI mode (for debugging):

```bash
pnpm run test:visual:ui
```

## Test Structure

### Component Tests (`components.spec.ts`)

- Tests all @rite/ui components across all 5 themes
- Captures individual component sections (typography, buttons, cards, etc.)
- Tests responsive breakpoints

### Theme Switcher Tests (`theme-switcher.spec.ts`)

- Tests theme switching functionality
- Verifies theme persistence
- Captures theme transition states

### Simple Component Tests (`simple-components.spec.ts`)

- Basic smoke tests for visual testing setup
- Quick validation of the visual test page

## Visual Test Page

The visual test showcase page is located at `/[locale]/visual-test` and displays all UI components in a single view for comprehensive testing.

## Best Practices

1. **Before committing changes**:
   - Run visual tests to ensure no unintended changes
   - Review any failures carefully - they might be expected changes

2. **When updating components**:
   - Run `pnpm run test:visual` first to see the changes
   - If changes are intentional, run `pnpm run test:visual:update`
   - Commit the updated screenshots with your changes

3. **Adding new components**:
   - Add them to the visual test page
   - Create specific test cases if needed
   - Generate baselines with `test:visual:update`

## Troubleshooting

### Tests failing on CI

- Ensure all baseline screenshots are committed
- Check for platform-specific rendering differences
- Consider increasing the `threshold` in playwright-visual.config.ts

### Local vs CI differences

- Screenshots may differ slightly between macOS, Linux, and Windows
- Use Docker locally to match CI environment if needed

### Theme not applying

- Ensure localStorage operations complete before screenshots
- Add `waitForTimeout` after theme changes if needed

## Configuration

Visual test configuration is in `playwright-visual.config.ts`:

- Single worker for consistency
- Animations disabled
- Specific viewport sizes
- Threshold settings for pixel comparisons

## Screenshots Directory

Baseline screenshots are stored in:

- `e2e/visual/[test-name].spec.ts-snapshots/`

These should be committed to version control.
