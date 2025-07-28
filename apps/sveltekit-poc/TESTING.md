# SvelteKit POC Testing Guide

## Prerequisites
1. Environment variables are set in `.env.local`:
   - `VITE_CONVEX_URL` - Convex backend URL  
   - `NEXTAUTH_SECRET` - NextAuth secret key
   - `NEXTAUTH_URL` - Should be `http://localhost:8001`
   - `INSTAGRAM_CLIENT_ID` - Instagram app client ID
   - `INSTAGRAM_CLIENT_SECRET` - Instagram app client secret
   - `INSTAGRAM_OAUTH_PROXY_URL` - Instagram OAuth proxy URL

## Testing Steps

### 1. Start Development Server
```bash
cd apps/sveltekit-poc
pnpm run dev
```
The app should be available at `http://localhost:8001`

### 2. Check Console Output
Look for these confirmations in the server console:
- ✅ Environment variables properly loaded
- ✅ Instagram OAuth provider configured
- ✅ Convex client initialized

### 3. Test Authentication
1. Click "Sign In with Instagram" in the header
2. Should redirect to Instagram OAuth flow
3. After signing in, should return to the app with user session

### 4. Test Features
1. **Dashboard** (`/dashboard`)
   - Should show user authentication status
   - Should display events from Convex database
   - Should allow creating sample events

2. **DJ Submission** (`/dj-submission`)
   - Test with token parameter: `?token=ABC123`
   - Should validate form inputs
   - Should handle guest list management

3. **File Upload** (`/file-upload-demo`)
   - Test drag-and-drop functionality
   - Test file validation (size, type)
   - Test multiple file selection

4. **Performance Comparison** (`/performance-comparison`)
   - Should show real-time performance metrics
   - Should run benchmarks on button click
   - Should display framework comparison

### 5. Common Issues

**Instagram OAuth not working:**
- Check environment variables are set correctly
- Verify Instagram OAuth proxy is running
- Check browser network tab for OAuth flow errors

**Convex connection issues:**
- Verify `VITE_CONVEX_URL` is set correctly
- Check Convex dashboard is accessible
- Ensure shared backend package is built

**Build/dev issues:**
- Run `pnpm install` to ensure all dependencies
- Check for TypeScript errors with `pnpm run check`
- Verify Tailwind CSS is compiling correctly

## Performance Testing
The SvelteKit POC should demonstrate:
- Bundle size < 50KB (vs Next.js ~200KB+)
- Load time < 100ms
- Fast hot reload < 50ms
- Minimal memory usage

## Expected Results
All features should work identically to the Next.js app but with significantly better performance metrics.