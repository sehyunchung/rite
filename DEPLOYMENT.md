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
NEXT_PUBLIC_CONVEX_URL=https://lovely-husky-802.convex.cloud
CONVEX_DEPLOY_KEY=your_production_deploy_key

# NextAuth
NEXTAUTH_URL=https://rite.party
NEXTAUTH_SECRET=your_secure_secret_here

# Instagram OAuth
INSTAGRAM_CLIENT_ID=735938226061336
INSTAGRAM_CLIENT_SECRET=your_instagram_secret
INSTAGRAM_OAUTH_PROXY_URL=https://rite-instagram-oauth-proxy.sehyunchung.workers.dev
```

### 3. OAuth Redirect URLs to Update

#### Instagram (Meta Developer Console)

- Add redirect URIs to your Instagram app settings:
  - `https://rite-instagram-oauth-proxy.sehyunchung.workers.dev/oauth/callback`

#### NextAuth Configuration

- Ensure `NEXTAUTH_URL` is set to `https://rite.party`
- Instagram OAuth flows through the custom proxy service

### 4. Instagram OAuth Proxy

The proxy at `rite-instagram-oauth-proxy.workers.dev` may need updates:

- Ensure `rite.party` is in the allowed origins
- Update CORS headers if needed

### 5. Post-Deployment Verification

- [ ] Test Instagram OAuth flow
- [ ] Test NextAuth authentication
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
- Watch NextAuth logs for authentication metrics
- Monitor Instagram OAuth proxy logs in Cloudflare Workers
