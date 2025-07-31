# Migration Guide: Using @rite/ui Components

## Phase 1 Migration Complete ✅

The following components have been migrated to the shared @rite/ui package with both web and native implementations:

- ✅ Input
- ✅ Label  
- ✅ Textarea
- ✅ Badge

## How to Update Your Imports

### Before (Old Import)
```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
```

### After (New Import)
```typescript
import { Input, Label, Textarea, Badge } from '@rite/ui';
```

## Example Usage

The API remains exactly the same - only the import path changes:

```typescript
import { Input, Label, Textarea, Badge } from '@rite/ui';

export function MyForm() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>
      
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" placeholder="Tell us about yourself" />
      </div>
      
      <Badge variant="secondary">Draft</Badge>
    </div>
  );
}
```

## Mobile Support

These components now work seamlessly on React Native with NativeWind styling:

```typescript
// In your Expo app
import { Input, Label, Textarea, Badge } from '@rite/ui';

export function MobileForm() {
  return (
    <View style={{ padding: 16 }}>
      <Label>Name</Label>
      <Input placeholder="Enter your name" />
      
      <Label>Bio</Label>  
      <Textarea placeholder="Tell us about yourself" />
      
      <Badge variant="secondary">Draft</Badge>
    </View>
  );
}
```

## Migration Steps

1. **Update imports** in your components from `@/components/ui/*` to `@rite/ui`
2. **Remove old files** from `apps/next-app/app/components/ui/` (input, label, textarea, badge)
3. **Test thoroughly** to ensure everything works as expected

## Benefits

- 🚀 **Code Reuse**: Same components work on web and mobile
- 🎨 **Consistent Design**: Unified design system across platforms
- 🔧 **Easier Maintenance**: Update once, use everywhere
- 📱 **Mobile Ready**: Native implementations optimized for React Native