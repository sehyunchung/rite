# Code Style and Conventions

## Mandatory Rules (from CLAUDE.md)

### React Imports

```tsx
// ✅ ALWAYS use namespace import for React
import * as React from 'react';

// ❌ NEVER use default import
import React from 'react';
```

### TypeScript

```tsx
// ❌ NEVER use any or non-null assertion
const data: any = getValue();
const value = data!.property;

// ✅ Use proper typing
const data: ExpectedType = getValue();
const value = data?.property;
```

### Design System

```tsx
// ✅ Use @rite/ui components exclusively
import { Button, Card } from '@rite/ui';

// ✅ Use CSS variables for colors
className = 'bg-[var(--brand-primary)]';

// ❌ Never use hardcoded colors
className = 'bg-purple-500';
```

## ESLint Configuration

### Key Rules

- **Indentation**: Tabs (2-space width), SwitchCase: 1
- **TypeScript**: No explicit `any`, no unsafe operations disabled
- **React**: Hooks rules enforced, refresh warnings
- **Unused vars**: Warn for vars/args starting with `_`

### File Ignores

- `dist/`, `convex/_generated/`, `instagram-oauth-proxy/`
- Config files: `eslint.config.mjs`, `postcss.config.js`, etc.

## Prettier Configuration

### Formatting Rules

```json
{
  "useTabs": true,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

### File Overrides

- **YAML**: Uses spaces (tabWidth: 2)
- **Markdown**: Uses spaces, preserves prose wrapping

## Component Structure

### Platform-Specific Components

```
components/button/
├── button.web.tsx      # Web implementation (Radix UI)
├── button.native.tsx   # React Native implementation
├── index.ts           # Platform-specific exports
└── button.test.tsx    # Shared tests
```

### Import/Export Pattern

```tsx
// index.ts - Platform-specific exports
export { Button } from './button.web';
// or
export { Button } from './button.native';

// Usage - same import works everywhere
import { Button } from '@rite/ui';
```

## TypeScript Conventions

### Type Definitions

```tsx
// ✅ Use 'type' instead of 'interface' unless absolutely necessary
type UserData = {
  id: string;
  name: string;
  email?: string;
};

// ✅ Use proper component prop types
type ButtonProps = {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onPress?: () => void;
};
```

### Naming Conventions

- **Components**: PascalCase (`ExportGuestList`, `ThemeSwitcher`)
- **Hooks**: camelCase with `use` prefix (`useGoogleAuth`, `useSession`)
- **Types**: PascalCase (`ExportData`, `ButtonProps`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **Files**: kebab-case or PascalCase for components

## CSS/Styling Conventions

### Tailwind Usage

```tsx
// ✅ Use design tokens and CSS variables
className = 'bg-[var(--bg-primary)] text-[var(--text-primary)]';

// ✅ Use flex and gap (React Native compatible)
className = 'flex flex-row gap-2';

// ❌ Never use space-x or space-y (not React Native compatible)
className = 'space-x-2';

// ✅ Theme-agnostic design
className = 'bg-brand-primary text-button-primary-text';
```

### Component Patterns

```tsx
// ✅ Use forwardRef for web components
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return <button ref={ref} className={cn(variants({ variant }), className)} {...props} />;
  }
);

// ✅ Use proper TypeScript with React 19
const Component: React.FC<Props> = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};
```

## Authentication Patterns

### OAuth Implementation

```tsx
// ✅ Modular hook pattern
const { signInWithGoogle, isLoading, error } = useOAuthFlow(convex);

// ✅ Proper error handling
if (error) {
  return <AuthErrorAlert error={error} />;
}

// ✅ Platform-specific configuration
const config = getOAuthConfig('google', Platform.OS);
```

## File Organization

### Directory Structure

- **Components**: Group by feature, include platform variants
- **Hooks**: Separate by concern (`auth/`, `api/`, etc.)
- **Types**: Shared types in dedicated package
- **Utils**: Platform-specific when needed

### Import Order

1. React and core libraries
2. Third-party libraries
3. Internal packages (`@rite/`)
4. Relative imports
5. Type-only imports (with `type` keyword)

## Documentation

### Code Comments

- Only add comments when explicitly requested
- Prefer self-documenting code
- Use JSDoc for public APIs

### Component Documentation

- Props should be self-explanatory through TypeScript
- Include usage examples in Storybook when available
