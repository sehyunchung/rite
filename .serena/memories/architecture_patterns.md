# Architecture Patterns and Guidelines

## Monorepo Architecture

### Workspace Dependencies

```json
// Package dependency pattern
{
  "dependencies": {
    "@rite/backend": "workspace:*", // Always latest
    "@rite/shared-types": "workspace:^", // Compatible version
    "@rite/ui": "workspace:*" // Always latest
  }
}
```

### Build Order (Turborepo)

1. `@rite/shared-types` (foundational types)
2. `@rite/posthog-config` (analytics config)
3. `@rite/backend` (Convex functions)
4. `@rite/ui` (components)
5. `next-app` & `mobile` (applications)

## Cross-Platform Component Design

### Platform-Specific Implementation Pattern

```tsx
// button/button.web.tsx
import { Slot } from '@radix-ui/react-slot';
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...);

// button/button.native.tsx
import { Pressable } from 'react-native';
export const Button: React.FC<ButtonProps> = (...);

// button/index.ts
export { Button } from './button.web';
// OR
export { Button } from './button.native';
```

### "use dom" Components (Mobile)

```tsx
// For advanced web features in mobile
// qr-code/qr-code.dom.tsx
'use dom';
import QRCode from 'qrcode';
export const QRCodeComponent = (...);

// Provides direct DOM access for Canvas, File API, etc.
```

## Authentication Architecture

### Modular Auth System (Mobile)

```
lib/auth/
├── types.ts           # AuthError class, interfaces
├── oauth-config.ts    # Platform-specific OAuth config
├── secure-storage.ts  # Cross-platform storage
├── session-utils.ts   # Session management
└── index.ts          # Centralized exports

hooks/auth/
├── useGoogleAuth.ts   # Provider-specific logic
├── useSession.ts      # Session state
└── useOAuthFlow.ts    # Complete flow orchestration

contexts/
└── AuthContext.tsx    # Clean orchestration (88 lines)
```

### OAuth Flow Types

- **Web**: Implicit flow (`response_type=token`)
- **Mobile**: Authorization code flow with auto-exchange
- **Platform Detection**: Automatic flow selection based on environment

## Theme System Architecture

### CSS Variables Pattern

```css
:root {
  --brand-primary: hsl(293deg 100% 66%);
  --bg-primary: hsl(254deg 35% 15%);
  --text-primary: hsl(0deg 0% 100%);
  --button-primary-text: white;
}
```

### Theme Switching

```tsx
// Automatic CSS variable updates
const applyTheme = (theme: Theme) => {
  const css = generateThemeCSS(theme);
  document.documentElement.style.cssText = css;
  localStorage.setItem('theme', theme.name);
};
```

## Data Protection Pattern

### Basic Obfuscation (Convex V8 Runtime)

```tsx
// Synchronous XOR + Base64 encoding
const encryptSensitiveData = (data: string): string => {
  // XOR with encryption key + Base64 encoding
  // NOT cryptographically secure - for basic privacy only
};

// Usage in mutations
const obfuscatedData = encryptSensitiveData(sensitiveInput);
await ctx.db.insert('submissions', { data: obfuscatedData });
```

## Testing Patterns

### TDD Workflow

```tsx
// 1. RED - Write failing test
test('should export guest list as CSV', () => {
  expect(exportToCSV(mockData)).toContain('Name,Email');
});

// 2. GREEN - Minimal implementation
const exportToCSV = (data) => 'Name,Email\n...';

// 3. REFACTOR - Improve while tests pass
const exportToCSV = (data: GuestData[]) => {
  // Proper implementation
};
```

### Visual Testing

```tsx
// Playwright visual regression
test('button variants', async ({ page }) => {
  await page.goto('/visual-test');
  await expect(page.locator('[data-testid="buttons"]')).toHaveScreenshot();
});
```

## Effect.ts Integration

### Functional Programming Pattern

```tsx
import { Effect, pipe } from 'effect';

// Error handling with Effect
const processExportEffect = (data: ExportData) =>
  pipe(
    Effect.tryPromise(() => generateExcel(data)),
    Effect.mapError((error) => new ExportProcessingError(error)),
    Effect.map((buffer) => ({ buffer, filename: 'export.xlsx' }))
  );
```

## File Upload Pattern

### Cross-Platform File Handling

```tsx
// Web (react-dropzone)
const { getRootProps, getInputProps } = useDropzone({
  accept: { 'image/*': ['.jpg', '.png'] },
  onDrop: handleFiles,
});

// Mobile (expo-image-picker)
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
});
```

## Convex Backend Patterns

### Database Schema

```tsx
// Schema with proper relationships
export default defineSchema({
  events: defineTable({
    title: v.string(),
    organizerId: v.id('users'),
    // ... other fields
  }).index('by_organizer', ['organizerId']),

  timeslots: defineTable({
    eventId: v.id('events'),
    djId: v.optional(v.id('users')),
    submissionToken: v.string(),
  }).index('by_event', ['eventId']),
});
```

### Mutation Pattern

```tsx
export const createEvent = mutation({
  args: { title: v.string(), description: v.string() },
  handler: async (ctx, { title, description }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    return await ctx.db.insert('events', {
      title,
      description,
      organizerId: userId,
      createdAt: Date.now(),
    });
  },
});
```

## Internationalization Pattern

### next-intl Setup

```tsx
// Locale routing: /[locale]/page
// Messages: /messages/en.json, /messages/ko.json

const t = useTranslations('dashboard');
return <h1>{t('title')}</h1>;

// Type-safe with generated types
type Messages = typeof import('../messages/en.json');
```

## Design Token System

### Token Hierarchy

```tsx
// Base tokens
const colors = {
  brand: { primary: '#E946FF' },
  neutral: { 0: '#FFFFFF', 900: '#000000' },
};

// Semantic tokens
const semanticColors = {
  bg: { primary: colors.neutral[900] },
  text: { primary: colors.neutral[0] },
};

// Component tokens
const buttonTokens = {
  primary: { bg: colors.brand.primary, text: 'white' },
};
```

## Performance Patterns

### Bundle Optimization

- **Dynamic imports** for large components
- **Tree shaking** with proper ES modules
- **Code splitting** at route level
- **Font optimization** with variable fonts

### Mobile Performance

- **Image optimization** with expo-image
- **Navigation optimization** with React Navigation
- **State management** with minimal re-renders
- **Platform-specific optimizations**
