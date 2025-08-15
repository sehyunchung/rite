# Mobile Authentication Strategy

## Current Status

The mobile app is connected to Convex and can read data. Authentication implementation is pending.

## Recommended Approach: Convex Auth (Beta)

### Pros:

- Native mobile support out of the box
- No additional auth service needed
- Works directly with existing Convex backend
- Supports Magic Links & OTPs for mobile
- Simplified architecture

### Implementation Plan:

1. Install Convex Auth in the backend package
2. Configure email provider for Magic Links
3. Create mobile auth screens
4. Use expo-secure-store for token storage
5. Implement useAuth() hooks

### Alternative: Clerk Integration

If more features are needed:

- Passkeys support
- Social login providers
- Advanced 2FA options
- Enterprise SSO

### Not Recommended: NextAuth Bridge

NextAuth doesn't have native React Native support. While possible to create a bridge, it adds complexity:

- Requires custom OAuth flow handling
- Complex token management
- Potential security concerns
- Better to use mobile-first auth solution

## Next Steps

1. Decide between Convex Auth (simpler) or Clerk (more features)
2. Implement chosen solution
3. Update ConvexProvider with auth context
4. Create login/signup screens
5. Test Instagram OAuth flow on mobile
