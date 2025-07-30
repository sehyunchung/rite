# @rite/ui

Shared UI components for the RITE platform, supporting both web and native platforms using the `.web` and `.native` convention.

## Architecture

- **Platform-specific files**: Metro bundler automatically picks the right version
- **Consistent API**: Same component interface across platforms  
- **Type safety**: Full TypeScript support
- **Zero migration cost**: Web components use existing shadcn/ui, native uses NativeWind

## Usage

```typescript
import { Button, Card, CardContent, CardHeader, CardTitle } from '@rite/ui'

// Same API works on both web and native!
<Card>
  <CardHeader>
    <CardTitle>Hello World</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="outline" size="lg">
      Click me
    </Button>
  </CardContent>
</Card>
```

## Available Components

- ✅ **Button** - Web (shadcn/ui) + Native (NativeWind Pressable)
- ✅ **Card** - Web (shadcn/ui) + Native (NativeWind View)
- 🚧 More coming soon...

## Development

```bash
# Type check
pnpm --filter=@rite/ui run type-check

# Build (if needed)
pnpm --filter=@rite/ui run build
```

## Architecture Details

### File Structure
```
src/components/button/
├── button.web.tsx      # Web version (shadcn/ui)
├── button.native.tsx   # Native version (NativeWind)
├── index.web.ts        # Web exports
├── index.native.ts     # Native exports  
└── index.tsx           # Platform-aware entry
```

### Platform Detection
Metro bundler automatically resolves:
- Web: `button.web.tsx` → `index.web.ts` → `index.tsx`
- Native: `button.native.tsx` → `index.native.ts` → `index.tsx`

No runtime platform checks needed!