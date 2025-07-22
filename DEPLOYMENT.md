# Deployment Guide for rite.party

## Domain Configuration

**Domain**: rite.party
**Deployment Platform**: Vercel

## Pre-Deployment Checklist

### 1. Vercel Setup
- [ ] Connect GitHub repository to Vercel
- [ ] Add custom domain `rite.party` in Vercel settings
- [ ] Configure DNS records as instructed by Vercel

### 2. Environment Variables (Production)
Add these in Vercel's Environment Variables settings:

```bash
# Convex
VITE_CONVEX_URL=https://valiant-curlew-94.convex.cloud

# Clerk (Production) - Update with your production keys
VITE_CLERK_PUBLISHABLE_KEY=pk_prod_YOUR_KEY_HERE
VITE_CLERK_FRONTEND_API_URL=https://YOUR_INSTANCE.clerk.accounts.dev
CLERK_FRONTEND_API_URL=https://YOUR_INSTANCE.clerk.accounts.dev

# Instagram OAuth
VITE_INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.workers.dev
VITE_INSTAGRAM_CLIENT_ID=735938226061336
```

### 3. OAuth Redirect URLs to Update

#### Instagram (Meta Developer Console)
- Add `https://rite.party/auth/instagram/callback` to valid OAuth redirect URIs

#### Clerk Dashboard
- Add `https://rite.party` to allowed origins
- Update redirect URLs for social logins

### 4. Instagram OAuth Proxy
The proxy at `rite-instagram-oauth-proxy.workers.dev` may need updates:
- Ensure `rite.party` is in the allowed origins
- Update CORS headers if needed

### 5. Post-Deployment Verification
- [ ] Test Instagram OAuth flow
- [ ] Test Clerk authentication
- [ ] Verify DJ submission links work
- [ ] Check QR code generation
- [ ] Test event creation flow

## SSL/HTTPS
Vercel automatically provisions SSL certificates for custom domains.

## DNS Settings
After adding the domain in Vercel, you'll need to update your DNS:
- A record pointing to Vercel's IP
- Or CNAME record pointing to your Vercel deployment

## Monitoring
- Check Vercel Analytics for performance
- Monitor Convex dashboard for database usage
- Watch Clerk dashboard for authentication metrics