# Port Migration Guide - From 3000 to 8000

This guide documents all the platform and environment variable updates needed after changing the development ports.

## Local Development Updates

### 1. Update `.env.local` files

**Next.js App** (`/apps/next-app/.env.local`):

```bash
# Change from:
NEXTAUTH_URL=http://localhost:3000

# To:
NEXTAUTH_URL=http://localhost:8000
```

**SvelteKit POC** (`/apps/sveltekit-poc/.env.local`):

```bash
# Change from:
NEXTAUTH_URL=http://localhost:3001

# To:
NEXTAUTH_URL=http://localhost:8001
```

## Platform Updates Required

### 2. Instagram OAuth (Meta Developer Console)

1. Go to [Meta Developer Console](https://developers.facebook.com/)
2. Select your Instagram app
3. Navigate to **Instagram API with Instagram Login** → **OAuth Redirect URIs**
4. Update the following redirect URIs:
   - Remove: `http://localhost:3000/api/auth/callback/instagram`
   - Add: `http://localhost:8000/api/auth/callback/instagram`
   - Keep production URL as is

### 3. Instagram OAuth Proxy (if self-hosted)

If you're running your own OAuth proxy locally:

- Update any redirect URIs that point to `localhost:3000`
- Update to use `localhost:8000`

### 4. Convex Dashboard

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Check if any environment variables reference `localhost:3000`
3. Update them to `localhost:8000`

### 5. NextAuth Configuration

The NextAuth configuration should automatically use the `NEXTAUTH_URL` environment variable, but verify:

- No hardcoded `localhost:3000` references in `/apps/next-app/app/lib/auth.ts`

## Testing After Migration

1. **Start the dev server**:

   ```bash
   pnpm run dev:next
   ```

   Verify it starts on port 8000

2. **Test authentication flow**:
   - Navigate to http://localhost:8000
   - Try signing in with Instagram
   - Verify OAuth callback works correctly

3. **Check browser console** for any errors related to:
   - CORS issues
   - Redirect mismatches
   - API endpoint failures

## Common Issues and Fixes

### Issue: OAuth redirect mismatch

**Error**: "Redirect URI mismatch"
**Fix**: Ensure all OAuth providers have the new `localhost:8000` URLs added

### Issue: CORS errors

**Error**: "Cross-Origin Request Blocked"
**Fix**: Update any API CORS configurations to allow `localhost:8000`

### Issue: Cookie domain mismatch

**Error**: Authentication cookies not being set
**Fix**: Clear browser cookies and localStorage for localhost

## Production Deployment

No changes needed for production as these are development-only port changes. Production URLs remain unchanged.

## Rollback Instructions

If you need to rollback to port 3000:

1. Revert the package.json changes
2. Update all .env.local files back to port 3000
3. Update OAuth redirect URIs back to port 3000
