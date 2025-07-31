# @rite/ui - Shared UI Components

Cross-platform UI component library for RITE platform, supporting both web (React) and mobile (React Native) applications.

## Overview

This package provides a unified component API with platform-specific implementations, enabling code reuse between Next.js web app and Expo mobile app while optimizing for each platform's unique capabilities.

## Architecture

### Platform-Specific File Resolution

Components use file extensions to provide platform-specific implementations:
- `.web.tsx` - Web implementation (React DOM)
- `.native.tsx` - Mobile implementation (React Native)
- `.web.ts` / `.native.ts` - Platform-specific utilities

Metro bundler (mobile) and webpack (web) automatically resolve the correct file based on the platform.

### Component Structure

```
src/components/
├── button/
│   ├── button.web.tsx      # Web implementation using React DOM
│   ├── button.native.tsx   # Native implementation using React Native
│   └── index.ts           # Platform-specific exports
├── card/
│   ├── card.web.tsx       # Complex component with sub-components
│   ├── card.native.tsx    # Native version with same API
│   └── index.ts
└── ... (other components)
```

## Available Components

### Basic Components
- **Button** - Pressable elements with variants (default, destructive, outline, secondary, ghost, link)
- **Input** - Text input fields with consistent styling
- **Label** - Form labels with proper accessibility
- **Textarea** - Multi-line text input
- **Badge** - Status indicators with variants

### Layout Components
- **Card** - Container with header, content, footer sections
- **Alert** - Informational messages with icon support
- **AlertDialog** - Modal confirmation dialogs

### Form Components
- **Select** - Dropdown selection with native behavior per platform

### Feedback Components
- **LoadingIndicator** - Branded loading state
- **FullScreenLoading** - Full-screen loading overlay

### Advanced Components
- **Dropzone** - File upload with drag-and-drop (web) / tap-to-select (mobile)
- **QRCode** - QR code generation (full support on web, placeholder on mobile)

## Installation

This package is part of the RITE monorepo and is automatically available to workspace apps:

```json
{
  "dependencies": {
    "@rite/ui": "workspace:*"
  }
}
```

## Usage

### Import Components

```tsx
// Same import works for both platforms
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Input,
  Label,
  LoadingIndicator 
} from '@rite/ui';
```

### Basic Example

```tsx
// This code works identically on web and mobile
function LoginForm() {
  const [email, setEmail] = useState('');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        <Button variant="default" className="mt-4">
          Sign In
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Platform-Specific Behavior

Components automatically adapt to platform conventions:

**Web (button.web.tsx)**:
- Uses HTML `<button>` elements
- Supports hover states
- Click events via `onClick`
- Full CSS styling capabilities

**Mobile (button.native.tsx)**:
- Uses React Native `Pressable`
- Touch feedback animations
- Press events via `onPress`
- NativeWind styling

## Styling

### Web
- Uses Tailwind CSS classes
- Supports all shadcn/ui patterns
- CSS modules and inline styles work

### Mobile
- Uses NativeWind (Tailwind for React Native)
- Limited to React Native style properties
- Consistent design tokens across platforms

## Component Guidelines

### Creating New Components

1. **Always create both web and native versions**:
   ```
   components/
   └── new-component/
       ├── new-component.web.tsx
       ├── new-component.native.tsx
       └── index.ts
   ```

2. **Keep the same API across platforms**:
   ```tsx
   // Both versions should accept the same props
   export interface NewComponentProps {
     title: string;
     onPress?: () => void;
     variant?: 'primary' | 'secondary';
   }
   ```

3. **Use platform-appropriate implementations**:
   ```tsx
   // Web version
   export function NewComponent({ title, onPress }: NewComponentProps) {
     return <button onClick={onPress}>{title}</button>;
   }
   
   // Native version
   export function NewComponent({ title, onPress }: NewComponentProps) {
     return (
       <Pressable onPress={onPress}>
         <Text>{title}</Text>
       </Pressable>
     );
   }
   ```

### Best Practices

1. **Consistent Props**: Maintain the same prop interface across platforms
2. **Graceful Degradation**: Provide fallbacks for platform-specific features
3. **Accessibility**: Ensure both versions are accessible (ARIA on web, accessibility props on mobile)
4. **Performance**: Optimize for each platform (CSS on web, StyleSheet on mobile)
5. **Testing**: Test components on both platforms

## Dependencies

### Core
- `react`: ^19.0.0
- `react-native`: 0.79.5 (peer dependency for mobile)
- `class-variance-authority`: Component variants
- `clsx` & `tailwind-merge`: Class name utilities

### Web-Specific
- `@radix-ui/*`: Accessible component primitives
- `react-dropzone`: File upload functionality
- `qrcode`: QR code generation
- `culori`: Color manipulation

### Mobile-Specific
- `lucide-react-native`: Native icon components
- `nativewind`: Tailwind CSS for React Native

## Development

### Build
```bash
pnpm run build
```

### Type Checking
```bash
pnpm run type-check
```

### Linting
```bash
pnpm run lint
```

## Future Enhancements

- [ ] Storybook for component documentation
- [ ] Visual regression testing
- [ ] Theme system with design tokens
- [ ] More native-specific optimizations
- [ ] Accessibility testing suite
- [ ] Component usage analytics

## Contributing

When adding new components:
1. Create both `.web.tsx` and `.native.tsx` versions
2. Ensure consistent API across platforms
3. Add TypeScript types
4. Update this README with the new component
5. Consider adding usage examples

## License

Part of the RITE platform - see root LICENSE file.