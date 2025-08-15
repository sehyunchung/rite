# Visual Testing for RITE Mobile App

This directory contains visual regression tests for the mobile app components and screens.

## Testing Approaches

### 1. Storybook Native (Recommended for Component Testing)

Storybook Native allows you to develop and test React Native components in isolation.

#### Setup

```bash
# Install dependencies
pnpm add -D @storybook/react-native @storybook/addon-ondevice-controls @storybook/addon-ondevice-actions

# Create .storybook directory
mkdir .storybook
```

#### Configuration

Create `.storybook/main.js`:

```javascript
module.exports = {
  stories: ['../visual-tests/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};
```

Create `.storybook/preview.js`:

```javascript
import { withBackgrounds } from '@storybook/addon-ondevice-backgrounds';

export const decorators = [withBackgrounds];
export const parameters = {
  backgrounds: {
    default: 'plain',
    values: [
      { name: 'plain', value: 'white' },
      { name: 'dark', value: '#1A1A1F' },
    ],
  },
};
```

### 2. React Native Testing Library + Jest Snapshots

For testing component structure and ensuring UI consistency.

#### Setup

```bash
# Install dependencies
pnpm add -D @testing-library/react-native @testing-library/jest-native jest-expo
```

#### Example Test

```typescript
// visual-tests/components/Button.test.tsx
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Button } from '@rite/ui';

describe('Button Visual Tests', () => {
  it('renders default button correctly', () => {
    const { toJSON } = render(
      <Button onPress={() => {}}>
        Click me
      </Button>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renders all button variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost'] as const;

    variants.forEach(variant => {
      const { toJSON } = render(
        <Button variant={variant} onPress={() => {}}>
          {variant} button
        </Button>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});
```

### 3. Detox E2E Tests with Screenshots

For full app visual regression testing.

#### Setup

```bash
# Install Detox
pnpm add -D detox @config-plugins/detox

# Add to app.config.js
plugins: [
  ['@config-plugins/detox']
]
```

#### Example Visual Test

```typescript
// e2e/visual.test.ts
describe('Visual Regression', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should match home screen appearance', async () => {
    await device.takeScreenshot('home-screen');
    // Screenshots saved to artifacts folder
  });

  it('should match event details screen', async () => {
    await element(by.id('event-card-0')).tap();
    await device.takeScreenshot('event-details');
  });
});
```

### 4. Expo Web Visual Tests

Since the app supports web export, you can use Playwright for web-based visual testing.

#### Setup

```bash
# In the mobile directory
pnpm add -D @playwright/test
```

#### Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './visual-tests/web',
  outputDir: './visual-tests/web/results',

  use: {
    baseURL: 'http://localhost:8081',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        hasTouch: true,
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: 'pnpm run web',
    port: 8081,
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Example Web Visual Test

```typescript
// visual-tests/web/app.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mobile Web Visual Tests', () => {
  test('home screen matches snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('home-screen.png');
  });

  test('all themes render correctly', async ({ page }) => {
    const themes = ['joshComeau', 'joshComeauLight'];

    for (const theme of themes) {
      await page.evaluate((themeName) => {
        localStorage.setItem('rite-theme', themeName);
        window.location.reload();
      }, theme);

      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`theme-${theme}.png`);
    }
  });
});
```

## Recommended Approach

For the RITE mobile app, I recommend:

1. **Component Testing**: React Native Testing Library with snapshots
2. **Visual Regression**: Playwright tests on Expo Web export
3. **E2E Testing**: Detox for critical user flows

This combination provides:

- Fast feedback during development (snapshots)
- Visual regression catching (Playwright)
- Real device testing (Detox)

## Running Tests

```bash
# Component snapshot tests
pnpm test

# Web visual tests
pnpm run test:visual:web

# E2E tests with screenshots
pnpm run test:e2e
```
